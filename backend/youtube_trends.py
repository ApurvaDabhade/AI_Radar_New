import csv
import re
import requests
import pandas as pd
from rapidfuzz import process
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
import os
from datetime import datetime
from dotenv import load_dotenv

# Setup
nltk.download("vader_lexicon")
load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")
SEARCH_QUERY = "Indian street food"
MAX_RESULTS = 500
DISHES_CSV = "indian_dishes_200.csv"
OUTPUT_CSV = "output.csv"
LAST_RUN_FILE = "last_run_date.txt"

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos"
YOUTUBE_COMMENTS_URL = "https://www.googleapis.com/youtube/v3/commentThreads"


# ------------------ Helpers ------------------
def should_run_this_month():
    current_month = datetime.now().strftime("%Y-%m")
    if not os.path.exists(LAST_RUN_FILE):
        return True
    with open(LAST_RUN_FILE, "r") as f:
        last_run_month = f.read().strip()
    return current_month != last_run_month


def update_last_run_date():
    current_month = datetime.now().strftime("%Y-%m")
    with open(LAST_RUN_FILE, "w") as f:
        f.write(current_month)


def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9 ]", " ", text)
    return text


def get_best_dish_match(text, dish_list, threshold=70):
    match, score, _ = process.extractOne(text, dish_list)
    return match if score >= threshold else None


def get_videos(query, max_results=50):
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "key": API_KEY,
        "order": "viewCount"
    }
    response = requests.get(YOUTUBE_SEARCH_URL, params=params).json()
    return response.get("items", [])


def get_video_stats(video_id):
    params = {
        "part": "statistics,snippet",
        "id": video_id,
        "key": API_KEY
    }
    response = requests.get(YOUTUBE_VIDEO_URL, params=params).json()
    if "items" in response and response["items"]:
        item = response["items"][0]
        stats = item["statistics"]
        return {
            "views": int(stats.get("viewCount", 0)),
            "likes": int(stats.get("likeCount", 0)),
            "commentCount": int(stats.get("commentCount", 0)),
            "title": item["snippet"]["title"],
            "description": item["snippet"].get("description", "")
        }
    return None


def get_top_comments(video_id, max_comments=7):
    params = {
        "part": "snippet",
        "videoId": video_id,
        "maxResults": max_comments,
        "order": "relevance",
        "textFormat": "plainText",
        "key": API_KEY
    }
    response = requests.get(YOUTUBE_COMMENTS_URL, params=params).json()
    comments = []
    if "items" in response:
        for item in response["items"]:
            comment = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            comments.append(comment)
    while len(comments) < max_comments:
        comments.append("-")
    return comments[:max_comments]


sid = SentimentIntensityAnalyzer()


def get_sentiment_scores(comments):
    pos, neg, neu = 0, 0, 0
    count = 0
    for comm in comments:
        if comm == "-" or not comm:
            continue
        scores = sid.polarity_scores(comm)
        pos += scores['pos']
        neg += scores['neg']
        neu += scores['neu']
        count += 1
    if count > 0:
        return pos/count, neg/count, neu/count
    return 0, 0, 0


def run_trend_pipeline():
    """Runs the full trend analysis pipeline."""
    if os.path.exists(OUTPUT_CSV):
        os.remove(OUTPUT_CSV)

    with open(DISHES_CSV, "r", encoding="utf-8") as f:
        dish_list = [row.strip().lower() for row in f.readlines()]

    collected_rows = []
    videos = get_videos(SEARCH_QUERY, max_results=MAX_RESULTS)

    for v in videos:
        video_id = v["id"]["videoId"]
        stats = get_video_stats(video_id)
        if not stats:
            continue

        combined_text = clean_text(stats["title"] + " " + stats["description"])
        dish_match = get_best_dish_match(combined_text, dish_list)

        if not dish_match:
            continue

        comments = get_top_comments(video_id)
        pos, neg, neu = get_sentiment_scores(comments)

        collected_rows.append({
            "dish_name": dish_match.title(),
            "views": stats["views"],
            "likes": stats["likes"],
            "comments_count": stats["commentCount"],
            "positive": pos,
            "negative": neg,
            "neutral": neu
        })

    df = pd.DataFrame(collected_rows)
    if df.empty:
        print("⚠️ No data collected.")
        df.to_csv(OUTPUT_CSV, index=False)
        return

    agg_df = df.groupby("dish_name").agg({
        "views": "sum",
        "likes": "sum",
        "comments_count": "sum",
        "positive": "first",
        "negative": "first",
        "neutral": "first"
    }).reset_index()

    agg_df["popularity_score"] = (
        agg_df["positive"] * 100
        + agg_df["negative"] * -100
        + agg_df["neutral"] * 50
    ).round(2)

    agg_df = agg_df.sort_values(by="popularity_score", ascending=False)
    agg_df.to_csv(OUTPUT_CSV, index=False)
    update_last_run_date()
    print("✅ Monthly YouTube trends updated successfully.")


def monthly_trends_manager(force_refresh=False):
    """Run once per month unless forced."""
    if force_refresh or should_run_this_month():
        print("🗓 Running monthly update for YouTube trends...")
        run_trend_pipeline()
    else:
        print("⚙️ This month's trends already up-to-date. Skipping regeneration.")
