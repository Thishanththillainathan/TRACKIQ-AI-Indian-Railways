"""
TRACKIQ AI — Self-Learning Loop Module
=========================================
Integrates Gemini into the digital simulation's self-learning cycle.

The loop:
  1. Receives the current simulation state (dict).
  2. Sends it to Gemini with the learning objective system prompt.
  3. Parses the response into a structured action/update.
  4. Returns the action for the caller to apply to the simulation.
  5. Logs every iteration to a JSONL file and optionally to Supabase.

Entry point
-----------
    action = run_learning_step(state, supabase_client=None)

Log format (one JSON object per line)
--------------------------------------
    {
      "iteration": <int>,
      "timestamp": "<iso>",
      "state_summary": {...},
      "prompt_length": <int>,
      "raw_response_length": <int>,
      "action": {...},
      "metric": <float or null>
    }
"""

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from services.gemini_client import generate, GeminiAuthError, GeminiQuotaError

logger = logging.getLogger(__name__)

# ── Log file location ──────────────────────────────────────────────────────────
_LOG_DIR  = Path(os.getenv("LEARNING_LOG_DIR", "learning_logs"))
_LOG_FILE = _LOG_DIR / "learning_iterations.jsonl"
_LOG_DIR.mkdir(parents=True, exist_ok=True)

_iteration_counter: int = 0

# ── System prompt for the learning loop ────────────────────────────────────────
_LEARNING_SYSTEM_PROMPT = """\
You are an AI optimisation agent for Indian Railways maintenance scheduling.
You observe the current state of a maintenance simulation and decide the best
next action to improve track availability, reduce train delays and increase
safety compliance.

State fields you may see:
  - active_blocks: list of current maintenance blocks (station, dept, time)
  - pending_requests: list of unscheduled maintenance requests
  - conflicts: list of detected scheduling conflicts
  - delay_risk: overall delay risk percentage
  - confidence: AI plan confidence score
  - iteration: current loop step

Your response MUST be a valid JSON object with this structure:
{
  "action_type": "<RESCHEDULE | MERGE | DEFER | APPROVE | FLAG_CONFLICT | NO_CHANGE>",
  "target_block_id": "<block_id or null>",
  "recommendation": "<one-sentence explanation>",
  "priority": "<HIGH | MEDIUM | LOW>",
  "suggested_time": "<HH:MM or null>",
  "reason": "<brief reasoning based strictly on the observed state>"
}

Reply with ONLY the JSON object. No prose, no markdown, no code fences.
"""


def _build_state_prompt(state: Dict[str, Any]) -> str:
    """Serialise simulation state into the Gemini prompt."""
    return (
        f"Current simulation state (iteration {state.get('iteration', '?')}):\n"
        f"{json.dumps(state, indent=2, default=str)}\n\n"
        "Based on this state, what is the single best action to take right now?"
    )


def _parse_action(raw: str) -> Dict[str, Any]:
    """
    Parse the model's JSON response into an action dict.
    Returns a safe default (NO_CHANGE) if parsing fails.
    """
    clean = raw.strip()
    if clean.startswith("```"):
        parts = clean.split("```")
        clean = parts[1] if len(parts) > 1 else clean
        if clean.startswith("json"):
            clean = clean[4:]
        clean = clean.strip()
    try:
        action = json.loads(clean)
        if "action_type" not in action:
            raise ValueError("Missing action_type")
        return action
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("Learning loop: could not parse action from response: %s", exc)
        return {
            "action_type": "NO_CHANGE",
            "target_block_id": None,
            "recommendation": "Could not parse model response; no action taken.",
            "priority": "LOW",
            "suggested_time": None,
            "reason": f"Parse error: {exc}",
            "_raw_response": raw[:300],
        }


def _log_iteration(
    iteration: int,
    state: Dict[str, Any],
    prompt: str,
    raw_response: str,
    action: Dict[str, Any],
    metric: Optional[float],
    supabase_client=None,
) -> None:
    """Append one iteration record to the JSONL log and optionally to Supabase."""
    record = {
        "iteration": iteration,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "state_summary": {
            "active_blocks": len(state.get("active_blocks", [])),
            "pending_requests": len(state.get("pending_requests", [])),
            "conflicts": len(state.get("conflicts", [])),
            "delay_risk": state.get("delay_risk"),
        },
        "prompt_length": len(prompt),
        "raw_response_length": len(raw_response),
        "action": action,
        "metric": metric,
    }

    # Write to JSONL file
    try:
        with open(_LOG_FILE, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, default=str) + "\n")
    except OSError as exc:
        logger.error("Learning loop: failed to write log: %s", exc)

    # Optionally persist to Supabase historical_outcomes
    if supabase_client:
        try:
            supabase_client.table("historical_outcomes").insert([{
                "block_id": action.get("target_block_id") or f"LEARN-{iteration}",
                "department": state.get("department", "AI-LOOP"),
                "recommended_window": action.get("suggested_time"),
                "completion_status": action.get("action_type", "NO_CHANGE"),
                "approval_action": action.get("recommendation", ""),
                "approval_comments": action.get("reason", ""),
                "delay_mins": int(state.get("delay_risk", 0)),
            }]).execute()
        except Exception as exc:
            logger.warning("Learning loop: Supabase log failed: %s", exc)


def run_learning_step(
    state: Dict[str, Any],
    supabase_client=None,
    metric: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Execute one self-learning iteration.

    Parameters
    ----------
    state           : Current simulation/world state dict.
    supabase_client : Optional Supabase client for logging.
    metric          : Optional scalar reward/performance metric for this step.

    Returns
    -------
    dict — The parsed action the simulation should apply.
    """
    global _iteration_counter
    _iteration_counter += 1
    state["iteration"] = state.get("iteration", _iteration_counter)

    prompt = _build_state_prompt(state)
    raw_response = ""

    try:
        raw_response = generate(
            prompt,
            system_instruction=_LEARNING_SYSTEM_PROMPT,
            temperature=0.2,
            max_output_tokens=512,
        )
        action = _parse_action(raw_response)
        logger.info(
            "Learning step %d: action=%s priority=%s",
            _iteration_counter,
            action.get("action_type"),
            action.get("priority"),
        )
    except (GeminiAuthError, GeminiQuotaError) as exc:
        logger.error("Learning loop: Gemini unavailable: %s", exc)
        action = {
            "action_type": "NO_CHANGE",
            "recommendation": "Gemini unavailable; no action taken.",
            "priority": "LOW",
            "reason": str(exc),
        }
    except Exception as exc:
        logger.error("Learning loop: unexpected error: %s", exc)
        action = {
            "action_type": "NO_CHANGE",
            "recommendation": "Unexpected error; no action taken.",
            "reason": str(exc),
        }

    _log_iteration(
        _iteration_counter, state, prompt, raw_response, action, metric, supabase_client
    )
    return action


def get_log_path() -> str:
    """Return the absolute path to the current iteration log file."""
    return str(_LOG_FILE.resolve())
