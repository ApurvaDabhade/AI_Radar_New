from flask import Flask, jsonify
from flask_cors import CORS
from gap_analysis import perform_gap_analysis
import pandas as pd

app = Flask(__name__)
CORS(app)
OUTPUT_CSV = "output.csv"

@app.route("/gap_analysis", methods=["GET"])
def gap_analysis_route():
    try:
        result = perform_gap_analysis()
        return jsonify({"status": "success", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/food-trends", methods=["GET"])
def food_trends():
    try:
        df = pd.read_csv(OUTPUT_CSV)
        data = df.to_dict(orient="records")
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
