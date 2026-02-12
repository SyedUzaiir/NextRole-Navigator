import requests
import json

url = "http://localhost:8000/api/get-course-content"
payload = {"course_name": "Python for Beginners"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
        if "modules" in data and len(data["modules"]) >= 15:
             print("SUCCESS: Received 15+ modules")
        else:
             print(f"WARNING: Received {len(data.get('modules', []))} modules")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
