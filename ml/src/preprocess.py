import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

EXCEL_PATH = os.path.join("ml", "data", "3dept.xlsx")
CACHE_DIR = os.path.join("ml", "data", ".cache")

def load_data(excel_path=EXCEL_PATH, use_cache=True):
    """
    Loads Maintenance, Engineering, and Operations sheets.
    Uses cached pickle files for rapid loading if available.
    """
    os.makedirs(CACHE_DIR, exist_ok=True)
    maint_cache = os.path.join(CACHE_DIR, "maint.pkl")
    eng_cache = os.path.join(CACHE_DIR, "eng.pkl")
    ops_cache = os.path.join(CACHE_DIR, "ops.pkl")

    if use_cache and os.path.exists(maint_cache) and os.path.exists(eng_cache) and os.path.exists(ops_cache):
        maint_df = pd.read_pickle(maint_cache)
        eng_df = pd.read_pickle(eng_cache)
        ops_df = pd.read_pickle(ops_cache)
    else:
        maint_df = pd.read_excel(excel_path, sheet_name="Maintenance")
        eng_df = pd.read_excel(excel_path, sheet_name="Engineering")
        ops_df = pd.read_excel(excel_path, sheet_name="Operations")
        
        maint_df.to_pickle(maint_cache)
        eng_df.to_pickle(eng_cache)
        ops_df.to_pickle(ops_cache)

    return maint_df, eng_df, ops_df


def build_preprocessor(categorical_cols, numerical_cols, max_categories=100):
    """
    Creates a scikit-learn ColumnTransformer with SimpleImputer,
    StandardScaler for numerical features, and OneHotEncoder for categorical features.
    """
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(max_categories=max_categories, handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, numerical_cols),
            ('cat', cat_pipeline, categorical_cols)
        ],
        remainder='drop'
    )
    return preprocessor


def get_tms_data():
    """
    TMS Data Preparation:
    Subset: Operations sheet where Block Type == "Engineering Block"
    Target: Actual Duration (Operations)
    Primary Task: Regression
    Candidate Features: Work Type, Traffic Density, Train Frequency, Scheduled Trains,
                        Previous Delay, Priority, Zone, Division, Planned Duration, Station.
    Time Sorting Column: Date
    """
    maint_df, eng_df, ops_df = load_data()
    
    tms_df = ops_df[ops_df['Block Type'] == 'Engineering Block'].copy()
    
    target_col = 'Actual Duration'
    time_col = 'Date'
    
    tms_df[time_col] = pd.to_datetime(tms_df[time_col], errors='coerce')
    tms_df = tms_df.sort_values(by=time_col).reset_index(drop=True)
    
    categorical_cols = ['Station', 'Work Type', 'Traffic Density', 'Priority', 'Zone', 'Division']
    numerical_cols = ['Planned Duration', 'Train Frequency', 'Scheduled Trains', 'Previous Delay']
    
    feature_cols = categorical_cols + numerical_cols
    assert target_col not in feature_cols, f"LEAKAGE ERROR: Target '{target_col}' found in feature columns!"
    assert 'Affected Trains' not in feature_cols, "LEAKAGE ERROR: Post-execution feature found!"

    X = tms_df[feature_cols].copy()
    y = tms_df[target_col].copy()
    dates = tms_df[time_col].copy()
    raw_df = tms_df.copy()

    return X, y, dates, categorical_cols, numerical_cols, target_col, raw_df


def get_smms_data():
    """
    SMMS Data Preparation:
    Primary Target: S&T Failure Severity Risk Classification (Major/Critical High Risk vs Minor/Moderate)
    Subset: Operations sheet where Block Type == "S&T Block"
    Candidate Features: Station, Work Type, Traffic Density, Priority, Zone, Division,
                        Planned Duration, Train Frequency, Scheduled Trains, Previous Delay.
    Time Sorting Column: Date
    """
    maint_df, eng_df, ops_df = load_data()
    
    st_ops = ops_df[ops_df['Block Type'] == 'S&T Block'].copy()
    st_ops = st_ops.dropna(subset=['Failure Severity']).copy()
    
    # Target: High Failure Risk Binary (1 if Major/Critical, 0 if Minor/Moderate)
    st_ops['High_Failure_Risk'] = st_ops['Failure Severity'].isin(['Major', 'Critical']).astype(int)
    
    target_col = 'High_Failure_Risk'
    time_col = 'Date'
    
    st_ops[time_col] = pd.to_datetime(st_ops[time_col], errors='coerce')
    st_ops = st_ops.sort_values(by=time_col).reset_index(drop=True)
    
    categorical_cols = ['Station', 'Work Type', 'Traffic Density', 'Priority', 'Zone', 'Division']
    numerical_cols = ['Planned Duration', 'Train Frequency', 'Scheduled Trains', 'Previous Delay']
    
    feature_cols = categorical_cols + numerical_cols
    assert target_col not in feature_cols, f"LEAKAGE ERROR: Target '{target_col}' found in features!"
    assert 'Actual Duration' not in feature_cols, "LEAKAGE ERROR: Post-execution feature found!"
    assert 'Affected Trains' not in feature_cols, "LEAKAGE ERROR: Post-execution feature found!"

    X = st_ops[feature_cols].copy()
    y = st_ops[target_col].copy()
    dates = st_ops[time_col].copy()
    raw_df = st_ops.copy()

    return X, y, dates, categorical_cols, numerical_cols, target_col, raw_df


def get_smms_legacy_risk_data():
    """
    SMMS Legacy Risk Class Data Preparation (from Maintenance sheet Asset Condition).
    Provided for audit and comparative analysis.
    """
    maint_df, eng_df, ops_df = load_data()
    smms_df = maint_df.copy()
    
    def map_risk_class(cond):
        if cond < 65:
            return 0  # High Risk
        elif cond < 85:
            return 1  # Moderate Risk
        else:
            return 2  # Low Risk / Healthy

    smms_df['Risk_Class'] = smms_df['Asset Condition'].apply(map_risk_class)
    
    target_col = 'Risk_Class'
    time_col = 'Maintenance Date'
    
    smms_df[time_col] = pd.to_datetime(smms_df[time_col], errors='coerce')
    smms_df = smms_df.sort_values(by=time_col).reset_index(drop=True)
    
    categorical_cols = ['Asset Type', 'Station', 'Maintenance Type', 'Problem Type', 'Zone', 'Division']
    numerical_cols = ['Asset Age', 'Usage Hours', 'Days Since Last Maintenance', 'Previous Failure Count']
    
    X = smms_df[categorical_cols + numerical_cols].copy()
    y = smms_df[target_col].copy()
    dates = smms_df[time_col].copy()

    return X, y, dates, categorical_cols, numerical_cols, target_col, smms_df


def get_trd_data():
    """
    TRD Data Preparation with Engineered Features:
    Subset: Operations sheet where Block Type in ["Traction (OHE) Block", "Traction Power Block"]
    Target: Affected Trains (Operations)
    Primary Task: Regression / Count Prediction
    Candidate Features: Block Type, Station, Work Type, Traffic Density, Priority, Zone, Division,
                        Planned Duration, Train Frequency, Scheduled Trains, Previous Delay,
                        Traffic_Exposed_Trains, Delay_Per_Train, High_Traffic_Flag.
    Time Sorting Column: Date
    """
    maint_df, eng_df, ops_df = load_data()
    
    trd_blocks = ['Traction (OHE) Block', 'Traction Power Block']
    trd_df = ops_df[ops_df['Block Type'].isin(trd_blocks)].copy()
    
    # Feature Engineering
    trd_df['Traffic_Exposed_Trains'] = trd_df['Planned Duration'] * trd_df['Train Frequency'] / 24.0
    trd_df['Delay_Per_Train'] = trd_df['Previous Delay'] / (trd_df['Train Frequency'] + 1.0)
    trd_df['High_Traffic_Flag'] = (trd_df['Traffic Density'] == 'Very High (>200 trains/day)').astype(int)

    target_col = 'Affected Trains'
    time_col = 'Date'
    
    trd_df[time_col] = pd.to_datetime(trd_df[time_col], errors='coerce')
    trd_df = trd_df.sort_values(by=time_col).reset_index(drop=True)
    
    categorical_cols = ['Block Type', 'Station', 'Work Type', 'Traffic Density', 'Priority', 'Zone', 'Division']
    numerical_cols = ['Planned Duration', 'Train Frequency', 'Scheduled Trains', 'Previous Delay',
                      'Traffic_Exposed_Trains', 'Delay_Per_Train', 'High_Traffic_Flag']
    
    feature_cols = categorical_cols + numerical_cols
    assert target_col not in feature_cols, f"LEAKAGE ERROR: Target '{target_col}' found in features!"
    assert 'Actual Duration' not in feature_cols, "LEAKAGE ERROR: Post-execution feature found!"

    X = trd_df[feature_cols].copy()
    y = trd_df[target_col].copy()
    dates = trd_df[time_col].copy()
    raw_df = trd_df.copy()

    return X, y, dates, categorical_cols, numerical_cols, target_col, raw_df


def chronological_split(X, y, dates, test_ratio=0.2):
    """
    Performs a strict chronological train/test split (80% train, 20% test).
    Assumes X, y, dates are already sorted in ascending order of dates.
    """
    n_samples = len(X)
    split_idx = int(n_samples * (1.0 - test_ratio))
    
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    dates_train, dates_test = dates.iloc[:split_idx], dates.iloc[split_idx:]
    
    return X_train, X_test, y_train, y_test, dates_train, dates_test
