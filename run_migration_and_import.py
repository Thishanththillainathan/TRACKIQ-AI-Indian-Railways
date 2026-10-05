"""
RAILWAY DATA INTEGRATION — Migration + Import Pipeline
=======================================================
Runs in 3 phases:
  1. Creates all new Supabase tables via direct psycopg2 connection
  2. Imports all Excel data into those tables
  3. Verifies row counts

Usage:
  python run_migration_and_import.py

Requires:
  pip install psycopg2-binary openpyxl python-dotenv supabase

The Supabase PostgreSQL connection string is derived from the project URL.
Project: utrhtyjbhwyecxizmveo.supabase.co
DB host: db.utrhtyjbhwyecxizmveo.supabase.co  port: 5432
"""

import os, sys, json, math, re, time
from pathlib import Path
from dotenv import load_dotenv

# ── Load env ──────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / "backend" / ".env", override=False)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY", "")
PROJECT_ID   = re.search(r"https://([^.]+)\.supabase\.co", SUPABASE_URL)
PROJECT_ID   = PROJECT_ID.group(1) if PROJECT_ID else ""

print(f"Project ID: {PROJECT_ID}")
print(f"Key prefix: {SUPABASE_KEY[:12]}...")

# ── Import via Supabase REST (upsert-based) ────────────────────────────────────
import requests

def supabase_upsert(table: str, rows: list, on_conflict: str = None, batch_size: int = 200) -> dict:
    """Upsert rows into a Supabase table in batches. Returns {inserted, errors}."""
    if not rows:
        return {"inserted": 0, "errors": []}

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    if on_conflict:
        url += f"?on_conflict={on_conflict}"

    total_inserted = 0
    errors = []
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        # Sanitize: replace NaN/inf with None
        clean = []
        for row in batch:
            cr = {}
            for k, v in row.items():
                if v is None or v == "":
                    cr[k] = None
                elif isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                    cr[k] = None
                elif isinstance(v, str) and v.strip().lower() in ("nan", "none", "null", ""):
                    cr[k] = None
                else:
                    cr[k] = v
            clean.append(cr)

        resp = requests.post(url, json=clean, headers=headers)
        if resp.status_code in (200, 201, 204):
            total_inserted += len(batch)
        else:
            err = f"HTTP {resp.status_code}: {resp.text[:200]}"
            errors.append(err)
            print(f"  !! Batch error for {table}: {err}")
        time.sleep(0.05)  # gentle rate limiting

    return {"inserted": total_inserted, "errors": errors}


def supabase_count(table: str) -> int:
    """Return the row count of a Supabase table."""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Prefer": "count=exact",
    }
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}?select=count",
        headers=headers
    )
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list) and data and "count" in data[0]:
            return data[0]["count"]
    # fallback: read header
    cr = resp.headers.get("Content-Range", "")
    if "/" in cr:
        return int(cr.split("/")[-1])
    return -1


def create_table_if_missing(table: str) -> bool:
    """Check if table exists by attempting a 0-row fetch."""
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    resp = requests.get(f"{SUPABASE_URL}/rest/v1/{table}?limit=0", headers=headers)
    return resp.status_code == 200


# ── Excel helpers ─────────────────────────────────────────────────────────────
import openpyxl

def read_sheet(wb_path: str, sheet_name: str, header_search_rows: int = 10) -> list[dict]:
    """Read a sheet and return list of dicts. Skips blank rows."""
    wb = openpyxl.load_workbook(wb_path, read_only=True, data_only=True)
    ws = wb[sheet_name]
    all_rows = list(ws.iter_rows(values_only=True))
    wb.close()

    # Find header row
    header_row_idx = None
    for i, row in enumerate(all_rows[:header_search_rows]):
        non_null = [c for c in row if c is not None and str(c).strip() != ""]
        if len(non_null) >= 2:
            header_row_idx = i
            break

    if header_row_idx is None:
        return []

    headers = []
    for c in all_rows[header_row_idx]:
        h = str(c).strip() if c is not None else ""
        headers.append(h)

    records = []
    for row in all_rows[header_row_idx + 1:]:
        if all(c is None or str(c).strip() == "" for c in row):
            continue
        d = {}
        for j, h in enumerate(headers):
            if not h:
                continue
            v = row[j] if j < len(row) else None
            d[h] = str(v).strip() if v is not None else None
        records.append(d)

    return records


# ── AUDIT LOG ─────────────────────────────────────────────────────────────────
AUDIT = []

def log(workbook, sheet, excel_rows, table, supabase_rows, status, note=""):
    AUDIT.append({
        "Workbook": workbook,
        "Sheet": sheet,
        "Excel Rows": excel_rows,
        "Supabase Table": table,
        "Supabase Rows": supabase_rows,
        "Status": status,
        "Note": note,
    })
    print(f"  [{status}] {workbook}/{sheet} → {table} | Excel={excel_rows} | Supa={supabase_rows} | {note}")


# ════════════════════════════════════════════════════════════════════════════════
# FILE PATHS
# ════════════════════════════════════════════════════════════════════════════════
TMD_FILE = str(ROOT / "data" / "Track_Management_Department.xlsx")
SNT_FILE = str(ROOT / "data" / "Indian_Railway_S&T_Management.xlsx")
TRD_FILE = str(ROOT / "data" / "Indian_Railways_Track_Distribution_System.xlsx")

SOURCE_TMD = "Track_Management_Department.xlsx"
SOURCE_SNT = "Indian_Railway_S&T_Management.xlsx"
SOURCE_TRD = "Indian_Railways_Track_Distribution_System.xlsx"

print("\n" + "="*70)
print("PHASE 1: Verify tables exist (run SQL migration in Supabase first)")
print("="*70)
required_tables = [
    "ir_zones", "ir_divisions", "stations",
    "tmd_zonal_offices", "tmd_org_structure", "tmd_track_statistics",
    "tmd_responsibilities", "tmd_assets",
    "snt_org_structure", "snt_signalling_systems", "snt_kavach_deployment",
    "snt_signalling_by_zone", "snt_rolling_stock", "snt_glossary", "st_assets",
    "ir_trains", "ir_locomotives", "ir_loco_sheds", "ir_trunk_routes",
    "ir_bridges", "ir_tunnels", "ir_network_stats", "ir_trainsets_emu",
    "trd_assets", "department_machines", "historical_records",
]
missing = [t for t in required_tables if not create_table_if_missing(t)]
if missing:
    print(f"MISSING TABLES: {missing}")
    print("Please run railway_data_migration.sql in Supabase Dashboard → SQL Editor first.")
    print("Then re-run this script.")
    sys.exit(1)
print("All required tables exist. ✅")

print("\n" + "="*70)
print("PHASE 2: IMPORT ALL EXCEL DATA")
print("="*70)

# ════════════════════════════════════════════════════════════════════════════════
# TMD — TRACK MANAGEMENT DEPARTMENT
# ════════════════════════════════════════════════════════════════════════════════
print("\n── TMD: Track Management Department ─────────────────────────────────")

# 1. Org Structure
rows = read_sheet(TMD_FILE, "Org Structure")
records = [{
    "level": r.get("Level"),
    "designation": r.get("Designation"),
    "jurisdiction": r.get("Jurisdiction"),
    "reporting_to": r.get("Reporting To"),
    "key_responsibilities": r.get("Key Responsibilities"),
    "source_file": SOURCE_TMD,
    "source_sheet": "Org Structure",
    "department": "TMD",
} for r in rows if r.get("Designation")]
res = supabase_upsert("tmd_org_structure", records)
ct = supabase_count("tmd_org_structure")
log(SOURCE_TMD, "Org Structure", len(rows), "tmd_org_structure", ct, "OK" if not res["errors"] else "PARTIAL", f"errors={len(res['errors'])}")

# 2. Key Officials — stored in tmd_org_structure with different source_sheet
rows2 = read_sheet(TMD_FILE, "Key Officials")
records2 = [{
    "designation": r.get("Position"),
    "level": r.get("Grade/Level"),
    "jurisdiction": r.get("Zone/Division"),
    "reporting_to": r.get("Location"),
    "key_responsibilities": r.get("Key Role"),
    "source_file": SOURCE_TMD,
    "source_sheet": "Key Officials",
    "department": "TMD",
} for r in rows2 if r.get("Position")]
res2 = supabase_upsert("tmd_org_structure", records2)
ct2 = supabase_count("tmd_org_structure")
log(SOURCE_TMD, "Key Officials", len(rows2), "tmd_org_structure", ct2, "OK" if not res2["errors"] else "PARTIAL")

# 3. Zonal TMD Offices
rows3 = read_sheet(TMD_FILE, "Zonal TMD Offices")
records3 = [{
    "zone_code": r.get("Zone Code"),
    "zone_name": r.get("Zone Name"),
    "hq_city": r.get("HQ City"),
    "pce_office": r.get("PCE Office"),
    "divisions": r.get("Divisions"),
    "track_machines_cell": r.get("Track Machines Cell"),
    "tms_cell": r.get("TMS Cell"),
    "source_url": r.get("Source URL"),
    "source_file": SOURCE_TMD,
    "source_sheet": "Zonal TMD Offices",
    "department": "TMD",
} for r in rows3 if r.get("Zone Code")]
res3 = supabase_upsert("tmd_zonal_offices", records3, on_conflict="zone_code")
ct3 = supabase_count("tmd_zonal_offices")
log(SOURCE_TMD, "Zonal TMD Offices", len(rows3), "tmd_zonal_offices", ct3, "OK" if not res3["errors"] else "PARTIAL")

# 4. Responsibilities
rows4 = read_sheet(TMD_FILE, "Responsibilities")
records4 = [{
    "category": r.get("Category"),
    "function": r.get("Function"),
    "description": r.get("Description"),
    "key_metrics": r.get("Key Metrics"),
    "source_file": SOURCE_TMD,
    "source_sheet": "Responsibilities",
    "department": "TMD",
} for r in rows4 if r.get("Function")]
res4 = supabase_upsert("tmd_responsibilities", records4)
ct4 = supabase_count("tmd_responsibilities")
log(SOURCE_TMD, "Responsibilities", len(rows4), "tmd_responsibilities", ct4, "OK" if not res4["errors"] else "PARTIAL")

# 5. Track Statistics
rows5 = read_sheet(TMD_FILE, "Track Statistics")
records5 = [{
    "metric": r.get("Metric"),
    "value": r.get("Value"),
    "unit": r.get("Unit"),
    "remarks": r.get("Remarks"),
    "source_file": SOURCE_TMD,
    "source_sheet": "Track Statistics",
    "department": "TMD",
} for r in rows5 if r.get("Metric")]
res5 = supabase_upsert("tmd_track_statistics", records5)
ct5 = supabase_count("tmd_track_statistics")
log(SOURCE_TMD, "Track Statistics", len(rows5), "tmd_track_statistics", ct5, "OK" if not res5["errors"] else "PARTIAL")

# 6. Training & Research — stored in tmd_responsibilities as separate sheet
rows6 = read_sheet(TMD_FILE, "Training & Research")
records6 = [{
    "category": "Training & Research",
    "function": r.get("Institution"),
    "description": r.get("Focus Area"),
    "key_metrics": r.get("Key Programs"),
    "source_file": SOURCE_TMD,
    "source_sheet": "Training & Research",
    "department": "TMD",
} for r in rows6 if r.get("Institution")]
res6 = supabase_upsert("tmd_responsibilities", records6)
ct6 = supabase_count("tmd_responsibilities")
log(SOURCE_TMD, "Training & Research", len(rows6), "tmd_responsibilities", ct6, "OK" if not res6["errors"] else "PARTIAL", "merged into tmd_responsibilities")

# 7. TMD Assets — seed from ir_locomotives (loco assets are TRD, not TMD)
# For TMD we generate track-machine asset stubs from tmd_zonal_offices
tmd_asset_rows = []
for r in rows3:
    zc = r.get("Zone Code","")
    zn = r.get("Zone Name","")
    hq = r.get("HQ City","")
    if zc:
        tmd_asset_rows.append({
            "asset_code": f"TMD-TAMPER-{zc}",
            "asset_name": f"Tamping Machine — {zn}",
            "asset_type": "Tamping Machine",
            "station_name": hq,
            "station_code": None,
            "division": None,
            "zone": zc,
            "status": "Operational",
            "source_file": SOURCE_TMD,
            "source_sheet": "Zonal TMD Offices",
            "department": "TMD",
        })
res7 = supabase_upsert("tmd_assets", tmd_asset_rows, on_conflict="asset_code")
ct7 = supabase_count("tmd_assets")
log(SOURCE_TMD, "Zonal TMD Offices (asset seeds)", len(tmd_asset_rows), "tmd_assets", ct7, "OK" if not res7["errors"] else "PARTIAL", "derived 1 asset per zone office")

print(f"  TMD import done.")

# ════════════════════════════════════════════════════════════════════════════════
# S&T — SIGNAL & TELECOM
# ════════════════════════════════════════════════════════════════════════════════
print("\n── S&T: Signal & Telecom ─────────────────────────────────────────────")

# 8. Zones Master
rows_zm = read_sheet(SNT_FILE, "Zones Master")
records_zm = [{
    "zone_code": r.get("Zone Code"),
    "zone_name": r.get("Zone Name"),
    "headquarters": r.get("Headquarters"),
    "established": r.get("Established"),
    "divisions_count": None if not r.get("No. of Divisions") else (lambda x: int(x) if str(x).isdigit() else None)(r.get("No. of Divisions")),
    "divisions_list": r.get("Divisions"),
    "website": r.get("Official Portal"),
    "source_file": SOURCE_SNT,
    "source_sheet": "Zones Master",
    "department": "SHARED",
} for r in rows_zm if r.get("Zone Code")]
res_zm = supabase_upsert("ir_zones", records_zm, on_conflict="zone_code")
ct_zm = supabase_count("ir_zones")
log(SOURCE_SNT, "Zones Master", len(rows_zm), "ir_zones", ct_zm, "OK" if not res_zm["errors"] else "PARTIAL")

# 9. Divisions Master
rows_dm = read_sheet(SNT_FILE, "Divisions Master")
records_dm = [{
    "zone_code": r.get("Zone Code"),
    "zone_name": r.get("Zone Name"),
    "division": r.get("Division"),
    "status": r.get("Status"),
    "source_file": SOURCE_SNT,
    "source_sheet": "Divisions Master",
    "department": "SHARED",
} for r in rows_dm if r.get("Zone Code") and r.get("Division")]
res_dm = supabase_upsert("ir_divisions", records_dm, on_conflict="zone_code,division")
ct_dm = supabase_count("ir_divisions")
log(SOURCE_SNT, "Divisions Master", len(rows_dm), "ir_divisions", ct_dm, "OK" if not res_dm["errors"] else "PARTIAL")

# 10. S&T Organisation
rows_org = read_sheet(SNT_FILE, "S&T Organisation")
records_org = [{
    "level": r.get("Level"),
    "designation": r.get("Designation / Unit"),
    "jurisdiction": r.get("Jurisdiction"),
    "reports_to": r.get("Reports To"),
    "key_responsibilities": r.get("Key S&T Responsibilities"),
    "data_basis": r.get("Data Basis"),
    "source_file": SOURCE_SNT,
    "source_sheet": "S&T Organisation",
    "department": "SNT",
} for r in rows_org if r.get("Designation / Unit")]
res_org = supabase_upsert("snt_org_structure", records_org)
ct_org = supabase_count("snt_org_structure")
log(SOURCE_SNT, "S&T Organisation", len(rows_org), "snt_org_structure", ct_org, "OK" if not res_org["errors"] else "PARTIAL")

# 11. Signalling Systems
rows_sig = read_sheet(SNT_FILE, "Signalling Systems")
records_sig = [{
    "system": r.get("System"),
    "category": r.get("Category"),
    "function": r.get("Function"),
    "typical_deployment": r.get("Typical Deployment"),
    "status_2026": r.get("Status (2026)"),
    "data_basis": r.get("Data Basis"),
    "source_file": SOURCE_SNT,
    "source_sheet": "Signalling Systems",
    "department": "SNT",
} for r in rows_sig if r.get("System")]
res_sig = supabase_upsert("snt_signalling_systems", records_sig)
ct_sig = supabase_count("snt_signalling_systems")
log(SOURCE_SNT, "Signalling Systems", len(rows_sig), "snt_signalling_systems", ct_sig, "OK" if not res_sig["errors"] else "PARTIAL")

# 12. Kavach Deployment
rows_kav = read_sheet(SNT_FILE, "Kavach (ATP) Deployment")
records_kav = [{
    "item": r.get("Item"),
    "value": r.get("Value"),
    "period": r.get("Period"),
    "detail": r.get("Detail / Source note"),
    "data_basis": r.get("Data Basis"),
    "source_file": SOURCE_SNT,
    "source_sheet": "Kavach (ATP) Deployment",
    "department": "SNT",
} for r in rows_kav if r.get("Item")]
res_kav = supabase_upsert("snt_kavach_deployment", records_kav)
ct_kav = supabase_count("snt_kavach_deployment")
log(SOURCE_SNT, "Kavach (ATP) Deployment", len(rows_kav), "snt_kavach_deployment", ct_kav, "OK" if not res_kav["errors"] else "PARTIAL")

# 13. Signalling By Zone
rows_sbz = read_sheet(SNT_FILE, "Signalling By Zone")
records_sbz = []
for r in rows_sbz:
    zc = r.get("Zone Code")
    if not zc:
        continue
    sc = r.get("Stations in register")
    ei = r.get("EI stations (model)")
    records_sbz.append({
        "zone_code": zc,
        "zone_name": r.get("Zone Name"),
        "stations_count": int(sc) if sc and str(sc).isdigit() else None,
        "share_pct": r.get("Share of stations"),
        "ei_stations_model": int(ei) if ei and str(ei).isdigit() else None,
        "notes": r.get("Notes"),
        "data_basis": r.get("Data Basis"),
        "source_file": SOURCE_SNT,
        "source_sheet": "Signalling By Zone",
        "department": "SNT",
    })
res_sbz = supabase_upsert("snt_signalling_by_zone", records_sbz, on_conflict="zone_code")
ct_sbz = supabase_count("snt_signalling_by_zone")
log(SOURCE_SNT, "Signalling By Zone", len(rows_sbz), "snt_signalling_by_zone", ct_sbz, "OK" if not res_sbz["errors"] else "PARTIAL")

# 14. Rolling Stock
rows_rs = read_sheet(SNT_FILE, "Rolling Stock & Protection")
records_rs = [{
    "class_train": r.get("Class / Train"),
    "train_type": r.get("Type"),
    "power_speed": r.get("Power / Speed"),
    "snt_fitment": r.get("S&T / Protection Fitment"),
    "data_basis": r.get("Data Basis"),
    "source_file": SOURCE_SNT,
    "source_sheet": "Rolling Stock & Protection",
    "department": "SNT",
} for r in rows_rs if r.get("Class / Train")]
res_rs = supabase_upsert("snt_rolling_stock", records_rs)
ct_rs = supabase_count("snt_rolling_stock")
log(SOURCE_SNT, "Rolling Stock & Protection", len(rows_rs), "snt_rolling_stock", ct_rs, "OK" if not res_rs["errors"] else "PARTIAL")

# 15. Glossary
rows_gl = read_sheet(SNT_FILE, "Glossary")
records_gl = [{
    "abbreviation": r.get("Abbreviation"),
    "expansion": r.get("Expansion"),
    "meaning": r.get("Meaning / Role in S&T"),
    "data_basis": r.get("Data Basis"),
    "source_file": SOURCE_SNT,
    "source_sheet": "Glossary",
    "department": "SNT",
} for r in rows_gl if r.get("Abbreviation")]
res_gl = supabase_upsert("snt_glossary", records_gl, on_conflict="abbreviation")
ct_gl = supabase_count("snt_glossary")
log(SOURCE_SNT, "Glossary", len(rows_gl), "snt_glossary", ct_gl, "OK" if not res_gl["errors"] else "PARTIAL")

# 16. S&T Assets — seed from signalling systems (one per system category)
snt_asset_seeds = []
for r in records_sig:
    system = r.get("system","")
    if system:
        snt_asset_seeds.append({
            "asset_code": f"SNT-SYS-{system[:20].replace(' ','-').upper()}",
            "asset_name": system,
            "asset_type": r.get("category","Signalling"),
            "status": "Operational",
            "source_file": SOURCE_SNT,
            "source_sheet": "Signalling Systems",
            "department": "SNT",
        })
res_sta = supabase_upsert("st_assets", snt_asset_seeds, on_conflict="asset_code")
ct_sta = supabase_count("st_assets")
log(SOURCE_SNT, "Signalling Systems (asset seeds)", len(snt_asset_seeds), "st_assets", ct_sta, "OK" if not res_sta["errors"] else "PARTIAL", "1 asset per signalling system")

# 17. STATIONS REGISTER — 8,989 rows  ★ CRITICAL ★
print("\n  Importing Stations Register (8989 rows) — this may take ~60s...")
rows_stn = read_sheet(SNT_FILE, "Stations Register")
# header detection: actual data header is row 3 in this sheet (rows 1-2 are title/desc)
# After read_sheet finds the first 2-col row, which may be the title. Let's manually detect.
# Re-read with explicit skip
import openpyxl as _opx
_wb = _opx.load_workbook(SNT_FILE, read_only=True, data_only=True)
_ws = _wb["Stations Register"]
_all = list(_ws.iter_rows(values_only=True))
_wb.close()
# Find the header with "Station Code" in it
_hdr_idx = None
for _i, _r in enumerate(_all[:10]):
    if any("Station Code" in str(c) for c in _r if c):
        _hdr_idx = _i
        break
if _hdr_idx is None:
    print("  WARNING: Could not find Stations Register header — skipping")
    log(SOURCE_SNT, "Stations Register", 0, "stations", 0, "SKIP", "header not found")
else:
    _headers = [str(c).strip() if c is not None else "" for c in _all[_hdr_idx]]
    stn_records = []
    for _row in _all[_hdr_idx+1:]:
        if all(c is None or str(c).strip() == "" for c in _row):
            continue
        d = {_headers[j]: (str(_row[j]).strip() if j < len(_row) and _row[j] is not None else None)
             for j in range(len(_headers)) if _headers[j]}
        code = d.get("Station Code","").strip()
        name = d.get("Station Name","").strip()
        if not code or not name:
            continue
        lat = d.get("Lat")
        lon = d.get("Lon")
        try: lat = float(lat) if lat else None
        except: lat = None
        try: lon = float(lon) if lon else None
        except: lon = None
        tier = d.get("S&T Tier (derived)")
        try: tier = int(float(tier)) if tier else None
        except: tier = None
        stn_records.append({
            "station_code": code,
            "station_name": name,
            "zone_code": d.get("Zone"),
            "zone_name": d.get("Zone Name"),
            "state": d.get("State"),
            "latitude": lat,
            "longitude": lon,
            "station_type": d.get("Station Type (derived)"),
            "snt_tier": tier,
            "data_basis": d.get("Data Basis"),
            "source_file": SOURCE_SNT,
            "source_sheet": "Stations Register",
            "department": "SHARED",
            "google_maps_url": (f"https://www.google.com/maps/search/?api=1&query={lat},{lon}" if lat and lon else None),
        })

    print(f"  Prepared {len(stn_records)} station records. Upserting in batches...")
    res_stn = supabase_upsert("stations", stn_records, on_conflict="station_code", batch_size=150)
    ct_stn = supabase_count("stations")
    log(SOURCE_SNT, "Stations Register", len(stn_records), "stations", ct_stn,
        "OK" if not res_stn["errors"] else "PARTIAL",
        f"upserted on station_code. errors={len(res_stn['errors'])}")

print(f"  S&T import done.")

# ════════════════════════════════════════════════════════════════════════════════
# TRD — TRACTION DISTRIBUTION / NETWORK
# ════════════════════════════════════════════════════════════════════════════════
print("\n── TRD: Traction Distribution / Network ──────────────────────────────")

# 18. Zones (TRD version — richer than S&T, has route_km etc.)
rows_tz = read_sheet(TRD_FILE, "Zones")
records_tz = [{
    "zone_code": r.get("Zone Code"),
    "zone_name": r.get("Zone Name"),
    "headquarters": r.get("Headquarters"),
    "established": r.get("Established"),
    "divisions_count": None if not r.get("Divisions") else (lambda x: int(x) if x and str(x).isdigit() else None)(r.get("Divisions")),
    "divisions_list": r.get("Divisions List"),
    "route_km": r.get("Route km (approx)"),
    "track_km": r.get("Track km (approx)"),
    "electrified_pct": r.get("Electrified %"),
    "gauge": r.get("Gauge"),
    "website": r.get("Website"),
    "states_served": r.get("States Served"),
    "google_maps_hq": r.get("Google Maps (HQ)"),
    "source_file": SOURCE_TRD,
    "source_sheet": "Zones",
    "department": "SHARED",
} for r in rows_tz if r.get("Zone Code")]
# Upsert enriching existing S&T zones rows
res_tz = supabase_upsert("ir_zones", records_tz, on_conflict="zone_code")
ct_tz = supabase_count("ir_zones")
log(SOURCE_TRD, "Zones", len(rows_tz), "ir_zones", ct_tz, "OK" if not res_tz["errors"] else "PARTIAL", "enriched with route_km/track_km")

# 19. Divisions (TRD version — adds state + google_maps)
rows_td = read_sheet(TRD_FILE, "Divisions")
records_td = [{
    "zone_code": r.get("Zone Code"),
    "zone_name": r.get("Zone Name"),
    "division": r.get("Division"),
    "division_hq": r.get("Division HQ"),
    "state": r.get("State"),
    "google_maps": r.get("Google Maps (HQ)"),
    "source_file": SOURCE_TRD,
    "source_sheet": "Divisions",
    "department": "SHARED",
} for r in rows_td if r.get("Zone Code") and r.get("Division")]
res_td = supabase_upsert("ir_divisions", records_td, on_conflict="zone_code,division")
ct_td = supabase_count("ir_divisions")
log(SOURCE_TRD, "Divisions", len(rows_td), "ir_divisions", ct_td, "OK" if not res_td["errors"] else "PARTIAL", "enriched with state+maps")

# 20. Trains (2858 rows)
print("  Importing ir_trains (2858 rows)...")
_wb2 = _opx.load_workbook(TRD_FILE, read_only=True, data_only=True)
_ws2 = _wb2["Trains"]
_all2 = []
for _i2, _r2 in enumerate(_ws2.iter_rows(values_only=True)):
    _all2.append(_r2)
_wb2.close()
# Find header
_hdr2 = None
for _i2, _r2 in enumerate(_all2[:5]):
    if any("Train No" in str(c) for c in _r2 if c):
        _hdr2 = _i2; break
train_records = []
if _hdr2 is not None:
    _hdrs2 = [str(c).strip() if c else "" for c in _all2[_hdr2]]
    for _row2 in _all2[_hdr2+1:]:
        if all(c is None or str(c).strip() == "" for c in _row2): continue
        d2 = {_hdrs2[j]: (str(_row2[j]).strip() if j < len(_row2) and _row2[j] is not None else None)
              for j in range(len(_hdrs2)) if _hdrs2[j]}
        tn = d2.get("Train No")
        try: tn = int(tn) if tn else None
        except: tn = None
        if not tn: continue
        dist = d2.get("Distance (km)")
        try: dist = int(dist) if dist else None
        except: dist = None
        stops = d2.get("No. of Stops")
        try: stops = int(stops) if stops else None
        except: stops = None
        train_records.append({
            "train_no": tn,
            "train_name": d2.get("Train Name"),
            "train_type": d2.get("Train Type"),
            "origin_code": d2.get("Origin Code"),
            "origin_station": d2.get("Origin Station"),
            "destination_code": d2.get("Destination Code"),
            "destination_station": d2.get("Destination Station"),
            "distance_km": dist,
            "duration_hhmm": d2.get("Duration (h:mm)"),
            "days_of_run": d2.get("Days of Run"),
            "stops_count": stops,
            "zone_origin": d2.get("Zone (origin)"),
            "google_maps": d2.get("Google Maps (Origin-Dest)"),
            "source_file": SOURCE_TRD,
            "source_sheet": "Trains",
            "department": "TRD",
        })
res_tr = supabase_upsert("ir_trains", train_records, on_conflict="train_no", batch_size=150)
ct_tr = supabase_count("ir_trains")
log(SOURCE_TRD, "Trains", len(train_records), "ir_trains", ct_tr, "OK" if not res_tr["errors"] else "PARTIAL", f"errors={len(res_tr['errors'])}")

# 21. Locomotives
rows_loco = read_sheet(TRD_FILE, "Locomotives")
loco_records = [{
    "class": r.get("Class"),
    "traction": r.get("Traction"),
    "gauge": r.get("Gauge"),
    "loco_type": r.get("Type"),
    "power_hp": r.get("Power (HP, approx)"),
    "max_speed_kmh": r.get("Max Speed (km/h)"),
    "tractive_effort": r.get("Tractive Effort (kN)"),
    "axle_load_t": r.get("Axle Load (t)"),
    "builder": r.get("Builder / Works"),
    "year_introduced": r.get("Year Introduced"),
    "status": r.get("Status"),
    "notes": r.get("Notes"),
    "source_file": SOURCE_TRD,
    "source_sheet": "Locomotives",
    "department": "TRD",
} for r in rows_loco if r.get("Class")]
res_loco = supabase_upsert("ir_locomotives", loco_records, on_conflict="class")
ct_loco = supabase_count("ir_locomotives")
log(SOURCE_TRD, "Locomotives", len(rows_loco), "ir_locomotives", ct_loco, "OK" if not res_loco["errors"] else "PARTIAL")

# 22. Loco Sheds
rows_sheds = read_sheet(TRD_FILE, "Loco_Sheds")
shed_records = [{
    "shed_name": r.get("Shed Name"),
    "city": r.get("City"),
    "state": r.get("State"),
    "zone": r.get("Zone"),
    "traction": r.get("Traction"),
    "gauge": r.get("Gauge"),
    "classes_housed": r.get("Classes Housed"),
    "coordinates": r.get("Coordinates (approx)"),
    "google_maps": r.get("Google Maps"),
    "notes": r.get("Notes"),
    "source_file": SOURCE_TRD,
    "source_sheet": "Loco_Sheds",
    "department": "TRD",
} for r in rows_sheds if r.get("Shed Name")]
res_sheds = supabase_upsert("ir_loco_sheds", shed_records, on_conflict="shed_name")
ct_sheds = supabase_count("ir_loco_sheds")
log(SOURCE_TRD, "Loco_Sheds", len(rows_sheds), "ir_loco_sheds", ct_sheds, "OK" if not res_sheds["errors"] else "PARTIAL")

# 23. Trunk Routes
rows_tr2 = read_sheet(TRD_FILE, "Trunk_Routes")
tr2_records = [{
    "route_name": r.get("Route Name"),
    "from_city": r.get("From"),
    "to_city": r.get("To"),
    "via_stations": r.get("Via (key stations)"),
    "route_km": r.get("Route km (approx)"),
    "gauge": r.get("Gauge"),
    "electrified": r.get("Electrified"),
    "opened": r.get("Opened"),
    "zones": r.get("Zones"),
    "states": r.get("States"),
    "google_maps": r.get("Google Maps (From-To)"),
    "notes": r.get("Notes"),
    "source_file": SOURCE_TRD,
    "source_sheet": "Trunk_Routes",
    "department": "TRD",
} for r in rows_tr2 if r.get("Route Name")]
res_tr2 = supabase_upsert("ir_trunk_routes", tr2_records, on_conflict="route_name")
ct_tr2 = supabase_count("ir_trunk_routes")
log(SOURCE_TRD, "Trunk_Routes", len(rows_tr2), "ir_trunk_routes", ct_tr2, "OK" if not res_tr2["errors"] else "PARTIAL")

# 24. Bridges
rows_br = read_sheet(TRD_FILE, "Bridges")
br_records = []
for r in rows_br:
    if not r.get("Bridge Name"): continue
    lat = r.get("Latitude"); lon = r.get("Longitude")
    try: lat = float(lat) if lat else None
    except: lat = None
    try: lon = float(lon) if lon else None
    except: lon = None
    br_records.append({
        "bridge_name": r.get("Bridge Name"),
        "river": r.get("River / Waterbody"),
        "route_section": r.get("Route / Section"),
        "zone": r.get("Zone"),
        "length_m": r.get("Length (m)"),
        "bridge_type": r.get("Type"),
        "opened": r.get("Opened"),
        "state": r.get("State"),
        "latitude": lat,
        "longitude": lon,
        "google_maps": r.get("Google Maps"),
        "notes": r.get("Notes"),
        "source_file": SOURCE_TRD,
        "source_sheet": "Bridges",
        "department": "TRD",
    })
res_br = supabase_upsert("ir_bridges", br_records, on_conflict="bridge_name")
ct_br = supabase_count("ir_bridges")
log(SOURCE_TRD, "Bridges", len(rows_br), "ir_bridges", ct_br, "OK" if not res_br["errors"] else "PARTIAL")

# 25. Tunnels
rows_tun = read_sheet(TRD_FILE, "Tunnels")
tun_records = [{
    "tunnel_name": r.get("Tunnel Name"),
    "route_section": r.get("Route / Section"),
    "zone": r.get("Zone"),
    "length_m": r.get("Length (m)"),
    "opened": r.get("Opened"),
    "state": r.get("State"),
    "coordinates": r.get("Coordinates (approx)"),
    "google_maps": r.get("Google Maps"),
    "notes": r.get("Notes"),
    "source_file": SOURCE_TRD,
    "source_sheet": "Tunnels",
    "department": "TRD",
} for r in rows_tun if r.get("Tunnel Name")]
res_tun = supabase_upsert("ir_tunnels", tun_records, on_conflict="tunnel_name")
ct_tun = supabase_count("ir_tunnels")
log(SOURCE_TRD, "Tunnels", len(rows_tun), "ir_tunnels", ct_tun, "OK" if not res_tun["errors"] else "PARTIAL")

# 26. Network Stats
rows_ns = read_sheet(TRD_FILE, "Network_Stats")
ns_records = [{
    "category": r.get("Category"),
    "parameter": r.get("Parameter"),
    "value_1": r.get("Value 1"),
    "value_2": r.get("Value 2"),
    "electrified": r.get("Electrified"),
    "electrified_pct": r.get("Electrified %"),
    "gauge_breakup": r.get("Gauge Breakup"),
    "divisions": r.get("Divisions"),
    "details": r.get("Details"),
    "source_notes": r.get("Source / Notes"),
    "source_file": SOURCE_TRD,
    "source_sheet": "Network_Stats",
    "department": "TRD",
} for r in rows_ns if r.get("Parameter")]
res_ns = supabase_upsert("ir_network_stats", ns_records)
ct_ns = supabase_count("ir_network_stats")
log(SOURCE_TRD, "Network_Stats", len(rows_ns), "ir_network_stats", ct_ns, "OK" if not res_ns["errors"] else "PARTIAL")

# 27. Trainsets EMU
rows_emu = read_sheet(TRD_FILE, "Trainsets_EMU")
emu_records = [{
    "name": r.get("Name"),
    "emu_type": r.get("Type"),
    "builder": r.get("Builder"),
    "introduced": r.get("Introduced"),
    "consist": r.get("Consist"),
    "capacity": r.get("Capacity (approx)"),
    "max_speed_kmh": r.get("Max Speed (km/h)"),
    "traction": r.get("Traction"),
    "routes": r.get("Routes"),
    "gauge": r.get("Gauge"),
    "source_file": SOURCE_TRD,
    "source_sheet": "Trainsets_EMU",
    "department": "TRD",
} for r in rows_emu if r.get("Name")]
res_emu = supabase_upsert("ir_trainsets_emu", emu_records, on_conflict="name")
ct_emu = supabase_count("ir_trainsets_emu")
log(SOURCE_TRD, "Trainsets_EMU", len(rows_emu), "ir_trainsets_emu", ct_emu, "OK" if not res_emu["errors"] else "PARTIAL")

# 28. TRD Assets — seed from locomotives (active ones)
trd_asset_records = []
for r in loco_records:
    status_val = r.get("status","")
    if status_val and any(x in status_val.lower() for x in ("retired","phase")): continue
    cls = r.get("class","")
    trd_asset_records.append({
        "asset_code": f"TRD-LOCO-{cls.replace('/','').replace(' ','')}",
        "asset_name": f"{cls} Locomotive",
        "asset_type": r.get("loco_type","Locomotive"),
        "status": "Operational",
        "source_file": SOURCE_TRD,
        "source_sheet": "Locomotives",
        "department": "TRD",
    })
res_trd_a = supabase_upsert("trd_assets", trd_asset_records, on_conflict="asset_code")
ct_trd_a = supabase_count("trd_assets")
log(SOURCE_TRD, "Locomotives (asset seeds)", len(trd_asset_records), "trd_assets", ct_trd_a, "OK" if not res_trd_a["errors"] else "PARTIAL", "active locos → trd_assets")

# 29. Department machines — seed from locos + loco sheds
dmachine_records = []
for r in loco_records:
    cls = r.get("class","")
    if not cls: continue
    dmachine_records.append({
        "machine_id": f"LOCO-{cls.replace('/','').replace(' ','')}",
        "machine_name": f"{cls} Locomotive",
        "machine_type": r.get("loco_type","Locomotive"),
        "department": "TRD",
        "loco_class": cls,
        "traction": r.get("traction"),
        "gauge": r.get("gauge"),
        "power_hp": r.get("power_hp"),
        "max_speed_kmh": r.get("max_speed_kmh"),
        "status": "Operational" if r.get("status","") and "retired" not in r.get("status","").lower() else "Retired",
        "source_file": SOURCE_TRD,
        "source_sheet": "Locomotives",
    })
res_dm = supabase_upsert("department_machines", dmachine_records, on_conflict="machine_id")
ct_dm2 = supabase_count("department_machines")
log(SOURCE_TRD, "Locomotives (machines)", len(dmachine_records), "department_machines", ct_dm2, "OK" if not res_dm["errors"] else "PARTIAL")

# 30. TRD Stations — merge into stations table (enrich with district, gauge, trains_serving)
print("\n  Merging TRD Stations (13141 rows) into stations table...")
_wb3 = _opx.load_workbook(TRD_FILE, read_only=True, data_only=True)
_ws3 = _wb3["Stations"]
_all3 = []
for _r3 in _ws3.iter_rows(values_only=True):
    _all3.append(_r3)
_wb3.close()
# Find header
_hdr3 = None
for _i3, _r3 in enumerate(_all3[:5]):
    if any("Station Code" in str(c) for c in _r3 if c):
        _hdr3 = _i3; break
trd_stn_records = []
if _hdr3 is not None:
    _hdrs3 = [str(c).strip() if c else "" for c in _all3[_hdr3]]
    for _row3 in _all3[_hdr3+1:]:
        if all(c is None or str(c).strip() == "" for c in _row3): continue
        d3 = {_hdrs3[j]: (str(_row3[j]).strip() if j < len(_row3) and _row3[j] is not None else None)
              for j in range(len(_hdrs3)) if _hdrs3[j]}
        code3 = d3.get("Station Code","").strip()
        name3 = d3.get("Station Name","").strip()
        if not code3 or not name3: continue
        lat3 = d3.get("Latitude"); lon3 = d3.get("Longitude")
        try: lat3 = float(lat3) if lat3 and lat3 not in ("None","") else None
        except: lat3 = None
        try: lon3 = float(lon3) if lon3 and lon3 not in ("None","") else None
        except: lon3 = None
        ts3 = d3.get("Trains Serving (from schedules)")
        try: ts3 = int(ts3) if ts3 else None
        except: ts3 = None
        trd_stn_records.append({
            "station_code": code3,
            "station_name": name3,
            "zone_code": d3.get("Zone Code"),
            "zone_name": d3.get("Zone Name"),
            "state": d3.get("State"),
            "district": d3.get("District/Region"),
            "latitude": lat3,
            "longitude": lon3,
            "gauge": d3.get("Gauge"),
            "heritage_line": d3.get("Heritage Line"),
            "trains_serving": ts3,
            "data_basis": "TRD-FACT",
            "source_file": SOURCE_TRD,
            "source_sheet": "Stations",
            "department": "SHARED",
            "google_maps_url": d3.get("Google Maps"),
        })

print(f"  Prepared {len(trd_stn_records)} TRD station records.")
res_trd_stn = supabase_upsert("stations", trd_stn_records, on_conflict="station_code", batch_size=150)
ct_stn_final = supabase_count("stations")
log(SOURCE_TRD, "Stations", len(trd_stn_records), "stations", ct_stn_final,
    "OK" if not res_trd_stn["errors"] else "PARTIAL",
    f"merged with S&T stations. Final count={ct_stn_final}. errors={len(res_trd_stn['errors'])}")

# ════════════════════════════════════════════════════════════════════════════════
# PHASE 3: FINAL VERIFICATION
# ════════════════════════════════════════════════════════════════════════════════
print("\n" + "="*70)
print("PHASE 3: VERIFICATION — Row Counts")
print("="*70)
verify_tables = [
    "ir_zones", "ir_divisions", "stations",
    "tmd_org_structure", "tmd_zonal_offices", "tmd_track_statistics",
    "tmd_responsibilities", "tmd_assets",
    "snt_org_structure", "snt_signalling_systems", "snt_kavach_deployment",
    "snt_signalling_by_zone", "snt_rolling_stock", "snt_glossary", "st_assets",
    "ir_trains", "ir_locomotives", "ir_loco_sheds", "ir_trunk_routes",
    "ir_bridges", "ir_tunnels", "ir_network_stats", "ir_trainsets_emu",
    "trd_assets", "department_machines",
]
print(f"{'Table':<35} {'Rows':>8}")
print("-"*45)
for t in verify_tables:
    c = supabase_count(t)
    print(f"  {t:<33} {c:>8}")

# ════════════════════════════════════════════════════════════════════════════════
# PRINT AUDIT REPORT
# ════════════════════════════════════════════════════════════════════════════════
print("\n" + "="*70)
print("DATA IMPORT AUDIT REPORT")
print("="*70)
print(f"{'Workbook':<42} {'Sheet':<35} {'Excel':>6} {'Supa':>6} {'Status':<10}")
print("-"*100)
for a in AUDIT:
    print(f"  {a['Workbook']:<40} {a['Sheet']:<35} {a['Excel Rows']:>6} {a['Supabase Rows']:>6} {a['Status']:<10}  {a.get('Note','')}")

print("\nDone. Run website integration next.")
