import requests
import json

BASE_URL = "http://localhost:8000"

def test_gap_analysis():
    print(f"Testing {BASE_URL}/gap_analysis?vendorId=vendor_01...")
    try:
        response = requests.get(f"{BASE_URL}/gap_analysis?vendorId=vendor_01", timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data["status"] == "success":
                print("✅ /gap_analysis returned success")
                # Check data structure
                citywide = data["data"].get("citywideData", [])
                if citywide and "category" in citywide[0]:
                    print("✅ 'category' field present in citywideData")
                else:
                    print("❌ 'category' field MISSING in citywideData or data empty")
                    print(f"Sample data: {citywide[:1]}")
            else:
                print(f"❌ API returned error status: {data}")
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    test_gap_analysis()
