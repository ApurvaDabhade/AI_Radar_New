from flask import Blueprint, request, jsonify
from datetime import datetime
from services.data_service import get_top_places
from services.calendar_service import get_calendar_events, generate_calendar_flags
from services.weather_service import get_weather
from services.ai_service import generate_vendor_insights

tourism_routes = Blueprint('tourism_routes', __name__)

@tourism_routes.route('/tourism', methods=['POST'])
def tourism_api():
    data = request.get_json()
    city = data.get("city")
    state = data.get("state")
    date_input = data.get("date")

    if not city or not state or not date_input:
        return jsonify({"error": "city, state, and date are required"}), 400

    # Try parsing date in multiple formats
    try:
        try:
            check_date = datetime.strptime(date_input, "%Y-%m-%d")
        except ValueError:
            check_date = datetime.strptime(date_input, "%d-%m-%Y")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD or DD-MM-YYYY"}), 400

    # Calendar flags
    start_date = datetime(check_date.year, 1, 1)
    end_date = datetime(check_date.year, 12, 31)
    event_dates = get_calendar_events(start_date, end_date)
    calendar_flags = generate_calendar_flags(check_date, event_dates)

    # Weather info
    weather_info = get_weather(city, check_date.strftime("%Y-%m-%d"))

    # Top tourist spots
    top_places = get_top_places(city, state)
    if not top_places:
        return jsonify({"error": f"No data found for {city}, {state}"}), 404

    # Compose final insights
    insights = {
        "City": city,
        "State": state,
        "Date": check_date.strftime("%Y-%m-%d"),
        **calendar_flags,
        **weather_info,
        "Top_Tourist_Spots": top_places
    }

    # Generate AI insights
    insights["AI_Insights"] = generate_vendor_insights(insights)

    return jsonify(insights)
