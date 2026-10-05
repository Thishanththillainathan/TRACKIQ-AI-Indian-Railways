"""Final quick check — trd_assets, department_machines, historical_records + stations detail."""
import os, requests
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / "backend" / ".env", override=False)

URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL","")
KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY","")
H   = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}

TABLES = ["trd_assets","department_machines","historical_records","stations"]
for t in TABLES:
    r = requests.get(f"{URL}/rest/v1/{t}?limit=2", headers=H)
    if r.status_code != 200:
        print(f"{t}: MISSING (HTTP {r.status_code})")
        continue
    rc = requests.get(f"{URL}/rest/v1/{t}?select=count", headers={**H,"Prefer":"count=exact"})
    count = rc.json()[0]["count"] if rc.status_code==200 and rc.json() else "?"
    rows = r.json()
    cols = list(rows[0].keys()) if rows else ["(empty — schema only)"]
    print(f"\n{t} | rows={count}")
    print(f"  cols: {cols}")
    if rows:
        print(f"  sample[0]: { {k: str(v)[:30] for k,v in rows[0].items()} }")
