import sys, os, joblib, json, traceback
os.chdir(r'c:\Users\THISHANTH T\Desktop\PROTOTYPE')
sys.path.insert(0, 'backend')

print("=== ai_assistant_model.joblib ===")
try:
    art = joblib.load('ml/models/ai_assistant_model.joblib')
    print("Type:", type(art).__name__)
    if isinstance(art, dict):
        print("Keys:", list(art.keys()))
        intents = art.get('unique_intents', [])
        print("Intents (%d):" % len(intents), intents)
        print("Version:", art.get('version'))
        print("Threshold:", art.get('confidence_threshold'))
        p = art.get('pipeline')
        print("Pipeline:", type(p).__name__ if p else 'NONE')
        rk = list(art.get('intent_responses', {}).keys())
        print("Response keys (%d):" % len(rk), rk[:10])
    else:
        print("Not a dict:", type(art).__name__)
except Exception as e:
    print("FAIL:", e)
    traceback.print_exc()

print("\n=== ai_assistant_training.json ===")
try:
    with open('ml/data/ai_assistant_training.json') as f:
        data = json.load(f)
    print("Type:", type(data).__name__)
    if isinstance(data, list):
        print("Total examples:", len(data))
        print("Keys in [0]:", list(data[0].keys()) if data else 'empty')
        for item in data[:2]:
            print(" ", item)
    elif isinstance(data, dict):
        print("Top keys:", list(data.keys()))
        intents = data.get('intents', [])
        print("Intents:", len(intents))
        if intents:
            i0 = intents[0]
            print("First:", i0.get('tag'), i0.get('patterns', [])[:2], i0.get('responses', [])[:1])
except Exception as e:
    print("FAIL:", e)
    traceback.print_exc()

print("\n=== modules/ai_data_query import test ===")
try:
    from modules.ai_data_query import verify_excel_immutability, get_dataset_summary
    print("Imported OK")
    v = verify_excel_immutability()
    for fname, ok in v.items():
        status = "OK" if ok else "HASH MISMATCH"
        print("  " + fname + ": " + status)
except Exception as e:
    print("FAIL:", e)
    traceback.print_exc()

print("\n=== modules/ai_assistant import test ===")
try:
    from modules.ai_assistant import get_ai_assistant_status, predict_ai_assistant_response
    print("Imported OK")
    st = get_ai_assistant_status()
    print("Status:", st)
except Exception as e:
    print("FAIL:", e)
    traceback.print_exc()

print("\n=== predict 'What is TMS?' ===")
try:
    from modules.ai_assistant import predict_ai_assistant_response
    r = predict_ai_assistant_response("What is TMS?")
    print("intent:", r.get('intent'))
    print("confidence:", r.get('confidence'))
    print("response:", str(r.get('response',''))[:120])
    print("is_data_grounded:", r.get('is_data_grounded'))
except Exception as e:
    print("FAIL:", e)
    traceback.print_exc()
