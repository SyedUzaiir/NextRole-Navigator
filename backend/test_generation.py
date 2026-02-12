import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path
import sys

# Add backend to path
sys.path.append(str(Path(__file__).resolve().parent))

from agent import get_course_content
from db import db

async def test_generation():
    course_name = "Advanced Python Pattern Matching"
    print(f"Testing generation for: {course_name}")
    
    # 1. Trigger Generation
    result = await get_course_content(course_name)
    
    if "error" in result:
        print(f"FAILED: {result['error']}")
        return
        
    print("Generation Successful!")
    print(f"Title: {result.get('title')}")
    print(f"Modules: {len(result.get('modules', []))}")
    
    if result.get('modules'):
        first_module = result['modules'][0]
        print(f"First Module: {first_module.get('moduleTitle')}")
        print(f"SubModules: {len(first_module.get('subModules', []))}")
        print(f"Quiz Questions: {len(first_module.get('quiz', []))}")
        
        if first_module.get('subModules'):
            first_sub = first_module['subModules'][0]
            print(f"First SubModule Video: {first_sub.get('videoURL')}")
            
    # 2. Verify Persistence
    saved_course = await db.courses.find_one({"title": result.get('title')})
    if saved_course:
        print("VERIFIED: Course saved to MongoDB")
    else:
        print("FAILED: Course not found in MongoDB")

if __name__ == "__main__":
    asyncio.run(test_generation())
