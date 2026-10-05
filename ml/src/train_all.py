import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

from ml.src.train_tms import train_tms_model
from ml.src.train_smms import train_smms_model
from ml.src.train_trd import train_trd_model
from ml.src.preprocess import get_tms_data, get_smms_data, get_trd_data, chronological_split

METADATA_PATH = os.path.join("ml", "models", "model_metadata.json")

def verify_saved_models(tms_meta, smms_meta, trd_meta):
    print("\n==================================================")
    print("      PHASE 10: PREDICTION TEST & VERIFICATION     ")
    print("==================================================")
    
    # 1. TMS Model Verification (10 Real Test Records)
    print("\n--- 1. Verifying TMS Model (10 Real Test Records) ---")
    tms_model = joblib.load(tms_meta["file_path"])
    X_tms, y_tms, dates_tms, _, _, _, _ = get_tms_data()
    _, X_test_tms, _, y_test_tms, _, _ = chronological_split(X_tms, y_tms, dates_tms)
    
    tms_sample = X_test_tms.head(10)
    tms_preds = tms_model.predict(tms_sample)
    tms_actuals = y_test_tms.head(10).values
    
    print("TMS Sample Inputs (10 rows):")
    for idx, (_, row) in enumerate(tms_sample.iterrows()):
        print(f"  Record {idx+1}: Station={row['Station']}, WorkType={row['Work Type']}, PlannedDur={row['Planned Duration']}h, Traffic={row['Traffic Density']} -> Actual={tms_actuals[idx]}h, Pred={tms_preds[idx]:.2f}h (Err={tms_preds[idx]-tms_actuals[idx]:.2f}h)")
    
    assert not np.isnan(tms_preds).any(), "ERROR: TMS Model returned NaN predictions!"
    print("[SUCCESS] TMS Model pipeline reloaded and verified on 10 real test records!")

    # 2. SMMS Model Verification (10 Real Test Records)
    print("\n--- 2. Verifying SMMS Model (10 Real Test Records) ---")
    smms_model = joblib.load(smms_meta["file_path"])
    X_smms, y_smms, dates_smms, _, _, _, _ = get_smms_data()
    _, X_test_smms, _, y_test_smms, _, _ = chronological_split(X_smms, y_smms, dates_smms)
    
    smms_sample = X_test_smms.head(10)
    smms_preds = smms_model.predict(smms_sample)
    smms_actuals = y_test_smms.head(10).values
    try:
        smms_probs = smms_model.predict_proba(smms_sample)[:, 1]
    except Exception:
        smms_probs = [None] * 10
        
    print("SMMS Sample Inputs (10 rows):")
    for idx, (_, row) in enumerate(smms_sample.iterrows()):
        prob_str = f"{smms_probs[idx]*100:.1f}%" if smms_probs[idx] is not None else "N/A"
        print(f"  Record {idx+1}: Station={row['Station']}, WorkType={row['Work Type']}, Priority={row['Priority']} -> RealRisk={smms_actuals[idx]}, PredRisk={smms_preds[idx]} (Prob={prob_str})")
        
    assert not np.isnan(smms_preds).any(), "ERROR: SMMS Model returned NaN predictions!"
    print("[SUCCESS] SMMS Model pipeline reloaded and verified on 10 real test records!")

    # 3. TRD Model Verification (10 Real Test Records)
    print("\n--- 3. Verifying TRD Model (10 Real Test Records) ---")
    trd_model = joblib.load(trd_meta["file_path"])
    X_trd, y_trd, dates_trd, _, _, _, _ = get_trd_data()
    _, X_test_trd, _, y_test_trd, _, _ = chronological_split(X_trd, y_trd, dates_trd)
    
    trd_sample = X_test_trd.head(10)
    trd_preds = trd_model.predict(trd_sample)
    trd_actuals = y_test_trd.head(10).values
    
    print("TRD Sample Inputs (10 rows):")
    for idx, (_, row) in enumerate(trd_sample.iterrows()):
        print(f"  Record {idx+1}: BlockType={row['Block Type']}, PlannedDur={row['Planned Duration']}h, Freq={row['Train Frequency']} -> Actual={trd_actuals[idx]} trains, Pred={trd_preds[idx]:.2f} trains")
        
    assert not np.isnan(trd_preds).any(), "ERROR: TRD Model returned NaN predictions!"
    print("[SUCCESS] TRD Model pipeline reloaded and verified on 10 real test records!")

    print("\nALL 3 SAVED MODEL PIPELINES SUCCESSFULLY VERIFIED ON REAL UNSEEN TEST DATA!")


def main():
    print("Starting Scientific Railway ML Improvement & Training Pipeline...\n")
    
    start_time = datetime.now()
    
    tms_meta = train_tms_model()
    smms_meta = train_smms_model()
    trd_meta = train_trd_model()
    
    full_metadata = {
        "timestamp": start_time.isoformat(),
        "version": "2.0-scientific-improvement",
        "tms_model": tms_meta,
        "smms_model": smms_meta,
        "trd_model": trd_meta
    }

    os.makedirs(os.path.dirname(METADATA_PATH), exist_ok=True)
    with open(METADATA_PATH, "w") as f:
        json.dump(full_metadata, f, indent=2)
    print(f"\nSaved metadata summary to {METADATA_PATH}")

    verify_saved_models(tms_meta, smms_meta, trd_meta)
    
    print(f"\nCompleted all ML training, evaluation, and verification in {datetime.now() - start_time}")

if __name__ == "__main__":
    main()
