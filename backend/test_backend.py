import requests
import json

def test_api():
    url = "http://localhost:8000/api/recommendations"
    # We need a valid email from the DB. I'll use a dummy one or try to find one.
    # For now, let's just check if the endpoint is reachable and returns error for missing user
    
    try:
        response = requests.get(url, params={"email": "test@example.com"})
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Health check
        health = requests.get("http://localhost:8000/api/health")
        print(f"Health Check: {health.json()}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
