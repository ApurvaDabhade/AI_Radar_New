import os
import json
import re
import pandas as pd
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from sklearn.preprocessing import OneHotEncoder, MultiLabelBinarizer
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_classic.memory import ConversationBufferMemory
from langchain_classic.chains import ConversationChain

# ============================
# 1️⃣ Configuration
# ============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Navigate up one level from models/ to backend/, then into data/
BACKEND_DIR = os.path.dirname(BASE_DIR)
SERVICE_ACCOUNT_FILE = os.path.join(BACKEND_DIR, "data", "calender.json")
ORDERS_CSV = os.path.join(BACKEND_DIR, "data", "order.csv")
MENU_CSV = os.path.join(BACKEND_DIR, "data", "menu.csv")
os.environ["GOOGLE_API_KEY"] = os.environ.get("GOOGLE_API_KEY", "YOUR_GEMINI_KEY")

# ============================
# 2️⃣ Season & festival helper
# ============================
def month_to_season(month: int) -> str:
    if month in [3, 4, 5, 6]:
        return 'Summer'
    elif month in [7, 8, 9, 10]:
        return 'Monsoon'
    else:
        return 'Winter'

def fetch_festivals(service, calendar_id, start_date='2025-01-01', end_date='2025-12-31'):
    events_result = service.events().list(
        calendarId=calendar_id,
        timeMin=start_date + 'T00:00:00Z',
        timeMax=end_date + 'T23:59:59Z',
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    events = events_result.get('items', [])
    data = [{'date': e['start']['date'], 'festival': e.get('summary', '')}
            for e in events if 'date' in e['start']]
    df = pd.DataFrame(data)
    if not df.empty:
        df['date'] = pd.to_datetime(df['date'])
        df['season'] = df['date'].dt.month.apply(month_to_season)
    else:
        df = pd.DataFrame(columns=['date','festival','season'])
    return df

# ============================
# 3️⃣ Initialize data
# ============================
calendar_id = 'en.indian#holiday@group.v.calendar.google.com'
try:
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=['https://www.googleapis.com/auth/calendar.readonly']
    )
    service = build('calendar', 'v3', credentials=credentials)
    festivals_df = fetch_festivals(service, calendar_id)
except Exception as e:
    print("⚠️ Google Calendar fetch failed:", e)
    festivals_df = pd.DataFrame(columns=['date','festival','season'])

orders_df = pd.read_csv(ORDERS_CSV)
orders_df['order_date'] = pd.to_datetime(orders_df['order_date'])

menu_df = pd.read_csv(MENU_CSV)
menu_df['available_toppings'] = menu_df['available_toppings'].apply(
    lambda x: [s.strip() for s in str(x).split(',')] if pd.notna(x) else [])
menu_df['available_addons'] = menu_df['available_addons'].apply(
    lambda x: [s.strip() for s in str(x).split(',')] if pd.notna(x) else [])

# Merge season/festival info
orders_df = orders_df.merge(
    festivals_df[['date', 'festival']],
    left_on='order_date',
    right_on='date',
    how='left'
).drop(columns=['date'])
orders_df['festival'] = orders_df['festival'].fillna('None')
orders_df['season'] = orders_df['order_date'].dt.month.apply(month_to_season)
orders_df['toppings_list'] = orders_df['toppings_selected'].apply(
    lambda x: eval(x) if isinstance(x, str) and x.startswith('[') else [])
orders_df['addons_list'] = orders_df['addons_selected'].apply(
    lambda x: eval(x) if isinstance(x, str) and x.startswith('[') else [])

# ============================
# 4️⃣ Train models
# ============================
X = orders_df[['dish_name', 'season', 'festival']]
encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
X_encoded = encoder.fit_transform(X)

mlb_toppings = MultiLabelBinarizer()
mlb_addons = MultiLabelBinarizer()
y_toppings = mlb_toppings.fit_transform(orders_df['toppings_list'])
y_addons = mlb_addons.fit_transform(orders_df['addons_list'])

X_train, X_test, y_train_t, y_test_t = train_test_split(X_encoded, y_toppings, test_size=0.2, random_state=42)
_, _, y_train_a, y_test_a = train_test_split(X_encoded, y_addons, test_size=0.2, random_state=42)

topping_model = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42)).fit(X_train, y_train_t)
addon_model = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42)).fit(X_train, y_train_a)

# ============================
# 5️⃣ LangChain / Gemini setup
# ============================
chat_model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)
memory = ConversationBufferMemory(memory_key="history", return_messages=True)
conv_chain = ConversationChain(llm=chat_model, memory=memory, verbose=True)

# ============================
# 6️⃣ Tools
# ============================
def clean_list_items(items):
    """Flatten any Marathi objects into strings"""
    clean = []
    for i in items:
        if isinstance(i, dict):
            clean.extend(list(i.values()))
        else:
            clean.append(i)
    return clean

def generate_dish_advisory_tool_fn(payload: str) -> str:
    try:
        data = json.loads(payload)
        dish = data['dish_name']
        season = data['season']
        lang = data['language']
        option = data.get('option', 'both')

        if option == "topping":
            prompt = f"Suggest 3–5 toppings for {dish} in {season} season."
        elif option == "addon":
            prompt = f"Suggest 3–5 add-ons for {dish} in {season} season."
        else:
            prompt = f"Suggest 3–5 toppings and 3–5 add-ons for {dish} in {season} season."

        if lang.lower() == "marathi":
            prompt += " Translate all suggestions into Marathi."

        system_msg = SystemMessage(content="Return only JSON in this format: {\"toppings\":[],\"addons\":[]}")
        user_msg = HumanMessage(content=prompt)
        response = chat_model.invoke([system_msg, user_msg])
        raw = response.content.strip()
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        result = json.loads(match.group(0)) if match else {}

        # Flatten objects
        result["toppings"] = clean_list_items(result.get("toppings", []))
        result["addons"] = clean_list_items(result.get("addons", []))
        return json.dumps(result)

    except Exception as e:
        return json.dumps({"error": "llm_failed", "message": str(e)})

# ============================
# 7️⃣ Orchestrator
# ============================
def suggest_items_orchestrator(order_date: str, dish_name: str, language: str = "English", option: str = "both"):
    date_str = pd.to_datetime(order_date).strftime("%Y-%m-%d")
    season = month_to_season(datetime.now().month)
    festival = "None"

    toppings, addons = [], []

    llm_out = json.loads(generate_dish_advisory_tool_fn(json.dumps({
        "dish_name": dish_name,
        "season": season,
        "language": language,
        "option": option
    })))

    toppings = clean_list_items(llm_out.get("toppings", []))
    addons = clean_list_items(llm_out.get("addons", []))

    if not toppings:
        toppings = ["No suggestions"]
    if not addons:
        addons = ["No suggestions"]

    return {
        "dish_name": dish_name,
        "date": date_str,
        "season": season,
        "festival": festival,
        "toppings": toppings,
        "addons": addons
    }
