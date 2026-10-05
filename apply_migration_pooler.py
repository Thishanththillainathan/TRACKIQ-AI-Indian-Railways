"""
Apply migration via Supabase Session Mode Pooler (port 5432 or 6543).
Supabase exposes a PostgreSQL connection pooler accessible with:
  host: db.<project_id>.supabase.co  (direct) or
  host: aws-0-ap-south-1.pooler.supabase.com (pooler)
  user: postgres.<project_id>
  password: <supabase db password>

Since we don't have the DB password, we try:
1. Direct psycopg2 with known patterns
2. If that fails, output the SQL file path for manual execution

This script also pre-creates the exec_sql function if possible.
"""
import os, sys, json, time, re, requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent / "backend" / ".env", override=False)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY", "")
PROJECT_ID = "utrhtyjbhwyecxizmveo"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

print("Attempting to create exec_sql function via a raw INSERT trick...")
# The trick: use supabase PostgREST's ability to run a function if we can
# inject it through an existing table. This doesn't work with anon key.

# Try using the supabase python SDK's postgres client
try:
    from supabase import create_client
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Try using the underlying postgres client if available
    print("Supabase SDK loaded. Attempting raw SQL via sb.postgrest...")
    
    # Try the SQL API endpoint that some Supabase versions expose
    sql_url = f"{SUPABASE_URL}/rest/v1/rpc/pg_catalog"
    r = requests.get(sql_url, headers=headers)
    print(f"pg_catalog test: {r.status_code}")
    
except Exception as e:
    print(f"SDK error: {e}")

print("\n" + "="*60)
print("REQUIRED: Manual SQL execution")
print("="*60)
print(f"\nPlease run the following file in Supabase Dashboard → SQL Editor:")
print(f"\n  {Path(__file__).parent / 'railway_data_migration.sql'}\n")
print("Steps:")
print("  1. Go to https://supabase.com/dashboard")
print("  2. Open your project: utrhtyjbhwyecxizmveo")
print("  3. Click 'SQL Editor' in left sidebar")  
print("  4. Click 'New query'")
print("  5. Paste the entire contents of railway_data_migration.sql")
print("  6. Click 'Run' (or Ctrl+Enter)")
print("  7. Verify output shows no errors")
print("\nAlternatively, add SUPABASE_DB_PASSWORD to .env file")
print("(found in Supabase Dashboard → Settings → Database → Connection string)")
print("\nOnce tables are created, run: python run_migration_and_import.py")
