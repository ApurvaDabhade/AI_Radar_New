import re
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from config import GEMINI_MODEL, GOOGLE_API_KEY

# Set API key
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# Initialize Chat Model

# List of models to try
MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-2.0-flash-exp", GEMINI_MODEL, "gemini-1.5-flash", "gemini-pro"]

def get_chat_model(model_name):
    try:
        return ChatGoogleGenerativeAI(model=model_name, temperature=0.7)
    except Exception:
        return None

def clean_ai_output(text: str) -> str:
    """
    Remove Markdown bold (**text**) and bullet points (* or -) from AI output.
    """
    # Remove bold (**text**)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    # Remove bullets at the beginning of lines
    text = re.sub(r"^\s*[\*\-]\s+", "", text, flags=re.MULTILINE)
    return text

def generate_vendor_insights(insights_dict: dict) -> str:
    """
    Generate enhanced tourism & vendor insights using AI with fallback models.
    """
    top_places_text = ", ".join([p["Name Place"] for p in insights_dict["Top_Tourist_Spots"][:3]])
    
    system_msg = SystemMessage(
        content="You are an expert AI tourism and business analyst. Provide actionable, concise, and emoji-rich insights for vendors and tourists."
    )
    
    user_msg = HumanMessage(
        content=f"""
City: {insights_dict['City']}
Season: {insights_dict['Season']}
Weather: {insights_dict['Temp(°C)']}°C, {insights_dict['Conditions']}
Top Attractions: {top_places_text}

Generate: 3️⃣ Bullet Points with Icons
📈 Tourist Flow: Provide expected tourist density and peak hours.
💰 Vendor Opportunities: Suggest what vendors can sell, ideal locations, and any seasonal trends.
🍴 Day Suitability: Recommend best times or activities for tourists, considering weather and top attractions.
📝 Pro Tips: Include one extra actionable tip for vendors to maximize business.

Notes:
- Mention {top_places_text} naturally.
- Each bullet should be concise, 1-2 sentences max.
- Use emojis naturally to highlight key points.
"""
    )

    # Limit models to avoid long timeouts if quota is dead
    FAST_MODELS = ["gemini-1.5-flash", "gemini-pro"]
    
    for model_name in FAST_MODELS:
        try:
            # Check for API key before trying
            if not os.environ.get("GOOGLE_API_KEY"):
                return "AI Insights unavailable (Missing API Key)."

            chat_model = get_chat_model(model_name)
            if not chat_model:
                continue
            
            # Reduce timeout to fail fast if model is unresponsive
            # Add timeout to invoke if possible, otherwise rely on fast failure
            try:
                response = chat_model.invoke([system_msg, user_msg])
                if response and response.content:
                    return clean_ai_output(response.content)
            except Exception as inner_e:
                print(f"⚠️ Model invoke failed for {model_name}: {inner_e}")
                if "RESOURCE_EXHAUSTED" in str(inner_e):
                    return "AI Insights temporarily unavailable (Quota Limit Reached)."
                continue

        except Exception as e:
            print(f"⚠️ Model {model_name} failed: {e}")
            continue

    return "AI Insights unavailable at the moment. Please consult local guides."

