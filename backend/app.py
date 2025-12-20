# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv  # ✅ Import dotenv
import os

# Load environment variables
load_dotenv()

from routes.chat_routes import chat_routes
from routes.tourism_routes import tourism_routes
from models.orchestrator import suggest_items_orchestrator
from insight_routes import insight_routes
from routes.review_routes import review_routes
from sheet_analyzer import fetch_all_google_sheet_data
from gap_analysis import perform_gap_analysis
import pandas as pd
from pymongo import MongoClient
from bson.objectid import ObjectId

# =====================================================
# App Configuration
# =====================================================
app = Flask(__name__)
CORS(app)

# =====================================================
# MongoDB Setup for Inventory
# =====================================================
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
print(f"🔌 Connecting to MongoDB: {MONGO_URI.split('@')[-1] if '@' in MONGO_URI else 'Localhost'}") # Log connection target
client = MongoClient(MONGO_URI)
db = client["inventoryDB"]
inventory_collection = db["items"]

# =====================================================
# Blueprints
# =====================================================
app.register_blueprint(chat_routes, url_prefix="/api")
app.register_blueprint(tourism_routes, url_prefix="/api")
app.register_blueprint(insight_routes, url_prefix="/api")
app.register_blueprint(review_routes, url_prefix="/api")  # ✅ Reviews backend

# =====================================================
# Constants
# =====================================================
OUTPUT_CSV = "output.csv"  # For food trends

# =====================================================
# Root Route
# =====================================================
@app.route('/')
def home():
    return jsonify({
        "message": "Startup Mitra, Tourism, Insights & Reviews Backend Running 🚀",
        "services": {
            "chatbot": "/api/chat",
            "menu_suggestion": "/api/suggest",
            "tourism": "/api/tourism",
            "inventory": "/api/inventory",
            "insight": "/api/insight?dish=Masala Karela",
            "reviews": "/api/reviews",
            "google_reviews": "/api/google-reviews",
            "gap_analysis": "/gap_analysis",
            "food_trends": "/api/food-trends"
        }
    })

# =====================================================
# AI Radar Suggestion Route
# =====================================================
@app.route("/api/suggest", methods=["POST"])
def suggest():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400

        order_date = data.get("order_date")
        dish_name = data.get("dish_name")
        language = data.get("language", "English")
        option = data.get("option", "both")

        if not order_date or not dish_name:
            return jsonify({"error": "Both 'order_date' and 'dish_name' are required"}), 400

        result = suggest_items_orchestrator(order_date, dish_name, language, option)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": "Server Error", "message": str(e)}), 500

# =====================================================
# Inventory Routes
# =====================================================
@app.route("/api/inventory", methods=["GET"])
def get_inventory():
    items = []
    for item in inventory_collection.find():
        item["_id"] = str(item["_id"])
        items.append(item)
    return jsonify(items)

@app.route("/api/inventory", methods=["POST"])
def add_inventory_item():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON payload provided"}), 400

    quantity = data.get("quantity", 0)
    status = data.get("status")
    if not status:
        if quantity > 10:
            status = "good"
        elif quantity > 5:
            status = "low"
        else:
            status = "critical"

    item = {
        "name": data.get("name"),
        "quantity": quantity,
        "unit": data.get("unit"),
        "status": status,
        "expiryDays": data.get("expiryDays", 0),
        "recommendation": data.get("recommendation", "")
    }
    result = inventory_collection.insert_one(item)
    item["_id"] = str(result.inserted_id)
    return jsonify(item)

@app.route("/api/inventory/<item_id>", methods=["PUT"])
def update_inventory_item(item_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON payload provided"}), 400

    result = inventory_collection.update_one({"_id": ObjectId(item_id)}, {"$set": data})
    if result.matched_count == 0:
        return jsonify({"error": "Item not found"}), 404

    updated_item = inventory_collection.find_one({"_id": ObjectId(item_id)})
    updated_item["_id"] = str(updated_item["_id"])
    return jsonify(updated_item)

@app.route("/api/inventory/<item_id>", methods=["DELETE"])
def delete_inventory_item(item_id):
    result = inventory_collection.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        return jsonify({"error": "Item not found"}), 404
    return jsonify({"message": "Item deleted successfully"})

# =====================================================
# Google Form Reviews Route
# =====================================================
@app.route("/api/google-reviews", methods=["GET"])
def google_reviews():
    try:
        data = fetch_all_google_sheet_data()
        return jsonify({
            "total_responses": len(data),
            "recent_reviews": data[-10:][::-1]  # Last 10 reviews
        })
    except Exception as e:
        return jsonify({"error": "Failed to fetch Google Form reviews", "message": str(e)}), 500

# =====================================================
# Gap Analysis Route
# =====================================================
@app.route("/gap_analysis", methods=["GET"])
def gap_analysis_route():
    try:
        result = perform_gap_analysis()
        return jsonify({"status": "success", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# =====================================================
# Food Trends Route
# =====================================================
@app.route("/api/food-trends", methods=["GET"])
def food_trends():
    try:
        df = pd.read_csv(OUTPUT_CSV)
        data = df.to_dict(orient="records")
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# =====================================================
# Run Flask App
# =====================================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    debug_mode = os.environ.get("DEBUG", "True").lower() == "true"
    print(f"🚀 Starting Combined Flask Backend on port {port} (debug={debug_mode})")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
