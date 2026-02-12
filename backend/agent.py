from pathlib import Path
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re
import asyncio
from typing import List, Dict, Any

# Robustly load .env.local from the project root
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env.local"
print(f"DEBUG: Loading .env from: {env_path}")
print(f"DEBUG: File exists: {env_path.exists()}")

load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not set")
    # Try loading from current directory as fallback
    load_dotenv()
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        print("DEBUG: Found key in current directory .env")

genai.configure(api_key=GEMINI_API_KEY)

# Generation Configuration
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-flash-latest",
    generation_config=generation_config,
)

# Search Tool using google-api-python-client
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

try:
    from db import db
except ImportError:
    from backend.db import db

def extract_json(text):
    """
    Robustly extracts JSON from text, handling markdown code blocks and extra text.
    """
    try:
        # 1. Try direct parsing
        return json.loads(text)
    except json.JSONDecodeError:
        pass
        
    # 2. Extract from code blocks
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
            
    # 3. Simple brace finding (fallback)
    try:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            return json.loads(text[start:end+1])
    except json.JSONDecodeError:
        pass
        
    print(f"DEBUG: Failed to extract JSON from: {text[:100]}...")
    return None

async def generate_with_retry(prompt, retries=2):
    """
    Generates content with retry logic for JSON errors.
    """
    for attempt in range(retries):
        try:
            response = await model.generate_content_async(prompt)
            data = extract_json(response.text)
            if data:
                return data
            print(f"Warning: JSON extraction failed (Attempt {attempt+1}/{retries})")
        except Exception as e:
            print(f"Warning: Generation error (Attempt {attempt+1}/{retries}): {e}")
            if "Quota" in str(e) or "429" in str(e):
                wait_time = 10 * (attempt + 1)
                print(f"Rate limit hit. Waiting {wait_time}s...")
                await asyncio.sleep(wait_time)
            
    return None

async def fetch_video_for_topic(primary_query: str, fallback_query: str = None):
    """
    Searches YouTube for a video related to the topic.
    Uses a fallback mechanism if the specific query fails.
    Returns a default video if API fails (e.g. quota exceeded).
    """
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    
    # Default video to prevent black screen
    default_video = {
        "videoId": "dQw4w9WgXcQ", # Rick Roll as placeholder, or a generic tech intro
        "title": f"Tutorial: {primary_query}",
        "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg",
        "channelTitle": "NextRole Navigator",
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }

    if not YOUTUBE_API_KEY:
        print("Warning: YOUTUBE_API_KEY not set")
        return default_video

    try:
        youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
        
        # 1. Try specific search
        search_response = youtube.search().list(
            q=primary_query,
            part="snippet",
            type="video",
            maxResults=1
        ).execute()
        
        items = search_response.get("items", [])
        
        # 2. Fallback if no results
        if not items and fallback_query:
            print(f"DEBUG: No results for '{primary_query}', trying fallback: '{fallback_query}'...")
            search_response = youtube.search().list(
                q=fallback_query,
                part="snippet",
                type="video",
                maxResults=1
            ).execute()
            items = search_response.get("items", [])
            
        if items:
            item = items[0]
            video_id = item["id"]["videoId"]
            title = item["snippet"]["title"]
            thumbnail = item["snippet"]["thumbnails"]["high"]["url"]
            channel_title = item["snippet"]["channelTitle"]
            
            # print(f"DEBUG: Found video for '{primary_query}': {video_id}")
            
            return {
                "videoId": video_id,
                "title": title,
                "thumbnail": thumbnail,
                "channelTitle": channel_title,
                "url": f"https://www.youtube.com/watch?v={video_id}"
            }
            
    except HttpError as e:
        print(f"YouTube API Error (likely quota): {e}")
        return default_video
    except Exception as e:
        print(f"Error fetching video for query '{primary_query}': {e}")
        return default_video
        
    return default_video

async def generate_course_outline(course_name: str):
    """
    Generates the course outline: Modules and Sub-modules titles only.
    """
    prompt = f"""
    You are an expert curriculum designer.
    Create a detailed course outline for: "{course_name}".
    
    The course should have 5-7 Modules.
    **CRITICAL CONSTRAINT**: Each Module MUST have EXACTLY 3 Sub-modules (Sections).
    
    **NAMING CONVENTION**:
    Every sub-module title MUST follow this exact format: "Section [Number]: [Descriptive Name]"
    - Example: "Section 1: Introduction to Variables"
    - Example: "Section 2: Understanding Data Types"
    - Example: "Section 3: Type Casting in Python"
    
    Ensure the "Descriptive Name" is meaningful and specific to the topic. Do NOT use generic names like "Introduction" or "Basics".
    
    Output JSON format:
    {{
        "title": "{course_name}",
        "description": "Comprehensive guide to {course_name}",
        "category": "Technical",
        "modules": [
            {{
                "moduleTitle": "String",
                "subModules": [
                    {{ "subTitle": "Section 1: String" }},
                    {{ "subTitle": "Section 2: String" }},
                    {{ "subTitle": "Section 3: String" }}
                ]
            }}
        ]
    }}
    """
    
    try:
        print(f"DEBUG: Generating outline for: {course_name}")
        return await generate_with_retry(prompt)
    except Exception as e:
        print(f"Error generating outline: {e}")
        return None

async def generate_module_details(course_name: str, module_title: str, sub_modules: List[Dict]):
    """
    Generates detailed content for a single module:
    - Explanations and Examples for each sub-module.
    - A Quiz for the module.
    """
    sub_module_titles = [sm["subTitle"] for sm in sub_modules]
    
    prompt = f"""
    You are a Senior Curriculum Architect and DSA Expert.
    
    Task: Generate detailed content for the module "{module_title}" of the course "{course_name}".
    
    Sub-modules to cover: {sub_module_titles}
    
    1. For EACH sub-module, provide:
       - "explanation": A detailed, clear explanation (2-3 paragraphs).
       - "examples": A practical code example or real-world scenario string.
       - "youtube_query": A specific search query to find a relevant YouTube video for this sub-topic.
    
    2. **MANDATORY**: Create a Quiz for this module.
       - The quiz MUST be included in the output.
       - 3-5 Multiple Choice Questions (MCQs) testing understanding of these sub-modules.
       - The questions can be conceptual or code-based.
    
    Output JSON format:
    {{
        "subModulesContent": [
            {{
                "subTitle": "String (Must match input)",
                "explanation": "String",
                "examples": "String",
                "youtube_query": "String"
            }}
        ],
        "quiz": [
            {{
                "question": "String",
                "options": ["String", "String", "String", "String"],
                "correctAnswer": "String (Must be one of the options)"
            }}
        ]
    }}
    """
    
    try:
        # print(f"DEBUG: Generating details for module: {module_title}")
        details = await generate_with_retry(prompt)
        return module_title, details # Return tuple for easy mapping
    except Exception as e:
        print(f"Error generating module details: {e}")
        return module_title, None

async def process_module(course_name, module_title, sub_modules_outline, missing_skill_focus=""):
    """
    Helper to process a single module: generate details (videos fetched lazily on demand).
    """
    print(f"DEBUG: Processing module: {module_title}...")

    # 1. Generate text content (in parallel with other modules, but here sequential within module)
    _, details = await generate_module_details(course_name, module_title, sub_modules_outline)

    if not details:
        print(f"Error: Could not generate details for module {module_title}")
        return None

    final_sub_modules = []
    content_map = {item["subTitle"]: item for item in details.get("subModulesContent", [])}

    # 2. Build sub-modules with youtube_query stored for lazy loading
    for sm_outline in sub_modules_outline:
        title = sm_outline["subTitle"]
        content = content_map.get(title, {})
        query = content.get("youtube_query", f"{title} tutorial {missing_skill_focus}")

        final_sub_modules.append({
            "subTitle": title,
            "explanation": content.get("explanation", "Content generation failed."),
            "examples": content.get("examples", "No examples provided."),
            "youtubeQuery": query,  # Store query for lazy loading
            "videoURL": "",  # Will be fetched on-demand
            "isCompleted": False
        })

    return {
        "moduleTitle": module_title,
        "isCompleted": False,
        "moduleScore": 0,
        "subModules": final_sub_modules,
        "quiz": details.get("quiz", [])
    }

async def generate_full_course(course_name: str):
    """
    Orchestrates the full generation process:
    1. Generate Outline.
    2. For each module, generate details and fetch videos (PARALLEL).
    3. Construct the final object.
    4. Save to MongoDB.
    """
    # 1. Generate Outline
    outline = await generate_course_outline(course_name)
    if not outline:
        return {"error": "Failed to generate course outline"}
    
    # 2. Process all modules in parallel
    tasks = []
    for module in outline.get("modules", []):
         tasks.append(process_module(course_name, module["moduleTitle"], module.get("subModules", [])))
    
    print(f"DEBUG: Starting parallel generation for {len(tasks)} modules...")
    results = await asyncio.gather(*tasks)
    
    final_modules = [r for r in results if r is not None]
        
    # 3. Construct Final Course Object
    course_data = {
        "title": outline.get("title", course_name),
        "description": outline.get("description", ""),
        "category": outline.get("category", "General"),
        "status": "active",
        "totalProgress": 0,
        "modules": final_modules
    }
    
    # 4. Save to MongoDB
    try:
        existing = await db.courses.find_one({"title": course_data["title"]})
        if existing:
            await db.courses.update_one({"_id": existing["_id"]}, {"$set": course_data})
            print(f"DEBUG: Updated existing course: {course_data['title']}")
        else:
            await db.courses.insert_one(course_data)
            print(f"DEBUG: Inserted new course: {course_data['title']}")
            
        return course_data
    except Exception as e:
        print(f"Error saving to DB: {e}")
        return {"error": f"Database error: {str(e)}"}

async def get_course_content(course_name: str):
    """
    Retrieves course content.
    1. Checks MongoDB first.
    2. If not found, triggers full generation (which saves to DB).
    3. Returns the course object.
    """
    try:
        # 1. Check DB
        print(f"DEBUG: Checking DB for course: {course_name}")
        course = await db.courses.find_one({"title": {"$regex": f"^{re.escape(course_name)}$", "$options": "i"}})
        
        if course:
            print("DEBUG: Found course in DB")
            if "_id" in course:
                course["_id"] = str(course["_id"])
            return course
            
        # 2. Generate if not found
        print("DEBUG: Course not found, generating new content...")
        return await generate_full_course(course_name)
        
    except Exception as e:
        print(f"Error in get_course_content: {e}")
        return {"error": str(e)}

async def get_recommendations_with_links(current_role: str):
    prompt = f"""
    You are an expert career coach.
    User role: "{current_role}".
    Generate 2-3 courses (Mastering {current_role}, Transitioning to Next Level).
    Output JSON: {{ "courses": [ {{ "title": "...", "description": "...", "topics": ["..."] }} ] }}
    """
    try:
        return await generate_with_retry(prompt)
    except:
        return None

async def analyze_skill_gap(employee_skills: List[str], target_role: str, target_role_skills: List[str]):
    """
    Analyzes the gap between employee skills and target role skills using Gemini.
    """
    prompt = f"""
    You are an expert career coach and skills analyst.
    
    Employee Current Skills: {json.dumps(employee_skills)}
    Target Role: "{target_role}"
    Target Role Required Skills: {json.dumps(target_role_skills)}
    
    Task:
    1. Compare the employee's current skills against the target role's required skills.
    2. Identify Missing Skills (consider semantic relevance, e.g., "React.js" matches "React").
    3. Calculate a Match Percentage (0-100).
    4. Estimate the Time required to bridge the gap (e.g., "3 weeks", "2 months").
    5. Provide 2-3 specific, actionable Upskilling Recommendations.
    
    Output strictly valid JSON:
    {{
      "missingSkills": ["Skill A", "Skill B"],
      "matchPercentage": 75,
      "estimatedTime": "4 weeks",
      "recommendations": ["Take course X", "Build project Y"]
    }}
    """
    
    try:
        print(f"DEBUG: Analyzing skill gap for target role: {target_role}")
        result = await generate_with_retry(prompt)
        
        if not result:
            return {"error": "Failed to generate skill gap analysis. Please try again."}
            
        return result
    except Exception as e:
        print(f"Error analyzing skill gap: {e}")
        return {"error": str(e)}

async def generate_upskilling_course(missing_skills: List[str], current_skills: List[str], email: str = None):
    """
    Generates a targeted upskilling course to bridge the skill gap.
    """
    course_name = f"Upskilling: Bridging the Gap to {missing_skills[0] if missing_skills else 'Next Level'}"
    
    # Look up user if email provided
    user_id = None
    if email:
        try:
            print(f"DEBUG: Looking up user for email: {email}")
            user = await db.users.find_one({"email": email})
            if user:
                user_id = user["_id"]
                print(f"DEBUG: Found user ID: {user_id}")
            else:
                print(f"Warning: No user found for email {email}")
        except Exception as e:
            print(f"Error looking up user: {e}")

    # 1. Generate Outline focused on missing skills
    prompt = f"""
    You are a Senior Curriculum Architect and DSA Expert.
    
    Task: Create a highly targeted course outline to bridge the skill gap for these specific missing skills: {json.dumps(missing_skills)}.
    The learner already knows: {json.dumps(current_skills)}, so DO NOT cover basics regarding those.
    
    Requirements:
    1.  **No Generic Placeholders**: Never use "Section 1", "Module 2", etc. Every title must be meaningful and context-specific (e.g., "Implementing Advanced Binary Search").
    2.  **Module Depth**: Create exactly 3 Modules.
    3.  **Section Depth**: Each Module MUST have EXACTLY 3 Sub-modules (Sections).
    4.  **Descriptive Titles**: Ensure all titles are descriptive and focused on the learning objective.
    5.  **NAMING CONVENTION**: Every sub-module title MUST follow this exact format: "Section [Number]: [Descriptive Name]" (e.g., "Section 1: Setup and Config").
    
    Output JSON format:
    {{
        "title": "{course_name}",
        "description": "Focused upskilling path to master {", ".join(missing_skills)}.",
        "category": "Upskilling",
        "modules": [
            {{
                "moduleTitle": "Descriptive Module Title",
                "subModules": [
                    {{ "subTitle": "Section 1: Descriptive Section Title" }},
                    {{ "subTitle": "Section 2: Descriptive Section Title" }},
                    {{ "subTitle": "Section 3: Descriptive Section Title" }}
                ]
            }}
        ]
    }}
    """
    
    try:
        print(f"DEBUG: Generating upskilling outline for: {missing_skills}")
        outline = await generate_with_retry(prompt)
        if not outline: raise ValueError("Outline generation failed")
    except Exception as e:
        print(f"Error generating upskilling outline: {e}")
        return {"error": str(e)}


    # 2. Process modules in parallel to improve performance
    tasks = []
    skill_focus = missing_skills[0] if missing_skills else ""
    
    for module in outline.get("modules", []):
         tasks.append(process_module(course_name, module["moduleTitle"], module.get("subModules", []), skill_focus))
    
    print(f"DEBUG: Starting parallel generation for {len(tasks)} modules...")
    results = await asyncio.gather(*tasks)
    final_modules = [r for r in results if r is not None]
        
    # 3. Construct Final Course Object
    course_data = {
        "title": outline.get("title", course_name),
        "description": outline.get("description", ""),
        "category": "Upskilling",
        "status": "active",
        "totalProgress": 0,
        "modules": final_modules
    }
    
    if user_id:
        course_data["userId"] = user_id
    
    # 4. Save to MongoDB
    try:
        result = await db.courses.insert_one(course_data)
        course_data["_id"] = str(result.inserted_id)
        if "userId" in course_data: course_data["userId"] = str(course_data["userId"])
        print(f"DEBUG: Inserted new upskilling course: {course_data['title']}")
            
        return course_data
    except Exception as e:
        print(f"Error saving to DB: {e}")
        return {"error": f"Database error: {str(e)}"}
