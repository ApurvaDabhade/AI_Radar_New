import os
from datetime import datetime, timedelta
from googleapiclient.discovery import build
from google.oauth2 import service_account

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, "data", "calender.json")
CALENDAR_ID = "en.indian#holiday@group.v.calendar.google.com"

service = None

if os.path.exists(SERVICE_ACCOUNT_FILE):
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=["https://www.googleapis.com/auth/calendar.readonly"]
        )
        service = build("calendar", "v3", credentials=credentials)
    except Exception as e:
        print("⚠️ Calendar init failed:", e)

def get_calendar_events(start_date: datetime, end_date: datetime):
    if not service:
        return {}

    events = service.events().list(
        calendarId=CALENDAR_ID,
        timeMin=start_date.isoformat() + "Z",
        timeMax=end_date.isoformat() + "Z",
        singleEvents=True,
        orderBy="startTime"
    ).execute().get("items", [])

    return {
        (e["start"].get("date") or e["start"].get("dateTime", "")[:10]):
        e.get("summary", "")
        for e in events
        if "start" in e
    }

def generate_calendar_flags(date: datetime, event_dates: dict):
    date_str = date.strftime("%Y-%m-%d")

    festival_day = date_str in event_dates
    nearby_festival_day = any(
        (date + timedelta(days=i)).strftime("%Y-%m-%d") in event_dates
        for i in range(-2, 3)
    ) and not festival_day

    season = (
        "Winter" if date.month in [12, 1, 2]
        else "Summer" if date.month in [3, 4, 5]
        else "Monsoon" if date.month in [6, 7, 8, 9]
        else "Post-Monsoon"
    )

    return {
        "Festival_Day": festival_day,
        "Nearby_Festival_Day": nearby_festival_day,
        "Season": season,
        "Holiday": date.weekday() >= 5
    }
