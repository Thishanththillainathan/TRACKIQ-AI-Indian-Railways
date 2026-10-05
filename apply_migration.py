"""
Apply railway_data_migration.sql to Supabase via direct PostgreSQL connection.
Uses psycopg2. Connection string for Supabase:
  host: db.<project_id>.supabase.co
  port: 5432
  dbname: postgres
  user: postgres
  password: <db_password from Supabase Dashboard → Settings → Database>

Set SUPABASE_DB_PASSWORD in .env or pass via environment.
"""
import os, sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent / "backend" / ".env", override=False)

PROJECT_ID = "utrhtyjbhwyecxizmveo"
DB_HOST = f"db.{PROJECT_ID}.supabase.co"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASS = os.getenv("SUPABASE_DB_PASSWORD", "")

if not DB_PASS:
    print("ERROR: SUPABASE_DB_PASSWORD not set in .env")
    print("Get it from: Supabase Dashboard → Project Settings → Database → Connection string")
    print("Add to .env: SUPABASE_DB_PASSWORD=your_db_password")
    sys.exit(1)

try:
    import psycopg2
except ImportError:
    print("psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

sql_file = Path(__file__).parent / "railway_data_migration.sql"
sql = sql_file.read_text(encoding="utf-8")

print(f"Connecting to {DB_HOST}:{DB_PORT}/{DB_NAME}...")
try:
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASS,
        sslmode="require", connect_timeout=30,
    )
    conn.autocommit = True
    cur = conn.cursor()
    print("Connected. Applying migration...")
    
    # Split on semicolons and run each statement
    statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]
    ok = 0
    for stmt in statements:
        if not stmt: continue
        try:
            cur.execute(stmt)
            ok += 1
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                ok += 1  # idempotent - already exists is fine
            else:
                print(f"  WARN: {str(e)[:120]}")
    
    print(f"Migration applied. {ok}/{len(statements)} statements succeeded.")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
