from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
import os
import re

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

chat_routes = Blueprint("chat_routes", __name__)

# --------------------------------------------------
# 🔑 API KEY FIX (MOST IMPORTANT)
# --------------------------------------------------
if os.environ.get("GEMINI_API_KEY") and not os.environ.get("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

if not os.environ.get("GOOGLE_API_KEY"):
    raise RuntimeError("❌ GOOGLE_API_KEY not found")

# --------------------------------------------------
# 🤖 Gemini Model
# --------------------------------------------------
# --------------------------------------------------
# 🤖 Gemini Model Helpers
# --------------------------------------------------
def get_chat_model(model_name="gemini-1.5-flash"):
    try:
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0.5,
            timeout=10  # ⚡ Fail fast (10s) to try next model
        )
    except Exception:
        return None

def clean_text(text: str) -> str:
    text = re.sub(r"[*#>-]+", "", text)
    return text.strip()

# --------------------------------------------------
# 📡 CHAT ENDPOINT
# --------------------------------------------------
@chat_routes.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({
                "text": "Please ask something 🙂",
                "suggestions": ["Start Business", "License Help"]
            })

        system_msg = SystemMessage(
            content=(
                "You are Startup Mitra, an expert Indian food business consultant. "
                "Provide helpful, detailed, and practical advice. "
                "Explain concepts clearly in simple language. "
                "Use bullet points if needed for clarity. "
                "Focus on actionable steps for a small business owner."
            )
        )

        user_msg = HumanMessage(content=user_message)

        # ✅ ROBUST MODEL INVOCATION
        models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-pro"]
        response_content = None

        for model_name in models_to_try:
            try:
                model = get_chat_model(model_name)
                if not model:
                    continue
                response = model.invoke([system_msg, user_msg])
                if response and response.content:
                    response_content = response.content
                    break
            except Exception as e:
                print(f"⚠️ Chat Request failed with {model_name}: {e}")
                continue
        
        if not response_content:
             return jsonify({
                "text": "Sorry, I’m having trouble thinking right now. Please try again.",
                "suggestions": ["Try Again"]
            }), 500

        reply = clean_text(response_content)

        return jsonify({
            "text": reply,
            "suggestions": [
                "Increase Sales",
                "Fix Menu Prices",
                "Best Location",
                "License Help"
            ]
        })

    except Exception as e:
        print("❌ Gemini Error:", e)
        return jsonify({
            "text": "Sorry, I’m having trouble right now. Please try again.",
            "suggestions": ["Try Again"]
        }), 500
