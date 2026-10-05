import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor

from ml.src.preprocess import get_tms_data, chronological_split, build_preprocessor
from ml.src.evaluate import evaluate_regression

MODEL_PATH = os.path.join("ml", "models", "tms_actual_duration_model.joblib")

def train_tms_model(test_ratio=0.2):
    print("\n==================================================")
    print("      TRAINING PHASE 4: TMS MODEL (REGRESSION)    ")
    print("==================================================")

    X, y, dates, categorical_cols, numerical_cols, target_col, raw_df = get_tms_data()
    print(f"Total TMS Records: {len(X)}")
    print(f"Target: {target_col}")
    print(f"Categorical Features ({len(categorical_cols)}): {categorical_cols}")
    print(f"Numerical Features ({len(numerical_cols)}): {numerical_cols}")

    X_train, X_test, y_train, y_test, dates_train, dates_test = chronological_split(X, y, dates, test_ratio=test_ratio)
    raw_test = raw_df.iloc[len(X_train):].copy()

    print(f"Train Period: {dates_train.min().strftime('%Y-%m-%d')} to {dates_train.max().strftime('%Y-%m-%d')} ({len(X_train)} rows)")
    print(f"Test Period:  {dates_test.min().strftime('%Y-%m-%d')} to {dates_test.max().strftime('%Y-%m-%d')} ({len(X_test)} rows)")

    candidates = {
        "LinearRegression": LinearRegression(),
        "RandomForestRegressor": RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
        "HistGradientBoostingRegressor": HistGradientBoostingRegressor(max_iter=150, random_state=42)
    }

    best_model_name = None
    best_pipeline = None
    best_metrics = None
    best_rmse = float("inf")
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
        
        train_metrics = evaluate_regression(y_train, y_train_pred)
        test_metrics = evaluate_regression(y_test, y_test_pred)
        
        print(f"  [{name}] Train -> MAE: {train_metrics['MAE']}, RMSE: {train_metrics['RMSE']}, R2: {train_metrics['R2']}")
        print(f"  [{name}] Test  -> MAE: {test_metrics['MAE']}, RMSE: {test_metrics['RMSE']}, R2: {test_metrics['R2']}")
        
        model_comparisons[name] = {
            "train": train_metrics,
            "test": test_metrics
        }

        if test_metrics['RMSE'] < best_rmse:
            best_rmse = test_metrics['RMSE']
            best_model_name = name
            best_pipeline = pipeline
            best_metrics = test_metrics

    print(f"\n>>> BEST TMS MODEL SELECTED: {best_model_name} (Test RMSE: {best_metrics['RMSE']}, Test R2: {best_metrics['R2']})")

    # Detailed Error Breakdown for Best Model
    y_best_pred = best_pipeline.predict(X_test)
    raw_test['Pred_Actual'] = y_best_pred
    raw_test['Abs_Error'] = np.abs(raw_test['Actual Duration'] - raw_test['Pred_Actual'])
    
    def dur_cat(dur):
        if dur < 4:
            return 'Low (<4h)'
        elif dur <= 10:
            return 'Medium (4-10h)'
        else:
            return 'High (>10h)'
            
    raw_test['Duration_Bracket'] = raw_test['Planned Duration'].apply(dur_cat)
    bracket_errors = raw_test.groupby('Duration_Bracket')['Abs_Error'].agg(['mean', 'median', 'count']).to_dict(orient='index')
    work_errors = raw_test.groupby('Work Type')['Abs_Error'].agg(['mean', 'median', 'count']).to_dict(orient='index')
    traffic_errors = raw_test.groupby('Traffic Density')['Abs_Error'].agg(['mean', 'median', 'count']).to_dict(orient='index')

    print("\n--- TMS Error Breakdown by Planned Duration Bracket ---")
    for b, stats in bracket_errors.items():
        print(f"  {b}: MAE={stats['mean']:.4f}h, Median={stats['median']:.4f}h, Count={stats['count']}")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(best_pipeline, MODEL_PATH)
    print(f"Saved complete pipeline to {MODEL_PATH}")

    metadata = {
        "model_name": "TMS Actual Duration Predictor",
        "system": "TMS (Track Management System)",
        "task": "Regression",
        "target": target_col,
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
        "error_breakdowns": {
            "by_duration_bracket": bracket_errors,
            "by_work_type": work_errors,
            "by_traffic_density": traffic_errors
        },
        "file_path": MODEL_PATH
    }

    return metadata

if __name__ == "__main__":
    train_tms_model()
