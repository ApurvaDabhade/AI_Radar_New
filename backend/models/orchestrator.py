# models/orchestrator.py

from dotenv import load_dotenv
load_dotenv()  # ✅ load .env ONCE

import os
import json
import re
import ast
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


# =====================================================
# 1️⃣ ENV VALIDATION (STRICT)
# =====================================================
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY missing in .env")

# 🔐 Bind ONCE (no override later)
os.environ["GOOGLE_API_KEY"] = GEMINI_KEY


# =====================================================
# 2️⃣ PATH CONFIG
# =====================================================
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, "data", "calender.json")
ORDERS_CSV = os.path.join(BASE_DIR, "data", "order.csv")
MENU_CSV = os.path.join(BASE_DIR, "data", "menu.csv")


# =====================================================
# 3️⃣ SEASON HELPER
# =====================================================
def month_to_season(month: int) -> str:
    if month in [3, 4, 5, 6]:
        return "Summer"
    elif month in [7, 8, 9, 10]:
        return "Monsoon"
    return "Winter"


# =====================================================
# 4️⃣ GOOGLE CALENDAR (OPTIONAL & SAFE)
# =====================================================
def fetch_festivals():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        return pd.DataFrame(columns=["date", "festival"])

    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=["https://www.googleapis.com/auth/calendar.readonly"]
        )
        service = build("calendar", "v3", credentials=credentials)

        events = service.events().list(
            calendarId="en.indian#holiday@group.v.calendar.google.com",
            singleEvents=True,
            orderBy="startTime"
        ).execute().get("items", [])

        rows = []
        for e in events:
            d = e["start"].get("date")
            if d:
                rows.append({"date": d, "festival": e.get("summary", "")})

        df = pd.DataFrame(rows)
        if not df.empty:
            df["date"] = pd.to_datetime(df["date"])
        return df

    except Exception:
        return pd.DataFrame(columns=["date", "festival"])


# =====================================================
# 5️⃣ LOAD DATA
# =====================================================
orders_df = pd.read_csv(ORDERS_CSV)
orders_df["order_date"] = pd.to_datetime(orders_df["order_date"])
orders_df["season"] = orders_df["order_date"].dt.month.apply(month_to_season)
orders_df["festival"] = "None"

orders_df["toppings_list"] = orders_df["toppings_selected"].apply(
    lambda x: ast.literal_eval(x) if isinstance(x, str) else []
)
orders_df["addons_list"] = orders_df["addons_selected"].apply(
    lambda x: ast.literal_eval(x) if isinstance(x, str) else []
)

try:
    menu_df = pd.read_csv(MENU_CSV)
except Exception:
    menu_df = pd.DataFrame()


# =====================================================
# 6️⃣ TRAIN ML MODELS
# =====================================================
X = orders_df[["dish_name", "season", "festival"]]

encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
X_encoded = encoder.fit_transform(X)

mlb_toppings = MultiLabelBinarizer()
mlb_addons = MultiLabelBinarizer()

y_toppings = mlb_toppings.fit_transform(orders_df["toppings_list"])
y_addons = mlb_addons.fit_transform(orders_df["addons_list"])

X_train, _, y_train_t, _ = train_test_split(X_encoded, y_toppings, test_size=0.2)
_, _, y_train_a, _ = train_test_split(X_encoded, y_addons, test_size=0.2)

topping_model = MultiOutputClassifier(RandomForestClassifier()).fit(X_train, y_train_t)
addon_model = MultiOutputClassifier(RandomForestClassifier()).fit(X_train, y_train_a)


# =====================================================
# 7️⃣ GEMINI MODELS
# =====================================================
def get_chat_model(model_name="gemini-1.5-flash"):
    try:
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0.4,
            timeout=30
        )
    except Exception:
        return None

# =====================================================
# 8️⃣ GEMINI TOOL
# =====================================================
def generate_dish_advisory(dish, season, festival="None", dish_details="", language="English", option="both"):
    
    context_part = ""
    if dish_details:
        context_part += f"The dish contains {dish_details}. "
    if festival and festival != "None":
        context_part += f"It is the occasion of {festival}, so suggest festive options. "

    if option == "topping":
        prompt = f"{context_part}Suggest 3–5 toppings for {dish} in {season} season."
    elif option == "addon":
        prompt = f"{context_part}Suggest 3–5 add-ons for {dish} in {season} season."
    else:
        prompt = f"{context_part}Suggest 3–5 toppings and 3–5 add-ons for {dish} in {season} season."

    if language.lower() == "marathi":
        prompt += " Translate everything into Marathi."

    # List of models to try in order
    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-pro"]
    
    response_content = None
    
    for model_name in models_to_try:
        try:
            chat_model = get_chat_model(model_name)
            if not chat_model:
                continue
                
            response = chat_model.invoke([
                SystemMessage(content="Return ONLY JSON: {\"toppings\":[],\"addons\":[]}"),
                HumanMessage(content=prompt)
            ])
            response_content = response.content
            if response_content:
                break
        except Exception as e:
            print(f"⚠️ Model {model_name} failed: {e}")
            continue

    if not response_content:
        print("❌ All AI models failed.")
        return {"toppings": ["Crispy Noodles", "Fried Onions"], "addons": ["Extra Sauce", "Pickle"]} # Fallback defaults

    try:
        match = re.search(r"\{.*\}", response_content, re.DOTALL)
        if match:
             return json.loads(match.group(0))
    except json.JSONDecodeError:
        print("❌ JSON Decode Error from AI response")
    except Exception as e:
        print(f"❌ Error parsing AI response: {e}")

    return {"toppings": [], "addons": []}


# =====================================================
# 9️⃣ ORCHESTRATOR
# =====================================================
def suggest_items_orchestrator(order_date, dish_name, language="English", option="both"):
    order_dt = pd.to_datetime(order_date)
    season = month_to_season(order_dt.month)
    
    # 1. Look up Festival
    festival = "None"
    try:
        festivals_df = fetch_festivals()
        if not festivals_df.empty:
            # Check if this date has a festival
            mask = festivals_df["date"] == order_dt
            if mask.any():
                festival = festivals_df.loc[mask, "festival"].values[0]
    except Exception as e:
        print(f"⚠️ Festival lookup failed: {e}")

    # 2. Look up Dish Details from Menu
    dish_details = ""
    try:
        if not menu_df.empty:
            # menu.csv columns: dish_id, dish_name, category, base_price, available_toppings, available_addons
            
            # Normalize column names just in case
            menu_df.columns = [c.strip() for c in menu_df.columns]
            
            # Find the row (Case-insensitive search)
            row = menu_df[menu_df["dish_name"].str.lower() == dish_name.lower()]
            if not row.empty:
                category = row.iloc[0].get("category", "")
                base_price = row.iloc[0].get("base_price", "")
                
                details_parts = []
                if category:
                    details_parts.append(f"category: {category}")
                if base_price:
                    details_parts.append(f"base price: {base_price}")
                
                dish_details = ", ".join(details_parts)
    except Exception as e:
        print(f"⚠️ Menu lookup failed: {e}")


    toppings, addons = [], []

    try:
        X_input = encoder.transform(
            pd.DataFrame([[dish_name, season, festival]],
            columns=["dish_name", "season", "festival"])
        )
        toppings = list(mlb_toppings.inverse_transform(
            topping_model.predict(X_input))[0])
        addons = list(mlb_addons.inverse_transform(
            addon_model.predict(X_input))[0])
    except Exception:
        pass

    if not toppings or not addons:
        llm_out = generate_dish_advisory(dish_name, season, festival, dish_details, language, option)
        toppings = llm_out.get("toppings", [])
        addons = llm_out.get("addons", [])

    return {
        "dish_name": dish_name,
        "date": order_dt.strftime("%Y-%m-%d"),
        "season": season,
        "festival": festival,
        "toppings": toppings or ["No suggestions"],
        "addons": addons or ["No suggestions"]
    }
