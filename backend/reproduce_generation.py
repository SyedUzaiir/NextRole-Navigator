import requests
import json
import sys

def test_generate_course():
    url = "http://127.0.0.1:8000/api/generate-gap-course"
    
    payload = {
        "missingSkills": ["React", "Node.js"],
        "currentSkills": ["HTML", "CSS", "JavaScript"],
        "email": "tech.explorer@example.com"
    }
    
    print(f"Calling {url} with payload: {payload}")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            if response.status_code != 200:
                 print(f"Error Details: {data}")
            else:
                 print("Success!")
                 # print(json.dumps(data, indent=2)) 
        except json.JSONDecodeError:
            print(f"Failed to parse JSON. Raw text: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_generate_course()
