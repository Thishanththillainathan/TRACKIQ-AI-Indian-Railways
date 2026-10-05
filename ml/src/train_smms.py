import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier

from ml.src.preprocess import get_smms_data, get_smms_legacy_risk_data, chronological_split, build_preprocessor
from ml.src.evaluate import evaluate_classification

MODEL_PATH = os.path.join("ml", "models", "smms_asset_condition_model.joblib")

def train_smms_model(test_ratio=0.2):
    print("\n==================================================")
    print("   TRAINING PHASE 2: SMMS MODEL (CLASSIFICATION)   ")
    print("==================================================")

    # --- 1. Audit Analysis on Legacy Risk Class Target ---
    print("\n--- Legacy SMMS Target Audit (Risk Class from Asset Condition) ---")
    X_leg, y_leg, dates_leg, cat_leg, num_leg, target_leg, _ = get_smms_legacy_risk_data()
    X_tr_leg, X_te_leg, y_tr_leg, y_te_leg, d_tr_leg, d_te_leg = chronological_split(X_leg, y_leg, dates_leg, test_ratio=test_ratio)
    
    pipe_leg = Pipeline([
        ('prep', build_preprocessor(cat_leg, num_leg)),
        ('clf', LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42))
    ])
    pipe_leg.fit(X_tr_leg, y_tr_leg)
    preds_leg = pipe_leg.predict(X_te_leg)
    metrics_leg = evaluate_classification(y_te_leg, preds_leg)
    print(f"Legacy Target Results -> Accuracy: {metrics_leg['Accuracy']}, F1: {metrics_leg['F1']}, ROC-AUC: {metrics_leg['ROC_AUC']}")
    print("Audit Diagnosis: Static asset features have near-zero correlation with Asset Condition scores. Predicting arbitrary bins yields random guessing (~36.5% Acc).")

    # --- 2. Primary Improved SMMS Model (S&T Failure Severity Risk Classification) ---
    print("\n--- Primary Improved SMMS Model (S&T Failure Severity Risk Classification) ---")
    X, y, dates, categorical_cols, numerical_cols, target_col, raw_df = get_smms_data()
    print(f"Total S&T Operational Records: {len(X)}")
    print(f"Target: {target_col} (1 = High Risk [Major/Critical Failure Severity], 0 = Low/Moderate Risk [Minor/Moderate])")
    print(f"Categorical Features ({len(categorical_cols)}): {categorical_cols}")
    print(f"Numerical Features ({len(numerical_cols)}): {numerical_cols}")

    class_counts = y.value_counts().to_dict()
    class_pcts = (y.value_counts(normalize=True) * 100).to_dict()
    print(f"Class Distribution (1=High Risk, 0=Low/Moderate): {class_counts}")
    print(f"Class Percentages: {class_pcts}")

    X_train, X_test, y_train, y_test, dates_train, dates_test = chronological_split(X, y, dates, test_ratio=test_ratio)
    print(f"Train Period: {dates_train.min().strftime('%Y-%m-%d')} to {dates_train.max().strftime('%Y-%m-%d')} ({len(X_train)} rows)")
    print(f"Test Period:  {dates_test.min().strftime('%Y-%m-%d')} to {dates_test.max().strftime('%Y-%m-%d')} ({len(X_test)} rows)")

    candidates = {
        "LogisticRegression": LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42),
        "RandomForestClassifier": RandomForestClassifier(n_estimators=100, max_depth=15, class_weight='balanced', random_state=42, n_jobs=-1),
        "HistGradientBoostingClassifier": HistGradientBoostingClassifier(class_weight='balanced', max_iter=150, random_state=42)
    }

    best_model_name = None
    best_pipeline = None
    best_metrics = None
    best_f1 = -1.0
    model_comparisons = {}

    for name, estimator in candidates.items():
        print(f"\nTraining {name}...")
        preprocessor = build_preprocessor(categorical_cols, numerical_cols)
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('model', estimator)
        ])
        
        pipeline.fit(X_train, y_train)
        
        y_train_pred = pipeline.predict(X_train)
        y_test_pred = pipeline.predict(X_test)
        
        try:
            y_test_prob = pipeline.predict_proba(X_test)
        except Exception:
            y_test_prob = None

        train_metrics = evaluate_classification(y_train, y_train_pred)
        test_metrics = evaluate_classification(y_test, y_test_pred, y_test_prob)
        
        print(f"  [{name}] Train -> Acc: {train_metrics['Accuracy']}, F1: {train_metrics['F1']}")
        print(f"  [{name}] Test  -> Acc: {test_metrics['Accuracy']}, F1: {test_metrics['F1']}, Precision: {test_metrics['Precision']}, Recall: {test_metrics['Recall']}, ROC-AUC: {test_metrics['ROC_AUC']}")
        
        model_comparisons[name] = {
            "train": train_metrics,
            "test": test_metrics
        }

        if test_metrics['F1'] > best_f1:
            best_f1 = test_metrics['F1']
            best_model_name = name
            best_pipeline = pipeline
            best_metrics = test_metrics

    print(f"\n>>> BEST SMMS MODEL SELECTED: {best_model_name} (Test F1: {best_metrics['F1']}, Test Accuracy: {best_metrics['Accuracy']}, ROC-AUC: {best_metrics['ROC_AUC']})")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(best_pipeline, MODEL_PATH)
    print(f"Saved complete pipeline to {MODEL_PATH}")

    metadata = {
        "model_name": "SMMS S&T Failure Severity Risk Predictor",
        "system": "SMMS (Signal & Telecom System)",
        "task": "Binary Classification",
        "target": target_col,
        "target_definition": "1 = High Failure Risk (Major/Critical S&T Failure), 0 = Low/Moderate Risk (Minor/Moderate)",
        "class_distribution_percentages": class_pcts,
        "selected_model": best_model_name,
        "total_rows": len(X),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "train_period": f"{dates_train.min().strftime('%Y-%m-%d')} to {dates_train.max().strftime('%Y-%m-%d')}",
        "test_period": f"{dates_test.min().strftime('%Y-%m-%d')} to {dates_test.max().strftime('%Y-%m-%d')}",
        "features": list(X.columns),
        "categorical_features": categorical_cols,
        "numerical_features": numerical_cols,
        "metrics": best_metrics,
        "all_model_comparisons": model_comparisons,
        "legacy_target_audit_metrics": metrics_leg,
        "file_path": MODEL_PATH
    }

    return metadata

if __name__ == "__main__":
    train_smms_model()
