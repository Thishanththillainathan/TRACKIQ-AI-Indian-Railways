import sys, os, traceback
sys.path.insert(0, r'c:\Users\THISHANTH T\Desktop\PROTOTYPE')
sys.path.insert(0, r'c:\Users\THISHANTH T\Desktop\PROTOTYPE\backend')
os.chdir(r'c:\Users\THISHANTH T\Desktop\PROTOTYPE')

print("=== Python:", sys.version)
print("=== CWD:", os.getcwd())
print("=== sys.path[0:4]:", sys.path[:4])
print()

# Test 1: joblib model
print("--- TEST 1: Model load ---")
try:
    import joblib
    art = joblib.load('ml/models/ai_assistant_model.joblib')
    print(f"[OK] Loaded. Type={type(art).__name__} Keys={list(art.keys()) if isinstance(art,dict) else 'N/A'}")
    if isinstance(art, dict):
        intents = art.get('unique_intents', [])
        print(f"     intents={len(intents)}  threshold={art.get('confidence_threshold')}  version={art.get('version')}")
        print(f"     pipeline type: {type(art.get('pipeline')).__name__}")
        print(f"     sample intents: {intents[:6]}")
except Exception as e:
    print(f"[FAIL] {type(e).__name__}: {e}")
    traceback.print_exc()

print()

# Test 2: ai_data_query import
print("--- TEST 2: ai_data_query import ---")
try:
    from backend.modules.ai_data_query import query_dataset_grounded_answer, get_dataset_summary
    print("[OK] Imported ai_data_query")
    s = get_dataset_summary()
    print(f"     dataset_summary: total_records={s.get('total_records')}  status={s.get('status')}")
    print(f"     immutability_verified={s.get('immutability_verified')}")
except Exception as e:
    print(f"[FAIL] {type(e).__name__}: {e}")
    traceback.print_exc()

print()

# Test 3: ai_assistant import + predict
print("--- TEST 3: ai_assistant import + predict ---")
try:
    from backend.modules.ai_assistant import predict_ai_assistant_response, get_ai_assistant_status
    print("[OK] Imported ai_assistant")
    status = get_ai_assistant_status()
    print(f"     status: {status}")
except Exception as e:
    print(f"[FAIL] import: {type(e).__name__}: {e}")
    traceback.print_exc()

print()

# Test 4: predict each test message
print("--- TEST 4: Predict test messages ---")
MESSAGES = [
    "Hello",
    "What is TMS?",
    "What is SMMS?",
    "What is TRD?",
    "What is block optimization?",
    "Tell me about railway stations",
    "What train types are available?",
    "Search railway data",
    "What is current train position?",
    "Give me a TMS prediction",
]
try:
    from backend.modules.ai_assistant import predict_ai_assistant_response
    for msg in MESSAGES:
        try:
            r = predict_ai_assistant_response(msg)
            print(f"  Q: {msg[:40]!r}")
            print(f"     intent={r.get('intent')}  conf={r.get('confidence')}  grounded={r.get('is_data_grounded')}")
            print(f"     response: {str(r.get('response',''))[:100]}")
        except Exception as e2:
            print(f"  Q: {msg[:40]!r}  -> ERROR: {type(e2).__name__}: {e2}")
except Exception as e:
    print(f"[FAIL] Can't run predictions: {type(e).__name__}: {e}")
    traceback.print_exc()
