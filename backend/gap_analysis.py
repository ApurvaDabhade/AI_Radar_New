import os
import pandas as pd
import pickle

RAW_REVIEWS_CSV = "raw_reviews.csv"
OUTPUT_ANALYSIS_CSV = "gap_output.csv"
VENDOR_SAMPLE_FRACTION = 0.1
SENTIMENT_MODEL_FILE = "sentiment_model.pkl"
ASPECT_MODEL_FILE = "aspect_model.pkl"

CATEGORIES = [
    "Food",
    "Service",
    "Price",
    "Ambience",
    "Hygiene",
    "Staff Behavior",
    "Delivery",
    "Location",
    "Other"
]

def load_models():
    with open(SENTIMENT_MODEL_FILE, "rb") as f:
        sentiment_pipeline = pickle.load(f)
    with open(ASPECT_MODEL_FILE, "rb") as f:
        aspect_pipeline = pickle.load(f)
    return sentiment_pipeline, aspect_pipeline

def analyze_reviews(df, sentiment_pipeline, aspect_pipeline):
    X = df["comment"].values
    sent_vec = sentiment_pipeline['vectorizer'].transform(X)
    sentiments = sentiment_pipeline['model'].predict(sent_vec)
    aspect_vec = aspect_pipeline['vectorizer'].transform(X)
    aspects = aspect_pipeline['model'].predict(aspect_vec)
    df["predicted_sentiment"] = sentiments
    df["predicted_aspect"] = aspects
    return df

def aggregate_categories(df):
    assert "predicted_aspect" in df.columns and "predicted_sentiment" in df.columns, \
        "Required columns missing from DataFrame."
    out = []
    for cat in CATEGORIES:
        group = df[df["predicted_aspect"] == cat]
        pos = (group["predicted_sentiment"] == "positive").sum()
        neg = (group["predicted_sentiment"] == "negative").sum()
        total = len(group)
        trend = 0  # Placeholder for trend calculation
        out.append({
            "name": cat,
            "positive": int(round((pos / total) * 100)) if total else 0,
            "neutral": 0,
            "negative": int(round((neg / total) * 100)) if total else 0,
            "trend": trend
        })
    return out

def aggregate_citywide(df):
    assert "predicted_aspect" in df.columns and "predicted_sentiment" in df.columns, \
        "Required columns missing from DataFrame."
    out = []
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
            "total": total
        })
    return out

def get_overall(df):
    assert "predicted_sentiment" in df.columns, "Required columns missing from DataFrame."
    pos = (df["predicted_sentiment"] == "positive").sum()
    neg = (df["predicted_sentiment"] == "negative").sum()
    total = len(df)
    avg_rating = round(df["rating"].mean(), 2) if "rating" in df.columns and total > 0 else None
    return {
        "positive": int(round((pos / total) * 100)) if total else 0,
        "neutral": 0,
        "negative": int(round((neg / total) * 100)) if total else 0,
        "total": total,
        "averageRating": avg_rating
    }

def get_static_trends():
    return {
        "positive": 12,
        "neutral": -3,
        "negative": -9
    }

def save_citywide_to_csv(df, fout):
    df.to_csv(fout, index=False)

def perform_gap_analysis():
    needs_processing = False
    if os.path.exists(OUTPUT_ANALYSIS_CSV):
        citywide_df = pd.read_csv(OUTPUT_ANALYSIS_CSV)
        # Check if required columns exist; if not, reprocess
        if not {"predicted_aspect", "predicted_sentiment"}.issubset(citywide_df.columns):
            needs_processing = True
    else:
        needs_processing = True

    if needs_processing:
        sentiment_pipeline, aspect_pipeline = load_models()
        raw_reviews_df = pd.read_csv(RAW_REVIEWS_CSV)
        citywide_df = analyze_reviews(raw_reviews_df, sentiment_pipeline, aspect_pipeline)
        save_citywide_to_csv(citywide_df, OUTPUT_ANALYSIS_CSV)

    # Vendor-specific 10% sample for categories aggregate
    vendor_sample_df = citywide_df.sample(frac=VENDOR_SAMPLE_FRACTION, random_state=42)
    categories_agg = aggregate_categories(vendor_sample_df)
    citywide_agg = aggregate_citywide(citywide_df)
    overall = get_overall(citywide_df)

    response = {
        "overall": overall,
        "trends": get_static_trends(),
        "categories": categories_agg,
        "citywideData": citywide_agg
    }
    return response
