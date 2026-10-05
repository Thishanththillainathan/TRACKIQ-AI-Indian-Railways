"""
READ-ONLY schema inspection of Supabase tables and source Excel files.
NO INSERT, UPDATE, DELETE, ALTER, DROP, TRUNCATE, or import operations.
"""
import os, json, math, re
import requests
import openpyxl
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / "backend" / ".env", override=False)

URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY", "")
HEAD = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}

REPORT_HEAD = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Prefer": "count=exact"}

def get_columns_and_count(table):
    """Return (columns_dict, row_count, error). READ ONLY — GET requests only."""
    # Get row count
    rc_resp = requests.get(f"{URL}/rest/v1/{table}?select=count", headers=REPORT_HEAD)
    row_count = -1
    if rc_resp.status_code == 200:
        data = rc_resp.json()
        if data and isinstance(data, list) and "count" in data[0]:
            row_count = data[0]["count"]
    cr = rc_resp.headers.get("Content-Range", "")
    if row_count == -1 and "/" in cr:
        row_count = int(cr.split("/")[-1])

    # Get schema from a sample row (limit=1) if any rows exist, or limit=0 to detect existence
    resp = requests.get(f"{URL}/rest/v1/{table}?limit=1", headers=HEAD)
    if resp.status_code != 200:
        return None, row_count, f"HTTP {resp.status_code}: {resp.text[:120]}"

    rows = resp.json()
    if not rows:
        # Table exists but empty — try to infer columns from OpenAPI schema
        # Use limit=0 and check if we get any column info
        resp0 = requests.get(f"{URL}/rest/v1/{table}?limit=0", headers=HEAD)
        return {}, row_count, None  # Table exists but empty — can't infer cols from data

    cols = {}
    for k, v in rows[0].items():
        if v is None:
            dtype = "unknown (null)"
        elif isinstance(v, bool):
            dtype = "boolean"
        elif isinstance(v, int):
            dtype = "integer"
        elif isinstance(v, float):
            dtype = "numeric"
        elif isinstance(v, dict):
            dtype = "jsonb"
        elif isinstance(v, list):
            dtype = "jsonb/array"
        else:
            # Try to detect date/timestamp/uuid from string value
            s = str(v)
            if re.match(r'^\d{4}-\d{2}-\d{2}T', s):
                dtype = "timestamptz"
            elif re.match(r'^\d{4}-\d{2}-\d{2}$', s):
                dtype = "date"
            elif re.match(r'^[0-9a-f]{8}-[0-9a-f]{4}-', s, re.I):
                dtype = "uuid"
            elif re.match(r'^\d{1,2}:\d{2}', s):
                dtype = "time/text"
            else:
                dtype = "text"
        cols[k] = {"type": dtype, "sample": str(v)[:40] if v is not None else "NULL"}
    return cols, row_count, None


def read_excel_headers(filepath, sheet_name, max_search_rows=15):
    """Read column headers from an Excel sheet. READ ONLY."""
    wb = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
    ws = wb[sheet_name]
    result = {"headers": [], "sample_row": [], "row_count_estimate": None}
    all_rows = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i > max_search_rows + 200:
            break
        all_rows.append(row)

    # Count actual data rows (up to first 5000)
    wb2 = openpyxl.load_workbook(filepath, read_only=True, data_only=True)
    ws2 = wb2[sheet_name]
    data_count = 0
    hdr_found = False
    hdr_idx = None
    for i, row in enumerate(ws2.iter_rows(values_only=True)):
        non_null = [c for c in row if c is not None and str(c).strip() not in ("", "nan")]
        if not hdr_found and len(non_null) >= 2:
            hdr_found = True
            hdr_idx = i
        elif hdr_found:
            if non_null:
                data_count += 1
    wb2.close()
    result["row_count_estimate"] = data_count

    # Find header row
    hdr_row_data = None
    for i, row in enumerate(all_rows[:max_search_rows]):
        non_null = [c for c in row if c is not None and str(c).strip() not in ("", "nan")]
        if len(non_null) >= 2:
            hdr_row_data = row
            hdr_idx_local = i
            break

    wb.close()

    if hdr_row_data is None:
        return result

    result["headers"] = [str(c).strip() if c is not None else "" for c in hdr_row_data]
    result["headers"] = [h for h in result["headers"] if h]

    # Get first data sample
    if hdr_idx_local + 1 < len(all_rows):
        sample = all_rows[hdr_idx_local + 1]
        result["sample_row"] = [str(v)[:35] if v is not None else "" for v in sample[:len(result["headers"])]]

    return result


# ══════════════════════════════════════════════════════════════════════════════
# SOURCE FILE DEFINITIONS
# ══════════════════════════════════════════════════════════════════════════════
SOURCE_FILES = {
    "TMD": ROOT / "data" / "Track_Management_Department.xlsx",
    "SNT": ROOT / "data" / "Indian_Railway_S&T_Management.xlsx",
    "TRD": ROOT / "data" / "Indian_Railways_Track_Distribution_System.xlsx",
}

TABLE_SOURCE_MAP = {
    "stations":           ("SNT", "Stations Register"),
    "ir_zones":           ("TRD", "Zones"),
    "ir_trains":          ("TRD", "Trains"),
    "ir_locomotives":     ("TRD", "Locomotives"),
    "tmd_assets":         ("TMD", "Zonal TMD Offices"),  # seeded from this
    "st_assets":          ("SNT", "Signalling Systems"),  # seeded from this
    "trd_assets":         ("TRD", "Locomotives"),         # seeded from this
    "department_machines":("TRD", "Locomotives"),
    "historical_records": (None, None),
}

TABLES = [
    "stations",
    "ir_zones",
    "ir_trains",
    "ir_locomotives",
    "tmd_assets",
    "st_assets",
    "trd_assets",
    "department_machines",
    "historical_records",
]

# ══════════════════════════════════════════════════════════════════════════════
# INSPECTION
# ══════════════════════════════════════════════════════════════════════════════
print("=" * 80)
print("READ-ONLY SCHEMA INSPECTION REPORT")
print("No data modifications of any kind.")
print("=" * 80)

all_results = {}

for table in TABLES:
    print(f"\n{'─'*80}")
    print(f"TABLE: {table}")
    print(f"{'─'*80}")

    # ── Supabase columns ─────────────────────────────────────────────────────
    cols, row_count, err = get_columns_and_count(table)

    if err and "404" in err:
        print(f"  ❌ STATUS: TABLE DOES NOT EXIST IN SUPABASE")
        supa_status = "MISSING"
        supa_cols = {}
    elif err:
        print(f"  ⚠  STATUS: ERROR — {err}")
        supa_status = "ERROR"
        supa_cols = {}
    else:
        supa_status = "EXISTS"
        supa_cols = cols or {}
        print(f"  ✅ STATUS: EXISTS   ROW COUNT: {row_count}")
        if supa_cols:
            print(f"  COLUMNS ({len(supa_cols)}):")
            for col, meta in supa_cols.items():
                print(f"    {col:<35} {meta['type']:<20} sample: {meta['sample']}")
        else:
            print(f"  ⚠  Table is empty — cannot infer column types from data.")
            print(f"     (Schema must be inspected via Supabase Dashboard → Table Editor)")

    all_results[table] = {
        "supa_status": supa_status,
        "row_count": row_count,
        "supa_cols": supa_cols,
    }

    # ── Source file ───────────────────────────────────────────────────────────
    src_dept, src_sheet = TABLE_SOURCE_MAP.get(table, (None, None))
    if src_dept is None:
        print(f"\n  SOURCE: None (no Excel source — populated from workflow data only)")
        all_results[table]["src"] = None
        continue

    src_file = SOURCE_FILES[src_dept]
    print(f"\n  SOURCE: {src_file.name}  →  Sheet: \"{src_sheet}\"")

    if not src_file.exists():
        print(f"  ❌ SOURCE FILE NOT FOUND: {src_file}")
        all_results[table]["src"] = {"error": "file not found"}
        continue

    excel_meta = read_excel_headers(str(src_file), src_sheet)
    src_headers = excel_meta["headers"]
    src_row_count = excel_meta["row_count_estimate"]
    src_sample = excel_meta["sample_row"]

    print(f"  SOURCE ROW COUNT (estimate): {src_row_count}")
    print(f"  SOURCE COLUMNS ({len(src_headers)}):")
    for h in src_headers:
        print(f"    [{h}]")
    if src_sample:
        print(f"  SAMPLE ROW: {src_sample}")

    all_results[table]["src"] = {
        "file": src_file.name,
        "sheet": src_sheet,
        "headers": src_headers,
        "row_count": src_row_count,
    }

    # ── Column mapping ────────────────────────────────────────────────────────
    if supa_cols:
        print(f"\n  COLUMN MAPPING  (Source Excel → Supabase):")
        print(f"  {'Source Column':<40} → {'Supabase Column':<30} Status")
        print(f"  {'─'*95}")

        # Define known mappings per table
        mappings = {
            "stations": {
                "Station Code":           "station_code",
                "Station Name":           "station_name",
                "Zone":                   "zone_code",
                "Zone Name":              "zone_name",
                "State":                  "state",
                "Lat":                    "latitude",
                "Lon":                    "longitude",
                "Station Type (derived)": "station_type",
                "S&T Tier (derived)":     "→ snt_tier (MISSING in current schema)",
                "Data Basis":             "→ data_basis (MISSING in current schema)",
                # TRD sheet extras
                "Zone Code":              "zone_code",
                "District/Region":        "→ district (MISSING in current schema)",
                "Gauge":                  "→ gauge (MISSING in current schema)",
                "Heritage Line":          "→ heritage_line (MISSING in current schema)",
                "Trains Serving (from schedules)": "→ trains_serving (MISSING in current schema)",
                "Google Maps":            "→ google_maps_url (MISSING in current schema)",
            },
            "ir_zones": {
                "Zone Code":         "zone_code",
                "Zone Name":         "zone_name",
                "Headquarters":      "headquarters",
                "Established":       "established",
                "Divisions":         "divisions_count",
                "Divisions List":    "divisions_list",
                "Website":           "website",
                "States Served":     "states_served",
                "Route km (approx)": "route_km",
                "Track km (approx)": "track_km",
                "Electrified %":     "electrified_pct",
                "Gauge":             "gauge",
                "Google Maps (HQ)":  "google_maps_hq",
            },
            "ir_trains": {
                "Train No":           "train_no",
                "Train Name":         "train_name",
                "Train Type":         "train_type",
                "Origin Code":        "origin_code",
                "Origin Station":     "origin_station",
                "Destination Code":   "destination_code",
                "Destination Station":"destination_station",
                "Distance (km)":      "distance_km",
                "Duration (h:mm)":    "duration_hhmm",
                "Days of Run":        "days_of_run",
                "No. of Stops":       "stops_count",
                "Zone (origin)":      "zone_origin",
                "Google Maps (Origin-Dest)": "google_maps",
            },
            "ir_locomotives": {
                "Class":              "class",
                "Traction":           "traction",
                "Gauge":              "gauge",
                "Type":               "loco_type",
                "Power (HP, approx)": "power_hp",
                "Max Speed (km/h)":   "max_speed_kmh",
                "Tractive Effort (kN)":"tractive_effort",
                "Axle Load (t)":      "axle_load_t",
                "Builder / Works":    "builder",
                "Year Introduced":    "year_introduced",
                "Status":             "status",
                "Notes":              "notes",
            },
            "tmd_assets": {
                "(seeded from Zonal TMD Offices)": "one asset per zone → asset_code, asset_name, zone, asset_type",
                "Zone Code":          "zone (asset zone)",
                "Zone Name":          "asset_name (partial)",
                "HQ City":            "station_name",
            },
            "st_assets": {
                "(seeded from Signalling Systems)": "one asset per system → asset_code, asset_name, asset_type",
                "System":             "asset_name",
                "Category":           "asset_type",
            },
            "trd_assets": {
                "(seeded from Locomotives)": "one asset per active loco class → asset_code, asset_name, asset_type",
                "Class":              "asset_code (prefixed TRD-LOCO-)",
                "Type":               "asset_type",
            },
            "department_machines": {
                "Class":              "loco_class + machine_id (LOCO-<class>)",
                "Traction":           "traction",
                "Gauge":              "gauge",
                "Type":               "machine_type",
                "Power (HP, approx)": "power_hp",
                "Max Speed (km/h)":   "max_speed_kmh",
                "Status":             "status",
                "Builder / Works":    "→ (not in schema)",
            },
        }

        mapping = mappings.get(table, {})
        for src_col in src_headers:
            mapped = mapping.get(src_col, "→ NOT MAPPED")
            if "MISSING" in mapped:
                status = "⚠  MISSING COL"
            elif "NOT MAPPED" in mapped:
                status = "—  NOT MAPPED"
            elif mapped in supa_cols:
                status = "✅ MAPS OK"
            elif mapped.startswith("→"):
                status = "⚠  MISSING COL"
            else:
                status = "✅ MAPS OK" if mapped in supa_cols else "⚠  COL ABSENT"
            print(f"    {src_col:<40} → {mapped:<40} {status}")

        print(f"\n  SUPABASE COLUMNS WITH NO SOURCE MAPPING:")
        unmapped_supa = [c for c in supa_cols if c not in
                         list(mapping.values()) + ["id","created_at","updated_at","source_file","source_sheet","department","data_basis"]]
        for c in unmapped_supa:
            print(f"    {c} — may be populated from metadata/system")

print(f"\n\n{'═'*80}")
print("STATIONS PRESERVATION ANALYSIS")
print(f"{'═'*80}")

st_info = all_results.get("stations", {})
print(f"  Current row count: {st_info.get('row_count', 'unknown')}")
print(f"  Status: {st_info.get('supa_status', 'unknown')}")
print(f"\n  SAFE TO PRESERVE: Yes.")
print(f"  Import strategy must use UPSERT on station_code (not DELETE+INSERT).")
print(f"  Existing rows will be updated if station_code matches; new rows inserted.")
print(f"  No existing rows will be deleted.")

print(f"\n\n{'═'*80}")
print("SUMMARY — TABLE STATUS")
print(f"{'═'*80}")
print(f"  {'Table':<30} {'Status':<12} {'Rows':>8}  Source")
print(f"  {'─'*75}")
for t in TABLES:
    info = all_results[t]
    src = info.get("src") or {}
    src_name = src.get("file", "N/A") if src else "N/A"
    sheet = src.get("sheet", "") if src else ""
    print(f"  {t:<30} {info['supa_status']:<12} {str(info['row_count']):>8}  {src_name} / {sheet}")

print("\nInspection complete. No data was modified.")
