import re
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from config import GEMINI_MODEL, GOOGLE_API_KEY

# Set API key
os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

# Initialize Chat Model
chat_model = ChatGoogleGenerativeAI(model=GEMINI_MODEL, temperature=0.7)

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
    Generate enhanced tourism & vendor insights for a city and return cleaned text.
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
    
    response = chat_model([system_msg, user_msg])
    clean_text = clean_ai_output(response.content)
    return clean_text
