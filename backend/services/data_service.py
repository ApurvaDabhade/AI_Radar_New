import pandas as pd
from config import DATA_PATH

df = pd.read_csv(DATA_PATH)
df.columns = [col.strip() for col in df.columns]

def get_top_places(city: str, state: str, top_n=5):
    city_data = df[(df['City'].str.lower() == city.lower()) & (df['State'].str.lower() == state.lower())]
    if city_data.empty:
        return []
    top_places = city_data.sort_values(by="Weighted_Score", ascending=False).head(top_n)
    return top_places[['Name Place', 'Rating', 'Rank_in_City']].to_dict(orient='records')
