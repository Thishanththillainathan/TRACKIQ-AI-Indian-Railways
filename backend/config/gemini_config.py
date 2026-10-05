"""
TRACKIQ AI — Gemini Configuration
===================================
Adjustable constants for all Gemini calls across every subsystem.
Uses the new google-genai SDK.  The API key is NEVER stored here.
"""

import os

# ── Model selection ────────────────────────────────────────────────────────────
# gemini-2.0-flash-exp  : latest fast model (good default)
# gemini-2.5-flash      : if available on your plan
GEMINI_DEFAULT_MODEL     = os.getenv("GEMINI_MODEL",            "gemini-2.5-flash")
GEMINI_STRUCTURED_MODEL  = os.getenv("GEMINI_STRUCTURED_MODEL", "gemini-2.5-flash")
GEMINI_STREAM_MODEL      = os.getenv("GEMINI_STREAM_MODEL",     "gemini-2.5-flash")

# ── Generation parameters ──────────────────────────────────────────────────────
GEMINI_TEMPERATURE       = float(os.getenv("GEMINI_TEMPERATURE",        "0.3"))
GEMINI_MAX_OUTPUT_TOKENS = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS",    "1024"))
GEMINI_TOP_P             = float(os.getenv("GEMINI_TOP_P",              "0.95"))
GEMINI_TOP_K             = int(os.getenv("GEMINI_TOP_K",                "40"))

# ── Retry / timeout behaviour ──────────────────────────────────────────────────
GEMINI_MAX_RETRIES       = int(os.getenv("GEMINI_MAX_RETRIES",          "2"))
GEMINI_RETRY_DELAY_S     = float(os.getenv("GEMINI_RETRY_DELAY_S",      "1.5"))
GEMINI_REQUEST_TIMEOUT_S = float(os.getenv("GEMINI_REQUEST_TIMEOUT_S",  "30.0"))

# ── Default system instruction shared across subsystems ────────────────────────
RAILOPT_SYSTEM_INSTRUCTION = (
    "You are TRACKIQ AI, an expert Indian Railways maintenance operations assistant. "
    "You help plan, optimize and analyse railway maintenance block schedules. "
    "Always base answers strictly on the provided context data. "
    "If required data is absent, state 'Insufficient data' rather than guessing."
)
