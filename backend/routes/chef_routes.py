from flask import Blueprint, request, jsonify
from models.orchestrator import suggest_items_orchestrator

chef_routes = Blueprint("chef_routes", __name__)

@chef_routes.route("/suggest", methods=["POST"])
def suggest_items():
    data = request.get_json()

    order_date = data.get("order_date")
    dish_name = data.get("dish_name")
    language = data.get("language", "English")
    option = data.get("option", "both")

    if not order_date or not dish_name:
        return jsonify({"error": "order_date and dish_name required"}), 400

    result = suggest_items_orchestrator(order_date, dish_name, language, option)
    return jsonify(result)
