"""
TRACKIQ AI — Gemini Client Wrapper
=====================================
Uses the new `google-genai` SDK (google.genai) as recommended by Google.
The `google-generativeai` package is deprecated and no longer receives updates.

Public interface
-----------------
    generate(prompt, system_instruction=None, **overrides)  -> str
    generate_structured(prompt, schema, **overrides)        -> dict
    stream(prompt, system_instruction=None, **overrides)    -> Iterator[str]
    health_check()                                          -> dict
"""

import json
import logging
import os
import time
from typing import Any, Dict, Iterator, Optional

from google import genai
from google.genai import types as genai_types

from config.gemini_config import (
    GEMINI_DEFAULT_MODEL,
    GEMINI_STRUCTURED_MODEL,
    GEMINI_MAX_OUTPUT_TOKENS,
    GEMINI_MAX_RETRIES,
    GEMINI_RETRY_DELAY_S,
    GEMINI_TEMPERATURE,
    GEMINI_TOP_K,
    GEMINI_TOP_P,
    RAILOPT_SYSTEM_INSTRUCTION,
)

logger = logging.getLogger(__name__)


# ── Custom exceptions ──────────────────────────────────────────────────────────

class GeminiAuthError(RuntimeError):
    """Missing or rejected API key."""


class GeminiQuotaError(RuntimeError):
    """Quota / rate-limit exhausted."""


class GeminiResponseError(RuntimeError):
    """Empty, blocked, or invalid response."""


# ── Module-level client singleton ─────────────────────────────────────────────

_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client
    if _client is not None:
        return _client

    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        raise GeminiAuthError(
            "GEMINI_API_KEY is not set. "
            "Add it to backend/.env or set it as an environment variable."
        )

    _client = genai.Client(api_key=key)
    logger.info("Gemini SDK (google-genai) client initialized. Key prefix: %s...", key[:8])
    return _client


def _build_config(**overrides) -> genai_types.GenerateContentConfig:
    return genai_types.GenerateContentConfig(
        temperature=overrides.get("temperature", GEMINI_TEMPERATURE),
        max_output_tokens=overrides.get("max_output_tokens", GEMINI_MAX_OUTPUT_TOKENS),
        top_p=overrides.get("top_p", GEMINI_TOP_P),
        top_k=overrides.get("top_k", GEMINI_TOP_K),
        system_instruction=overrides.get("system_instruction"),
    )


def _classify_error(exc: Exception) -> None:
    msg = str(exc).lower()
    if "api_key" in msg or "unauthorized" in msg or "permission" in msg or "invalid" in msg:
        raise GeminiAuthError(f"Gemini authentication failed: {exc}") from exc
    if "quota" in msg or "rate" in msg or "resource_exhausted" in msg or "429" in msg:
        raise GeminiQuotaError(f"Gemini quota/rate limit: {exc}") from exc
    raise exc


# ── Public API ─────────────────────────────────────────────────────────────────

def generate(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: str = GEMINI_DEFAULT_MODEL,
    **overrides,
) -> str:
    """
    Send a single prompt and return the text response.

    Parameters
    ----------
    prompt            : User prompt.
    system_instruction: Optional override for the system instruction.
    model             : Gemini model name.
    **overrides       : GenerateContentConfig field overrides.

    Returns
    -------
    str — Stripped model response.

    Raises
    ------
    GeminiAuthError, GeminiQuotaError, GeminiResponseError
    """
    client = _get_client()
    sys_instr = system_instruction or RAILOPT_SYSTEM_INSTRUCTION
    cfg = _build_config(system_instruction=sys_instr, **overrides)

    last_exc: Optional[Exception] = None
    for attempt in range(1, GEMINI_MAX_RETRIES + 1):
        try:
            t0 = time.perf_counter()
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=cfg,
            )
            elapsed = time.perf_counter() - t0

            text = response.text
            if not text:
                raise GeminiResponseError(
                    "Gemini returned an empty response (possibly safety-filtered)."
                )

            logger.debug(
                "generate() ok | model=%s attempt=%d elapsed=%.2fs chars=%d",
                model, attempt, elapsed, len(text),
            )
            return text.strip()

        except (GeminiAuthError, GeminiQuotaError, GeminiResponseError):
            raise
        except Exception as exc:
            last_exc = exc
            logger.warning(
                "generate() attempt %d/%d failed: %s: %s",
                attempt, GEMINI_MAX_RETRIES, type(exc).__name__, str(exc)[:120],
            )
            if attempt < GEMINI_MAX_RETRIES:
                time.sleep(GEMINI_RETRY_DELAY_S * attempt)

    _classify_error(last_exc)
    raise RuntimeError("Unreachable")


def generate_structured(
    prompt: str,
    schema: Dict[str, Any],
    system_instruction: Optional[str] = None,
    model: str = GEMINI_STRUCTURED_MODEL,
    **overrides,
) -> Dict[str, Any]:
    """
    Ask Gemini to return JSON conforming to *schema*.

    Returns
    -------
    dict — Parsed and key-validated response.
    """
    required_keys = schema.get("required", [])
    schema_str = json.dumps(schema, indent=2)
    structured_prompt = (
        f"{prompt}\n\n"
        f"Return ONLY a valid JSON object conforming to this schema. "
        f"Do not include markdown, code fences, or any text outside the JSON.\n\n"
        f"Schema:\n{schema_str}"
    )

    sys_instr = system_instruction or RAILOPT_SYSTEM_INSTRUCTION
    overrides.setdefault("temperature", 0.1)

    last_exc: Optional[Exception] = None
    for attempt in range(1, GEMINI_MAX_RETRIES + 2):
        try:
            raw = generate(
                structured_prompt,
                system_instruction=sys_instr,
                model=model,
                **overrides,
            )
            clean = raw.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
                clean = clean.strip()

            parsed = json.loads(clean)
            missing = [k for k in required_keys if k not in parsed]
            if missing:
                raise GeminiResponseError(
                    f"Response missing required keys: {missing}. Got: {list(parsed.keys())}"
                )

            logger.debug("generate_structured() ok | keys=%s", list(parsed.keys()))
            return parsed

        except (GeminiAuthError, GeminiQuotaError):
            raise
        except json.JSONDecodeError as exc:
            last_exc = GeminiResponseError(f"Non-JSON on attempt {attempt}: {exc}")
            logger.warning(str(last_exc))
        except GeminiResponseError as exc:
            last_exc = exc
            logger.warning("Structured validation: %s", exc)
        except Exception as exc:
            last_exc = exc
            logger.warning("generate_structured() unexpected: %s", exc)

        if attempt <= GEMINI_MAX_RETRIES:
            time.sleep(GEMINI_RETRY_DELAY_S)

    raise last_exc or GeminiResponseError("generate_structured() failed after all retries.")


def stream(
    prompt: str,
    system_instruction: Optional[str] = None,
    model: str = GEMINI_DEFAULT_MODEL,
    **overrides,
) -> Iterator[str]:
    """
    Stream response chunks from Gemini.
    """
    client = _get_client()
    sys_instr = system_instruction or RAILOPT_SYSTEM_INSTRUCTION
    cfg = _build_config(system_instruction=sys_instr, **overrides)

    try:
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=prompt,
            config=cfg,
        ):
            if chunk.text:
                yield chunk.text
    except Exception as exc:
        _classify_error(exc)


def health_check() -> Dict[str, Any]:
    """
    Ping Gemini with a trivial prompt to verify key + connectivity.
    """
    try:
        result = generate(
            "Reply with exactly one word: OK",
            system_instruction="Health check. Reply only: OK",
            max_output_tokens=10,
        )
        return {
            "status": "ok",
            "model": GEMINI_DEFAULT_MODEL,
            "response_preview": result[:20],
        }
    except GeminiAuthError as exc:
        return {"status": "auth_error", "detail": str(exc)}
    except GeminiQuotaError as exc:
        return {"status": "quota_error", "detail": str(exc)}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)[:120]}
