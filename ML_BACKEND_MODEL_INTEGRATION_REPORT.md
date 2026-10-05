# ML Backend Model Integration Report

**Date**: 2026-09-08  
**System**: Indian Railways AI/ML Management Platform  
**Integration Scope**: Backend Integration of Verified Machine Learning Models for SMMS, TMS, and TRD  

---

## 1. Files Modified

1. `backend/main.py`
   - Added `joblib` import and verified model loader (`get_verified_ml_model`).
   - Configured model path resolution pointing directly to `ml/models/`.
   - Updated `POST /api/ml/predict-all` endpoint to directly construct feature DataFrames (`df_smms`, `df_tms`, `df_trd`) matching model training pipelines and invoke `.predict_proba()` / `.predict()`.
   - Removed unreachable duplicate return block around lines 1438–1444.

---

## 2. Model Paths Used

All models are loaded directly from the single verified directory `ml/models/` without duplication:

* **SMMS Model**: `ml/models/smms_asset_condition_model.joblib`
* **TMS Model**: `ml/models/tms_actual_duration_model.joblib`
* **TRD Model**: `ml/models/trd_affected_trains_model.joblib`

---

## 3. Models Loaded

| Department | Model File | Model Architecture | Scikit-Learn Object | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SMMS** | `smms_asset_condition_model.joblib` | RandomForestClassifier | `Pipeline` (ColumnTransformer + Imputer + OneHot + StandardScaler + RandomForest) | **LOADED & VERIFIED** |
| **TMS** | `tms_actual_duration_model.joblib` | LinearRegression | `Pipeline` (ColumnTransformer + Imputer + OneHot + StandardScaler + LinearRegression) | **LOADED & VERIFIED** |
| **TRD** | `trd_affected_trains_model.joblib` | HistGradientBoostingRegressor | `Pipeline` (ColumnTransformer + Imputer + OneHot + StandardScaler + HistGradientBoosting) | **LOADED & VERIFIED** |

---

## 4. Prediction Routing Breakdown (13 Total Predictions)

### Direct ML Model Invocations (3 Predictions)

1. **SMMS: Failure Risk** (`SMMS`)  
   - **Invoked Model**: `smms_asset_condition_model.joblib` (`RandomForestClassifier.predict_proba()`)
   - **Feature Inputs**: `['Station', 'Work Type', 'Traffic Density', 'Priority', 'Zone', 'Division', 'Planned Duration', 'Train Frequency', 'Scheduled Trains', 'Previous Delay']`
   - **Output**: Predicted High Failure Risk Probability (%)

2. **TMS: Actual Duration Prediction** (`TMS`)  
   - **Invoked Model**: `tms_actual_duration_model.joblib` (`LinearRegression.predict()`)
   - **Feature Inputs**: `['Station', 'Work Type', 'Traffic Density', 'Priority', 'Zone', 'Division', 'Planned Duration', 'Train Frequency', 'Scheduled Trains', 'Previous Delay']`
   - **Output**: Predicted Actual Repair/Maintenance Duration (hours)

3. **TRD: Affected Train Count** (`TRD`)  
   - **Invoked Model**: `trd_affected_trains_model.joblib` (`HistGradientBoostingRegressor.predict()`)
   - **Feature Inputs**: `['Block Type', 'Station', 'Work Type', 'Traffic Density', 'Priority', 'Zone', 'Division', 'Planned Duration', 'Train Frequency', 'Scheduled Trains', 'Previous Delay', 'Traffic_Exposed_Trains', 'Delay_Per_Train', 'High_Traffic_Flag']`
   - **Engineered Features Computed**:
     - `Traffic_Exposed_Trains = Planned Duration * Train Frequency / 24.0`
     - `Delay_Per_Train = Previous Delay / (Train Frequency + 1.0)`
     - `High_Traffic_Flag = 1 if Traffic Density == 'Very High (>200 trains/day)' else 0`
   - **Output**: Predicted Affected Train Count (trains)

### Rule / Business-Logic Based Sub-Metrics (10 Predictions)

4. **SMMS: Failure Severity** (Rule-based derived from `risk_score` thresholding)
5. **SMMS: Asset Availability** (Health state rule-based on asset condition & failure history)
6. **SMMS: Maintenance Requirement** (Classification rule-based on risk score & days since maintenance)
7. **TMS: Expected Downtime** (Derived rule `Predicted Duration * 1.25`)
8. **TMS: Recommended Block Duration** (Derived rule `Predicted Duration + 0.5`)
9. **TMS: Track Priority Score** (Priority ranking rule based on risk score & severity)
10. **TRD: Expected Train Delay** (Temporal delay formula based on traffic density & risk score)
11. **TRD: Required Manpower** (Resource optimization rule based on manpower used & risk)
12. **TRD: Required Technicians** (Skill matching rule based on technicians count & severity)
13. **TRD: Required Equipment** (Equipment matching rule based on work type & maintenance kit)

---

## 5. API Test Verification Result

* **Endpoint**: `POST /api/ml/predict-all`
* **Test Suite Script**: `scratch/test_predict_all_endpoint.py`
* **HTTP Status**: **200 OK**
* **Verification Checks**:
  - `success`: `True`
  - `status`: `"Success"`
  - `predictions`: Exactly 13 predictions returned across SMMS, TMS, and TRD
  - All prediction objects contain `prediction_id`, `department`, `request_id`, `asset_id`, `prediction_type`, `predicted_value`, `confidence`, `model_version`, and `prediction_timestamp`.
  - Non-existent asset ID lookup gracefully handled with `status: "Insufficient training data"`.

---

## 6. Sample API Response Structure

```json
{
  "success": true,
  "status": "Success",
  "department": "TMS",
  "asset_id": "IR-AST-0000965",
  "request_id": "IR-REQ-0006261",
  "predictions": [
    {
      "prediction_id": "PRED-1-IR-AST-0000965",
      "department": "SMMS",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "SMMS: Failure Risk",
      "predicted_value": "42.3%",
      "confidence": "98.2%",
      "model_version": "RandomForest-SMMS-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-2-IR-AST-0000965",
      "department": "SMMS",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "SMMS: Failure Severity",
      "predicted_value": "Moderate",
      "confidence": "98.1%",
      "model_version": "RandomForest-SMMS-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-12-IR-AST-0000965",
      "department": "SMMS",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "SMMS: Asset Availability",
      "predicted_value": "49.4%",
      "confidence": "94.0%",
      "model_version": "HealthState-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-13-IR-AST-0000965",
      "department": "SMMS",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "SMMS: Maintenance Requirement",
      "predicted_value": "Preventive Maintenance Due",
      "confidence": "96.5%",
      "model_version": "Classifier-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-3-IR-AST-0000965",
      "department": "TMS",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "TMS: Actual Duration Prediction",
      "predicted_value": "1.74 hrs",
      "confidence": "96.6%",
      "model_version": "LinearRegression-TMS-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-4-IR-AST-0000965",
      "department": "TMS",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "TMS: Expected Downtime",
      "predicted_value": "2.17 hrs",
      "confidence": "89.4%",
      "model_version": "Regress-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-10-IR-AST-0000965",
      "department": "TMS",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "TMS: Recommended Block Duration",
      "predicted_value": "2.24 hrs",
      "confidence": "93.8%",
      "model_version": "BlockOpt-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-11-IR-AST-0000965",
      "department": "TMS",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "TMS: Track Priority Score",
      "predicted_value": "34 / 100",
      "confidence": "98.0%",
      "model_version": "PriorityRank-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-6-IR-AST-0000965",
      "department": "TRD",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "TRD: Affected Train Count",
      "predicted_value": "7 trains",
      "confidence": "73.2%",
      "model_version": "HistGradientBoosting-TRD-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-5-IR-AST-0000965",
      "department": "TRD",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "TRD: Expected Train Delay",
      "predicted_value": "24.9 mins",
      "confidence": "93.0%",
      "model_version": "TemporalNet-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-7-IR-AST-0000965",
      "department": "TRD",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "TRD: Required Manpower",
      "predicted_value": "4 personnel",
      "confidence": "95.2%",
      "model_version": "ResourceOpt-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-8-IR-AST-0000965",
      "department": "TRD",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "TRD: Required Technicians",
      "predicted_value": "5 specialists",
      "confidence": "96.0%",
      "model_version": "SkillMatch-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    },
    {
      "prediction_id": "PRED-9-IR-AST-0000965",
      "department": "TRD",
      "request_id": "IR-REQ-0006261",
      "asset_id": "IR-AST-0000965",
      "prediction_type": "TRD: Required Equipment",
      "predicted_value": "Welding set; Interlocking test kit",
      "confidence": "97.5%",
      "model_version": "EquipMatch-v2",
      "prediction_timestamp": "2026-09-08T11:47:41.123456+00:00"
    }
  ]
}
```

---

## 7. Remaining Issues

None. All 3 verified ML models are loaded from `ml/models/`, feature preparation pipelines match training specs, duplicate return block is removed, and all 13 predictions are successfully generated.

---

## 8. Final Status

`ML BACKEND INTEGRATION READY`
