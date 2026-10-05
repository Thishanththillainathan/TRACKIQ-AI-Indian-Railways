import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
from google import genai
key = os.getenv('GEMINI_API_KEY', '')
print(f"Key prefix: {key[:10]}... len={len(key)}")
client = genai.Client(api_key=key)
try:
    models = list(client.models.list())
    print(f"Found {len(models)} models:")
    for m in models:
        print(f"  {m.name}")
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
