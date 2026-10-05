"""
Apply migration via Supabase Management REST API.
This uses the Supabase project's anon key to POST raw SQL through the /rest/v1/rpc/exec endpoint
if it exists, otherwise falls back to running table-creation via the schema endpoint.

Alternative: uses the supabase-py client's underlying httpx to hit the SQL endpoint
that the Supabase Dashboard uses internally.
"""
import os, sys, json, time, requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent / "backend" / ".env", override=False)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY", "")
PROJECT_ID   = "utrhtyjbhwyecxizmveo"

# Supabase Management API - requires service role or project access token
# Since we only have the anon key, we need to use the pg_dump/restore approach
# OR use the supabase python SDK which supports rpc with anon key if function exists

# Strategy: Create each table by sending a valid INSERT with a "dummy" row and letting
# Supabase auto-reject it if table doesn't exist, which tells us nothing.
# 
# REAL STRATEGY: use the Supabase "sql" API endpoint that was available in older clients
# https://supabase.com/docs/reference/javascript/rpc
# We'll create a stored procedure first via the anon key... but that requires CREATE FUNCTION perms.
#
# FINAL FALLBACK: Use Python supabase-py client's .rpc() which CAN execute arbitrary SQL
# if the function is already registered. Since it's not, we need to use psycopg2.
#
# Since psycopg2 IS available but we lack the password, let's try to get it from the
# Supabase connection string format or from the project's known password.
#
# ALTERNATIVE THAT ALWAYS WORKS: Use the Supabase Edge Function or the REST Schema Cache
# The REAL solution: read the SQL file and run each statement via the
# Supabase Management API's /pg/query endpoint

import subprocess

def run_sql_via_supabase_cli(sql: str) -> bool:
    """Try using supabase CLI if installed."""
    try:
        result = subprocess.run(
            ["supabase", "db", "push", "--debug"],
            capture_output=True, text=True, timeout=30
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

# Check if supabase CLI is available
has_cli = run_sql_via_supabase_cli("SELECT 1")
print(f"Supabase CLI available: {has_cli}")

# Try connecting via psycopg2 with common Supabase password patterns
# The Supabase DB password is set by the user when creating the project
# It defaults to a random string. We need to try the Management API.

print("\nAttempting Supabase Management API...")
# The management API URL
MGMT_BASE = f"https://api.supabase.com/v1/projects/{PROJECT_ID}"

# Try with the anon key as bearer (won't work for management API, needs personal token)
# Instead, use the REST API's sql execution via rpc if exec_sql function exists

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# Test if exec_sql function exists
test = requests.post(
    f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
    json={"query": "SELECT 1 as test"},
    headers=headers,
)
print(f"exec_sql test: {test.status_code}")

if test.status_code == 200:
    # Great! We can execute SQL
    sql_file = Path(__file__).parent / "railway_data_migration.sql"
    sql = sql_file.read_text(encoding="utf-8")
    # Split into individual statements
    stmts = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]
    ok, fail = 0, 0
    for stmt in stmts:
        if not stmt: continue
        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
            json={"query": stmt + ";"},
            headers=headers,
        )
        if r.status_code in (200, 204):
            ok += 1
        else:
            print(f"  FAIL ({r.status_code}): {r.text[:100]}")
            fail += 1
    print(f"SQL via exec_sql: {ok} ok, {fail} failed")
else:
    print(f"exec_sql not available. Status: {test.status_code}: {test.text[:200]}")
    print("\nPlease run railway_data_migration.sql manually in Supabase SQL Editor.")
    print("Then run: python run_migration_and_import.py")
    sys.exit(1)
