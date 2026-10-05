"""
Import stations from S&T Stations Register + TRD Stations into existing `stations` table.
This script works with just the anon key — no DDL needed.
"""
import os, sys, math, time, json, re
import requests
import openpyxl
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")
load_dotenv(ROOT / "backend" / ".env", override=False)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY", "")

def upsert_batch(table, rows, on_conflict="station_code", batch_size=150):
    if not rows:
        return 0, []
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": f"resolution=merge-duplicates,return=minimal",
    }
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict={on_conflict}"
    total, errors = 0, []
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i+batch_size]
        clean = []
        for row in batch:
            cr = {}
            for k, v in row.items():
                if v is None:
                    cr[k] = None
                elif isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                    cr[k] = None
                elif isinstance(v, str) and v.lower() in ("nan","none","null",""):
                    cr[k] = None
                else:
                    cr[k] = v
            clean.append(cr)
        resp = requests.post(url, json=clean, headers=headers)
        if resp.status_code in (200, 201, 204):
            total += len(batch)
        else:
            errors.append(f"HTTP {resp.status_code}: {resp.text[:200]}")
            print(f"  Batch error: HTTP {resp.status_code}: {resp.text[:120]}")
        time.sleep(0.03)
    return total, errors

def count_table(table):
    h = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Prefer": "count=exact"}
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}?select=count", headers=h)
    if r.status_code == 200:
        data = r.json()
        if data and "count" in data[0]:
            return data[0]["count"]
    cr = r.headers.get("Content-Range","")
    if "/" in cr:
        return int(cr.split("/")[-1])
    return -1

# ── Step 1: Check stations columns ────────────────────────────────────────────
print("Checking existing stations table structure...")
h0 = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
r0 = requests.get(f"{SUPABASE_URL}/rest/v1/stations?limit=1", headers=h0)
if r0.status_code != 200:
    print(f"Cannot access stations table: {r0.status_code}: {r0.text[:100]}")
    sys.exit(1)
if r0.json():
    existing_cols = list(r0.json()[0].keys())
    print(f"Existing columns: {existing_cols}")
else:
    # Try via INSERT to discover columns
    test = requests.post(
        f"{SUPABASE_URL}/rest/v1/stations",
        json=[{"station_code":"TEST_COL_PROBE","station_name":"TEST"}],
        headers={**h0, "Content-Type":"application/json","Prefer":"return=representation"},
    )
    print(f"Probe insert: {test.status_code}: {test.text[:200]}")
    if test.status_code in (200,201):
        existing_cols = list(test.json()[0].keys()) if test.json() else []
        # Clean up test row
        requests.delete(f"{SUPABASE_URL}/rest/v1/stations?station_code=eq.TEST_COL_PROBE", headers=h0)
    else:
        existing_cols = ["station_code","station_name","zone_code","zone_name","state","latitude","longitude","station_type","division","google_maps_url"]

print(f"Working with columns: {existing_cols}")

SNT_FILE = str(ROOT / "data" / "Indian_Railway_S&T_Management.xlsx")
TRD_FILE = str(ROOT / "data" / "Indian_Railways_Track_Distribution_System.xlsx")

# ── Step 2: Read S&T Stations Register ───────────────────────────────────────
print("\nReading S&T Stations Register...")
wb = openpyxl.load_workbook(SNT_FILE, read_only=True, data_only=True)
ws = wb["Stations Register"]
all_rows = list(ws.iter_rows(values_only=True))
wb.close()

# Find header row with "Station Code"
hdr_idx = None
for i, row in enumerate(all_rows[:10]):
    if any("Station Code" in str(c) for c in row if c):
        hdr_idx = i; break

if hdr_idx is None:
    print("ERROR: Could not find Stations Register header row")
    sys.exit(1)

headers_snt = [str(c).strip() if c else "" for c in all_rows[hdr_idx]]
print(f"S&T headers found: {[h for h in headers_snt if h]}")

snt_records = []
for row in all_rows[hdr_idx + 1:]:
    if all(c is None or str(c).strip() == "" for c in row):
        continue
    d = {headers_snt[j]: (str(row[j]).strip() if j < len(row) and row[j] is not None else None)
         for j in range(len(headers_snt)) if headers_snt[j]}
    code = d.get("Station Code", "")
    name = d.get("Station Name", "")
    if not code or not name or code.lower() == "nan":
        continue
    lat = d.get("Lat")
    lon = d.get("Lon")
    try: lat = float(lat) if lat and lat not in ("None","nan") else None
    except: lat = None
    try: lon = float(lon) if lon and lon not in ("None","nan") else None
    except: lon = None
    tier = d.get("S&T Tier (derived)")
    try: tier = int(float(tier)) if tier else None
    except: tier = None
    
    record = {
        "station_code": code.strip(),
        "station_name": name.strip(),
        "zone_code": d.get("Zone"),
        "zone_name": d.get("Zone Name"),
        "state": d.get("State"),
        "latitude": lat,
        "longitude": lon,
        "station_type": d.get("Station Type (derived)"),
        "division": None,
        "google_maps_url": (f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
                            if lat and lon else None),
        "source_file": "Indian_Railway_S&T_Management.xlsx",
        "source_sheet": "Stations Register",
        "department": "SHARED",
        "data_basis": d.get("Data Basis"),
        "snt_tier": tier,
    }
    # Only keep columns that actually exist in the table
    # Remove extra cols if stations table doesn't have them yet
    snt_records.append(record)

print(f"Prepared {len(snt_records)} S&T station records")

# ── Step 3: Try inserting S&T stations ───────────────────────────────────────
# First try with full schema
print(f"\nUpserting S&T stations (full schema)...")
tot_snt, errs_snt = upsert_batch("stations", snt_records, on_conflict="station_code")

if errs_snt:
    # Check if it's a column-not-found error
    first_err = errs_snt[0] if errs_snt else ""
    if "PGRST204" in first_err or "column" in first_err.lower():
        print(f"Column mismatch. Retrying with minimal schema...")
        # Build minimal records
        minimal = []
        for rec in snt_records:
            mr = {
                "station_code": rec["station_code"],
                "station_name": rec["station_name"],
            }
            for col in ["zone_code","zone_name","state","latitude","longitude","station_type","division","google_maps_url"]:
                if col in existing_cols and rec.get(col) is not None:
                    mr[col] = rec[col]
            minimal.append(mr)
        tot_snt, errs_snt = upsert_batch("stations", minimal, on_conflict="station_code")

ct_snt = count_table("stations")
print(f"S&T stations upserted. Total in table now: {ct_snt}")
print(f"Errors: {len(errs_snt)}")

# ── Step 4: Read TRD Stations and merge ──────────────────────────────────────
print("\nReading TRD Stations (13141 rows)...")
wb2 = openpyxl.load_workbook(TRD_FILE, read_only=True, data_only=True)
ws2 = wb2["Stations"]
all_rows2 = []
for row2 in ws2.iter_rows(values_only=True):
    all_rows2.append(row2)
wb2.close()

hdr_idx2 = None
for i2, row2 in enumerate(all_rows2[:5]):
    if any("Station Code" in str(c) for c in row2 if c):
        hdr_idx2 = i2; break

if hdr_idx2 is None:
    print("ERROR: TRD Stations header not found")
else:
    hdrs2 = [str(c).strip() if c else "" for c in all_rows2[hdr_idx2]]
    print(f"TRD headers: {[h for h in hdrs2 if h]}")
    
    trd_records = []
    for row2 in all_rows2[hdr_idx2 + 1:]:
        if all(c is None or str(c).strip() == "" for c in row2):
            continue
        d2 = {hdrs2[j]: (str(row2[j]).strip() if j < len(row2) and row2[j] is not None else None)
              for j in range(len(hdrs2)) if hdrs2[j]}
        code2 = d2.get("Station Code", "")
        name2 = d2.get("Station Name", "")
        if not code2 or not name2 or code2.lower() == "nan":
            continue
        lat2 = d2.get("Latitude"); lon2 = d2.get("Longitude")
        try: lat2 = float(lat2) if lat2 and lat2 not in ("None","nan") else None
        except: lat2 = None
        try: lon2 = float(lon2) if lon2 and lon2 not in ("None","nan") else None
        except: lon2 = None
        ts2 = d2.get("Trains Serving (from schedules)")
        try: ts2 = int(float(ts2)) if ts2 else None
        except: ts2 = None
        
        record2 = {
            "station_code": code2.strip(),
            "station_name": name2.strip(),
            "zone_code": d2.get("Zone Code"),
            "zone_name": d2.get("Zone Name"),
            "state": d2.get("State"),
            "latitude": lat2,
            "longitude": lon2,
            "station_type": d2.get("Gauge"),
            "division": d2.get("District/Region"),
            "google_maps_url": d2.get("Google Maps"),
            "source_file": "Indian_Railways_Track_Distribution_System.xlsx",
            "source_sheet": "Stations",
            "department": "SHARED",
            "data_basis": "TRD-FACT",
        }
        trd_records.append(record2)
    
    print(f"Prepared {len(trd_records)} TRD station records")
    print("Merging TRD stations (upsert on station_code)...")
    tot_trd, errs_trd = upsert_batch("stations", trd_records, on_conflict="station_code")
    
    if errs_trd:
        first_err = errs_trd[0] if errs_trd else ""
        if "PGRST204" in first_err or "column" in first_err.lower():
            print(f"Column mismatch. Retrying with minimal schema...")
            minimal2 = []
            for rec2 in trd_records:
                mr2 = {"station_code": rec2["station_code"], "station_name": rec2["station_name"]}
                for col in ["zone_code","zone_name","state","latitude","longitude","station_type","division","google_maps_url"]:
                    if col in existing_cols and rec2.get(col) is not None:
                        mr2[col] = rec2[col]
                minimal2.append(mr2)
            tot_trd, errs_trd = upsert_batch("stations", minimal2, on_conflict="station_code")
    
    ct_final = count_table("stations")
    print(f"\nFinal stations count: {ct_final}")
    print(f"TRD errors: {len(errs_trd)}")

print("\n✅ Stations import complete")
