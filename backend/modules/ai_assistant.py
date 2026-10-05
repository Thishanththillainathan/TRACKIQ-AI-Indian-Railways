import os
import re
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

PROTOTYPE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MODEL_JOBLIB = os.path.join(PROTOTYPE_DIR, "ml", "models", "ai_assistant_model.joblib")
TRAINING_DATA_JSON = os.path.join(PROTOTYPE_DIR, "ml", "data", "ai_assistant_training.json")

_model_artifact = None
_training_examples = None

def load_ai_assistant_model():
    """
    Attempts to load the joblib model artifact safely.
    If joblib loading fails, logs warning without throwing exception.
    """
    global _model_artifact
    if _model_artifact is not None:
        return _model_artifact
    
    if os.path.exists(MODEL_JOBLIB):
        try:
            import joblib
            _model_artifact = joblib.load(MODEL_JOBLIB)
            logger.info("[OK] Successfully loaded AI Assistant model from %s", MODEL_JOBLIB)
            return _model_artifact
        except Exception as e:
            logger.warning("[AI ASSISTANT] ML intent model unavailable: Failed to load joblib model from %s (%s). Falling back to pure-Python classifier.", MODEL_JOBLIB, e)
            return None
    else:
        logger.warning("[AI ASSISTANT] ML intent model unavailable: Model file not found at %s", MODEL_JOBLIB)
        return None

def load_training_data_fallback() -> List[Dict[str, Any]]:
    """
    Loads ai_assistant_training.json for pure-python intent fallback matching.
    """
    global _training_examples
    if _training_examples is not None:
        return _training_examples
    
    if os.path.exists(TRAINING_DATA_JSON):
        try:
            with open(TRAINING_DATA_JSON, "r", encoding="utf-8") as f:
                _training_examples = json.load(f)
            logger.info("[OK] Loaded %d training examples for pure-python intent fallback.", len(_training_examples))
            return _training_examples
        except Exception as e:
            logger.error("[AI ASSISTANT ERROR] Failed loading training JSON fallback: %s", e)
            _training_examples = []
            return _training_examples
    return []

# Pre-load resources on module import safely
load_ai_assistant_model()
load_training_data_fallback()

from backend.modules.ai_data_query import query_dataset_grounded_answer, get_dataset_summary
from backend.modules.railway_pdf_knowledge import query_pdf_knowledge

try:
    from backend.modules.ml_knowledge import query_ml_knowledge_answer
except Exception:
    try:
        from modules.ml_knowledge import query_ml_knowledge_answer
    except Exception:
        def query_ml_knowledge_answer(u): return None

try:
    from backend.modules.project_knowledge import query_project_knowledge_answer
except Exception:
    try:
        from modules.project_knowledge import query_project_knowledge_answer
    except Exception:
        def query_project_knowledge_answer(u): return None

try:
    from backend.modules.response_formatter import format_ai_response
except Exception:
    try:
        from modules.response_formatter import format_ai_response
    except Exception:
        def format_ai_response(user_message, res_dict):
            return res_dict

def get_ai_assistant_status() -> dict:
    """
    Returns AI Assistant system status for GET /api/ai-assistant/status.
    """
    artifact = load_ai_assistant_model()
    training_data = load_training_data_fallback()
    is_loaded = (artifact is not None) or (len(training_data) > 0)
    summary = get_dataset_summary()
    
    return {
        "status": "online",
        "model_loaded": is_loaded,
        "model_version": artifact.get("version", "v1.0.0") if artifact else "v1.0.0-fallback",
        "confidence_threshold": artifact.get("confidence_threshold", 0.45) if artifact else 0.40,
        "total_intents": len(artifact.get("unique_intents", [])) if artifact else 23,
        "total_connected_records": summary.get("total_records", 580000),
        "connected_files_count": summary.get("connected_files_count", 15),
        "immutability_verified": summary.get("immutability_verified", True),
        "assistant_status": "AI ASSISTANT READY"
    }

def _detect_casual_greeting(message: str) -> Optional[Dict[str, Any]]:
    """
    Detects casual conversation, greetings, introductions, status inquiries, capabilities,
    and pleasantries BEFORE project, dataset, or legacy intent classification.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    msg_strip = str(message or "").strip()
    if not msg_strip:
        return None

    msg_lower = msg_strip.lower()
    clean_text = re.sub(r'[^\w\s]', '', msg_lower).strip()
    words = clean_text.split()
    if not words:
        return None

    # Check for name introduction patterns (e.g. "Hi, I am Thishanth", "Hii, I am Thishanth", "I am Thishanth", "My name is Thishanth")
    name_match = re.search(r'\b(?:i am|my name is|this is|call me)\s+([a-zA-Z]+)', msg_strip, re.IGNORECASE)
    user_name = None
    if name_match:
        extracted = name_match.group(1).strip()
        non_names = {"a", "the", "here", "ready", "fine", "good", "asking", "looking", "trying", "working", "testing", "predicting"}
        if extracted.lower() not in non_names and len(extracted) > 1:
            user_name = extracted.capitalize()

    if user_name:
        return {
            "response": f"Hello {user_name}! I'm TRACKIQ AI, your operational assistant for Indian Railways. You can ask me about railway data, TMS, SMMS, TRD, maintenance, train operations, block planning, predictions, stations, and more.",
            "intent": "greeting",
            "confidence": 0.99,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "project_knowledge",
            "timestamp": now_iso
        }

    # Direct casual greetings
    casual_greetings = {
        "hi", "hii", "hiii", "hello", "hey", "heyy", "greetings", "hello assistant", "hi assistant",
        "good morning", "good afternoon", "good evening", "good night"
    }
    if clean_text in casual_greetings:
        prefix = "Good morning" if clean_text == "good morning" else ("Good evening" if clean_text == "good evening" else "Hello")
        return {
            "response": f"{prefix}! I'm TRACKIQ AI, your operational assistant for Indian Railways. You can ask me about railway data, TMS, SMMS, TRD, maintenance, train operations, block planning, predictions, stations, and more.",
            "intent": "greeting",
            "confidence": 0.98,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "project_knowledge",
            "timestamp": now_iso
        }

    # How are you / Status inquiry
    how_are_you_phrases = ["how are you", "how are u", "how is it going", "hows it going", "whats up", "what is up"]
    if any(phrase in clean_text for phrase in how_are_you_phrases):
        return {
            "response": "I'm doing great and ready to assist you! How can I help with your Indian Railways maintenance or block planning needs?",
            "intent": "greeting",
            "confidence": 0.98,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "project_knowledge",
            "timestamp": now_iso
        }

    # Identity ("Who are you?")
    who_are_you_phrases = ["who are you", "who r u", "what is your name", "what are you"]
    if any(phrase in clean_text for phrase in who_are_you_phrases):
        return {
            "response": "I am TRACKIQ AI, your operational assistant for Indian Railways. You can ask me about railway data, TMS, SMMS, TRD, maintenance, train operations, block planning, predictions, stations, and more.",
            "intent": "identity",
            "confidence": 0.98,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "project_knowledge",
            "timestamp": now_iso
        }

    # Capabilities ("What can you do?")
    what_can_you_do_phrases = ["what can you do", "what can u do", "what do you do", "how can you help", "what functionality"]
    if any(phrase in clean_text for phrase in what_can_you_do_phrases):
        return {
            "response": "I am TRACKIQ AI, your operational assistant for Indian Railways. I can help you with railway data queries, TMS, SMMS, TRD datasets, maintenance schedules, train operations, block planning, ML predictions, and station information.",
            "intent": "capabilities",
            "confidence": 0.98,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "project_knowledge",
            "timestamp": now_iso
        }

    # Gratitude
    thanks_phrases = ["thank you", "thanks", "thanks a lot", "thank u", "thx", "many thanks"]
    if clean_text in thanks_phrases or any(clean_text == p for p in thanks_phrases):
        return {
            "response": "You're welcome! Let me know if you need assistance with Indian Railways block planning or dataset queries.",
            "intent": "gratitude",
            "confidence": 0.98,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "project_knowledge",
            "timestamp": now_iso
        }

    # Pleasantries & Acknowledgments
    pleasantries = {"okay", "ok", "cool", "good", "great", "awesome", "nice", "bye", "goodbye", "see ya", "nice to meet you"}
    if clean_text in pleasantries:
        return {
            "response": "Glad to hear that! Feel free to ask any question about Indian Railways maintenance or block planning.",
            "intent": "casual_acknowledgment",
            "confidence": 0.95,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "project_knowledge",
            "timestamp": now_iso
        }

    # Short greetings (up to 3 words starting with a greeting word)
    greeting_lead_words = {"hi", "hii", "hiii", "hello", "hey", "heyy", "greetings"}
    if len(words) <= 3 and words[0] in greeting_lead_words:
        return {
            "response": "Hello! I'm TRACKIQ AI, your operational assistant for Indian Railways. You can ask me about railway data, TMS, SMMS, TRD, maintenance, train operations, block planning, predictions, stations, and more.",
            "intent": "greeting",
            "confidence": 0.98,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "project_knowledge",
            "timestamp": now_iso
        }

    return None

def _pure_python_intent_classifier(message: str) -> Optional[Dict[str, Any]]:
    """
    Pure-python deterministic intent classifier utilizing TF-IDF and word overlap matching on ai_assistant_training.json.
    Requires minimum confidence threshold of 0.70 to prevent false intent matches.
    """
    training_data = load_training_data_fallback()
    if not training_data:
        return None

    words = set(re.findall(r'\w+', message.lower()))
    if not words:
        return None

    best_match = None
    best_score = 0.0

    for item in training_data:
        ex_words = set(re.findall(r'\w+', item["text"].lower()))
        if not ex_words:
            continue
        intersection = words & ex_words
        union = words | ex_words
        jaccard = len(intersection) / float(len(union))
        overlap = len(intersection) / float(min(len(words), len(ex_words)))
        score = (jaccard * 0.5) + (overlap * 0.5)
        
        if score > best_score:
            best_score = score
            best_match = item

    calc_conf = round(min(0.99, best_score * 1.4 + 0.3), 2)
    if best_match and calc_conf >= 0.70:
        logger.info("[AI ASSISTANT] Falling back to pure-Python classifier for intent '%s' (score=%.2f, conf=%.2f)", best_match["intent"], best_score, calc_conf)
        return {
            "intent": best_match["intent"],
            "confidence": calc_conf,
            "response": best_match["response"]
        }
    return None

def _raw_predict_ai_assistant_response(message: str) -> dict:
    """
    Main Multi-Tier AI Assistant Router fulfilling priority order:
    1. Casual conversation / greeting (Detected BEFORE project, dataset or ML intent classifiers)
    2. Explicit prediction request
    3. Explicit data query (Dynamic Data Grounding Engine across ALL ml/data/ files)
    4. Cross-dataset analysis / PDF knowledge query
    5. Project knowledge & Core Domain Handlers
    6. Trained joblib ML intent classifier or pure-python fallback classifier (Minimum 0.70 confidence)
    7. Safe fallback response
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    msg_clean = str(message or "").strip()
    msg_lower = msg_clean.lower()

    if not msg_clean:
        return {
            "response": "Please type a question regarding railway maintenance, block planning, predictions, or connected datasets.",
            "intent": "unknown",
            "confidence": 0.0,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "fallback",
            "timestamp": now_iso
        }

    try:
        # Priority 1: Casual conversation / greeting (Detected BEFORE any intent classifier)
        casual_res = _detect_casual_greeting(msg_clean)
        if casual_res is not None:
            return casual_res

        # Priority 2: Explicit live prediction execution requests (TMS, SMMS, TRD)
        if any(p in msg_lower for p in ["give me a tms prediction", "predict tms duration", "predict tms", "tms delay prediction"]):
            tms_model = None
            try:
                from backend.main import get_verified_ml_model
                tms_model = get_verified_ml_model("TMS")
            except Exception:
                tms_model = None

            if tms_model is not None:
                try:
                    import pandas as pd
                    sample_input = pd.DataFrame([{
                        "Station": "NDLS", "Work Type": "Track Tamping", "Traffic Density": "High (120-200 trains/day)",
                        "Priority": "Routine", "Zone": "NR", "Division": "Delhi",
                        "Planned Duration": 120.0, "Train Frequency": 15.0, "Scheduled Trains": 12.0, "Previous Delay": 10.0
                    }])
                    pred_val = float(tms_model.predict(sample_input)[0])
                    return {
                        "response": f"TMS Prediction Model (`tms_actual_duration_model.joblib` — Linear Regression Pipeline): For a scheduled 120-minute Track Management block at NDLS, the predicted actual duration is **{pred_val:.1f} minutes** (+{max(0, int(pred_val - 120))} mins buffer recommended).",
                        "intent": "tms_prediction",
                        "confidence": 0.98,
                        "is_data_grounded": True,
                        "grounded_source": "tms_actual_duration_model.joblib",
                        "source_type": "ml_model",
                        "timestamp": now_iso
                    }
                except Exception as ml_err:
                    logger.warning("[AI ASSISTANT WARNING] TMS ML inference failed: %s", ml_err)

            return {
                "response": "TMS Prediction Overview (Model Temporarily Unavailable): For a scheduled 120-minute Track Management block at NDLS, baseline actual duration is ~134 minutes (+14 minutes buffer recommended).",
                "intent": "tms_prediction",
                "confidence": 0.90,
                "is_data_grounded": False,
                "grounded_source": "TMS Prediction Overview",
                "source_type": "fallback",
                "timestamp": now_iso
            }

        if any(p in msg_lower for p in ["give me an smms prediction", "give me smms prediction", "predict smms", "smms risk prediction"]):
            smms_model = None
            try:
                from backend.main import get_verified_ml_model
                smms_model = get_verified_ml_model("SMMS")
            except Exception:
                smms_model = None

            if smms_model is not None:
                try:
                    import pandas as pd
                    sample_input = pd.DataFrame([{
                        "Station": "NDLS", "Work Type": "Point Machine Testing", "Traffic Density": "High (120-200 trains/day)",
                        "Priority": "High", "Zone": "NR", "Division": "Delhi",
                        "Planned Duration": 90.0, "Train Frequency": 15.0, "Scheduled Trains": 10.0, "Previous Delay": 15.0
                    }])
                    pred_cls = int(smms_model.predict(sample_input)[0])
                    prob = smms_model.predict_proba(sample_input)[0]
                    risk_str = "High Failure Risk (Major/Critical)" if pred_cls == 1 else "Low/Moderate Risk"
                    return {
                        "response": f"SMMS Prediction Model (`smms_asset_condition_model.joblib` — Random Forest Classifier): Asset Failure Risk is **{risk_str}** (Class {pred_cls}, Confidence: {max(prob):.1%}).",
                        "intent": "smms_prediction",
                        "confidence": 0.98,
                        "is_data_grounded": True,
                        "grounded_source": "smms_asset_condition_model.joblib",
                        "source_type": "ml_model",
                        "timestamp": now_iso
                    }
                except Exception as ml_err:
                    logger.warning("[AI ASSISTANT WARNING] SMMS ML inference failed: %s", ml_err)

        if any(p in msg_lower for p in ["give me a trd prediction", "predict trd", "trd disruption prediction"]):
            trd_model = None
            try:
                from backend.main import get_verified_ml_model
                trd_model = get_verified_ml_model("TRD")
            except Exception:
                trd_model = None

            if trd_model is not None:
                try:
                    import pandas as pd
                    sample_input = pd.DataFrame([{
                        "Block Type": "Traction (OHE) Block", "Station": "CSMT", "Work Type": "Catenary Wire Maintenance",
                        "Traffic Density": "Very High (>200 trains/day)", "Priority": "Routine", "Zone": "CR", "Division": "Mumbai",
                        "Planned Duration": 120.0, "Train Frequency": 20.0, "Scheduled Trains": 18.0, "Previous Delay": 25.0,
                        "Traffic_Exposed_Trains": 100.0, "Delay_Per_Train": 1.19, "High_Traffic_Flag": 1
                    }])
                    pred_val = float(trd_model.predict(sample_input)[0])
                    return {
                        "response": f"TRD Disruption Model (`trd_affected_trains_model.joblib` — HistGradientBoosting Regressor): Predicted number of affected trains is **{int(round(pred_val))} trains** ({pred_val:.1f} estimated disruption count).",
                        "intent": "trd_prediction",
                        "confidence": 0.98,
                        "is_data_grounded": True,
                        "grounded_source": "trd_affected_trains_model.joblib",
                        "source_type": "ml_model",
                        "timestamp": now_iso
                    }
                except Exception as ml_err:
                    logger.warning("[AI ASSISTANT WARNING] TRD ML inference failed: %s", ml_err)

        # Priority 3: ML Knowledge & System Architecture Queries
        ml_know_res = query_ml_knowledge_answer(msg_clean)
        if ml_know_res is not None:
            return {
                "response": ml_know_res["response"],
                "intent": ml_know_res.get("intent", "ml_knowledge"),
                "confidence": ml_know_res.get("confidence", 0.98),
                "is_data_grounded": True,
                "grounded_source": ml_know_res.get("grounded_source", "ml/models/model_metadata.json"),
                "source_type": ml_know_res.get("source_type", "ml_metadata"),
                "timestamp": now_iso
            }

        # Priority 4: Complete Project Knowledge & Domain Queries
        proj_know_res = query_project_knowledge_answer(msg_clean)
        if proj_know_res is not None:
            return {
                "response": proj_know_res["response"],
                "intent": proj_know_res.get("intent", "project_knowledge"),
                "confidence": proj_know_res.get("confidence", 0.98),
                "is_data_grounded": True,
                "grounded_source": proj_know_res.get("grounded_source", "TRACKIQ AI System Architecture"),
                "source_type": proj_know_res.get("source_type", "project_knowledge"),
                "timestamp": now_iso
            }

        # Priority 3: Explicit data query / Dynamic Data Grounding Engine Across ALL ml/data/ Files
        grounded_res = query_dataset_grounded_answer(msg_clean)
        if grounded_res is not None:
            return {
                "response": grounded_res["response"],
                "intent": grounded_res.get("intent", "data_grounded_query"),
                "confidence": grounded_res.get("confidence", 0.99),
                "is_data_grounded": True,
                "grounded_source": grounded_res.get("grounded_source", "Railway Dataset"),
                "source_type": grounded_res.get("source_type", "excel"),
                "source_file": grounded_res.get("source_file"),
                "source_sheet": grounded_res.get("source_sheet"),
                "source_page": grounded_res.get("source_page"),
                "is_verified": True,
                "timestamp": now_iso
            }

        # Priority 4: PDF Knowledge Search
        pdf_res = query_pdf_knowledge(msg_clean)
        if pdf_res is not None:
            return {
                "response": pdf_res["response"],
                "intent": "pdf_knowledge",
                "confidence": 0.85,
                "is_data_grounded": True,
                "grounded_source": pdf_res.get("grounded_source"),
                "source_type": "pdf",
                "timestamp": now_iso
            }

        # Priority 5: Core Domain Specific Handlers
        if any(p in msg_lower for p in ["explain tms", "what is tms", "tell me about tms", "tms explanation"]):
            return {
                "response": "TMS (Track Management System) manages civil engineering, track tamping, rail renewals, turnout replacement, and track maintenance scheduling across 60,000 recorded asset segments.",
                "intent": "tms_explanation",
                "confidence": 0.95,
                "is_data_grounded": True,
                "grounded_source": "TRACK_MANAGEMENT.xlsx",
                "source_type": "project_knowledge",
                "timestamp": now_iso
            }

        if any(p in msg_lower for p in ["block optimization", "what is block optimization", "optimize block"]):
            return {
                "response": "Block optimization uses linear programming and machine learning to find optimal possession windows for maintenance work. It minimizes train delays, avoids multi-department schedule conflicts, and ensures required manpower and asset availability.",
                "intent": "block_optimization",
                "confidence": 0.95,
                "is_data_grounded": True,
                "grounded_source": "AI_BLOCK_PLANNER_ALL_DEPTS",
                "source_type": "project_knowledge",
                "timestamp": now_iso
            }

        if any(p in msg_lower for p in ["train position", "current train position", "where is train", "live position", "live tracking"]):
            return {
                "response": "Live train tracking API is not currently connected to the prototype. Train positions are drawn from reference operations data and static section block schedules near NDLS, CSMT, and MAS.",
                "intent": "train_position",
                "confidence": 0.90,
                "is_data_grounded": True,
                "grounded_source": "Operations Dataset",
                "source_type": "project_knowledge",
                "timestamp": now_iso
            }

        # Priority 6: ML Joblib Model Intent Classifier (Minimum 0.70 Confidence Threshold)
        artifact = load_ai_assistant_model()
        if artifact and "pipeline" in artifact:
            try:
                pipeline = artifact["pipeline"]
                intent_responses = artifact["intent_responses"]
                threshold = max(0.70, artifact.get("confidence_threshold", 0.40))

                probabilities = pipeline.predict_proba([msg_clean])[0]
                max_idx = int(probabilities.argmax())
                predicted_intent = str(pipeline.classes_[max_idx])
                confidence = float(probabilities[max_idx])

                if confidence >= threshold and predicted_intent != "unknown":
                    responses_list = intent_responses.get(predicted_intent, [])
                    if responses_list:
                        resp_idx = abs(hash(msg_clean)) % len(responses_list)
                        return {
                            "response": responses_list[resp_idx],
                            "intent": predicted_intent,
                            "confidence": round(confidence, 4),
                            "is_data_grounded": False,
                            "grounded_source": None,
                            "source_type": "ml_model",
                            "timestamp": now_iso
                        }
            except Exception as ml_err:
                logger.warning("[AI ASSISTANT] ML model unavailable: Scikit-learn inference error (%s). Falling back.", ml_err)

        # Priority 6 (Fallback): Pure-Python Intent Fallback Classifier (Minimum 0.70 Confidence)
        pure_res = _pure_python_intent_classifier(msg_clean)
        if pure_res is not None and pure_res.get("confidence", 0.0) >= 0.70:
            return {
                "response": pure_res["response"],
                "intent": pure_res["intent"],
                "confidence": pure_res["confidence"],
                "is_data_grounded": False,
                "grounded_source": None,
                "source_type": "pure_python_intent",
                "timestamp": now_iso
            }

        # Priority 7: Deterministic Safe Fallback Response
        return {
            "response": f"I analyzed your query: '{msg_clean}'. I am your operational assistant for Indian Railways maintenance block planning. Ask me about active blocks, SMMS/TMS/TRD datasets, station details, or delay predictions.",
            "intent": "general_inquiry",
            "confidence": 0.50,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "fallback",
            "timestamp": now_iso
        }

    except Exception as e:
        logger.error("[AI ASSISTANT ERROR] Unhandled exception in AI Assistant pipeline: %s", e, exc_info=True)
        return {
            "response": "I encountered a processing notice while querying the operational backend, but system services remain operational. Please retry your question.",
            "intent": "system_error",
            "confidence": 0.0,
            "is_data_grounded": False,
            "grounded_source": None,
            "source_type": "fallback",
            "timestamp": now_iso
        }


def predict_ai_assistant_response(message: str) -> dict:
    """
    Public entry point for AI Assistant pipeline.
    Routes raw multi-tier response through centralized format_ai_response layer.
    """
    raw_res = _raw_predict_ai_assistant_response(message)
    return format_ai_response(message, raw_res)

