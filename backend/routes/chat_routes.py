# routes/chat_routes.py

from flask import Blueprint, request, jsonify
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
import re
from memory.memory_handler import add_message, get_memory_messages

load_dotenv()
chat_routes = Blueprint('chat_routes', __name__)

# Initialize Gemini model
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=os.getenv("GOOGLE_API_KEY")
)

def clean_response(text: str) -> str:
    """Remove markdown-style bullets, symbols, and extra whitespace."""
    text = re.sub(r"[-*•#>]+", "", text)  # ✅ no regex error now
    text = re.sub(r"\s+", " ", text).strip()  # remove multiple spaces/newlines
    return text


@chat_routes.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_input = data.get("message", "").strip()

        if not user_input:
            return jsonify({"reply": "Please type something to ask!"})

        # 1️⃣ Add user message to memory
        add_message("user", user_input)

        # 2️⃣ Retrieve recent messages for context
        memory_messages = get_memory_messages()
        conversation_context = ""
        for msg in memory_messages[-6:]:  # Limit to last few messages
            role = "User" if msg.type == "human" else "Assistant"
            conversation_context += f"{role}: {msg.content}\n"

        # 3️⃣ Create context-aware system prompt
        prompt = (
            "You are Startup Mitra, a friendly Indian business advisor. "
            "Use the conversation history below to provide contextual advice. "
            "You help users with 1) Menu suggestions, 2) Location advice, 3) Supplier connections, "
            "and 4) Business basics. "
            "Always answer in a simple and concise way — no markdown, bullets, or formatting.\n\n"
            f"{conversation_context}\nAssistant:"
        )

        # 4️⃣ Get AI-generated reply
        response = model.invoke(prompt)
        bot_reply = getattr(response, "content", str(response))

        # 5️⃣ Clean and simplify AI reply
        clean_reply = clean_response(bot_reply)

        # 6️⃣ Store bot message in memory
        add_message("bot", clean_reply)

        return jsonify({"reply": clean_reply})

    except Exception as e:
        print("❌ Error in /chat:", e)
        return jsonify({"reply": "Sorry, something went wrong while processing your request."})
