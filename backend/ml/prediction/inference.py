import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timezone

from backend.ml.preprocessing.pipeline import load_pipeline_artifact, MODELS_DIR

def get_model_metadata(model_key):
    meta_path = os.path.join(MODELS_DIR, f"{model_key}_model_metadata.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            return json.load(f)
    return {
        "status": "insufficient_data",
        "message": f"{model_key.capitalize()} Prediction unavailable — insufficient historical labelled data."
    }

def predict_delay(input_data, supabase_client=None):
    """
    Performs inference for Delay Prediction.
    input_data: { 'scheduled_duration': 120, 'department': 'Track Management', 'station': 'NEW DELHI' }
    """
    metadata = get_model_metadata("delay")
    if metadata.get("status") != "trained":
        return {
            "status": "unavailable",
            "message": "Delay Prediction unavailable — insufficient historical labelled data.",
            "model_version": metadata.get("model_version", "v1.0.0-pending")
        }

    preprocessor = load_pipeline_artifact("delay_preprocessor")
    model = load_pipeline_artifact("delay_model")

    if not preprocessor or not model:
        return {
            "status": "unavailable",
            "message": "Delay Prediction unavailable — insufficient historical labelled data.",
            "model_version": "v1.0.0-pending"
        }

    df_in = pd.DataFrame([{
        "scheduled_duration": float(input_data.get("scheduled_duration", 120)),
        "department": str(input_data.get("department", "Track Management")),
        "station": str(input_data.get("station", "NEW DELHI"))
    }])

    X_trans = preprocessor.transform(df_in)
    pred_val = float(model.predict(X_trans)[0])
    pred_val = max(0.0, round(pred_val, 1))

    res = {
        "status": "success",
        "predicted_delay_mins": pred_val,
        "model_version": metadata.get("model_version", "v1.0.0"),
        "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
        "input": input_data
    }

    # Store in Supabase ml_predictions table if client provided
    if supabase_client:
        try:
            supabase_client.table("ml_predictions").insert([{
                "prediction_id": f"PRED-DEL-{int(datetime.now().timestamp())}",
                "model_type": "Delay Prediction",
                "model_version": metadata.get("model_version", "v1.0.0"),
                "station": input_data.get("station", "NEW DELHI"),
                "department": input_data.get("department", "Track Management"),
                "input_reference": input_data,
                "predicted_value": f"{pred_val} mins",
                "predicted_numeric": pred_val
            }]).execute()
        except Exception as e:
            print(f"Warning storing prediction in Supabase: {e}")

    return res


def predict_risk(input_data, supabase_client=None):
    metadata = get_model_metadata("risk")
    if metadata.get("status") != "trained":
        return {
            "status": "unavailable",
            "message": "Risk Prediction unavailable — insufficient historical labelled data.",
            "model_version": metadata.get("model_version", "v1.0.0-pending")
        }

    preprocessor = load_pipeline_artifact("risk_preprocessor")
    model = load_pipeline_artifact("risk_model")

    if not preprocessor or not model:
        return {
            "status": "unavailable",
            "message": "Risk Prediction unavailable — insufficient historical labelled data.",
            "model_version": "v1.0.0-pending"
        }

    df_in = pd.DataFrame([{
        "scheduled_duration": float(input_data.get("scheduled_duration", 120)),
        "department": str(input_data.get("department", "Track Management")),
        "station": str(input_data.get("station", "NEW DELHI"))
    }])

    X_trans = preprocessor.transform(df_in)
    pred_cat = str(model.predict(X_trans)[0])

    res = {
        "status": "success",
        "predicted_risk_category": pred_cat,
        "model_version": metadata.get("model_version", "v1.0.0"),
        "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
        "input": input_data
    }

    if supabase_client:
        try:
            supabase_client.table("ml_predictions").insert([{
                "prediction_id": f"PRED-RSK-{int(datetime.now().timestamp())}",
                "model_type": "Risk Prediction",
                "model_version": metadata.get("model_version", "v1.0.0"),
                "station": input_data.get("station", "NEW DELHI"),
                "department": input_data.get("department", "Track Management"),
                "input_reference": input_data,
                "predicted_value": pred_cat,
                "risk_category": pred_cat
            }]).execute()
        except Exception as e:
            print(f"Warning storing prediction in Supabase: {e}")

    return res


def predict_congestion(input_data, supabase_client=None):
    metadata = get_model_metadata("congestion")
    if metadata.get("status") != "trained":
        return {
            "status": "unavailable",
            "message": "Congestion Prediction unavailable — insufficient historical labelled data.",
            "model_version": metadata.get("model_version", "v1.0.0-pending")
        }

    preprocessor = load_pipeline_artifact("congestion_preprocessor")
    model = load_pipeline_artifact("congestion_model")

    if not preprocessor or not model:
        return {
            "status": "unavailable",
            "message": "Congestion Prediction unavailable — insufficient historical labelled data.",
            "model_version": "v1.0.0-pending"
        }

    df_in = pd.DataFrame([{
        "active_blocks": float(input_data.get("active_blocks", 1)),
        "department": str(input_data.get("department", "Track Management")),
        "station": str(input_data.get("station", "NEW DELHI"))
    }])

    X_trans = preprocessor.transform(df_in)
    pred_level = str(model.predict(X_trans)[0])

    res = {
        "status": "success",
        "predicted_congestion_level": pred_level,
        "model_version": metadata.get("model_version", "v1.0.0"),
        "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
        "input": input_data
    }

    if supabase_client:
        try:
            supabase_client.table("ml_predictions").insert([{
                "prediction_id": f"PRED-CNG-{int(datetime.now().timestamp())}",
                "model_type": "Congestion Prediction",
                "model_version": metadata.get("model_version", "v1.0.0"),
                "station": input_data.get("station", "NEW DELHI"),
                "department": input_data.get("department", "Track Management"),
                "input_reference": input_data,
                "predicted_value": pred_level
            }]).execute()
        except Exception as e:
            print(f"Warning storing prediction in Supabase: {e}")

    return res
