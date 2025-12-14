# insight_backend.py
import pandas as pd

# ==============================
# Stub for safe testing
# ==============================

# Dummy preprocess function
def preprocess_data(dish_df=None, price_df=None):
    return pd.DataFrame(), pd.DataFrame()

# Dummy insight function
def get_insight_for_dish(dish_name):
    return {
        "dish": dish_name.title(),
        "ingredients": [],
        "weather": {},
        "insight": "No insight available."
    }
