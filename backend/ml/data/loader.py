import os
import pandas as pd
import numpy as np

def load_historical_operational_data(supabase_client=None):
    """
    Loads historical operational records from Supabase or dataset files.
    Extracts features and target labels for Delay, Risk, and Congestion prediction.
    Returns:
        dict: DataFrames for delay, risk, and congestion datasets.
    """
    delay_data = []
    risk_data = []
    congestion_data = []

    # Attempt to fetch from Supabase historical_outcomes or historical_operations
    if supabase_client:
        try:
            res_outcomes = supabase_client.table("historical_outcomes").select("*").execute()
            if res_outcomes.data:
                for row in res_outcomes.data:
                    if row.get("delay_mins") is not None:
                        delay_data.append(row)
                    if row.get("completion_status") or row.get("observed_conflicts") is not None:
                        risk_data.append(row)
            
            res_ops = supabase_client.table("historical_operations").select("*").execute()
            if res_ops.data:
                for row in res_ops.data:
                    if row.get("delay_mins") is not None:
                        delay_data.append(row)
                    if row.get("congestion_level") is not None:
                        congestion_data.append(row)
        except Exception as e:
            print(f"Warning: Could not fetch ML dataset from Supabase: {e}")

    df_delay = pd.DataFrame(delay_data)
    df_risk = pd.DataFrame(risk_data)
    df_congestion = pd.DataFrame(congestion_data)

    return {
        "delay": df_delay,
        "risk": df_risk,
        "congestion": df_congestion
    }
