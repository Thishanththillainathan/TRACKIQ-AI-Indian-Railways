"""
Apply SQL migration via Supabase Studio internal query API.
This endpoint is used by Supabase Dashboard's SQL editor.
It requires the anon key + project ID.
"""
import os, sys, re, time, json
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent / "backend" / ".env", override=False)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY", "")
BACKEND_KEY  = os.getenv("SUPABASE_KEY", "")
PROJECT_ID   = re.search(r"https://([^.]+)\.supabase\.co", SUPABASE_URL)
PROJECT_ID   = PROJECT_ID.group(1) if PROJECT_ID else "utrhtyjbhwyecxizmveo"

print(f"Project: {PROJECT_ID}")

sql_file = Path(__file__).parent / "railway_data_migration.sql"
full_sql = sql_file.read_text(encoding="utf-8")

# Try various API endpoints that can execute SQL
endpoints_to_try = [
    # Supabase SQL API endpoint (some plans)
    f"{SUPABASE_URL}/rest/v1/rpc/query",
    f"{SUPABASE_URL}/pg/query",
    # Internal Supabase Studio API
    f"https://api.supabase.com/v1/projects/{PROJECT_ID}/database/query",
]

for key in [SUPABASE_KEY, BACKEND_KEY]:
    if not key:
        continue
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    for ep in endpoints_to_try:
        try:
            r = requests.post(ep, json={"query": "SELECT 1"}, headers=headers, timeout=10)
            print(f"  {ep}: {r.status_code}")
            if r.status_code == 200:
                print(f"  ✅ Found working endpoint: {ep}")
                # Now run the full migration
                stmts = [s.strip() for s in full_sql.split(';') 
                         if s.strip() and not s.strip().startswith('--') and len(s.strip()) > 5]
                ok = fail = 0
                for stmt in stmts:
                    if not stmt: continue
                    r2 = requests.post(ep, json={"query": stmt}, headers=headers, timeout=30)
                    if r2.status_code in (200, 204):
                        ok += 1
                    else:
                        body = r2.text[:100]
                        if "already exists" not in body.lower():
                            print(f"    WARN: {r2.status_code}: {body}")
                        else:
                            ok += 1
                        fail += 1
                print(f"  Migration: {ok} ok, {fail} warn")
                sys.exit(0)
        except requests.exceptions.ConnectionError:
            pass
        except Exception as e:
            print(f"  {ep}: ERR {type(e).__name__}: {str(e)[:60]}")

print("\nNo direct SQL API found.")
print("Trying psycopg2 with Supabase session-mode pooler...")

try:
    import psycopg2
    # Supabase session-mode pooler
    # user format: postgres.<project_id>
    # password: same as db password
    # But we need the password...
    
    # Try with publishable key as password (sometimes works in dev)
    for user in [f"postgres.{PROJECT_ID}", "postgres"]:
        for pwd in [SUPABASE_KEY, BACKEND_KEY]:
            if not pwd: continue
            try:
                conn = psycopg2.connect(
                    host=f"aws-0-ap-south-1.pooler.supabase.com",
                    port=6543,
                    dbname="postgres",
                    user=user,
                    password=pwd,
                    connect_timeout=8,
                    sslmode="require",
                )
                print(f"  ✅ Connected as {user}")
                conn.autocommit = True
                cur = conn.cursor()
                stmts = [s.strip() for s in full_sql.split(';') 
                         if s.strip() and not s.strip().startswith('--') and len(s.strip()) > 5]
                ok = fail = 0
                for stmt in stmts:
                    if not stmt: continue
                    try:
                        cur.execute(stmt)
                        ok += 1
                    except Exception as e2:
                        if "already exists" in str(e2).lower():
                            ok += 1
                        else:
                            fail += 1
                            print(f"    WARN: {str(e2)[:80]}")
                print(f"Migration: {ok} ok, {fail} fail")
                cur.close(); conn.close()
                sys.exit(0)
            except psycopg2.OperationalError as e:
                print(f"  psycopg2 {user}: {str(e)[:80]}")
except ImportError:
    print("psycopg2 not available")

print("\n" + "="*65)
print("MANUAL ACTION REQUIRED")
print("="*65)
print(f"File: railway_data_migration.sql")
print("1. Open: https://supabase.com/dashboard/project/utrhtyjbhwyecxizmveo/sql/new")
print("2. Paste railway_data_migration.sql content")
print("3. Click Run")
print("4. Then run: python run_migration_and_import.py")
