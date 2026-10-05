import re
from typing import Dict, Any

try:
    from backend.modules.multilingual_engine import detect_query_language, format_multilingual_response
except Exception:
    try:
        from modules.multilingual_engine import detect_query_language, format_multilingual_response
    except Exception:
        def detect_query_language(t): return "ENGLISH"
        def format_multilingual_response(u, l, r): return r

def detect_user_tone(user_message: str) -> Dict[str, bool]:
    """
    Detects if the user prompt uses casual English or Tanglish slang.
    """
    msg_lower = (user_message or "").lower().strip()
    words = set(re.findall(r'\b\w+\b', msg_lower))
    
    tanglish_words = {
        "dei", "da", "bro", "enna", "epdi", "puriyala", "sollu", "solllu", 
        "iruku", "irukku", "pathi", "oda", "machi", "dude"
    }
    has_tanglish = bool(words & tanglish_words) or ("na enna" in msg_lower) or ("epdi iruku" in msg_lower) or ("simple ah" in msg_lower)
    has_da_dei = ("da" in words) or ("dei" in words) or ("machi" in words)
    
    return {
        "has_tanglish": has_tanglish,
        "has_da_dei": has_da_dei
    }

def format_ai_response(user_message: str, res_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Centralized Response Formatting Layer.
    Formally enforces the user's natural, casual, concise, and multilingual response style across all endpoints.
    Preserves 100% data accuracy and grounding metadata while matching the user's language (English, Tamil, Tanglish, Mixed).
    """
    if not res_dict or not isinstance(res_dict, dict) or "response" not in res_dict:
        return res_dict

    msg_clean = str(user_message or "").strip()
    msg_lower = msg_clean.lower()
    lang_label = detect_query_language(msg_clean)
    res_dict["language_detected"] = lang_label
    
    tone = detect_user_tone(msg_clean)
    has_tanglish = (lang_label == "TANGLISH") or tone["has_tanglish"]
    has_da = tone["has_da_dei"]

    # 1. Casual Greetings & Name Introductions
    intent = res_dict.get("intent", "")
    if intent in ["greeting", "identity", "capabilities", "casual_acknowledgment", "gratitude"] or (len(msg_clean.split()) <= 4 and bool(re.search(r'\b(hi|hii|hiii|hello|hey|heyy|greetings)\b', msg_lower))):
        name_match = re.search(r'\b(?:i am|my name is|this is|call me)\s+([a-zA-Z\u0b80-\u0bff]+)', msg_clean, re.IGNORECASE)
        if name_match:
            user_name = name_match.group(1).strip().capitalize()
            if lang_label == "TAMIL":
                res_dict["response"] = f"வணக்கம் {user_name}! நான் TRACKIQ AI. ரயில்வே தரவு அல்லது பராமரிப்பு திட்டமிடல் பற்றி என்னிடம் கேட்கலாம்."
            elif lang_label == "TANGLISH":
                res_dict["response"] = f"Hello {user_name}! I'm TRACKIQ AI. Railway data or block planning-la enna doubt irukku da?"
            else:
                res_dict["response"] = f"Hello {user_name}! I'm TRACKIQ AI. How can I help you with Indian Railways block planning or data today?"
            return res_dict
        elif lang_label == "TAMIL":
            res_dict["response"] = "வணக்கம்! நான் TRACKIQ AI. இந்திய ரயில்வே பராமரிப்பு மற்றும் தரவு வினாக்களுக்கு உதவ தயாராக உள்ளேன்."
            return res_dict
        elif has_tanglish:
            res_dict["response"] = "Vanakkam da! I'm TRACKIQ AI. Railway data or block planning-la enna doubt irukku?"
            return res_dict
        elif "who are you" in msg_lower or "who r u" in msg_lower or "யார் நீ" in msg_clean:
            if lang_label == "TAMIL":
                res_dict["response"] = "நான் TRACKIQ AI, இந்திய ரயில்வே பராமரிப்பு திட்டமிடல் மற்றும் தரவு உதவி மென்பொருள்."
            else:
                res_dict["response"] = "I'm TRACKIQ AI, your operational assistant for Indian Railways block planning and data queries."
            return res_dict
        elif "what can you do" in msg_lower or "what can u do" in msg_lower or "என்ன செய்ய முடியும்" in msg_clean:
            if lang_label == "TAMIL":
                res_dict["response"] = "நான் TMS, SMMS, TRD தரவுத்தொகுப்புகள், நிலைய தகவல்கள் மற்றும் ML block கணிப்புகளை வழங்க முடியும்."
            else:
                res_dict["response"] = "I can help you query TMS, SMMS, TRD datasets, maintenance schedules, train speeds, station info, and run ML block predictions."
            return res_dict
        elif any(t in msg_lower for t in ["thank", "thanks", "thx", "நன்றி"]):
            if lang_label == "TAMIL":
                res_dict["response"] = "மிக்க நன்றி! வேறு ஏதேனும் ரயில்வே தரவு தகவல்கள் தேவைப்பட்டால் கேட்கவும்."
            elif has_tanglish:
                res_dict["response"] = "Welcome da! Let me know if you need any other railway data."
            else:
                res_dict["response"] = "You're welcome! Let me know if you need anything else."
            return res_dict
        elif any(p in msg_lower for p in ["okay", "ok", "cool", "good", "great", "awesome", "nice", "bye", "சரி"]):
            if lang_label == "TAMIL":
                res_dict["response"] = "சரி! எப்போது வேண்டுமானாலும் ரயில்வே தரவுகளை கேட்கலாம்."
            elif has_tanglish:
                res_dict["response"] = "Cool da! Ask anytime."
            else:
                res_dict["response"] = "Great! Let me know whenever you need data."
            return res_dict
        else:
            if lang_label == "TAMIL":
                res_dict["response"] = "வணக்கம்! நான் TRACKIQ AI. இந்திய ரயில்வே பராமரிப்பு திட்டமிடல் பற்றி என்ன கேட்க விரும்புகிறீர்கள்?"
            else:
                res_dict["response"] = "Hello! I'm TRACKIQ AI. How can I help you with Indian Railways data or block planning today?"
            return res_dict

    # 2. Multilingual Response Formatting for Data Queries
    res_dict = format_multilingual_response(msg_clean, lang_label, res_dict)
    orig_resp = str(res_dict.get("response", "")).strip()

    # 3. Unavailable / Out-of-Scope Data Safeguards
    if res_dict.get("source_type") == "safeguard" or res_dict.get("grounded_source") == "Scope Safeguard Notice" or "don't have a connected real-time source" in orig_resp.lower():
        if lang_label == "TAMIL":
            res_dict["response"] = "இந்த தரவு தற்போதைய அமைப்பில் கிடைக்கவில்லை."
        elif has_tanglish or "epdi iruku" in msg_lower:
            if "weather" in msg_lower:
                res_dict["response"] = "Weather data namma current system-la available illa da."
            else:
                res_dict["response"] = "Indha data namma current system-la available illa da."
        else:
            if "weather" in msg_lower:
                res_dict["response"] = "Weather data is not available in our current operational datasets."
            else:
                res_dict["response"] = "This data is not available in our current operational datasets."
        return res_dict

    # 4. Universal Fluff Removal (Removes annoying intro fillers while keeping 100% of data body intact)
    cleaned = orig_resp

    fillers = [
        r'^(Certainly!|Sure!|Of course!|Absolutely!|As an AI\.\.\.|Here is\.\.\.|Here is|I analyzed your query:)\s*',
    ]
    for pattern in fillers:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE).strip()

    if has_tanglish and has_da and not cleaned.endswith("da.") and not cleaned.endswith("da"):
        cleaned += " da"

    res_dict["response"] = cleaned
    return res_dict

