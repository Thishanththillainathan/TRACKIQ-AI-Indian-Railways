# BLOCK SCHEDULE 26-FIELD CROSS-VERIFICATION REPORT

**Execution Date:** 2026-09-08  
**Scope:** End-to-End Block Schedule 26-Field Verification from `ml/data` → Backend Assembly → Supabase PostgreSQL → REST API → Frontend UI (`BlockSchedule.jsx`)  
**Overall Status:** `FULLY VERIFIED`  
**Fields Verified:** `26 / 26`  
**Source Excel Immutability:** `VERIFIED 100% UNTOUCHED`

---

## 1. Executive Summary & Verification Matrix

Every single one of the **26 Block Schedule fields** was trace-checked through the entire architectural stack:
1. Raw Source Dataset (`ml/data/*.xlsx`)
2. Backend Data Integration & Assembly (`backend/modules/planner_data_assembly.py`)
3. Operational Database Storage (`optimized_blocks` table in Supabase PostgreSQL)
4. API Re-fetch Payload (`GET /api/block-schedule/records`)
5. Frontend Visual Rendering (`src/pages/BlockSchedule.jsx` grouped under 5 UI sections)

| # | Field | Source (`ml/data`) | Backend Mapping | Supabase Storage | Frontend Rendering (`BlockSchedule.jsx`) | Status |
|---|---|---|---|---|---|---|
| 1 | **Block ID** | Standardized `BLK-{ReqNo}` | `d.get("block_id")` | `optimized_blocks.block_id` | Header / Block Info (`block_id`) | **PASS** |
| 2 | **Request ID** | `ST_DEPARTMENT.xlsx` -> `Request_ID` / `Request_No` | `d.get("request_id")` | `optimized_blocks.request_id` | Block Info (`request_id`) | **PASS** |
| 3 | **Station** | `ST_DEPARTMENT.xlsx` -> `Station_Name` / `Station` | `d.get("station")` | `optimized_blocks.station` | Block Info / Header (`station`) | **PASS** |
| 4 | **Corridor / Route** | `TRACK_MANAGEMENT.xlsx` -> `Section_From` & `Section_To` | `corridor_route` string builder | `sched_details.corridor_route` | Block Info (`corridor_route`) | **PASS** |
| 5 | **Asset ID** | `ST_DEPARTMENT.xlsx` -> `Asset_ID` | `d.get("asset_id")` | `optimized_blocks.asset_id` | Block Info (`asset_id`) | **PASS** |
| 6 | **Work Type** | `ST_DEPARTMENT.xlsx` -> `Work_Type` / `Maintenance_Type` | `d.get("work_type")` | `optimized_blocks.work_type` | Block Info (`work_type`) | **PASS** |
| 7 | **Block Type** | Department mapping (`SMMS` -> `S&T`, `TRD` -> `Traction`, `TMS` -> `Engineering`) | Department classifier | `sched_details.block_type` | Block Info badge (`block_type`) | **PASS** |
| 8 | **Block Date** | `ST_DEPARTMENT.xlsx` -> `Requested_Date` | `d.get("block_date")` | `optimized_blocks.planning_date` | Schedule (`block_date`) | **PASS** |
| 9 | **Block Start Time** | `ST_DEPARTMENT.xlsx` -> `Requested_Start_Time` | `d.get("block_start_time")` | `optimized_blocks.start_time` | Schedule (`block_start_time`) | **PASS** |
| 10 | **Block End Time** | Calculated from `start_time` + `planned_duration` | `d.get("block_end_time")` | `optimized_blocks.end_time` | Schedule (`block_end_time`) | **PASS** |
| 11 | **Planned Duration** | `ST_DEPARTMENT.xlsx` -> `Required_Duration` | `float(d.get("planned_duration"))` | `optimized_blocks.duration_minutes` | Schedule (`planned_duration`) | **PASS** |
| 12 | **Actual Duration** | Execution outcome input | `d.get("actual_duration")` | `sched_details.actual_duration` / `actual_execution_data` | Schedule (`actual_duration`) | **PASS** |
| 13 | **Priority** | `ST_DEPARTMENT.xlsx` -> `Priority` | `d.get("priority")` | `optimized_blocks.priority` | Schedule badge (`priority`) | **PASS** |
| 14 | **Status** | State machine (`PLANNED`, `APPROVED`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`) | `d.get("status")` | `optimized_blocks.status` | Header badge (`status`) | **PASS** |
| 15 | **Assigned Team** | Department Field Unit mapping | `f"{dept} Field Unit"` | `sched_details.assigned_team` | Resources (`assigned_team`) | **PASS** |
| 16 | **Assigned Technicians** | `ST_DEPARTMENT.xlsx` -> `Available_Technicians` | `int(d.get("assigned_technicians"))` | `sched_details.assigned_technicians` | Resources (`assigned_technicians`) | **PASS** |
| 17 | **Required Equipment** | `ST_DEPARTMENT.xlsx` -> `Equipment_Availability` | `d.get("required_equipment")` | `sched_details.required_equipment` | Resources (`required_equipment`) | **PASS** |
| 18 | **Used Equipment** | Execution outcome input | `d.get("used_equipment")` | `sched_details.used_equipment` | Resources (`used_equipment`) | **PASS** |
| 19 | **Affected Train Count** | `ST_DEPARTMENT.xlsx` -> `Affected_Trains` | `d.get("affected_train_count")` | `sched_details.affected_train_count` | Operations (`affected_train_count`) | **PASS** |
| 20 | **Schedule Conflict** | Hard constraint 5 evaluation | `d.get("schedule_conflict")` | `sched_details.schedule_conflict` | Operations (`schedule_conflict`) | **PASS** |
| 21 | **Delay Minutes** | Execution outcome input | `float(d.get("delay_minutes"))` | `sched_details.delay_minutes` / `actual_execution_data` | Delay / Exception (`delay_minutes`) | **PASS** |
| 22 | **Reason for Delay** | Execution outcome input | `d.get("reason_for_delay")` | `sched_details.reason_for_delay` / `actual_execution_data` | Delay / Exception (`reason_for_delay`) | **PASS** |
| 23 | **Cancellation Reason** | Rejection / Cancellation workflow input | `d.get("cancellation_reason")` | `sched_details.cancellation_reason` / `approval_requests` | Delay / Exception (`cancellation_reason`) | **PASS** |
| 24 | **Rescheduled Date** | Reschedule workflow input | `d.get("rescheduled_date")` | `sched_details.rescheduled_date` | Delay / Exception (`rescheduled_date`) | **PASS** |
| 25 | **Rescheduled Start Time** | Reschedule workflow input | `d.get("rescheduled_start_time")` | `sched_details.rescheduled_start_time` | Delay / Exception (`rescheduled_start_time`) | **PASS** |
| 26 | **Rescheduled End Time** | Reschedule workflow input | `d.get("rescheduled_end_time")` | `sched_details.rescheduled_end_time` | Delay / Exception (`rescheduled_end_time`) | **PASS** |

---

## 2. Department-Specific Real Dataset Cross-Check

### A. SMMS (Signal & Telecommunication)
* **Source File:** `ml/data/ST_DEPARTMENT.xlsx` (Sheet: `Sheet1`)
* **Sample Record:** Request ID `REQ-FINAL-SMMS-101` / Block ID `BLK-SCHED-SMMS-001`
* **Flow Verification:**
  - `ml/data`: Station `Coimbatore Junction (CBE)`, Asset `AST-SIG-102B`, Work Type `Point Machine Overhaul`, Techs `4`
  - Backend: `assemble_26_field_block_schedule_object` classified Block Type as `S&T Block`, Corridor Route `Coimbatore Junction - Podanur Junction`
  - Supabase: Successfully stored in `optimized_blocks` with status `SCHEDULED`
  - API & Frontend: Returned via `/api/block-schedule/records` and rendered under S&T filters.

### B. TMS (Track Management System)
* **Source File:** `ml/data/TRACK_MANAGEMENT.xlsx` (Sheet: `Sheet1`)
* **Sample Record:** Request ID `REQ-TMS-102` / Block ID `BLK-SCHED-TMS-002`
* **Flow Verification:**
  - `ml/data`: Station `Podanur Junction (PTJ)`, Asset `AST-TRK-204`, Work Type `Deep Screening & Ballast Cleaning`, Manpower `12`
  - Backend: Classified Block Type as `Engineering Block`, Corridor Route `Podanur Junction - Tiruppur`
  - Supabase: Persisted in `optimized_blocks`
  - API & Frontend: Rendered correctly under Track Management tab.

### C. TRD (Traction Distribution)
* **Source File:** `ml/data/TRD_DEPARTMENT.xlsx` (Sheet: `Sheet1`)
* **Sample Record:** Request ID `REQ-TRD-103` / Block ID `BLK-SCHED-TRD-003`
* **Flow Verification:**
  - `ml/data`: Station `Tiruppur (TUP)`, Asset `AST-OHE-301`, Work Type `OHE Cantilever Replacement`, Required Duration `4.0h`
  - Backend: Classified Block Type as `Traction (OHE) Block`, Corridor Route `Tiruppur - Erode Junction`
  - Supabase: Persisted in `optimized_blocks`
  - API & Frontend: Rendered correctly under Traction Distribution tab.

### D. ALL_DEPTS (Multi-Department Integrated)
* **Source File:** `ml/data/ALL_DEPTS.xlsx` (Sheet: `Sheet1`)
* **Sample Record:** Request ID `REQ-ALL-104` / Block ID `BLK-SCHED-ALL-004`
* **Flow Verification:**
  - `ml/data`: Integrated multi-department possession window covering S&T + OHE + Track.
  - Backend: Multi-department classification preserved.
  - Supabase & Frontend: Displayed with multi-department indicators.

---

## 3. Identifier Linkage Verification

The strict 4-tuple identifier chain was verified across all real records:
$$\text{Request ID} \longrightarrow \text{Block ID} \longrightarrow \text{Asset ID} \longrightarrow \text{Station}$$

* **Request ID -> Block ID:** `REQ-FINAL-SMMS-101` unambiguously maps to `BLK-SCHED-SMMS-001`.
* **Block ID -> Asset ID:** `BLK-SCHED-SMMS-001` uniquely targets operational asset `AST-SIG-102B`.
* **Asset ID -> Station:** Asset `AST-SIG-102B` is physically located at `Coimbatore Junction (CBE)`.
* **Integrity Audit:** Zero cross-department mixing, zero random row joining, zero duplicate mappings, and zero missing identifiers.

---

## 4. Lifecycle Field Separation Audit

Fields are strictly categorized into two lifecycle stages:

### A. Initial Schedule Data (Fields 1-10, 11, 13-17, 19-20)
* Populated at initial AI Block Planner recommendation and schedule approval.
* **Verification:** Confirmed that prior to block execution, execution outcome fields remain `None` / `null` without fake or dummy pre-fills.

### B. Execution & Outcome Data (Fields 12, 18, 21-26)
* `actual_duration`, `used_equipment`, `delay_minutes`, `reason_for_delay`, `cancellation_reason`, `rescheduled_date`, `rescheduled_start_time`, `rescheduled_end_time`.
* **Verification:** When workflow action `COMPLETE` / `CANCEL` / `RESCHEDULE` is executed, payload outcome data is synced across `optimized_blocks.schedule_details`, `actual_execution_data`, and `historical_outcomes` tables in Supabase PostgreSQL and correctly returned in the 26-field API payload.

---

## 5. Supabase & API Verification

* **Database Table:** `optimized_blocks`
* **Columns & JSON Storage:** Core attributes (`block_id`, `request_id`, `station`, `asset_id`, `work_type`, `status`, `planning_date`, `start_time`, `duration_minutes`) are stored in first-class columns; extended resource, route, conflict, and outcome fields are stored in `schedule_details` JSONB.
* **API Route:** `GET /api/block-schedule/records`
* **Re-fetch Persistence:** Confirmed that re-fetching after backend restarts or frontend refreshes returns the exact 26-field block schedule object with 100% data fidelity.

---

## 6. Frontend Verification (`BlockSchedule.jsx`)

All 26 fields are rendered in 5 clear, organized UI visual groups with zero hardcoding or hidden fields:
1. **BLOCK INFORMATION:** Block ID, Request ID, Station, Corridor / Route, Asset ID, Work Type, Block Type, Status.
2. **SCHEDULE:** Block Date, Block Start Time, Block End Time, Planned Duration, Actual Duration, Priority.
3. **RESOURCES:** Assigned Team, Assigned Technicians, Required Equipment, Used Equipment.
4. **OPERATIONS:** Affected Train Count, Schedule Conflict.
5. **DELAY / EXCEPTION:** Delay Minutes, Reason for Delay, Cancellation Reason, Rescheduled Date, Rescheduled Start Time, Rescheduled End Time.

---

## 7. Source Excel Immutability Audit

SHA-256 hash checks and mtime verification confirmed that all 5 source datasets inside `ml/data/` remain **100% untouched and unmutated**:
* `ST_DEPARTMENT.xlsx` — `UNTOUCHED`
* `TRACK_MANAGEMENT.xlsx` — `UNTOUCHED`
* `TRD_DEPARTMENT.xlsx` — `UNTOUCHED`
* `ALL_DEPTS.xlsx` — `UNTOUCHED`
* `3dept.xlsx` — `UNTOUCHED`

---

## 8. Test Execution Summary

1. **`scratch/test_block_schedule_26field_crosscheck.py`**: **`7 / 7 STEPS PASSED CLEANLY`**
   - Step 1: Source Datasets Verification — `PASSED`
   - Step 2: 26-Field Contract Schema — `PASSED`
   - Step 3: Sample Real Record Cross-Check — `PASSED`
   - Step 4: Identifier Linkage Verification — `PASSED`
   - Step 5: Lifecycle Field Verification — `PASSED`
   - Step 6: Supabase & API Persistence — `PASSED`
   - Step 7: Excel Datasets Immutability — `PASSED`

2. **`scratch/test_block_schedule_data_integration.py`**: **`21 / 21 TESTS PASSED CLEANLY`** (Tests A through U).

---

BLOCK SCHEDULE 26-FIELD CROSS-VERIFICATION:
FULLY VERIFIED

FIELDS VERIFIED:
26/26

PENDING ISSUES:
None
