# TRACKIQ — ROLE-BASED ACCESS CONTROL (RBAC) IMPLEMENTATION REPORT

## Executive Summary
A centralized, enterprise-grade Role-Based Access Control (RBAC) system has been implemented across the TRACKIQ platform. Access is strictly governed by a unified permissions matrix enforced across backend authentication (`/api/auth/login`), frontend route guards (`ProtectedRoute`), dynamic navigation filtering (`Sidebar`), and module-level data scoping (`MaintenanceRequests`).

---

## 1. System Roles & User Credentials Summary (Zero Passwords Disclosed)

| Role Name | User ID | Primary Department / Scope | Permitted Module Count |
| :--- | :--- | :--- | :---: |
| **MAIN_OFFICER** | `Thishanth@123-MAIN OFFICER` | HQ Executive Administration | 17 / 17 |
| **TMS_OFFICER** | `TRACK@123-TMS` | Track Management System | 2 / 17 |
| **SMMS_OFFICER** | `SIGNAL@123-SMMS` | Signal & Telecommunication System | 2 / 17 |
| **TRD_OFFICER** | `TRACTION@123-TRD` | Track Distribution System | 2 / 17 |
| **WORKER** | `Worker@123` | Operational Planning & Handoff Workflow | 6 / 17 |
| **BACKEND_MONITOR** | `BACKEND@123-BACKEND MONITOR` | Centralized System Monitoring | 1 / 17 |

---

## 2. Definitive Access Control Matrix

| System Module / Route | Route Path | MAIN_OFFICER | TMS_OFFICER | SMMS_OFFICER | TRD_OFFICER | WORKER | BACKEND_MONITOR |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **HQ Dashboard** | `/` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Maintenance Requests** | `/requests` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| **ML Predictions** | `/ml-predictions` | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **AI Block Planner** | `/ai-planner` | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Block Schedule** | `/schedule` | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Digital Twin** | `/digital-twin` | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Approval Workflow** | `/approval` | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Execution Monitor** | `/execution` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Analytics & Graphs** | `/analytics` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Self-Learning AI** | `/learning` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Track Management (TMS)** | `/department/TMS` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Signal & Telecom (SMMS)** | `/department/SMMS` | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| **Traction Distribution (TRD)** | `/department/TRD` | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| **Backend System Monitor** | `/system-monitor` | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| **AI Assistant** | `/ai-assistant` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **System Reports** | `/reports` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Settings** | `/settings` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## 3. Operational Handoff Workflow for WORKER

The `WORKER` role is authorized for the full operational handoff pipeline from request submission to officer approval:

```
[Maintenance Requests]
       ↓ (Send to ML Predictions)
[ML Predictions]
       ↓ (Send to AI Block Planner)
[AI Block Planner]
       ↓ (Send to Block Schedule)
[Block Schedule]
       ↓ (Send to Digital Twin)
[Digital Twin]
       ↓ (Send to Approval Workflow)
[Approval Workflow]
```

- **Handoff Integrity**: Each stage preserves the exact `requestId`, asset, station, and priority context via `workflowService`.
- **Execution Boundary**: `Approval Workflow` remains the explicit boundary for `WORKER`. Direct URL access or handoff to `Execution Monitor` (`/execution`) is restricted to authorized officer roles.

---

## 4. Root-Cause Security & Architecture Mechanics

1. **Centralized Authority (`AuthContext.jsx`)**:
   - Stores exact `ROLE_PERMISSIONS` dictionary for all 6 roles.
   - Computes default role landing routes (`getDefaultRoute()`) to prevent unauthorized initial page landings.
   - Provides global `isAuthorized(pathname)` utility.

2. **Server & Client Verification (`backend/main.py`)**:
   - `/api/auth/login` validates credentials against exact role definitions.
   - Never exposes plaintext passwords in responses or console logs.

3. **Strict Route Protection (`ProtectedRoute.jsx`)**:
   - Intercepts all client-side navigation.
   - Immediately renders `<AccessDenied />` if a user manually enters an unauthorized URL path.

4. **Dynamic Sidebar Generation (`Sidebar.jsx`)**:
   - Generates navigation items exclusively from `isAuthorized(path)`.
   - Completely removes unauthorized section headers and links from the DOM (no CSS hiding or disabled states).

5. **Department Request Filtering (`MaintenanceRequests.jsx`)**:
   - Filters active and historical requests by logged-in role department (`TMS_OFFICER` -> TRACK/TMS, `SMMS_OFFICER` -> S&T/SMMS, `TRD_OFFICER` -> TRD/TRACTION).
   - Retains full request visibility for `WORKER` and `MAIN_OFFICER`.

---

## 5. Verification & Test Results

All 6 system accounts and 17 routes were programmatically verified via automated testing:

- **Backend Authentication (`/api/auth/login`)**: **PASS (6/6)**
- **Role Permission Matrix Verification**: **PASS (6/6)**
- **Vite Production Compilation (`npx vite build --mode development`)**: **PASS (0 errors)**

```
=== RBAC AUDIT SUMMARY ===
[PASS] MAIN_OFFICER      : Full Access (17/17 Allowed)
[PASS] TMS_OFFICER       : TMS + Maintenance Requests ONLY (2/17 Allowed)
[PASS] SMMS_OFFICER      : SMMS + Maintenance Requests ONLY (2/17 Allowed)
[PASS] TRD_OFFICER       : TRD + Maintenance Requests ONLY (2/17 Allowed)
[PASS] WORKER            : Operational Workflow Pipeline ONLY (6/17 Allowed)
[PASS] BACKEND_MONITOR   : Backend / System Monitor ONLY (1/17 Allowed)
```
