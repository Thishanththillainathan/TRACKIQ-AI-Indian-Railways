# DIGITAL TWIN — EXACT MISSING DATA FILE AUDIT REPORT

**Audit Date:** 2026-09-08  
**Scope:** File-by-File Column & Telemetry Audit for 5 Required Digital Twin Data Groups  
**Target Directory:** `C:\Users\THISHANTH T\Desktop\PROTOTYPE\ml\data`  
**Files Audited:** `ST_DEPARTMENT.xlsx`, `TRACK_MANAGEMENT.xlsx`, `TRD_DEPARTMENT.xlsx`, `ALL_DEPTS.xlsx`, `3dept.xlsx`  
**Excel Dataset Immutability:** `100% READ-ONLY & UNTOUCHED` (Verified via SHA-256 Checksums)

---

## 1. Executive Summary

This audit performs an explicit, file-by-file column inspection of all Excel datasets in `ml/data/`, backend code in `backend/main.py` & `backend/modules/`, and Supabase schema tables in `supabase_schema.sql` to identify the **exact presence, partial presence, or total absence** of 5 key Digital Twin data groups:
1. **Current Train Position**
2. **Train ID**
3. **Track Occupancy**
4. **Signal Status**
5. **Switch / Point Status**

---

## 2. Exact File-by-File Check Matrix

| Required Data Group | `ST_DEPARTMENT.xlsx` | `TRACK_MANAGEMENT.xlsx` | `TRD_DEPARTMENT.xlsx` | `ALL_DEPTS.xlsx` | `3dept.xlsx` |
|---|---|---|---|---|---|
| **A. Current Train Position** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** |
| **B. Train ID** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** |
| **C. Track Occupancy** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** |
| **D. Signal Status** | **PARTIALLY FOUND** | **PARTIALLY FOUND** | **PARTIALLY FOUND** | **PARTIALLY FOUND** | **NOT FOUND** |
| **E. Switch / Point Status** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** | **NOT FOUND** |

---

## 3. Analysis of PARTIALLY FOUND Items

### Data Group D: Signal Status
* **Exact File 1:** `ml/data/ST_DEPARTMENT.xlsx`
  - **Sheet:** `S&T_DEPARTMENT`
  - **Column:** `Signal_Status_Required`
  - **Sample Value:** `"Interlocking locked – route set"` (Row 2)
  - **Static / Real-time:** `STATIC`
  - **Digital Twin Use:** `PARTIAL` (Serves as a pre-maintenance safety requirement string; does NOT provide live signal relay aspect telemetry).

* **Exact File 2:** `ml/data/TRACK_MANAGEMENT.xlsx`
  - **Sheet:** `TRACK_MANAGEMENT`
  - **Column:** `Signal_Status_Required`
  - **Sample Value:** `"All signals to aspect"` (Row 2)
  - **Static / Real-time:** `STATIC`
  - **Digital Twin Use:** `PARTIAL` (Static requirement string).

* **Exact File 3:** `ml/data/TRD_DEPARTMENT.xlsx`
  - **Sheet:** `TRD_DEPARTMENT`
  - **Column:** `Signal_Status_Required`
  - **Sample Value:** `"Home + distant cleared"` (Row 2)
  - **Static / Real-time:** `STATIC`
  - **Digital Twin Use:** `PARTIAL` (Static requirement string).

* **Exact File 4:** `ml/data/ALL_DEPTS.xlsx`
  - **Sheet:** `AI_BLOCK_PLANNER_ALL_DEPTS`
  - **Column:** `Signal_Status_Required`
  - **Sample Value:** `"All signals to aspect"` (Row 2)
  - **Static / Real-time:** `STATIC`
  - **Digital Twin Use:** `PARTIAL` (Static requirement string).

---

## 4. Explicit List of NOT FOUND Items by File

### A. Current Train Position
**NOT FOUND IN:**
* `ml/data/ST_DEPARTMENT.xlsx`
* `ml/data/TRACK_MANAGEMENT.xlsx`
* `ml/data/TRD_DEPARTMENT.xlsx`
* `ml/data/ALL_DEPTS.xlsx`
* `ml/data/3dept.xlsx`

*(No column exists for real-time GPS coordinates, latitude/longitude, or live milepost train location).*

### B. Train ID
**NOT FOUND IN:**
* `ml/data/ST_DEPARTMENT.xlsx`
* `ml/data/TRACK_MANAGEMENT.xlsx`
* `ml/data/TRD_DEPARTMENT.xlsx`
* `ml/data/ALL_DEPTS.xlsx`
* `ml/data/3dept.xlsx`

*(Columns `Affected_Trains` and `Typical_Train_Composition` contain generic text categories like `"2 Mail/Express trains diverted"` or `"EMU local train"`, but specific 5-digit Train ID numbers such as `12675` or `12676` are completely absent).*

### C. Track Occupancy
**NOT FOUND IN:**
* `ml/data/ST_DEPARTMENT.xlsx`
* `ml/data/TRACK_MANAGEMENT.xlsx`
* `ml/data/TRD_DEPARTMENT.xlsx`
* `ml/data/ALL_DEPTS.xlsx`
* `ml/data/3dept.xlsx`

*(Columns `Traffic_Density` and `Traffic_Density_at_Block_Time` contain qualitative strings like `"Medium"` or `"Low"`, but real-time track circuit or axle-counter occupancy telemetry is absent).*

### E. Switch / Point Status
**NOT FOUND IN:**
* `ml/data/ST_DEPARTMENT.xlsx`
* `ml/data/TRACK_MANAGEMENT.xlsx`
* `ml/data/TRD_DEPARTMENT.xlsx`
* `ml/data/ALL_DEPTS.xlsx`
* `ml/data/3dept.xlsx`

*(Work types like `"Point Machine Overhaul"` reference point assets, but explicit columns for live switch position or relay contact state e.g., `Normal` / `Reverse` do not exist).*

---

## 5. Alternative Column Name Search Results

| Search Variation | Columns Inspected | Match Result | Reason / Classification |
|---|---|---|---|
| `Train_ID`, `Train Number`, `Train_No` | `Affected_Trains`, `Typical_Train_Composition` | `NO EXACT MATCH` | `Affected_Trains` describes section impact ("2 trains diverted"), not a specific Train ID. |
| `Train_Position`, `Current_Location`, `GPS`, `Latitude`, `Longitude` | `Section_From`, `Section_To` | `NO EXACT MATCH` | `Section_From`/`Section_To` defines static corridor boundaries, not live train positions. |
| `Track_Occupancy`, `Occupied`, `Block Occupancy` | `Traffic_Density`, `Block_Strategy` | `NO EXACT MATCH` | `Traffic_Density` is qualitative traffic volume ("High"), not live circuit occupancy. |
| `Signal_Status`, `Signal Aspect` | `Signal_Status_Required` | `PARTIAL MATCH` | `Signal_Status_Required` is a static maintenance pre-condition requirement, not live signal relay telemetry. |
| `Switch_Status`, `Point_Status`, `Point State` | `Work_Type` | `NO EXACT MATCH` | `Work_Type` names maintenance activities ("Point Machine Overhaul"), not live point positions. |

---

## 6. Comprehensive Source Integration Matrix (Excel vs Backend vs Supabase vs Live)

| Data Group | Excel Source | Backend Source (`backend/main.py`) | Supabase Source (`supabase_schema.sql`) | Live Telemetry Source | Overall Status |
|---|---|---|---|---|---|
| **Current Train Position** | `NOT FOUND` | `PARTIALLY FOUND` (Mock string `"HELD_AT_OUTER_SIGNAL"` at `/api/digital-twin/state`) | `NOT FOUND` | `NOT FOUND` | **MISSING LIVE SOURCE** |
| **Train ID** | `NOT FOUND` | `PARTIALLY FOUND` (Mock string `"12675"` at `/api/digital-twin/state`) | `NOT FOUND` | `NOT FOUND` | **MISSING LIVE SOURCE** |
| **Track Occupancy** | `NOT FOUND` | `PARTIALLY FOUND` (Derived string `"ACTIVE_BLOCK"` at `/api/digital-twin/state`) | `PARTIALLY FOUND` (`execution_monitor.execution_status` = `In Progress`) | `NOT FOUND` | **DERIVED ONLY (NO LIVE SENSOR)** |
| **Signal Status** | `PARTIALLY FOUND` (`Signal_Status_Required`) | `PARTIALLY FOUND` (Derived string `"RED / STOP"` at `/api/digital-twin/state`) | `NOT FOUND` | `NOT FOUND` | **DERIVED / STATIC ONLY** |
| **Switch / Point Status** | `NOT FOUND` | `PARTIALLY FOUND` (Derived string `"LOCKED"` at `/api/digital-twin/state`) | `NOT FOUND` | `NOT FOUND` | **DERIVED ONLY** |

---

## 7. Critical Distinction: Derived Data vs Live Telemetry

To ensure technical accuracy, derived operational state must never be conflated with live hardware telemetry:

1. **Track Occupancy:**
   - *Derived Value:* Status set to `"OCCUPIED_BY_MAINTENANCE"` whenever an operational block is set to `IN_PROGRESS` in Supabase.
   - *Live Telemetry (Missing):* Real-time 400Hz track circuit voltage shift or axle counter impulse count.

2. **Signal Status:**
   - *Static / Derived Value:* Column `Signal_Status_Required` (`"Interlocking locked – route set"`) or derived signal red aspect during active block execution.
   - *Live Telemetry (Missing):* Current transformer voltage feedback from the signal lamp unit / electronic interlocking (EI) cabinet.

3. **Switch / Point Status:**
   - *Derived Value:* Point machine status set to `"LOCKED"` based on `Work_Type` = `Point Machine Overhaul`.
   - *Live Telemetry (Missing):* Point machine detector contact position feedback (Normal vs Reverse).

4. **Train Position & Speed:**
   - *Derived Value:* Static section speed limit `Max_Speed_KMPH = 160`.
   - *Live Telemetry (Missing):* Real-time GPS lat/long stream and live axle speedometer readings.

---

## EXACTLY WHAT IS MISSING

### 1. FIELD: Current Train Position
* **EXACT FILES CHECKED:** `ST_DEPARTMENT.xlsx`, `TRACK_MANAGEMENT.xlsx`, `TRD_DEPARTMENT.xlsx`, `ALL_DEPTS.xlsx`, `3dept.xlsx`
* **EXACT COLUMNS CHECKED:** All 104 unique columns across all sheets (including `Section_From`, `Section_To`, `Station`, `Typical_Train_Composition`)
* **FOUND / NOT FOUND:** `NOT FOUND` in Excel; `NOT FOUND` in Supabase; `MOCKED` in `/api/digital-twin/state`
* **STATIC / REAL-TIME:** N/A (Missing)
* **CURRENT SOURCE:** Hardcoded mock array in `get_digital_twin_state()` in `backend/main.py`
* **WHY IT CANNOT PROVIDE LIVE DATA:** Static Excel sheets and PostgreSQL tables do not receive live GPS / COIS telemetry streams.

### 2. FIELD: Train ID
* **EXACT FILES CHECKED:** `ST_DEPARTMENT.xlsx`, `TRACK_MANAGEMENT.xlsx`, `TRD_DEPARTMENT.xlsx`, `ALL_DEPTS.xlsx`, `3dept.xlsx`
* **EXACT COLUMNS CHECKED:** `Affected_Trains`, `Affected_Trains.1`, `Train_Schedule`, `Train_Frequency`, `Scheduled Trains`
* **FOUND / NOT FOUND:** `NOT FOUND` in Excel (generic categories only); `NOT FOUND` in Supabase; `MOCKED` in `/api/digital-twin/state`
* **STATIC / REAL-TIME:** N/A (Missing)
* **CURRENT SOURCE:** Hardcoded mock string `"12675"` in `backend/main.py`
* **WHY IT CANNOT PROVIDE LIVE DATA:** Source Excel datasets specify aggregate train impacts (e.g. `"2 Mail/Express trains diverted"`), not individual 5-digit train numbers.

### 3. FIELD: Track Occupancy (Live Sensor Feed)
* **EXACT FILES CHECKED:** `ST_DEPARTMENT.xlsx`, `TRACK_MANAGEMENT.xlsx`, `TRD_DEPARTMENT.xlsx`, `ALL_DEPTS.xlsx`, `3dept.xlsx`
* **EXACT COLUMNS CHECKED:** `Traffic_Density`, `Traffic_Density_at_Block_Time`, `Block_Strategy`
* **FOUND / NOT FOUND:** `NOT FOUND` in Excel as live sensor feed; `DERIVED` in backend & Supabase
* **STATIC / REAL-TIME:** `WORKFLOW-DERIVED`
* **CURRENT SOURCE:** Evaluated from `optimized_blocks.status == 'IN_PROGRESS'`
* **WHY IT CANNOT PROVIDE LIVE DATA:** No hardware axle counter or track circuit API feed is connected to the backend.

### 4. FIELD: Signal Status (Live Relay Feed)
* **EXACT FILES CHECKED:** `ST_DEPARTMENT.xlsx`, `TRACK_MANAGEMENT.xlsx`, `TRD_DEPARTMENT.xlsx`, `ALL_DEPTS.xlsx`, `3dept.xlsx`
* **EXACT COLUMNS CHECKED:** `Signal_Status_Required`
* **FOUND / NOT FOUND:** `PARTIALLY FOUND` in Excel (as static requirement string); `DERIVED` in backend
* **STATIC / REAL-TIME:** `STATIC REQUIREMENT`
* **CURRENT SOURCE:** `Signal_Status_Required` column in Excel / derived `"RED / STOP"` in `backend/main.py`
* **WHY IT CANNOT PROVIDE LIVE DATA:** `Signal_Status_Required` is a static textual safety instruction, not a live electronic interlocking aspect feed.

### 5. FIELD: Switch / Point Status (Live Contact Feed)
* **EXACT FILES CHECKED:** `ST_DEPARTMENT.xlsx`, `TRACK_MANAGEMENT.xlsx`, `TRD_DEPARTMENT.xlsx`, `ALL_DEPTS.xlsx`, `3dept.xlsx`
* **EXACT COLUMNS CHECKED:** `Work_Type`, `Signal_Status_Required`
* **FOUND / NOT FOUND:** `NOT FOUND` in Excel as explicit column; `DERIVED` in backend
* **STATIC / REAL-TIME:** `WORKFLOW-DERIVED`
* **CURRENT SOURCE:** Derived from active maintenance `Work_Type` in `backend/main.py`
* **WHY IT CANNOT PROVIDE LIVE DATA:** No point machine detector contact feedback feed exists in the static Excel datasets or Supabase tables.

---

## FINAL MATRIX

| Field | Excel Source | Backend Source | Supabase Source | Live Source | Status |
|---|---|---|---|---|---|
| **Current Train Position** | `NOT FOUND` | Mocked (`"HELD_AT_OUTER_SIGNAL"`) | `NOT FOUND` | `NOT FOUND` | **MISSING LIVE DATA** |
| **Train ID** | `NOT FOUND` | Mocked (`"12675"`) | `NOT FOUND` | `NOT FOUND` | **MISSING DATA & SOURCE** |
| **Track Occupancy** | `NOT FOUND` | Derived (`"ACTIVE_BLOCK"`) | Derived (`execution_monitor`) | `NOT FOUND` | **DERIVED ONLY** |
| **Signal Status** | Static String (`Signal_Status_Required`) | Derived (`"RED / STOP"`) | `NOT FOUND` | `NOT FOUND` | **DERIVED / STATIC ONLY** |
| **Switch / Point Status** | `NOT FOUND` | Derived (`"LOCKED"`) | `NOT FOUND` | `NOT FOUND` | **DERIVED ONLY** |

---

## CORE QUESTION ANSWER

**"Which exact file does NOT contain the required Digital Twin data?"**

1. **`ml/data/ST_DEPARTMENT.xlsx`** does **NOT** contain `Current Train Position`, specific `Train ID` numbers, live `Track Occupancy` sensor telemetry, or live `Switch / Point Status`.
2. **`ml/data/TRACK_MANAGEMENT.xlsx`** does **NOT** contain `Current Train Position`, specific `Train ID` numbers, live `Track Occupancy` sensor telemetry, or live `Switch / Point Status`.
3. **`ml/data/TRD_DEPARTMENT.xlsx`** does **NOT** contain `Current Train Position`, specific `Train ID` numbers, live `Track Occupancy` sensor telemetry, or live `Switch / Point Status`.
4. **`ml/data/ALL_DEPTS.xlsx`** does **NOT** contain `Current Train Position`, specific `Train ID` numbers, live `Track Occupancy` sensor telemetry, or live `Switch / Point Status`.
5. **`ml/data/3dept.xlsx`** does **NOT** contain `Current Train Position`, specific `Train ID` numbers, live `Track Occupancy` sensor telemetry, `Signal Status`, or `Switch / Point Status`.

---

## SHA-256 Baseline Immutability Check

* `ST_DEPARTMENT.xlsx`: `503059cba9bc66ec7f9fc49626937c2eac02fcdc58749d65be1566ad5d309ac6` — **MATCHED**
* `TRACK_MANAGEMENT.xlsx`: `82e782e5652834ca6e2feb364e35bbf32e43c7f9eb419b0c4c7038a589bed2c2` — **MATCHED**
* `TRD_DEPARTMENT.xlsx`: `d788055e47978446cd30a31cff25596f98768525d2c53dd8ae080c03bb63818d` — **MATCHED**
* `ALL_DEPTS.xlsx`: `6588e17a6ed93c0406c8ffd1f8fa1c711dfd023b5ead970dad86f500f420add9` — **MATCHED**
* `3dept.xlsx`: `ffbceb34ed23535795d48b2186e84c6409d886df58eb43612dc91313857d07d9` — **MATCHED**
