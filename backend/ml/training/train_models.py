import os
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, accuracy_score, f1_score

from backend.ml.data.loader import load_historical_operational_data
from backend.ml.preprocessing.pipeline import build_preprocessing_pipeline, save_pipeline_artifact, MODELS_DIR

def train_delay_prediction_model(supabase_client=None):
    """
    Trains a real scikit-learn Delay Prediction regression model if valid labelled historical data exists.
    Features: scheduled_duration, station, department, workload, time_of_day.
    Target: delay_mins (numeric).
    Returns model metadata dict or status 'insufficient_data'.
    """
    data_dict = load_historical_operational_data(supabase_client)
    df = data_dict["delay"]

    if df.empty or len(df) < 10 or "delay_mins" not in df.columns or df["delay_mins"].dropna().count() < 10:
        metadata = {
            "model_name": "Delay_Prediction_Model",
            "model_type": "Delay Prediction",
            "model_version": "v1.0.0-pending",
            "target": "delay_mins",
            "status": "insufficient_data",
            "message": "Delay Prediction unavailable — insufficient historical labelled data.",
            "record_count": len(df) if not df.empty else 0
        }
        with open(os.path.join(MODELS_DIR, "delay_model_metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)
        return metadata

    # Clean & Prepare Features
    df = df.dropna(subset=["delay_mins"]).copy()
    df["scheduled_duration"] = df.get("scheduled_duration_mins", df.get("duration_mins", 120))
    df["department"] = df.get("department", "Track Management")
    df["station"] = df.get("station_name", "NEW DELHI")

    numeric_features = ["scheduled_duration"]
    categorical_features = ["department", "station"]

    X = df[numeric_features + categorical_features]
    y = df["delay_mins"].astype(float)

    # Train / Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = build_preprocessing_pipeline(numeric_features, categorical_features)
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X_train_trans, y_train)

    y_pred = model.predict(X_test_trans)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))

    # Save Pipeline & Model
    save_pipeline_artifact(preprocessor, "delay_preprocessor")
    save_pipeline_artifact(model, "delay_model")

    metadata = {
        "model_name": "Delay_Prediction_Model",
        "model_type": "Delay Prediction",
        "model_version": "v1.0.0",
        "target": "delay_mins",
        "features": numeric_features + categorical_features,
        "status": "trained",
        "record_count": len(df),
        "evaluation_metrics": {
            "mae_mins": round(mae, 2),
            "rmse_mins": round(rmse, 2)
        },
        "trained_at": pd.Timestamp.now().isoformat()
    }

    with open(os.path.join(MODELS_DIR, "delay_model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    return metadata


def train_risk_prediction_model(supabase_client=None):
    """
    Trains a real scikit-learn Risk Prediction classification model if valid outcome labels exist.
    Target: risk_category (High/Medium/Low).
    """
    data_dict = load_historical_operational_data(supabase_client)
    df = data_dict["risk"]

    if df.empty or len(df) < 10 or "completion_status" not in df.columns:
        metadata = {
            "model_name": "Risk_Prediction_Model",
            "model_type": "Risk Prediction",
            "model_version": "v1.0.0-pending",
            "target": "risk_category",
            "status": "insufficient_data",
            "message": "Risk Prediction unavailable — insufficient historical labelled data.",
            "record_count": len(df) if not df.empty else 0
        }
        with open(os.path.join(MODELS_DIR, "risk_model_metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)
        return metadata

    # If dataset has valid rows
    df["scheduled_duration"] = df.get("duration_mins", 120)
    df["department"] = df.get("department", "Track Management")
    df["station"] = df.get("station_name", "NEW DELHI")
    df["risk_label"] = df["completion_status"].apply(lambda s: "High" if str(s).lower() in ["aborted", "delayed"] else "Low")

    numeric_features = ["scheduled_duration"]
    categorical_features = ["department", "station"]

    X = df[numeric_features + categorical_features]
    y = df["risk_label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    preprocessor = build_preprocessing_pipeline(numeric_features, categorical_features)
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X_train_trans, y_train)

    y_pred = model.predict(X_test_trans)
    acc = float(accuracy_score(y_test, y_pred))

    save_pipeline_artifact(preprocessor, "risk_preprocessor")
    save_pipeline_artifact(model, "risk_model")

    metadata = {
        "model_name": "Risk_Prediction_Model",
        "model_type": "Risk Prediction",
        "model_version": "v1.0.0",
        "target": "risk_category",
        "features": numeric_features + categorical_features,
        "status": "trained",
        "record_count": len(df),
        "evaluation_metrics": {
            "accuracy": round(acc * 100, 2)
        },
        "trained_at": pd.Timestamp.now().isoformat()
    }

    with open(os.path.join(MODELS_DIR, "risk_model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    return metadata


def train_congestion_prediction_model(supabase_client=None):
    """
    Trains a real scikit-learn Congestion Prediction model if valid target labels exist.
    """
    data_dict = load_historical_operational_data(supabase_client)
    df = data_dict["congestion"]

    if df.empty or len(df) < 10 or "congestion_level" not in df.columns:
        metadata = {
            "model_name": "Congestion_Prediction_Model",
            "model_type": "Congestion Prediction",
            "model_version": "v1.0.0-pending",
            "target": "congestion_level",
            "status": "insufficient_data",
            "message": "Congestion Prediction unavailable — insufficient historical labelled data.",
            "record_count": len(df) if not df.empty else 0
        }
        with open(os.path.join(MODELS_DIR, "congestion_model_metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)
        return metadata

    df["active_blocks"] = df.get("active_blocks", 1)
    df["department"] = df.get("department", "Track Management")
    df["station"] = df.get("station_name", "NEW DELHI")

    numeric_features = ["active_blocks"]
    categorical_features = ["department", "station"]

    X = df[numeric_features + categorical_features]
    y = df["congestion_level"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    preprocessor = build_preprocessing_pipeline(numeric_features, categorical_features)
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(X_train_trans, y_train)

    y_pred = model.predict(X_test_trans)
    acc = float(accuracy_score(y_test, y_pred))

    save_pipeline_artifact(preprocessor, "congestion_preprocessor")
    save_pipeline_artifact(model, "congestion_model")

    metadata = {
        "model_name": "Congestion_Prediction_Model",
        "model_type": "Congestion Prediction",
        "model_version": "v1.0.0",
        "target": "congestion_level",
        "features": numeric_features + categorical_features,
        "status": "trained",
        "record_count": len(df),
        "evaluation_metrics": {
            "accuracy": round(acc * 100, 2)
        },
        "trained_at": pd.Timestamp.now().isoformat()
    }

    with open(os.path.join(MODELS_DIR, "congestion_model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    return metadata
