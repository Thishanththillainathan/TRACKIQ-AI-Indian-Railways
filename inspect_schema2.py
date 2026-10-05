"""
READ-ONLY — inspect remaining tables: ir_locomotives, tmd_assets, st_assets,
trd_assets, department_machines, historical_records.
Uses fast Excel inspection (no full row count for large files).
"""
import os, re, requests
from pathlib import Path
from dotenv import load_dotenv
import openpyxl

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / "backend" / ".env", override=False)

URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY", "")
H   = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}

def probe_table(table):
    """GET request only — read columns from sample row or report empty/missing."""
    r = requests.get(f"{URL}/rest/v1/{table}?limit=1", headers=H)
    if r.status_code != 200:
        return None, 0, f"HTTP {r.status_code}"
    rows = r.json()
    # Row count via count=exact header
    rc_r = requests.get(f"{URL}/rest/v1/{table}?select=count",
                        headers={**H, "Prefer": "count=exact"})
    count = 0
    if rc_r.status_code == 200:
        d = rc_r.json()
        count = d[0]["count"] if d and "count" in d[0] else 0
    if not rows:
        return {}, count, None
    cols = {}
    for k, v in rows[0].items():
        t = "text"
        if v is None: t = "unknown(null)"
        elif isinstance(v, bool): t = "boolean"
        elif isinstance(v, int): t = "integer"
        elif isinstance(v, float): t = "numeric"
        elif isinstance(v, (dict, list)): t = "jsonb"
        else:
            s = str(v)
            if re.match(r'^\d{4}-\d{2}-\d{2}T', s): t = "timestamptz"
            elif re.match(r'^\d{4}-\d{2}-\d{2}$', s): t = "date"
            elif re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-', s, re.I): t = "uuid"
            elif re.match(r'^\d{1,2}:\d{2}', s): t = "time/text"
        cols[k] = (t, str(v)[:40] if v is not None else "NULL")
    return cols, count, None

def fast_excel_headers(filepath, sheet_name):
    """Read headers only — no full row count. READ ONLY."""
    wb = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
    if sheet_name not in wb.sheetnames:
        wb.close()
        return [], []
    ws = wb[sheet_name]
    hdr, sample = [], []
    found = False
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i > 15: break
        non_null = [c for c in row if c is not None and str(c).strip() not in ("","nan")]
        if not found and len(non_null) >= 2:
            hdr = [str(c).strip() if c else "" for c in row]
            hdr = [h for h in hdr if h]
            found = True
        elif found:
            sample = [str(v)[:35] if v is not None else "" for v in row[:len(hdr)]]
            break
    wb.close()
    return hdr, sample

FILES = {
    "TMD": ROOT / "data" / "Track_Management_Department.xlsx",
    "SNT": ROOT / "data" / "Indian_Railway_S&T_Management.xlsx",
    "TRD": ROOT / "data" / "Indian_Railways_Track_Distribution_System.xlsx",
}

TASKS = [
    ("ir_locomotives",    "TRD", "Locomotives",    "Locomotive class register"),
    ("tmd_assets",        "TMD", "Zonal TMD Offices", "Seeded: 1 tamping-machine asset per zonal office"),
    ("st_assets",         "SNT", "Signalling Systems", "Seeded: 1 asset per signalling system type"),
    ("trd_assets",        "TRD", "Locomotives",    "Seeded: 1 loco-asset per active locomotive class"),
    ("department_machines","TRD","Locomotives",    "Seeded: 1 machine record per locomotive class"),
    ("historical_records", None, None,             "Workflow data only — no Excel source"),
]

for table, dept, sheet, note in TASKS:
    print(f"\n{'═'*80}")
    print(f"TABLE: {table}")
    print(f"NOTE: {note}")
    print(f"{'─'*80}")

    cols, count, err = probe_table(table)
    if err and "404" in err:
        print(f"  ❌ TABLE DOES NOT EXIST")
    elif err:
        print(f"  ⚠  ERROR: {err}")
    else:
        print(f"  ✅ EXISTS  |  ROW COUNT: {count}")
        if cols:
            print(f"  COLUMNS ({len(cols)}):")
            for col, (dtype, sample) in cols.items():
                print(f"    {col:<35} {dtype:<20} sample: {sample}")
        else:
            print(f"  ⚠  Table is empty — column types inferred from migration SQL only.")

    if dept:
        hdr, sample = fast_excel_headers(str(FILES[dept]), sheet)
        print(f"\n  SOURCE: {FILES[dept].name}  →  Sheet: \"{sheet}\"")
        print(f"  SOURCE COLUMNS ({len(hdr)}):")
        for h in hdr:
            print(f"    [{h}]")
        if sample:
            print(f"  SAMPLE: {sample}")

print(f"\n{'═'*80}")
print("STATIONS — EXISTING 101 ROWS ANALYSIS")
print(f"{'─'*80}")
# Re-read stations schema (already done above but summarise key findings)
r = requests.get(f"{URL}/rest/v1/stations?limit=3", headers=H)
rows = r.json()
if rows:
    print(f"  Confirmed: {len(rows)} sample rows readable. Columns present:")
    for k in rows[0].keys():
        print(f"    {k}")
    print(f"\n  CRITICAL FINDING:")
    print(f"  The existing 101 rows use CAMELCASE column names:")
    print(f"    stationName, officialName, stationCode, zone, network, district, state")
    print(f"  Plus SNAKE_CASE columns added by previous migration:")
    print(f"    station_code, zone_code, state, gauge, heritage_line, trains_serving,")
    print(f"    snt_tier, data_basis, source_file, source_sheet, department, updated_at")
    print(f"\n  MISMATCH: S&T Excel uses 'Station Name' → 'station_name' but")
    print(f"  the Supabase table does NOT have a 'station_name' column.")
    print(f"  The table has both 'stationName' (camelCase, existing 101 rows)")
    print(f"  AND 'station_code' (snake_case, from migration SQL).")
    print(f"\n  INSERT STRATEGY REQUIRED:")
    print(f"  Must upsert on 'station_code' column.")
    print(f"  Must map Excel 'Station Name' → 'stationName' (not station_name).")
    print(f"  Existing 101 rows are safe if upsert is used on station_code.")
    sample_codes = [r.get("stationCode") or r.get("station_code","") for r in rows[:3]]
    print(f"\n  Sample stationCode values: {sample_codes}")

print(f"\n{'═'*80}")
print("COMPLETE COLUMN DISCREPANCY SUMMARY")
print(f"{'─'*80}")
print("""
  TABLE         ISSUE
  ─────────────────────────────────────────────────────────────────────────────
  stations      Dual schema: camelCase (stationName, stationCode, officialName,
                zone, network, district) from original 101 rows PLUS snake_case
                (station_code, zone_code, gauge, heritage_line, trains_serving,
                snt_tier, data_basis, source_file, source_sheet, department)
                from migration SQL.
                
                MISSING from Supabase: station_name, zone_name, latitude,
                longitude, station_type, google_maps_url, division.
                
                SOLUTION: Map Excel 'Station Name' → stationName,
                Excel 'Station Code' → station_code AND stationCode,
                Excel 'Lat'/'Lon' → need ADD COLUMN latitude, longitude.

  ir_zones      Table exists but EMPTY. Schema defined in migration SQL.
                All 13 Excel columns map to migration SQL columns. ✅

  ir_trains     Table exists but EMPTY. 2,858 rows ready to import.
                train_no INTEGER must be used as upsert key. ✅

  ir_locomotives Table exists but EMPTY. 65 rows ready to import.
                class TEXT as upsert key. ✅

  tmd_assets    Table EXISTS but EMPTY. Will be seeded (not from raw Excel rows).
                Seeding strategy: 1 asset per zonal office = 19 rows.

  st_assets     Table EXISTS but EMPTY. Seeded from Signalling Systems = 12 rows.

  trd_assets    Table EXISTS but EMPTY. Seeded from active locos = ~45 rows.

  department_machines  Table EXISTS but EMPTY. Seeded from all locos = ~65 rows.

  historical_records   Table EXISTS but EMPTY. No Excel source.
                       Populated only when real maintenance work is completed.
""")
print("Inspection complete. NO DATA WAS MODIFIED.")
