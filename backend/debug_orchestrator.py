
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

try:
    from models.orchestrator import suggest_items_orchestrator
    
    print("Attempting prediction with updated model list...")
    # This calls the function which now tries: gemini-2.5-flash -> ... -> fallback
    result = suggest_items_orchestrator("2025-12-27", "Masala Puri", "English", "both")
    print("Result:", result)

except Exception as e:
    print("CRASHED:", e)
    import traceback
    traceback.print_exc()
