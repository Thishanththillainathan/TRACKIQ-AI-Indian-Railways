"""
TRACKIQ AI — Gemini Connection Test
======================================
Run this script directly to verify the API key and network connectivity:

    cd backend
    python -m tests.test_gemini_connection

No simulation stack required.  Exits 0 on success, 1 on failure.
"""

import os
import sys
from pathlib import Path

# Add backend root to path so imports work whether running as module or script
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

def main() -> int:
    print("=" * 60)
    print("TRACKIQ AI — Gemini Connection Test")
    print("=" * 60)

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        print("FAIL: GEMINI_API_KEY is not set in backend/.env")
        return 1

    print(f"API key found: {api_key[:8]}... (length {len(api_key)})")

    try:
        from services.gemini_client import health_check, GEMINI_DEFAULT_MODEL
        print(f"Model: {GEMINI_DEFAULT_MODEL}")
        print("Sending health-check prompt…")

        result = health_check()

        if result["status"] == "ok":
            print(f"✅ SUCCESS — Gemini responded: '{result.get('response_preview', '')}'")
            return 0
        elif result["status"] == "auth_error":
            print(f"❌ AUTH FAILURE — {result.get('detail', '')}")
            print("   → Rotate your GEMINI_API_KEY in backend/.env")
            return 1
        elif result["status"] == "quota_error":
            print(f"⚠  QUOTA/RATE LIMIT — {result.get('detail', '')}")
            print("   → Key is valid but quota is exhausted; wait or upgrade plan")
            return 1
        else:
            print(f"❌ ERROR — {result.get('detail', '')}")
            return 1

    except ImportError as exc:
        print(f"❌ Import error: {exc}")
        print("   → Run: pip install google-generativeai")
        return 1
    except Exception as exc:
        print(f"❌ Unexpected error: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
