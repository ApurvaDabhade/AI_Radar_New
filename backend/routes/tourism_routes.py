from flask import Blueprint, request, jsonify
from datetime import datetime
from services.data_service import get_top_places
from services.calendar_service import get_calendar_events, generate_calendar_flags
from services.weather_service import get_weather
from services.ai_service import generate_vendor_insights

tourism_routes = Blueprint("tourism_routes", __name__)

@tourism_routes.route("/tourism", methods=["POST"])
def tourism_api():
    data = request.get_json()

    city = data.get("city")
    state = data.get("state")
    date_input = data.get("date")

    if not city or not state or not date_input:
        return jsonify({"error": "city, state, and date are required"}), 400

    try:
        try:
            check_date = datetime.strptime(date_input, "%Y-%m-%d")
        except ValueError:
            check_date = datetime.strptime(date_input, "%d-%m-%Y")
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    event_dates = get_calendar_events(
        datetime(check_date.year, 1, 1),
        datetime(check_date.year, 12, 31)
    )

    calendar_flags = generate_calendar_flags(check_date, event_dates)
    weather_info = get_weather(city, check_date.strftime("%Y-%m-%d"))
    top_places = get_top_places(city, state)

    # Filter upcoming events (next 30 days)
    upcoming_events = []
    for date_str, event_name in event_dates.items():
        try:
            event_date = datetime.strptime(date_str, "%Y-%m-%d")
            delta = (event_date - check_date).days
            if 0 <= delta <= 30:
                upcoming_events.append({"date": date_str, "event": event_name, "days_away": delta})
        except ValueError:
            continue
    
    # Sort by date
    upcoming_events.sort(key=lambda x: x["days_away"])

    if not top_places:
        return jsonify({"error": "No tourist data found"}), 404

    insights = {
        "City": city,
        "State": state,
        "Date": check_date.strftime("%Y-%m-%d"),
        **calendar_flags,
        **weather_info,
        "Top_Tourist_Spots": top_places,
        "Upcoming_Events": upcoming_events
    }

    insights["AI_Insights"] = generate_vendor_insights(insights)
    return jsonify(insights)
