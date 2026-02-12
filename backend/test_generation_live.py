import requests
import json
import sys

API_URL = "http://127.0.0.1:8000/api/generate-gap-course"

payload = {
    "missingSkills": ["Advanced Graph Algorithms", "Dynamic Programming Optimization"],
    "currentSkills": ["Basic Graph Traversal", "Recursion", "Python Basics"],
    "email": "tech.explorer@example.com"
}

try:
    print(f"Sending request to {API_URL}...")
    response = requests.post(API_URL, json=payload, timeout=120) # Long timeout for AI generation
    response.raise_for_status()
    
    data = response.json()
    
    print("\n--- Verification Results ---")
    print(f"Course Title: {data.get('title')}")
    
    modules = data.get("modules", [])
    print(f"Module Count: {len(modules)}")
    
    errors = []
    
    for i, module in enumerate(modules):
        title = module.get("moduleTitle", "N/A")
        sub_modules = module.get("subModules", [])
        quiz = module.get("quiz", [])
        
        print(f"\nModule {i+1}: {title}")
        print(f"  - Sub-module count: {len(sub_modules)}")
        print(f"  - Quiz question count: {len(quiz)}")
        
        # Check constraints
        if "Section" in title or "Module" in title and len(title) < 10:
             errors.append(f"Module {i+1} has generic title: {title}")
             
        if len(sub_modules) != 3:
             errors.append(f"Module {i+1} has {len(sub_modules)} sections (expected 3)")
             
        if not (3 <= len(quiz) <= 5):
             errors.append(f"Module {i+1} Quiz has {len(quiz)} questions (expected 3-5)")
             
        for sm in sub_modules:
            sm_title = sm.get("subTitle", "")
            if "Section" in sm_title or "Part" in sm_title and len(sm_title) < 10:
                errors.append(f"  - Sub-module has generic title: {sm_title}")

    if errors:
        print("\n[FAIL] specific constraints violated:")
        for e in errors:
            print(f"- {e}")
        sys.exit(1)
    else:
        print("\n[PASS] All structural constraints met.")
        sys.exit(0)

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
