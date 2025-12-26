import os
import sys
from datetime import datetime

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from backend.services.calendar_service import get_calendar_events, generate_calendar_flags
    from backend.services.data_service import get_top_places
    from backend.services.weather_service import get_weather
    from backend.services.ai_service import generate_vendor_insights
    from backend.config import BASE_DIR
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

print("--- ALL IMPORTS SUCCESSFUL ---")

city = "Mumbai"
state = "Maharashtra"
check_date = datetime.now()

print(f"Testing for {city}, {state} on {check_date}")

# 1. Test Calendar
print("\n--- Testing Calendar Service ---")
try:
    event_dates = get_calendar_events(
        datetime(check_date.year, 1, 1),
        datetime(check_date.year, 12, 31)
    )
    print(f"Events found: {len(event_dates)}")
    if event_dates:
        print(f"Sample event: {list(event_dates.items())[0]}")
except Exception as e:
    print(f"❌ Calendar Error: {e}")

# 2. Test Data Service
print("\n--- Testing Data Service ---")
try:
    top_places = get_top_places(city, state)
    print(f"Top places found: {len(top_places)}")
except Exception as e:
    print(f"❌ Data Service Error: {e}")

# 3. Test Weather
print("\n--- Testing Weather Service ---")
try:
    weather = get_weather(city, check_date.strftime("%Y-%m-%d"))
    print(f"Weather: {weather}")
except Exception as e:
    print(f"❌ Weather Error: {e}")

# 4. Test AI
print("\n--- Testing AI Service ---")
try:
    insights = {
        "City": city,
        "Season": "Winter",
        "Temp(°C)": "30",
        "Conditions": "Clear",
        "Top_Tourist_Spots": [{"Name Place": "Gateway"}]
    }
    ai_out = generate_vendor_insights(insights)
    print(f"AI Output length: {len(ai_out)}")
except Exception as e:
    print(f"❌ AI Error: {e}")
