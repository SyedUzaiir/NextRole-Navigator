import asyncio
import os
import sys

# Add parent directory to path to allow imports if needed, 
# though running from backend dir should be fine for sibling imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from agent import generate_upskilling_course
    from db import db
except ImportError:
    # Fallback for different running contexts
    try:
        from backend.agent import generate_upskilling_course
        from backend.db import db
    except ImportError as e:
        print(f"Import failed: {e}")
        sys.exit(1)

async def test_direct():
    print("--- Starting Direct Debug ---")
    
    # Check simple things first
    print(f"DB Object: {db}")
    if db is None:
        print("CRITICAL: 'db' object is None. Check MONGODB_URI in .env.local")
    
    missing_skills = ["React", "Node.js"]
    current_skills = ["HTML", "CSS", "JavaScript"]
    
    print(f"Testing generate_upskilling_course with missing={missing_skills}")
    
    try:
        result = await generate_upskilling_course(missing_skills, current_skills)
        if "error" in result:
             print(f"Function returned error: {result['error']}")
        else:
             print("Success! Course generated.")
             print(f"Title: {result.get('title')}")
             
    except Exception as e:
        print(f"EXCEPTION CAUGHT: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_direct())
