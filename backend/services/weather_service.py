import requests
from config import WEATHER_API_KEY

def get_weather(city: str, date: str):
    url = f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{city}/{date}?unitGroup=metric&key={WEATHER_API_KEY}&include=days"
    try:
        r = requests.get(url)
        data = r.json()
        if "days" in data:
            day = data["days"][0]
            return {"Temp(°C)": day.get("temp", "N/A"), "Conditions": day.get("conditions", "N/A")}
    except Exception as e:
        print("⚠️ Weather error:", e)
    return {"Temp(°C)": "N/A", "Conditions": "N/A"}
