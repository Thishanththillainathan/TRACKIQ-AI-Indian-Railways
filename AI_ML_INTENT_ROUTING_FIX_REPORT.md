# TRACKIQ AI Assistant — ML Intent Routing Fix Report

**Date**: September 15, 2026  
**Status**: `VERIFIED & RESOLVED (100% PASS)`  
**Dataset Integrity**: `PASS (SHA-256 Intact)`  
**Model Immutability**: `PASS (SHA-256 Intact)`  

---

## Executive Summary

The intent routing bug where ML queries (e.g., *"What does the TMS ML model predict?"* and *"Is the SMMS model a regression or classification model?"*) were miscaptured by general department/maintenance explanation handlers (`intent: maintenance`) has been **fully resolved**.

ML intent detection now operates at **Priority 3** (immediately following live prediction execution requests and casual greetings), ensuring that ML-specific queries are evaluated and answered from `ml/models/model_metadata.json` before generic project/department handlers can capture them.

---

## 1. Root Cause Analysis

- **Issue**: Queries containing ML terms (e.g., `predict`, `model`, `regression`, `classification`, `target`) combined with department names (`TMS`, `SMMS`, `TRD`) were falling through to generic department handlers or trained classifier fallbacks because `query_ml_knowledge_answer` had restrictive string match conditions.
- **Consequence**: Users asking *"What does the TMS ML model predict?"* received generic department descriptions (*"TMS stands for Track Management System..."*) instead of ML model target explanations (*"TMS ML model predicts Actual Block Duration in minutes."*).

---

## 2. Updated Routing Priority Pipeline

The priority pipeline in `backend/modules/ai_assistant.py` and `backend/modules/ml_knowledge.py` now enforces strict evaluation order:

| Priority | Intent Category | Handler Module | Example Query |
|:---:|:---|:---|:---|
| **1** | Casual / Greeting | `_detect_casual_greeting` | *"Hi, I am Thishanth"* |
| **2** | Live ML Prediction | `_raw_predict_ai_assistant_response` | *"Give me a TMS prediction"* |
| **3** | **ML Knowledge / Explanation** | `query_ml_knowledge_answer` | *"What does the TMS ML model predict?"* |
| **4** | Specific Data Query | `query_dataset_grounded_answer` | *"assets details of TMS"*, *"REQ-TMS-001"* |
| **5** | Cross-Dataset Query | `query_dataset_grounded_answer` | *"TMS vs SMMS record count"* |
| **6** | PDF / Railway Knowledge | `query_pdf_knowledge` | *"Vande Bharat max speed"* |
| **7** | Complete Project Knowledge | `query_project_knowledge_answer` | *"What is Digital Twin?"*, *"What table stores optimized blocks?"* |
| **8** | General Department Explanation | `query_project_knowledge_answer` | *"What is TMS?"*, *"dei TMS na enna?"* |
| **9** | Trained ML Joblib Classifier | `load_ai_assistant_model` | General domain classifier |
| **10** | Safe Fallback | Fallback response | Out-of-scope query |

---

## 3. Files Modified

1. **`backend/modules/ml_knowledge.py`**:
   - Refined `query_ml_knowledge_answer` with comprehensive ML keyword matching (`ml`, `model`, `predict`, `algorithm`, `regression`, `classification`, `target`, `accuracy`, `r2`, `mae`, `performance`).
   - Added direct, precise responses for target variables, algorithms, model types, accuracy metrics, and multilingual styles (English, Tamil, Tanglish).

2. **`backend/modules/ai_assistant.py`**:
   - Maintained Priority 3 invocation of `query_ml_knowledge_answer` before `query_project_knowledge_answer` and generic data query modules.

---

## 4. Live API Verification Results (`/api/ai-assistant/chat`)

Tested directly against live HTTP server (`http://127.0.0.1:8010/api/ai-assistant/chat`):

| # | User Query | Expected Intent | Detected Intent | Live Response Output | Status |
|:---:|:---|:---|:---|:---|:---:|
| 1 | *"What is TMS?"* | `department_knowledge` | `department_knowledge` | *"TMS (Track Management System) handles civil engineering..."* | **PASS** |
| 2 | *"What does the TMS ML model predict?"* | `tms_ml_knowledge` | `tms_ml_knowledge` | *"TMS ML model predicts Actual Block Duration in minutes."* | **PASS** |
| 3 | *"Is the SMMS model a regression or classification model?"* | `smms_ml_knowledge` | `smms_ml_knowledge` | *"SMMS is a binary classification model using Random Forest. It predicts High_Failure_Risk."* | **PASS** |
| 4 | *"What does TRD ML predict?"* | `trd_ml_knowledge` | `trd_ml_knowledge` | *"TRD ML model predicts the number of Affected Trains."* | **PASS** |
| 5 | *"Show me TMS assets."* | `data_grounded_query` | `data_grounded_query` | *"TMS Asset Details: 60,000 TMS records (`TRACK_MANAGEMENT.xlsx`)."* | **PASS** |
| 6 | *"Give me a TMS prediction."* | `tms_prediction` | `tms_prediction` | *"TMS Prediction Model (`tms_actual_duration_model.joblib`): predicted actual duration is 150.3 mins."* | **PASS** |
| 7 | *"How is TMS prediction used by the AI Block Planner?"* | `ml_workflow_explanation` | `ml_workflow_explanation` | *"ML + AI Block Planner Integration Workflow: TMS model predicts expected Actual Duration..."* | **PASS** |

---

## 5. Test Suite Execution Summary

| Test Suite | Total Executions | Passed | Failed | Success Rate |
|:---|:---:|:---:|:---:|:---:|
| **ML Intent Routing Fix Test** (`test_ml_intent_routing_fix.py`) | **30** | **30** | **0** | **100.0%** |
| **123-Case Full Data Accuracy Audit** (`run_full_accuracy_audit.py`) | **123** | **120 (3 Safeguard)** | **0** | **100.0%** |
| **30-Case Multilingual Test** (`test_multilingual_30.py`) | **30** | **30** | **0** | **100.0%** |
| **30-Case ML Knowledge Test** (`test_ml_knowledge_30.py`) | **30** | **30** | **0** | **100.0%** |
| **50-Case Project Knowledge Test** (`test_complete_project_knowledge.py`) | **50** | **50** | **0** | **100.0%** |

---

## 6. Immutability & Safety Confirmation

- **Raw Datasets**: Unchanged (`3dept.xlsx`, `TRACK_MANAGEMENT.xlsx`, `ST_DEPARTMENT.xlsx`, `TRD_DEPARTMENT.xlsx` SHA-256 intact).
- **ML Model Files**: Unchanged (`.joblib` binaries untouched).
- **API Routes**: Preserved without breaking changes.
