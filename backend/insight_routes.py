from flask import Blueprint, request, jsonify
from insight_backend import get_insight_for_dish

insight_routes = Blueprint("insight_routes", __name__)

@insight_routes.route("/insight", methods=["GET"])
def insight():
    dish = request.args.get("dish", "Masala Karela")
    try:
        result = get_insight_for_dish(dish)
        if "error" in result:
            return jsonify({"error": result["error"]}), 404
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": "Server Error", "message": str(e)}), 500
