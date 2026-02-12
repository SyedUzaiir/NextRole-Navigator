import requests
import json

def test_recommendations():
    email = "test@example.com"
    url = f"http://127.0.0.1:8000/api/recommendations?email={email}"
    
    print(f"Calling {url}...")
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Raw Response Text: '{response.text}'")
        
        try:
            data = response.json()
            print(f"Parsed JSON: {data}")
        except json.JSONDecodeError:
            print("Failed to parse JSON")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_recommendations()
