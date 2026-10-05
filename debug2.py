import sys, os, traceback
sys.path.insert(0, 'backend')
sys.path.insert(0, '.')
os.chdir(r'c:\Users\THISHANTH T\Desktop\PROTOTYPE')

print("Python:", sys.version[:20])

# Step 1: joblib model
print("\n--- STEP 1: joblib model ---")
try:
    import joblib
    art = joblib.load('ml/models/ai_assistant_model.joblib')
    ks = list(art.keys()) if isinstance(art, dict) else str(type(art))
    print("OK - Keys:", ks)
    if isinstance(art, dict):
        intents = art.get('unique_intents', [])
        print("  version:", art.get('version'))
        print("  threshold:", art.get('confidence_threshold'))
        print("  num_intents:", len(intents))
        print("  sample intents:", intents[:8])
        print("  pipeline:", type(art.get('pipeline')).__name__)
        print("  intent_responses sample:", list(art.get('intent_responses', {}).keys())[:5])
except Exception as e:
    print("FAIL:", type(e).__name__, str(e))
    traceback.print_exc()

# Step 2: immutability check
print("\n--- STEP 2: Excel immutability ---")
try:
    from modules.ai_data_query import verify_excel_immutability, get_dataset_summary
    v = verify_excel_immutability()
    for fname, ok in v.items():
        print("  " + fname + ": " + ("OK" if ok else "HASH MISMATCH"))
    s = get_dataset_summary()
    print("  total_records:", s.get('total_records'))
    print("  immutability_verified:", s.get('immutability_verified'))
except Exception as e:
    print("FAIL:", type(e).__name__, str(e))
    traceback.print_exc()

# Step 3: ai_assistant module
print("\n--- STEP 3: ai_assistant module ---")
try:
    from modules.ai_assistant import get_ai_assistant_status, predict_ai_assistant_response
    status = get_ai_assistant_status()
    print("Status:", status)
except Exception as e:
    print("FAIL:", type(e).__name__, str(e))
    traceback.print_exc()

# Step 4: predict
print("\n--- STEP 4: Predictions ---")
try:
    from modules.ai_assistant import predict_ai_assistant_response
    msgs = ["Hello", "What is TMS?", "What is SMMS?", "What is TRD?",
            "What is block optimization?", "Tell me about railway stations",
            "What train types are available?", "Search railway data",
            "What is current train position?", "Give me a TMS prediction"]
    for msg in msgs:
        try:
            r = predict_ai_assistant_response(msg)
            resp_short = str(r.get('response', ''))[:80]
            print("Q:", msg[:35])
            print("  intent=%s conf=%s grounded=%s" % (r.get('intent'), r.get('confidence'), r.get('is_data_grounded')))
            print("  response:", resp_short)
        except Exception as e2:
            print("Q:", msg[:35], "-> ERROR:", type(e2).__name__, str(e2))
except Exception as e:
    print("FAIL to run predictions:", type(e).__name__, str(e))
    traceback.print_exc()
