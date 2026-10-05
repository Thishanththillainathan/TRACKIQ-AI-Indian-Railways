import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, PoissonRegressor
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor

from ml.src.preprocess import get_trd_data, chronological_split, build_preprocessor
from ml.src.evaluate import evaluate_regression

MODEL_PATH = os.path.join("ml", "models", "trd_affected_trains_model.joblib")

def train_trd_model(test_ratio=0.2):
    print("\n==================================================")
    print("   TRAINING PHASE 3: TRD MODEL (COUNT REGRESSION) ")
    print("==================================================")

    X, y, dates, categorical_cols, numerical_cols, target_col, raw_df = get_trd_data()
    print(f"Total TRD Records: {len(X)}")
    print(f"Target: {target_col} (Skewness: {y.skew():.2f}, Mean: {y.mean():.2f}, Median: {y.median():.2f})")
    print(f"Categorical Features ({len(categorical_cols)}): {categorical_cols}")
    print(f"Numerical Features ({len(numerical_cols)}): {numerical_cols}")

    X_train, X_test, y_train, y_test, dates_train, dates_test = chronological_split(X, y, dates, test_ratio=test_ratio)
    raw_test = raw_df.iloc[len(X_train):].copy()

    print(f"Train Period: {dates_train.min().strftime('%Y-%m-%d')} to {dates_train.max().strftime('%Y-%m-%d')} ({len(X_train)} rows)")
    print(f"Test Period:  {dates_test.min().strftime('%Y-%m-%d')} to {dates_test.max().strftime('%Y-%m-%d')} ({len(X_test)} rows)")

    candidates = {
        "LinearRegression": LinearRegression(),
        "PoissonRegressor": PoissonRegressor(max_iter=1000),
        "RandomForestRegressor": RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1),
        "HistGradientBoostingRegressor": HistGradientBoostingRegressor(max_iter=200, learning_rate=0.05, max_depth=12, random_state=42)
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

    print(f"\n>>> BEST TRD MODEL SELECTED: {best_model_name} (Test RMSE: {best_metrics['RMSE']}, Test R2: {best_metrics['R2']})")

    # Detailed Error Breakdown for Best Model
    y_best_pred = best_pipeline.predict(X_test)
    raw_test['Pred_Affected'] = y_best_pred
    raw_test['Abs_Error'] = np.abs(raw_test['Affected Trains'] - raw_test['Pred_Affected'])
    
    traffic_errors = raw_test.groupby('Traffic Density')['Abs_Error'].agg(['mean', 'median', 'count']).to_dict(orient='index')
    block_errors = raw_test.groupby('Block Type')['Abs_Error'].agg(['mean', 'median', 'count']).to_dict(orient='index')

    print("\n--- TRD Error Breakdown by Traffic Density ---")
    for density, stats in traffic_errors.items():
        print(f"  {density}: MAE={stats['mean']:.4f} trains, Median={stats['median']:.4f} trains, Count={stats['count']}")

    print("\n--- TRD Error Breakdown by Block Type ---")
    for btype, stats in block_errors.items():
        print(f"  {btype}: MAE={stats['mean']:.4f} trains, Median={stats['median']:.4f} trains, Count={stats['count']}")

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(best_pipeline, MODEL_PATH)
    print(f"Saved complete pipeline to {MODEL_PATH}")

    metadata = {
        "model_name": "TRD Affected Trains Disruption Predictor",
        "system": "TRD (Traction Distribution System)",
        "task": "Count Regression",
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
            "by_traffic_density": traffic_errors,
            "by_block_type": block_errors
        },
        "file_path": MODEL_PATH
    }

    return metadata

if __name__ == "__main__":
    train_trd_model()
