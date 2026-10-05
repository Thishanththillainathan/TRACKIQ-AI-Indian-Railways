import hashlib
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

def get_deterministic_request_seed(request_id: str = None, station: str = None, work_type: str = None) -> int:
    """
    Generates a 100% deterministic integer seed derived from the current request inputs.
    Eliminates random variations across renders while guaranteeing distinct outputs
    between Request A, Request B, and Request C.
    """
    key_str = f"{request_id or 'REQ'}_{station or 'STN'}_{work_type or 'WORK'}"
    md5_hash = hashlib.md5(key_str.encode('utf-8')).hexdigest()
    return int(md5_hash[:8], 16)


def generate_deterministic_ml_predictions(payload: dict, seed: int = None) -> list:
    """
    Generates deterministic, request-derived demonstration predictions for all 13 metrics
    when real ML inference is unavailable, tagged with `is_demo_simulation = True`.
    """
    if seed is None:
        seed = get_deterministic_request_seed(
            payload.get("request_id"),
            payload.get("station"),
            payload.get("work_type")
        )

    req_id = payload.get("request_id") or f"REQ-DEMO-{seed % 1000:03d}"
    ast_id = payload.get("asset_id") or f"AST-DEMO-{seed % 1000:03d}"
    station_val = payload.get("station") or "Main Line"
    dur = float(payload.get("duration_hours") or 3.5)
    freq = float(payload.get("train_frequency") or 15.0)
    delay = float(payload.get("previous_delay") or 10.0)

    # Deterministic formulas derived from input parameters & seed
    risk_score = round(max(15.0, min(92.0, 20.0 + (seed % 50) + (delay * 1.2))), 1)
    predicted_repair_dur = round(max(1.0, dur * (1.0 + ((seed % 25) / 100.0))), 2)
    affected_trains = max(1, int(round((dur * freq / 24.0) * (0.8 + (seed % 40) / 100.0))))

    if risk_score > 70: severity = "Critical"
    elif risk_score > 45: severity = "Major"
    elif risk_score > 20: severity = "Moderate"
    else: severity = "Minor"

    expected_downtime = round(predicted_repair_dur * 1.2, 2)
    rec_block_dur = round(predicted_repair_dur + 0.5, 2)
    expected_delay = round(5.0 + (risk_score * 0.35), 1)
    req_manpower = int(max(4, 6 + (seed % 5)))
    req_techs = int(max(2, 3 + (seed % 3)))
    priority_score = int(round(max(20, min(98, risk_score * 0.85 + 10))))
    availability = round(max(50.0, min(99.5, 98.0 - (risk_score * 0.4))), 1)
    maint_req = "Urgent Corrective Maintenance Required" if risk_score > 60 else "Preventive Maintenance Scheduled"

    ts = datetime.now(timezone.utc).isoformat()

    return [
        # SMMS DEPARTMENT
        {"prediction_id": f"PRED-1-{ast_id}", "department": "SMMS", "request_id": req_id, "asset_id": ast_id, "prediction_type": "SMMS: Failure Risk", "predicted_value": f"{risk_score}%", "confidence": "95.0%", "model_version": "DemoSimulation-SMMS", "prediction_timestamp": ts, "is_demo_simulation": True},
        {"prediction_id": f"PRED-2-{ast_id}", "department": "SMMS", "request_id": req_id, "asset_id": ast_id, "prediction_type": "SMMS: Failure Severity", "predicted_value": severity, "confidence": "94.5%", "model_version": "DemoSimulation-SMMS", "prediction_timestamp": ts, "is_demo_simulation": True},
        {"prediction_id": f"PRED-12-{ast_id}", "department": "SMMS", "request_id": req_id, "asset_id": ast_id, "prediction_type": "SMMS: Asset Availability", "predicted_value": f"{availability}%", "confidence": "93.0%", "model_version": "DemoSimulation-SMMS", "prediction_timestamp": ts, "is_demo_simulation": True},
        {"prediction_id": f"PRED-13-{ast_id}", "department": "SMMS", "request_id": req_id, "asset_id": ast_id, "prediction_type": "SMMS: Maintenance Requirement", "predicted_value": maint_req, "confidence": "94.0%", "model_version": "DemoSimulation-SMMS", "prediction_timestamp": ts, "is_demo_simulation": True},

        # TMS DEPARTMENT
        {"prediction_id": f"PRED-3-{ast_id}", "department": "TMS", "request_id": req_id, "asset_id": ast_id, "prediction_type": "TMS: Actual Duration Prediction", "predicted_value": f"{predicted_repair_dur} hrs", "confidence": "94.0%", "model_version": "DemoSimulation-TMS", "prediction_timestamp": ts, "is_demo_simulation": True},
        {"prediction_id": f"PRED-4-{ast_id}", "department": "TMS", "request_id": req_id, "asset_id": ast_id, "prediction_type": "TMS: Expected Downtime", "predicted_value": f"{expected_downtime} hrs", "confidence": "91.0%", "model_version": "DemoSimulation-TMS", "prediction_timestamp": ts, "is_demo_simulation": True},
        {"prediction_id": f"PRED-10-{ast_id}", "department": "TMS", "request_id": req_id, "asset_id": ast_id, "prediction_type": "TMS: Recommended Block Duration", "predicted_value": f"{rec_block_dur} hrs", "confidence": "92.5%", "model_version": "DemoSimulation-TMS", "prediction_timestamp": ts, "is_demo_simulation": True},
        {"prediction_id": f"PRED-11-{ast_id}", "department": "TMS", "request_id": req_id, "asset_id": ast_id, "prediction_type": "TMS: Track Priority Score", "predicted_value": f"{priority_score} / 100", "confidence": "96.0%", "model_version": "DemoSimulation-TMS", "prediction_timestamp": ts, "is_demo_simulation": True},

        # TRD DEPARTMENT
        {"prediction_id": f"PRED-6-{ast_id}", "department": "TRD", "request_id": req_id, "asset_id": ast_id, "prediction_type": "TRD: Affected Train Count", "predicted_value": f"{affected_trains} trains", "confidence": "90.0%", "model_version": "DemoSimulation-TRD", "prediction_timestamp": ts, "is_demo_simulation": True},
        {"prediction_id": f"PRED-5-{ast_id}", "department": "TRD", "request_id": req_id, "asset_id": ast_id, "prediction_type": "TRD: Expected Train Delay", "predicted_value": f"{expected_delay} mins", "confidence": "92.0%", "model_version": "DemoSimulation-TRD", "prediction_timestamp": ts, "is_demo_simulation": True},
        {"prediction_id": f"PRED-7-{ast_id}", "department": "TRD", "request_id": req_id, "asset_id": ast_id, "prediction_type": "TRD: Required Manpower", "predicted_value": f"{req_manpower} personnel", "confidence": "94.0%", "model_version": "DemoSimulation-TRD", "prediction_timestamp": ts, "is_demo_simulation": True},
        {"prediction_id": f"PRED-8-{ast_id}", "department": "TRD", "request_id": req_id, "asset_id": ast_id, "prediction_type": "TRD: Required Technicians", "predicted_value": f"{req_techs} specialists", "confidence": "95.0%", "model_version": "DemoSimulation-TRD", "prediction_timestamp": ts, "is_demo_simulation": True},
        {"prediction_id": f"PRED-9-{ast_id}", "department": "TRD", "request_id": req_id, "asset_id": ast_id, "prediction_type": "TRD: Required Equipment", "predicted_value": "Tower Wagon & Maintenance Rig", "confidence": "96.0%", "model_version": "DemoSimulation-TRD", "prediction_timestamp": ts, "is_demo_simulation": True}
    ]
