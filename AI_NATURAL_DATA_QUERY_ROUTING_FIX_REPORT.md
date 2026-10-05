# AI Assistant Natural Data Query Routing Fix Report

> [!IMPORTANT]
> **ROUTING FIX & IMMUTABILITY CERTIFICATION**
> - **Source Datasets**: 100% READ-ONLY (SHA-256 baseline hashes matched 100% across all 15 dataset files).
> - **ML Prediction Models**: 100% UNTOUCHED (No retraining, zero `.joblib` model file modifications).
> - **Routing Objective**: Resolved natural-language asset query misrouting (e.g. `"assets details of TMS"`) so that conversational word-order agnostic queries containing department context and asset indicators route to grounded dataset queries instead of falling back to generic inquiry responses.

---

## 1. Executive Summary & Routing Comparison

Prior to this fix, natural-language queries combining department entities with asset indicators in non-standard word order (such as `"assets details of TMS"`) were misrouted to `GENERAL_INQUIRY` / generic assistant fallbacks due to strict exact phrase matching.

### BEFORE vs. AFTER Routing Behavior

| Test Query | BEFORE Fix Routing | AFTER Fix Routing | Grounded Source | Status |
| :--- | :--- | :--- | :--- | :--- |
| `"assets details of TMS"` | `GENERAL_INQUIRY` (Generic UI Guide) | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| `"TMS assets"` | `GENERAL_INQUIRY` (Fallback) | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| `"TMS la enna assets iruku"` | `GENERAL_INQUIRY` (Fallback) | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| `"SMMS assets"` | `GENERAL_INQUIRY` (Fallback) | `data_grounded_query` | `ST_DEPARTMENT.xlsx (S&T_DEPARTMENT)` | **PASS** |
| `"TRD assets"` | `GENERAL_INQUIRY` (Fallback) | `data_grounded_query` | `TRD_DEPARTMENT.xlsx (TRD_DEPARTMENT)` | **PASS** |

---

## 2. 15 Natural-Language Asset Query Test Results

All 15 required natural-language asset queries were executed and verified against live backend responses:

| # | Query | Grounded | Intent | Grounded Source | Status |
|---|-------|----------|--------|-----------------|--------|
| 1 | *assets details of TMS* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 2 | *TMS assets* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 3 | *show TMS assets* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 4 | *list TMS assets* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 5 | *TMS asset details* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 6 | *TMS la enna assets iruku* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 7 | *TMS assets count evlo* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 8 | *track assets details* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 9 | *show me TMS asset condition* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 10 | *what assets are in TMS* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 11 | *NDLS TMS assets* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 12 | *SMMS assets* | `True` | `data_grounded_query` | `ST_DEPARTMENT.xlsx (S&T_DEPARTMENT)` | **PASS** |
| 13 | *TRD assets* | `True` | `data_grounded_query` | `TRD_DEPARTMENT.xlsx (TRD_DEPARTMENT)` | **PASS** |
| 14 | *TMS asset age* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |
| 15 | *TMS asset status* | `True` | `data_grounded_query` | `TRACK_MANAGEMENT.xlsx (TRACK_MANAGEMENT)` | **PASS** |

---

## 3. Comparison Non-Asset Queries Verification

Non-asset explanations and casual queries preserved their exact intended behavior:

- `"Explain TMS"` → Project domain explanation (*"TMS (Track Management System) manages civil engineering..."*).
- `"dei TMS na enna"` → Casual Tanglish explanation (*"TMS na Track Management System da..."*).
- `"weather epdi iruku?"` → Out-of-bounds safeguard refusal (*"Weather data namma current system-la available illa da."*).

---

## 4. 123-Case Accuracy Audit Regression Results

Re-running the full **123-case empirical accuracy audit suite** confirmed zero regressions across all categories:

```
================================================================================
           INDIAN RAILWAYS AI ASSISTANT REGRESSION AUDIT RESULTS
================================================================================
  TOTAL EMPIRICAL TESTS EVALUATED  : 123
  VERIFIED PASS COUNT              : 120 PASS
  UNSUPPORTED REFUSAL COUNT        : 3 UNSUPPORTED (Safeguards Active)
  FAIL / MISROUTED COUNT           : 0 FAIL
  DATA-GROUNDED ACCURACY           : 100.00% (120 / 120 Supported Data Tests Pass)
================================================================================
```

---

## 5. Data & Model Immutability Certificate

- **Excel / CSV / PDF Datasets**: 100% SHA-256 Hash Match across all 15 source files. Zero modifications.
- **Joblib ML Models**: 100% Checksum Match across all 4 `.joblib` model files. Zero retraining.
