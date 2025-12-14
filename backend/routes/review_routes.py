# review_routes.py
from flask import Blueprint, jsonify
from sheet_analyzer import fetch_all_google_sheet_data
from collections import Counter

review_routes = Blueprint("review_routes", __name__)

@review_routes.route("/reviews", methods=["GET"])
def get_reviews():
    try:
        data = fetch_all_google_sheet_data()

        # Debug: print number of records fetched
        print(f"[DEBUG] Number of reviews fetched: {len(data)}")

        if not data:
            return jsonify({
                "total_responses": 0,
                "category_insights": {},
                "city_insights": {},
                "recent_reviews": []
            })

        # Category count
        category_count = {}
        city_list = []

        for entry in data:
            category = entry.get("Category of Feedback", "Unknown")
            city = entry.get("City / Location", "Unknown")
            category_count[category] = category_count.get(category, 0) + 1
            city_list.append(city)

        city_count = dict(Counter(city_list))

        # Last 10 reviews
        recent_reviews = data[-10:][::-1]

        return jsonify({
            "total_responses": len(data),
            "category_insights": category_count,
            "city_insights": city_count,
            "recent_reviews": recent_reviews
        })

    except Exception as e:
        print("[ERROR] Failed to fetch reviews:", e)
        return jsonify({"error": "Failed to fetch reviews", "message": str(e)}), 500
