from googleapiclient.discovery import build
from google.oauth2 import service_account
from datetime import datetime, timedelta
from config import SERVICE_ACCOUNT_FILE, CALENDAR_ID

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=['https://www.googleapis.com/auth/calendar.readonly']
)
service = build('calendar', 'v3', credentials=credentials)

def get_calendar_events(start_date: datetime, end_date: datetime):
    events_result = service.events().list(
        calendarId=CALENDAR_ID,
        timeMin=start_date.isoformat() + 'Z',
        timeMax=end_date.isoformat() + 'Z',
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    events = events_result.get('items', [])
    return {event['start'].get('date'): event['summary'] for event in events if 'date' in event['start']}

def generate_calendar_flags(date: datetime, event_dates: dict):
    date_str = date.strftime('%Y-%m-%d')
    festival_day = date_str in event_dates
    nearby_festival_day = any(
        (date + timedelta(days=offset)).strftime('%Y-%m-%d') in event_dates
        for offset in range(-2, 3)
    ) and not festival_day

    month = date.month
    season = "Winter" if month in [12, 1, 2] else "Summer" if month in [3, 4, 5] else "Monsoon" if month in [6, 7, 8, 9] else "Post-Monsoon"
    holiday = date.weekday() in [5, 6]

    return {
        "Festival_Day": festival_day,
        "Nearby_Festival_Day": nearby_festival_day,
        "Season": season,
        "Holiday": holiday
    }
