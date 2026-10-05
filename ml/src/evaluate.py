import numpy as np
import pandas as pd
from sklearn.metrics import (
    mean_absolute_error,
    root_mean_squared_error,
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score,
    classification_report
)

def evaluate_regression(y_true, y_pred):
    """
    Calculates MAE, RMSE, R2 score, and Mean Error for regression models.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    errors = y_pred - y_true
    mae = float(mean_absolute_error(y_true, y_pred))
    rmse = float(root_mean_squared_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))
    mean_err = float(np.mean(errors))
    
    # Worst errors (top 5 max absolute errors)
    abs_errors = np.abs(errors)
    worst_indices = np.argsort(abs_errors)[-5:][::-1]
    worst_errors = [
        {"actual": float(y_true[idx]), "predicted": round(float(y_pred[idx]), 2), "error": round(float(errors[idx]), 2)}
        for idx in worst_indices
    ]
    
    return {
        "MAE": round(mae, 4),
        "RMSE": round(rmse, 4),
        "R2": round(r2, 4),
        "Mean_Error": round(mean_err, 4),
        "Worst_Errors": worst_errors
    }


def evaluate_classification(y_true, y_pred, y_prob=None):
    """
    Calculates Accuracy, Precision, Recall, F1, Macro F1, Confusion Matrix, and ROC-AUC for classification models.
    """
    acc = float(accuracy_score(y_true, y_pred))
    prec_w = float(precision_score(y_true, y_pred, average='weighted', zero_division=0))
    rec_w = float(recall_score(y_true, y_pred, average='weighted', zero_division=0))
    f1_w = float(f1_score(y_true, y_pred, average='weighted', zero_division=0))
    f1_macro = float(f1_score(y_true, y_pred, average='macro', zero_division=0))
    cm = confusion_matrix(y_true, y_pred).tolist()
    
    # Per-class metrics
    report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)
    
    auc = None
    if y_prob is not None:
        try:
            if len(np.unique(y_true)) == 2:
                auc = float(roc_auc_score(y_true, y_prob[:, 1] if y_prob.ndim == 2 else y_prob))
            else:
                auc = float(roc_auc_score(y_true, y_prob, multi_class='ovr', average='weighted'))
            auc = round(auc, 4)
        except Exception:
            auc = None

    return {
        "Accuracy": round(acc, 4),
        "Precision": round(prec_w, 4),
        "Recall": round(rec_w, 4),
        "F1": round(f1_w, 4),
        "Macro_F1": round(f1_macro, 4),
        "ROC_AUC": auc,
        "Confusion_Matrix": cm,
        "Per_Class_Metrics": {
            str(k): {
                "precision": round(v["precision"], 4),
                "recall": round(v["recall"], 4),
                "f1-score": round(v["f1-score"], 4),
                "support": v["support"]
            }
            for k, v in report.items() if str(k) not in ['accuracy', 'macro avg', 'weighted avg']
        }
    }
