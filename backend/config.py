import os

# Base Directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Google API
GOOGLE_API_KEY = "AIzaSyACLAiOTCjmlTGQ6zex6OUn6BCj8q6OdZw"
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, 'data', 'calender.json')

# Visual Crossing Weather API
WEATHER_API_KEY = "P9A5UL4L2CZJNSM35ADG4YF74"

# CSV Dataset
DATA_PATH = os.path.join(BASE_DIR, 'data', 'new.csv')

# Calendar ID
CALENDAR_ID = 'en.indian#holiday@group.v.calendar.google.com'

# LangChain Gemini Model
GEMINI_MODEL = "models/gemini-2.5-flash"
