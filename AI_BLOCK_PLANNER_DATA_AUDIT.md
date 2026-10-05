# AI Block Planner — 5-File Data Source Audit Report

**Date**: 2026-09-08  
**Project Root**: `C:\Users\THISHANTH T\Desktop\PROTOTYPE`  
**Data Directory**: `ml/data/`  
**Audit Purpose**: Complete data source inspection, schema inventory, cross-department mapping, and contract validation for AI Block Planner integration.  

---

## 1. Files Discovered

A comprehensive scan of `ml/data/` identified exactly 5 Excel data files totaling **150.77 MB**:

| # | Filename | File Size | Sheet Name | Row Count | Column Count | Primary Role / Category |
|---|:---|:---|:---|:---|:---|:---|
| 1 | `ST_DEPARTMENT.xlsx` | 27.66 MB | `S&T_DEPARTMENT` | 60,001 | 71 | **Department Dataset: SMMS (S&T)** |
| 2 | `TRACK_MANAGEMENT.xlsx` | 27.66 MB | `TRACK_MANAGEMENT` | 60,001 | 71 | **Department Dataset: TMS (Track Management)** |
| 3 | `TRD_DEPARTMENT.xlsx` | 27.67 MB | `TRD_DEPARTMENT` | 60,001 | 71 | **Department Dataset: TRD (Traction & OHE)** |
| 4 | `ALL_DEPTS.xlsx` | 28.93 MB | `AI_BLOCK_PLANNER_ALL_DEPTS` | 60,001 | 71 | **Supporting Dataset: Cross-Department Consolidated Master** |
| 5 | `3dept.xlsx` | 37.85 MB | `Maintenance`<br>`Engineering`<br>`Operations` | 110,000<br>125,000<br>105,000 | 17<br>17<br>18 | **Supporting Dataset: Core ML Model Training & Database Source** |

---

## 2. File-by-File Analysis

### File 1: `ST_DEPARTMENT.xlsx`
- **Department**: **SMMS (Signal & Telecommunication Maintenance Management System)**
- **Sheet**: `S&T_DEPARTMENT` (60,001 rows, 71 columns)
- **Nature**: Contains specialized S&T maintenance block requests, point machine overhaul tasks, axle counter checks, interlocking tests, asset condition logs, S&T resource availability, and S&T section constraints.
- **Sample Work Types**: `Telecom_OFC_lay`, `Point_machine_overhaul`, `Signal_interlocking_test`, `Track_circuit_maintenance`.

### File 2: `TRACK_MANAGEMENT.xlsx`
- **Department**: **TMS (Track Management System)**
- **Sheet**: `TRACK_MANAGEMENT` (60,001 rows, 71 columns)
- **Nature**: Contains track engineering block requests, rail grinding, tamping, turnout renewal, sleeper replacement, ballast cleaning, track asset condition logs, civil engineering manpower, and track speed/line constraints.
- **Sample Work Types**: `Turnout_renewal`, `Deep_screening`, `Track_tamping`, `Rail_grinding`.

### File 3: `TRD_DEPARTMENT.xlsx`
- **Department**: **TRD (Traction Distribution & Electrical)**
- **Sheet**: `TRD_DEPARTMENT` (60,001 rows, 71 columns)
- **Nature**: Contains electrical traction power blocks, OHE catenary maintenance, cantilever adjustment, TSS overhaul, insulator washing, OHE tower wagon availability, and traction power isolation constraints.
- **Sample Work Types**: `Traction_substation_maintenance`, `OHE_catenary_inspection`, `Insulator_washing`, `Cantilever_adjustment`.

### File 4: `ALL_DEPTS.xlsx`
- **Supporting Dataset**: **Cross-Department Consolidated Master Dataset**
- **Sheet**: `AI_BLOCK_PLANNER_ALL_DEPTS` (60,001 rows, 71 columns)
- **Nature**: Serves as a pre-joined multi-department dataset linking requests, asset attributes, train operations, crew/equipment resources, and operational constraints across S&T, Track, and Traction.

### File 5: `3dept.xlsx`
- **Supporting Dataset**: **Core ML Model Training Workbook**
- **Sheets**:
  1. `Maintenance` (110,000 rows, 17 cols) — Asset condition, maintenance type, asset age, downtime, repair duration.
  2. `Engineering` (125,000 rows, 17 cols) — Request ID, asset ID, technicians, manpower used, equipment used, planned duration.
  3. `Operations` (105,000 rows, 18 cols) — Block type, actual duration, train frequency, traffic density, scheduled trains, affected trains, previous delay, failure severity, priority.
- **Role**: Source for backend SQLite database (`railway_data.db`) and verified scikit-learn model training (`smms_asset_condition_model.joblib`, `tms_actual_duration_model.joblib`, `trd_affected_trains_model.joblib`).

---

## 3. Complete Column Inventory (71 Standardized Columns)

The primary 71 columns present across `ST_DEPARTMENT.xlsx`, `TRACK_MANAGEMENT.xlsx`, `TRD_DEPARTMENT.xlsx`, and `ALL_DEPTS.xlsx`:

| Column Name | Data Type | Sample Values | Nulls | Uniques | Planner Relevance |
|:---|:---|:---|:---|:---|:---|
| `Request_ID` | `str` | `BR-RANA-87560`, `BR-TATA-93589` | 0 | 60,001 | **YES (Block Request Data)** |
| `Station` | `str` | `Ranaghat`, `Tatanagar`, `Churu` | 0 | 815 | **YES (Block Request Data)** |
| `Asset_ID` | `str` | `ABN-RANA-MCH-4408`, `ABN-TATA-OHE-5952` | 0 | 60,001 | **YES (Block Request & Asset Data)** |
| `Work_Type` | `str` | `Telecom_OFC_lay`, `Track_tamping` | 0 | 12 | **YES (Block Request Data)** |
| `Priority` | `str` | `Urgent`, `High`, `Normal`, `Routine` | 0 | 4 | **YES (Block Request Data)** |
| `Requested_Date` | `str` | `09-Aug-2024`, `02-Jul-2025` | 0 | 365 | **YES (Block Request Data)** |
| `Requested_Start_Time` | `str` | `17:00`, `09:00`, `22:30` | 0 | 96 | **YES (Block Request Data)** |
| `Required_Duration` | `int64` | `4`, `12`, `6`, `3.5` | 0 | 24 | **YES (Block Request Data)** |
| `Asset_Type` | `str` | `OHE asset`, `Telecom asset`, `Civil structure` | 0 | 11 | **YES (Asset Data)** |
| `Current_Status` | `str` | `In use`, `Available`, `Under maintenance` | 0 | 7 | **YES (Asset Data)** |
| `Asset_Availability` | `str` | `Yes`, `No`, `On calendar` | 0 | 4 | **YES (Asset Data)** |
| `Asset_Condition` | `str` | `B (Good)`, `D (Needs renewal)`, `A (Excellent)` | 0 | 5 | **YES (Asset Data)** |
| `Train_Schedule` | `str` | `20:00 - 06:00`, `16:15 - 22:15` | 0 | 3,248 | **YES (Train Operations Data)** |
| `Train_Frequency` | `str` | `Hourly`, `Every 30 min`, `Every 15 min` | 0 | 10 | **YES (Train Operations Data)** |
| `Traffic_Density` | `str` | `Medium-High`, `High density`, `Low` | 0 | 5 | **YES (Train Operations Data)** |
| `Affected_Trains` | `str` | `Express trains diverted`, `Mail/Express halted` | 0 | 10 | **YES (Train Operations Data)** |
| `Available_Technicians` | `int64` | `15`, `5`, `3`, `12` | 0 | 19 | **YES (Resource Data)** |
| `Available_Manpower` | `int64` | `4`, `29`, `18`, `52` | 0 | 59 | **YES (Resource Data)** |
| `Equipment_Availability` | `str` | `Fully available`, `Partially available` | 0 | 5 | **YES (Resource Data)** |
| `Allowed_Start_Time` | `str` | `17:15`, `09:30`, `04:00` | 0 | 39 | **YES (Block Constraint Data)** |
| `Allowed_End_Time` | `str` | `19:15`, `22:30`, `10:15` | 0 | 117 | **YES (Block Constraint Data)** |
| `Maximum_Block_Duration` | `int64` | `2`, `12`, `6`, `4` | 0 | 11 | **YES (Block Constraint Data)** |
| `Existing_Block_Schedule` | `str` | `Overlapping signalling work...` | 8,467 | 6 | **YES (Block Constraint Data)** |
| `Conflicting_Blocks` | `str` | `CONFLICT: LC gatekeeper duty clash...` | 27,078 | 776 | **YES (Block Constraint Data)** |
| `Section_From` / `Section_To` | `str` | `Tatanagar`, `Ranaghat` | 0 | 815 | Auxiliary Spatial Context |
| `Zone_Code` / `Division` | `str` | `NFR`, `CR`, `Rangiya`, `Pune` | 0 | 69 | Auxiliary Zonal Context |
| `Line_Type` / `Max_Speed_KMPH`| `str`/`int`| `Main line (double)`, `130` | 0 | 82 | Auxiliary Track Specs |

---

## 4. Three Department Data Analysis (SMMS, TMS, TRD)

All 3 department files (`ST_DEPARTMENT.xlsx`, `TRACK_MANAGEMENT.xlsx`, `TRD_DEPARTMENT.xlsx`) share identical 71-column structure schemas, but differ in domain content:

- **SMMS (S&T)**: Focuses on signalling, telecommunications, point machines, track circuits, and electronic interlocking.
- **TMS (Track)**: Focuses on rails, sleepers, ballast, turnouts, track geometry, and civil engineering structures.
- **TRD (Traction)**: Focuses on OHE catenary wires, traction substations (TSS), switching posts, and power isolation.

---

## 5. Supporting Dataset Analysis (`ALL_DEPTS.xlsx` & `3dept.xlsx`)

- **`ALL_DEPTS.xlsx`**: Consolidated dataset merging S&T, TMS, and TRD records. Used when cross-department joint queries are requested without querying individual department sheets.
- **`3dept.xlsx`**: Historical operational dataset divided into `Maintenance`, `Engineering`, and `Operations`. Serves as backend database source and ML model training ground.

---

## 6. Planner Data Mapping (The 5 Categories & 22 Fields)

### Category 1: BLOCK REQUEST DATA (8 Fields)

1. **Request ID**
   - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
   - **Source Column**: `Request_ID`
   - **Transformation**: None (Format: `BR-XXXX-XXXXX`)

2. **Station**
   - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
   - **Source Column**: `Station`
   - **Transformation**: String normalization

3. **Asset ID**
   - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
   - **Source Column**: `Asset_ID`
   - **Transformation**: None (Format: `ABN-XXXX-XXX-XXXX`)

4. **Work Type**
   - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
   - **Source Column**: `Work_Type`
   - **Transformation**: Standardized string replace underscores with spaces

5. **Priority**
   - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
   - **Source Column**: `Priority`
   - **Transformation**: Map `Urgent` -> `P1 - High`, `Normal` -> `P2 - Medium`, `Routine` -> `P3 - Low`

6. **Requested Date**
   - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
   - **Source Column**: `Requested_Date`
   - **Transformation**: Parse date string to ISO `YYYY-MM-DD`

7. **Requested Start Time**
   - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
   - **Source Column**: `Requested_Start_Time`
   - **Transformation**: Format to `HH:MM` (24-hr)

8. **Required Duration**
   - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
   - **Source Column**: `Required_Duration`
   - **Transformation**: Convert integer/float to hours (e.g. `3.5`)

---

### Category 2: ASSET DATA (5 Fields)

9. **Asset ID**
   - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
   - **Source Column**: `Asset_ID`

10. **Asset Type**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Asset_Type`

11. **Current Status**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Current_Status`

12. **Asset Availability**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Asset_Availability` (Can also be enriched via ML Health State prediction)

13. **Asset Condition**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Asset_Condition`

---

### Category 3: TRAIN OPERATIONS DATA (4 Fields)

14. **Train Schedule**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Train_Schedule`

15. **Train Frequency**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Train_Frequency`

16. **Traffic Density**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Traffic_Density`

17. **Affected Trains**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Affected_Trains` (Can also be calculated via ML TRD model `trd_affected_trains_model.joblib`)

---

### Category 4: RESOURCE DATA (3 Fields)

18. **Available Technicians**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Available_Technicians`

19. **Available Manpower**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Available_Manpower`

20. **Equipment Availability**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Equipment_Availability`

---

### Category 5: BLOCK CONSTRAINT DATA (5 Fields)

21. **Allowed Start Time**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Allowed_Start_Time`

22. **Allowed End Time**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Allowed_End_Time`

23. **Maximum Block Duration**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Maximum_Block_Duration`

24. **Existing Block Schedule**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Existing_Block_Schedule`

25. **Conflicting Blocks**
    - **Source File**: `ST_DEPARTMENT.xlsx` / `TRACK_MANAGEMENT.xlsx` / `TRD_DEPARTMENT.xlsx` / `ALL_DEPTS.xlsx`
    - **Source Column**: `Conflicting_Blocks`

---

## 7. 22-Field Data Availability Matrix

| # | Planner Field | Category | Available Direct? | Discovered Source File | Discovered Source Column | Derived? | Data Quality Score |
|---|:---|:---|:---:|:---|:---|:---:|:---:|
| 1 | `request_id` | Block Request | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Request_ID` | No | **100%** |
| 2 | `station` | Block Request | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Station` | No | **100%** |
| 3 | `asset_id` | Block Request | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Asset_ID` | No | **100%** |
| 4 | `work_type` | Block Request | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Work_Type` | No | **100%** |
| 5 | `priority` | Block Request | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Priority` | Format map | **100%** |
| 6 | `requested_date` | Block Request | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Requested_Date` | ISO Date | **100%** |
| 7 | `requested_start_time` | Block Request | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Requested_Start_Time` | HH:MM | **100%** |
| 8 | `required_duration` | Block Request | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Required_Duration` | Hours float | **100%** |
| 9 | `asset_id` | Asset Data | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Asset_ID` | No | **100%** |
| 10 | `asset_type` | Asset Data | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Asset_Type` | No | **100%** |
| 11 | `current_status` | Asset Data | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Current_Status` | No | **100%** |
| 12 | `asset_availability` | Asset Data | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Asset_Availability` | Optional ML | **100%** |
| 13 | `asset_condition` | Asset Data | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Asset_Condition` | No | **100%** |
| 14 | `train_schedule` | Train Ops | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Train_Schedule` | No | **100%** |
| 15 | `train_frequency` | Train Ops | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Train_Frequency` | No | **100%** |
| 16 | `traffic_density` | Train Ops | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Traffic_Density` | No | **100%** |
| 17 | `affected_trains` | Train Ops | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Affected_Trains` | Optional ML | **100%** |
| 18 | `available_technicians`| Resource Data | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Available_Technicians`| Integer | **100%** |
| 19 | `available_manpower` | Resource Data | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Available_Manpower` | Integer | **100%** |
| 20 | `equipment_availability`| Resource Data| **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Equipment_Availability`| String | **100%** |
| 21 | `allowed_start_time` | Constraints | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Allowed_Start_Time` | HH:MM | **100%** |
| 22 | `allowed_end_time` | Constraints | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Allowed_End_Time` | HH:MM | **100%** |
| 23 | `maximum_block_duration`| Constraints| **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Maximum_Block_Duration`| Hours float | **100%** |
| 24 | `existing_block_schedule`| Constraints| **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Existing_Block_Schedule`| Null handled | **86%** |
| 25 | `conflicting_blocks` | Constraints | **YES** | `ST` / `TRACK` / `TRD` / `ALL_DEPTS` | `Conflicting_Blocks` | Null handled | **55%** |

---

## 8. Cross-Department Relationships & Join Keys

Records across the 5 data files can be joined cleanly using:
1. **Primary Join Key**: `Asset_ID` (`ABN-XXXX-XXX-XXXX`) — 100% match quality across datasets.
2. **Secondary Join Key**: `Request_ID` (`BR-XXXX-XXXXX`) — Unique identifier per work request.
3. **Location Key**: `Station` — Maps requests to station network coordinates.

---

## 9. Department Data Routing Logic

- **SMMS Request Routing**: Queries `ST_DEPARTMENT.xlsx` for S&T block request features + cross-references `ALL_DEPTS.xlsx` or `3dept.xlsx` for joint section traffic density and adjoining track constraints.
- **TMS Request Routing**: Queries `TRACK_MANAGEMENT.xlsx` for civil/track request features + cross-references OHE traction power status from `TRD_DEPARTMENT.xlsx`.
- **TRD Request Routing**: Queries `TRD_DEPARTMENT.xlsx` for traction/OHE request features + cross-references signal interlocking status from `ST_DEPARTMENT.xlsx`.

---

## 10. ML → AI Planner Data Boundary

- **Isolation Principle**: The ML Prediction layer and AI Block Planner layer maintain a strict boundary.
- **Input Feeding**: Verified ML outputs (`TMS: Actual Duration Prediction`, `TRD: Affected Train Count`, `SMMS: Failure Risk`) can optionally enrich the planner input record under `required_duration`, `affected_trains`, and `asset_availability` **without breaking the 5-category data contract**.

---

## 11. Final AI Block Planner Input Schema

```json
{
  "block_request": {
    "request_id": "BR-TATA-93589",
    "station": "Tatanagar",
    "asset_id": "ABN-TATA-OHE-5952",
    "work_type": "Traction_substation_maintenance",
    "priority": "P1 - Urgent",
    "requested_date": "2025-07-02",
    "requested_start_time": "09:00",
    "required_duration": 3.5
  },
  "asset": {
    "asset_id": "ABN-TATA-OHE-5952",
    "asset_type": "OHE asset",
    "current_status": "In use",
    "asset_availability": "Yes",
    "asset_condition": "B (Good)"
  },
  "train_operations": {
    "train_schedule": "20:00 - 06:00",
    "train_frequency": "Hourly",
    "traffic_density": "Medium-High",
    "affected_trains": "Mail/Express halted at adjoining station"
  },
  "resources": {
    "available_technicians": 15,
    "available_manpower": 4,
    "equipment_availability": "Fully available"
  },
  "block_constraints": {
    "allowed_start_time": "17:15",
    "allowed_end_time": "23:00",
    "maximum_block_duration": 6.0,
    "existing_block_schedule": "Overlapping signalling work in next subdivision",
    "conflicting_blocks": "CONFLICT: Level-crossing gatekeeper duty clash"
  }
}
```

---

## 12. DATA AUDIT STATUS

DATA AUDIT STATUS: **READY FOR PLANNER INTEGRATION**
