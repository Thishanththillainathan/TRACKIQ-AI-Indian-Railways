# AI ASSISTANT DATA INTEGRATION REPORT

**Project:** TRACKIQ TWIN – Intelligent Railway System  
**Module:** AI Assistant Dataset Integration & Grounding Engine  
**Date:** September 8, 2026  
**Final Status:** **AI ASSISTANT DATA INTEGRATION READY**

---

## 1. Files Discovered & Audited

The complete `ml/data/` directory was audited. The dataset inventory includes:

| Filename | File Size | Primary Sheet Name | Department | Row Count | Purpose & Usage |
|----------|-----------|--------------------|------------|-----------|-----------------|
| `ST_DEPARTMENT.xlsx` | 27.66 MB | `S&T_DEPARTMENT` | SMMS (Signal & Telecomm) | 60,000 | Signal & Telecom asset, maintenance, & traffic density records |
| `TRACK_MANAGEMENT.xlsx` | 27.66 MB | `TRACK_MANAGEMENT` | TMS (Track Management) | 60,000 | Permanent Way, track geometry, & rail defect maintenance records |
| `TRD_DEPARTMENT.xlsx` | 27.67 MB | `TRD_DEPARTMENT` | TRD (Traction Distribution) | 60,000 | Overhead Traction (OHE), power, & affected train impact records |
| `ALL_DEPTS.xlsx` | 28.93 MB | `AI_BLOCK_PLANNER_ALL_DEPTS` | Unified Multi-Dept | 60,000 | Multi-departmental 25-field AI Block Planner master dataset |
| `3dept.xlsx` | 37.85 MB | `Maintenance`, `Engineering`, `Operations` | Multi-Dept Historical | 340,000 | Historical ML training base dataset (110k Maint, 125k Eng, 105k Ops) |
| `ai_assistant_training.json` | 0.02 MB | N/A | AI Assistant Intent | 99 samples | 23-intent classification examples for AI Assistant NLP |

**Total Connected Dataset Records:** **580,000 Records**

---

## 2. Dataset Schemas & Column Mappings

### Department Datasets (`ST_DEPARTMENT.xlsx`, `TRACK_MANAGEMENT.xlsx`, `TRD_DEPARTMENT.xlsx`)
- **Key Columns (71 fields):** `Request_ID`, `Station`, `Asset_ID`, `Work_Type`, `Priority`, `Requested_Date`, `Requested_Start_Time`, `Required_Duration`, `Asset_Type`, `Current_Status`, `Asset_Availability`, `Asset_Condition`, `Train_Schedule`, `Train_Frequency`, `Traffic_Density`, `Affected_Trains`, `Available_Technicians`, `Available_Manpower`, `Equipment_Availability`, `Allowed_Start_Time`, `Allowed_End_Time`, `Maximum_Block_Duration`, `Existing_Block_Schedule`, `Conflicting_Blocks`, `Section_From`, `Section_To`, `Zone_Code`, `Division`, etc.

### Unified Planner Dataset (`ALL_DEPTS.xlsx`)
- **Key Columns (72 fields):** `Department`, `Request_ID`, `Station`, `Asset_ID`, `Work_Type`, `Priority`, `Asset_Type`, `Current_Status`, `Asset_Availability`, `Asset_Condition`, `Traffic_Density`, `Affected_Trains`, etc.

### Historical 3-Department Dataset (`3dept.xlsx`)
- **`Maintenance` (17 fields):** `Asset ID`, `Asset Type`, `Station`, `Asset Age`, `Installation Date`, `Maintenance Date`, `Maintenance Type`, `Problem Type`, `Asset Condition`, `Failure Severity`, `Zone`, `Division`.
- **`Engineering` (17 fields):** `Request ID`, `Asset ID`, `Asset Type`, `Station`, `Work Type`, `Problem Type`, `Planned Duration`, `Manpower Used`, `Equipment Used`, `Zone`, `Division`.
- **`Operations` (18 fields):** `Request ID`, `Station`, `Asset ID`, `Block Type`, `Work Type`, `Actual Duration`, `Affected Trains`, `Priority`, `Traffic Density`, `Zone`, `Division`.

---

## 3. Department Awareness & Mapping

The AI Assistant maintains explicit domain awareness:
- **SMMS (Signal & Telecommunication):** Mapped to `ST_DEPARTMENT.xlsx` (`S&T_DEPARTMENT` sheet).
- **TMS (Track Management System):** Mapped to `TRACK_MANAGEMENT.xlsx` (`TRACK_MANAGEMENT` sheet).
- **TRD (Traction Distribution):** Mapped to `TRD_DEPARTMENT.xlsx` (`TRD_DEPARTMENT` sheet).
- **Unified / All Departments:** Mapped to `ALL_DEPTS.xlsx` (`AI_BLOCK_PLANNER_ALL_DEPTS` sheet).
- **Historical ML Datasets:** Mapped to `3dept.xlsx` (`Maintenance`, `Engineering`, `Operations` sheets).

---

## 4. Data Access Layer Architecture (`backend/modules/ai_data_query.py`)

A dedicated backend-only data access layer was implemented:
- **Immutability Enforcement:** Computes SHA-256 baseline checksums before and after query execution.
- **In-Memory DataFrame Caching (`_DF_CACHE`):** Caches loaded dataset slices in memory to eliminate redundant openpyxl disk parsing.
- **Exposed Safe Query API:**
  - `verify_excel_immutability()`
  - `get_dataset_summary()`
  - `get_department_summary(department: str)`
  - `search_smms_data(query: str, limit: int)`
  - `search_tms_data(query: str, limit: int)`
  - `search_trd_data(query: str, limit: int)`
  - `search_maintenance_data(...)`, `search_engineering_data(...)`, `search_operations_data(...)`
  - `get_asset_information(asset_id: str)`
  - `get_station_information(station_name: str)`
  - `get_block_information(query_id: str)`
  - `query_dataset_grounded_answer(user_message: str)`

---

## 5. AI Assistant Grounding Integration

The inference workflow in `backend/modules/ai_assistant.py` was extended with a two-stage decision pipeline:

```
                  USER QUESTION
                        │
                        ▼
         Data-Grounding Decision Engine
                        │
          Does query ask for dataset values?
            (Counts, Assets, Stations, SMMS/TMS/TRD)
                        │
          ┌─────────────┴─────────────┐
          │ YES                       │ NO
          ▼                           ▼
Backend Data Query Layer     TF-IDF + Neural MLP
 (ai_data_query.py)           Intent Classifier
          │                           │
          ▼                           ▼
Grounded Dataset Response    Trained Intent Response
(is_data_grounded: true)     (is_data_grounded: false)
```

---

## 6. Data Grounding Behavior & UI Badges

- **Data-Grounded Responses:** Responses backed by real dataset records append metadata fields:
  ```json
  {
    "response": "The SMMS dataset (ST_DEPARTMENT.xlsx) contains 60,000 records across 15 stations...",
    "intent": "data_grounded_query",
    "confidence": 0.99,
    "is_data_grounded": true,
    "grounded_source": "ST_DEPARTMENT.xlsx (S&T_DEPARTMENT)"
  }
  ```
- **Frontend UI Indicator:** `src/pages/AIAssistant.jsx` renders a subtle blue badge (`Source: Railway Dataset` / `Source: ST_DEPARTMENT.xlsx`) on grounded message bubbles.

---

## 7. Security & Telemetry Safeguards

1. **Zero Secret Exposure:** Backend returns only formatted answer text and clean source labels (`ST_DEPARTMENT.xlsx`). No raw database credentials, environment keys, or internal file paths are exposed to the frontend.
2. **Missing Real-Time Telemetry Safeguard:** Queries asking for live GPS, live train occupancy, or real-time signal telemetry cleanly return:
   > *"I don't have a connected real-time source for live telemetry, real-time GPS, or live track occupancy. The connected datasets provide static, reference, and historical operational data."*
3. **Out-of-Scope Safeguard:** Queries asking for unrecorded stations or unknown IDs return:
   > *"I don't have records for station 'XYZ999' in the connected dataset sources."*

---

## 8. Excel Immutability Verification (SHA-256 Checksums)

All five source Excel datasets were verified before and after implementation:

| Dataset Filename | Baseline SHA-256 Checksum | Post-Execution SHA-256 Checksum | Status |
|------------------|---------------------------|---------------------------------|--------|
| `ST_DEPARTMENT.xlsx` | `503059cba9bc66ec7f9fc49626937c2eac02fcdc58749d65be1566ad5d309ac6` | `503059cba9bc66ec7f9fc49626937c2eac02fcdc58749d65be1566ad5d309ac6` | **UNMUTATED (100% MATCH)** |
| `TRACK_MANAGEMENT.xlsx` | `82e782e5652834ca6e2feb364e35bbf32e43c7f9eb419b0c4c7038a589bed2c2` | `82e782e5652834ca6e2feb364e35bbf32e43c7f9eb419b0c4c7038a589bed2c2` | **UNMUTATED (100% MATCH)** |
| `TRD_DEPARTMENT.xlsx` | `d788055e47978446cd30a31cff25596f98768525d2c53dd8ae080c03bb63818d` | `d788055e47978446cd30a31cff25596f98768525d2c53dd8ae080c03bb63818d` | **UNMUTATED (100% MATCH)** |
| `ALL_DEPTS.xlsx` | `6588e17a6ed93c0406c8ffd1f8fa1c711dfd023b5ead970dad86f500f420add9` | `6588e17a6ed93c0406c8ffd1f8fa1c711dfd023b5ead970dad86f500f420add9` | **UNMUTATED (100% MATCH)** |
| `3dept.xlsx` | `ffbceb34ed23535795d48b2186e84c6409d886df58eb43612dc91313857d07d9` | `ffbceb34ed23535795d48b2186e84c6409d886df58eb43612dc91313857d07d9` | **UNMUTATED (100% MATCH)** |

---

## 9. Comprehensive Test Results (`scratch/test_ai_assistant_data.py`)

All **18 automated verification tests** passed with 100% success:

| Test | Description | Result | Details |
|------|-------------|--------|---------|
| **A** | `ml/data` Directory Discovery | **PASSED** | Discovered `ml/data` directory |
| **B** | `ST_DEPARTMENT.xlsx` Readable | **PASSED** | Verified read accessibility |
| **C** | `TRACK_MANAGEMENT.xlsx` Readable | **PASSED** | Verified read accessibility |
| **D** | `TRD_DEPARTMENT.xlsx` Readable | **PASSED** | Verified read accessibility |
| **E** | `ALL_DEPTS.xlsx` Readable | **PASSED** | Verified read accessibility |
| **F** | `3dept.xlsx` Readable | **PASSED** | Verified read accessibility |
| **G** | Dataset Schemas Detected | **PASSED** | SMMS 60,000 records detected |
| **H** | Row Counts Calculated | **PASSED** | 580,000 total records calculated |
| **I** | SMMS Query Real Data | **PASSED** | Returned real record `BR-KOLH-10739` |
| **J** | TMS Query Real Data | **PASSED** | Returned real record `BR-RANA-87560` |
| **K** | TRD Query Real Data | **PASSED** | Returned real record `BR-TATA-93589` |
| **L** | Unknown Data Request Handling | **PASSED** | Safely handled without hallucinating |
| **M** | Missing Real-Time Data Safeguard | **PASSED** | Returned telemetry safeguard message |
| **N** | ML Models Loadability | **PASSED** | SMMS, TMS, and TRD models loaded cleanly |
| **O** | AI Assistant Chat Endpoint | **PASSED** | `POST /api/ai-assistant/chat` returned grounded response |
| **P** | Block Schedule Verification | **PASSED** | 26-field Block Schedule API verified |
| **Q** | AI Block Planner Assembly | **PASSED** | 25-field planner contract verified |
| **R** | Excel Immutability (SHA-256) | **PASSED** | **All 5 Excel files 100% unmutated** |

---

## 10. Known Limitations

1. **Static Precomputed Metadata:** Summary counts evaluate instantaneously from cached metadata tables while detailed row lookups utilize cached DataFrame slices.
2. **Read-Only Reference Data:** Dataset queries reflect reference and historical ML data in `ml/data/`. Live operational state updates persist to Supabase PostgreSQL without modifying Excel files.

---

## Final Status

```
=====================================================================================
           STATUS: AI ASSISTANT DATA INTEGRATION READY
=====================================================================================
```
