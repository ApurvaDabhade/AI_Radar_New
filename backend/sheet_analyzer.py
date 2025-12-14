# sheet_analyzer.py
import pandas as pd
from textblob import TextBlob
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os

SPREADSHEET_ID = os.environ.get(
    "GOOGLE_SHEET_ID",
    "1ZcCXZ2wdF8xgLSnLxTTYv0cy_3gXNMfHTKRAC48tDK0"
)
RANGE_NAME = os.environ.get("GOOGLE_SHEET_RANGE", "Food_Reviews!A:E")
CREDENTIALS_FILE = os.environ.get(
    "GOOGLE_CREDENTIALS_JSON",
    "C:\\AI_Radar\\backend\\customerfeedback-12345abcd.json"
)

def fetch_all_google_sheet_data():
    try:
        creds = service_account.Credentials.from_service_account_file(
            CREDENTIALS_FILE,
            scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"]
        )
        service = build("sheets", "v4", credentials=creds)
        sheet = service.spreadsheets()
        result = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=RANGE_NAME).execute()
        values = result.get("values", [])

        print("[DEBUG] Raw values from Google Sheet:", values)  # <-- debug

        if not values or len(values) < 2:
            print("No data found in Google Sheet.")
            return []

        df = pd.DataFrame(values[1:], columns=values[0])
        df = df.fillna("")

        # Sentiment analysis
        text_col = "Comment / Review" if "Comment / Review" in df.columns else df.columns[-1]
        df["Sentiment"] = df[text_col].apply(lambda x: "Positive" if TextBlob(str(x)).sentiment.polarity > 0.1
                                             else "Negative" if TextBlob(str(x)).sentiment.polarity < -0.1
                                             else "Neutral")

        if "Rating" in df.columns:
            df["Rating"] = pd.to_numeric(df["Rating"], errors="coerce").fillna(0).astype(int)

        for col in ["Customer Name", "Category of Feedback", "City / Location"]:
            if col not in df.columns:
                df[col] = "Unknown"
            else:
                df[col] = df[col].replace("", "Unknown")

        return df.to_dict(orient="records")

    except Exception as e:
        print("Error fetching sheet:", e)
        return []
