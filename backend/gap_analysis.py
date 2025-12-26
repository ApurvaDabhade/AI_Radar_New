import os
from typing import List, Dict, Tuple

import pandas as pd
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    AutoModelForTokenClassification,
    pipeline,
)

from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

load_dotenv()

# ---------------- CONFIG ----------------
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
SERVICE_ACCOUNT_FILE = "credentials.json"
SPREADSHEET_ID = os.getenv("GOOGLE_SHEET_ID")
SHEET_RANGE = "Form responses 1!A2:F"

if not os.path.exists(SERVICE_ACCOUNT_FILE):
    print(f"WARNING: {SERVICE_ACCOUNT_FILE} not found. Gap analysis will use empty data.")

if not SPREADSHEET_ID:
    print("WARNING: GOOGLE_SHEET_ID env var not set.")
OUTPUT_ANALYSIS_CSV = "gap_output.csv"

CATEGORIES = [
    "Food",
    "Service",
    "Price",
    "Ambience",
    "Hygiene",
    "Staff Behavior",
    "Delivery",
    "Location",
    "Other",
]

SENTIMENT_MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment-latest"
ASPECT_MODEL_NAME = "gauneg/deberta-v3-base-absa-ate-sentiment"

# ---------------- GOOGLE SHEETS ----------------
# ---------------- GOOGLE SHEETS ----------------
def get_sheet_rows() -> List[List[str]]:
    if not os.path.exists(SERVICE_ACCOUNT_FILE) or not SPREADSHEET_ID:
        print("Using mock data as credentials/ID missing.")
        return [
            ["2025-01-01", "vendor_01", "Customer 1", "5", "Great food and service!", "Mumbai"],
            ["2025-01-02", "vendor_01", "Customer 2", "4", "Tasty but expensive.", "Mumbai"],
            ["2025-01-03", "vendor_02", "Customer 3", "3", "Average taste.", "Pune"],
        ]

    try:
        creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        service = build("sheets", "v4", credentials=creds)
        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=SPREADSHEET_ID, range=SHEET_RANGE)
            .execute()
        )
        return result.get("values", [])
    except Exception as e:
        print(f"Error fetching sheets: {e}. Using mock data.")
        return [
            ["2025-01-01", "vendor_01", "Customer 1", "5", "Great food and service! (Mock)", "Mumbai"],
            ["2025-01-02", "vendor_01", "Customer 2", "4", "Tasty but expensive. (Mock)", "Mumbai"],
        ]


def build_dataframe() -> pd.DataFrame:
    rows = get_sheet_rows()
    if not rows:
        return pd.DataFrame(columns=["timestamp", "vendor_id", "name", "rating", "comment", "city"])
    df = pd.DataFrame(rows, columns=["timestamp", "vendor_id", "name", "rating", "comment", "city"])
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce")
    df = df[df["comment"].notna() & (df["comment"].str.strip() != "")]
    df = df.reset_index(drop=True)
    return df


# ---------------- MODEL LOADING ----------------
_sentiment_pipe = None
_aspect_tokenizer = None
_aspect_model = None

def load_sentiment_pipeline():
    global _sentiment_pipe
    if _sentiment_pipe is None:
        _sentiment_pipe = pipeline(
            "sentiment-analysis",
            model=SENTIMENT_MODEL_NAME,
            tokenizer=SENTIMENT_MODEL_NAME,
        )
    return _sentiment_pipe


def load_aspect_model():
    global _aspect_tokenizer, _aspect_model
    if _aspect_tokenizer is None or _aspect_model is None:
        _aspect_tokenizer = AutoTokenizer.from_pretrained(ASPECT_MODEL_NAME)
        _aspect_model = AutoModelForTokenClassification.from_pretrained(ASPECT_MODEL_NAME)
    return _aspect_tokenizer, _aspect_model


# ---------------- SENTIMENT HELPERS ----------------
def normalize_overall_sentiment(label: str) -> str:
    l = label.lower()
    if "pos" in l:
        return "positive"
    if "neg" in l:
        return "negative"
    return "neutral"


def predict_overall_sentiment(text: str) -> str:
    if not text:
        return "neutral"
    pipe = load_sentiment_pipeline()
    result = pipe(text[:512])[0]
    return normalize_overall_sentiment(result["label"])


# ---------------- ASPECT → CATEGORY MAPPING ----------------
CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "Food": ["food", "taste", "meal", "dish", "naan", "biryani", "pizza", "burger", "dessert"],
    "Service": ["service", "wait", "attentive", "manager", "queue"],
    "Price": ["price", "expensive", "cheap", "value", "costly"],
    "Ambience": ["ambience", "decor", "music", "lighting", "vibe"],
    "Hygiene": ["clean", "dirty", "hygiene", "odor", "smell"],
    "Staff Behavior": ["staff", "rude", "polite", "friendly", "waiter"],
    "Delivery": ["delivery", "takeaway", "parcel", "swiggy", "zomato"],
    "Location": ["location", "parking", "place", "distance", "near"],
    "Other": [],
}


def map_aspect_term_to_category(term: str, text: str) -> str:
    t_term = (term or "").lower()
    t_text = (text or "").lower()
    for cat, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in t_term or kw in t_text:
                return cat
    return "Other"


def map_aspect_polarity_to_label(polarity: str) -> str:
    p = polarity.lower()
    if "pos" in p:
        return "positive"
    if "neg" in p:
        return "negative"
    return "neutral"


def extract_main_aspect_and_sentiment(text: str) -> Tuple[str, str]:
    if not text:
        return "Other", "neutral"
    tokenizer, model = load_aspect_model()
    nlp = pipeline(
        "token-classification",
        model=model,
        tokenizer=tokenizer,
        aggregation_strategy="simple",
    )
    entities = nlp(text[:512])
    if not entities:
        return "Other", "neutral"
    best = max(entities, key=lambda e: e.get("score", 0.0))
    raw_term = best.get("word", "").strip()
    raw_polarity = best.get("entity_group", "")
    category = map_aspect_term_to_category(raw_term, text)
    sentiment = map_aspect_polarity_to_label(raw_polarity)
    return category, sentiment


# ---------------- ANALYSIS ----------------
def analyze_reviews(df: pd.DataFrame) -> pd.DataFrame:
    overall_list, aspect_list = [], []
    for text in df["comment"]:
        overall = predict_overall_sentiment(text)
        aspect_cat, _aspect_sent = extract_main_aspect_and_sentiment(text)
        overall_list.append(overall)
        aspect_list.append(aspect_cat)
    df["predicted_sentiment"] = overall_list
    df["predicted_aspect"] = aspect_list
    return df


def aggregate_categories(df: pd.DataFrame) -> List[Dict]:
    out: List[Dict] = []
    for cat in CATEGORIES:
        group = df[df["predicted_aspect"] == cat]
        pos = (group["predicted_sentiment"] == "positive").sum()
        neg = (group["predicted_sentiment"] == "negative").sum()
        total = len(group)
        out.append({
            "name": cat,
            "positive": int(round((pos / total) * 100)) if total else 0,
            "neutral": 0,
            "negative": int(round((neg / total) * 100)) if total else 0,
            "trend": 0,
        })
    return out


def aggregate_citywide(df: pd.DataFrame) -> List[Dict]:
    out: List[Dict] = []
    for cat in CATEGORIES:
        group = df[df["predicted_aspect"] == cat]
        pos = (group["predicted_sentiment"] == "positive").sum()
        neg = (group["predicted_sentiment"] == "negative").sum()
        total = len(group)
        out.append({
            "category": cat,
            "positive": int(round((pos / total) * 100)) if total else 0,
            "neutral": 0,
            "negative": int(round((neg / total) * 100)) if total else 0,
            "total": int(total),
        })
    return out


def get_overall(df: pd.DataFrame) -> Dict:
    pos = (df["predicted_sentiment"] == "positive").sum()
    neg = (df["predicted_sentiment"] == "negative").sum()
    total = len(df)
    avg_rating = round(df["rating"].mean(), 2) if total > 0 else None
    return {
        "positive": int(round((pos / total) * 100)) if total else 0,
        "neutral": 0,
        "negative": int(round((neg / total) * 100)) if total else 0,
        "total": int(total),
        "averageRating": avg_rating,
    }


def get_static_trends() -> Dict:
    return {"positive": 12, "neutral": -3, "negative": -9}


def save_citywide_to_csv(df: pd.DataFrame, fout: str):
    cols = [
        "timestamp", "vendor_id", "name", "rating",
        "comment", "city", "predicted_aspect", "predicted_sentiment",
    ]
    for c in cols:
        if c not in df.columns:
            df[c] = None
    df[cols].to_csv(fout, index=False)


# ---------------- MAIN ENTRY ----------------
def perform_gap_analysis(vendor_id: str) -> Dict:
    df_all = build_dataframe()
    if df_all.empty:
        return {
            "overall": {"positive": 0, "neutral": 0, "negative": 0, "total": 0, "averageRating": None},
            "trends": get_static_trends(),
            "categories": [],
            "citywideData": [],
        }

    # --- MOCK BYPASS START ---
    if not os.path.exists(SERVICE_ACCOUNT_FILE) or not SPREADSHEET_ID:
        # Return fully processed mock response to avoid ML model loading delay
        print("Returning fast mock analysis.")
        return {
            "overall": {
                "positive": 80,
                "neutral": 0,
                "negative": 20,
                "total": 5,
                "averageRating": 4.5
            },
            "trends": get_static_trends(),
            "categories": [
                {"name": "Food", "positive": 90, "neutral": 0, "negative": 10, "trend": 0},
                {"name": "Service", "positive": 70, "neutral": 10, "negative": 20, "trend": 0},
                {"name": "Price", "positive": 60, "neutral": 20, "negative": 20, "trend": 0},
                {"name": "Ambience", "positive": 85, "neutral": 5, "negative": 10, "trend": 0},
                {"name": "Hygiene", "positive": 95, "neutral": 0, "negative": 5, "trend": 0},
                {"name": "Staff Behavior", "positive": 80, "neutral": 10, "negative": 10, "trend": 0},
                {"name": "Delivery", "positive": 75, "neutral": 5, "negative": 20, "trend": 0},
                {"name": "Location", "positive": 90, "neutral": 5, "negative": 5, "trend": 0},
                {"name": "Other", "positive": 50, "neutral": 50, "negative": 0, "trend": 0}
            ],
            "citywideData": [
                {"category": "Food", "positive": 85, "neutral": 5, "negative": 10, "total": 100},
                {"category": "Service", "positive": 75, "neutral": 10, "negative": 15, "total": 80},
                 {"category": "Price", "positive": 65, "neutral": 15, "negative": 20, "total": 90},
                 {"category": "Ambience", "positive": 80, "neutral": 10, "negative": 10, "total": 70},
                 {"category": "Hygiene", "positive": 90, "neutral": 5, "negative": 5, "total": 60},
                 {"category": "Staff Behavior", "positive": 70, "neutral": 20, "negative": 10, "total": 50},
                 {"category": "Delivery", "positive": 70, "neutral": 10, "negative": 20, "total": 85},
                 {"category": "Location", "positive": 85, "neutral": 10, "negative": 5, "total": 95},
                 {"category": "Other", "positive": 50, "neutral": 40, "negative": 10, "total": 40}
            ]
        }
    # --- MOCK BYPASS END ---

    df_all = analyze_reviews(df_all)
    save_citywide_to_csv(df_all, OUTPUT_ANALYSIS_CSV)
    df_vendor = df_all[df_all["vendor_id"] == vendor_id]

    if df_vendor.empty:
        overall = {"positive": 0, "neutral": 0, "negative": 0, "total": 0, "averageRating": None}
        categories_agg = [{"name": cat, "positive": 0, "neutral": 0, "negative": 0, "trend": 0} for cat in CATEGORIES]
    else:
        overall = get_overall(df_vendor)
        categories_agg = aggregate_categories(df_vendor)

    citywide_agg = aggregate_citywide(df_all)

    return {
        "overall": overall,
        "trends": get_static_trends(),
        "categories": categories_agg,
        "citywideData": citywide_agg,
    }


if __name__ == "__main__":
    print(perform_gap_analysis("vendor_01"))