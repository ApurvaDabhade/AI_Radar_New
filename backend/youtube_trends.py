import csv
import re
import requests
import pandas as pd
from rapidfuzz import process
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
import dotenv
from dotenv import load_dotenv
import os

# Make sure to download vader lexicon once if not done
nltk.download("vader_lexicon")
load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")
SEARCH_QUERY = "Indian street food"
MAX_RESULTS = 500

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos"
YOUTUBE_COMMENTS_URL = "https://www.googleapis.com/youtube/v3/commentThreads"

DISHES_CSV = "indian_dishes_200.csv"
OUTPUT_CSV = "output.csv"

# Load dish names
with open(DISHES_CSV, "r", encoding="utf-8") as f:
    dish_list = [row.strip().lower() for row in f.readlines()]

# Helper: clean text for matching
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9 ]", " ", text)
    return text

# Fuzzy dish match
def get_best_dish_match(text, dish_list, threshold=70):
    match, score, _ = process.extractOne(text, dish_list)
    return match if score >= threshold else None

# Fetch videos
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

# Fetch video stats
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

# Fetch top comments
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

# Sentiment analyzer init
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
    else:
        return 0, 0, 0

def main():
    collected_rows = []
    videos = get_videos(SEARCH_QUERY, max_results=MAX_RESULTS)

    for v in videos:
        video_id = v["id"]["videoId"]
        # Fetch video details & stats
        stats = get_video_stats(video_id)
        if not stats:
            continue

        combined_text = clean_text(stats["title"] + " " + stats["description"])
        dish_match = get_best_dish_match(combined_text, dish_list)

        if not dish_match:
            continue

        # Fetch comments
        comments = get_top_comments(video_id)

        # Sentiment scores per video
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

    # Aggregate by dish, summing reach but keeping sentiments from first occurrence
    df = pd.DataFrame(collected_rows)
    if df.empty:
        print("No data collected.")
        return

    agg_df = df.groupby("dish_name").agg({
        "views": "sum",
        "likes": "sum",
        "comments_count": "sum",
        "positive": "first",
        "negative": "first",
        "neutral": "first"
    }).reset_index()

    # Calculate popularity score
    agg_df["popularity_score"] = (agg_df["positive"] * 100) + (agg_df["negative"] * -100) + (agg_df["neutral"] * 50)
    agg_df["popularity_score"] = agg_df["popularity_score"].round(2)

    # Sort descending by popularity score
    agg_df = agg_df.sort_values(by="popularity_score", ascending=False)

    # Save full table
    agg_df.to_csv(OUTPUT_CSV, index=False)
    print(f"✅ All data saved to {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
