from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId

# Load environment variables
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env.local")

app = FastAPI(root_path=os.getenv("ROOT_PATH", ""))

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import dependencies
try:
    from agent import get_recommendations_with_links, get_course_content, analyze_skill_gap, generate_upskilling_course
except ImportError:
    from backend.agent import get_recommendations_with_links, get_course_content, analyze_skill_gap, generate_upskilling_course
try:
    from db import db
except ImportError:
    from backend.db import db

# Pydantic Models
class RecommendationRequest(BaseModel):
    userId: str # Or email

class CourseContentRequest(BaseModel):
    course_name: str

class QuizSubmission(BaseModel):
    courseId: str
    moduleTitle: str
    answers: List[int] # Indices of selected options
    
class SkillGapRequest(BaseModel):
    employeeSkills: List[str]
    targetRole: str
    targetRoleSkills: List[str]


class UpskillingRequest(BaseModel):
    missingSkills: List[str]
    currentSkills: List[str]
    email: str # Required to link course to user

@app.get("/")
async def root():
    return {"message": "NextRole Navigator Backend is running"}

@app.get("/api/health")
async def health_check():
    if not db:
        return {"status": "healthy", "database": "disconnected"}
    try:
        await db.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "healthy", "database": "error", "details": str(e)}

@app.get("/api/recommendations")
async def get_recommendations(email: str):
    """
    Fetches recommendations for a user based on their email.
    """
    try:
        # Fetch user from MongoDB
        if not db:
            return {"error": "Database connection unavailable. Please set MONGODB_URI."}

        user = await db.users.find_one({"email": email})
        if not user:
            return {"error": "User not found"}
        
        current_role = user.get("currentRole")
        if not current_role:
            return {"error": "User has no role defined"}
            
        # Generate recommendations
        print(f"DEBUG: Fetching recommendations for role: {current_role}")
        recommendations = await get_recommendations_with_links(current_role)
        
        if not recommendations:
             return {"error": "Failed to generate recommendations."}
        
        return recommendations
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/get-course-content")
async def api_get_course_content(request: CourseContentRequest):
    """
    Fetches a curated curriculum and video links for a specific course.
    """
    try:
        print(f"DEBUG: Requesting content for course: {request.course_name}")
        content = await get_course_content(request.course_name)
        if "error" in content:
            raise HTTPException(status_code=500, detail=content["error"])
        return content
    except Exception as e:
        print(f"Error in api_get_course_content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/submit-quiz")
async def submit_quiz(submission: QuizSubmission):
    """
    Handles quiz submission, calculates score, and updates progress.
    """
    try:
        course_id = submission.courseId
        module_title = submission.moduleTitle
        user_answers = submission.answers
        
        # Fetch course
        try:
            course = await db.courses.find_one({"_id": ObjectId(course_id)})
        except:
             course = await db.courses.find_one({"_id": course_id}) # Try as string if ObjectId fails
             
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
            
        # Find the module
        module_index = -1
        target_module = None
        for idx, m in enumerate(course["modules"]):
            if m["moduleTitle"] == module_title:
                module_index = idx
                target_module = m
                break
        
        if not target_module:
            raise HTTPException(status_code=404, detail="Module not found")
            
        # Calculate Score
        quiz = target_module.get("quiz", [])
        if not quiz:
            return {"message": "No quiz for this module", "score": 0}
            
        correct_count = 0
        total_questions = len(quiz)
        
        for i, question in enumerate(quiz):
            if i < len(user_answers):
                # Assuming user_answers contains indices of selected options
                # And question["correctAnswer"] is the string of the correct option
                selected_index = user_answers[i]
                options = question.get("options", [])
                if 0 <= selected_index < len(options):
                    selected_option = options[selected_index]
                    if selected_option == question.get("correctAnswer"):
                        correct_count += 1
        
        score_percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        
        # Update Module
        target_module["moduleScore"] = score_percentage
        target_module["isCompleted"] = True # Mark module as completed after quiz
        
        # Update Course in DB
        # We need to update the specific module in the array
        await db.courses.update_one(
            {"_id": course["_id"]},
            {"$set": {f"modules.{module_index}": target_module}}
        )
        
        # Check Course Completion
        # Re-fetch to get latest state or just check in memory
        all_modules_completed = all(m.get("isCompleted", False) or (i == module_index) for i, m in enumerate(course["modules"]))
        
        if all_modules_completed:
            # Calculate total progress
            total_score = 0
            for i, m in enumerate(course["modules"]):
                if i == module_index:
                    total_score += score_percentage
                else:
                    total_score += m.get("moduleScore", 0)
            
            avg_score = total_score / len(course["modules"])
            
            await db.courses.update_one(
                {"_id": course["_id"]},
                {"$set": {
                    "status": "completed",
                    "totalProgress": avg_score
                }}
            )
            
        return {
            "message": "Quiz submitted successfully",
            "score": score_percentage,
            "correctCount": correct_count,
            "totalQuestions": total_questions,
            "isCourseCompleted": all_modules_completed
        }
    except Exception as e:
        print(f"Error submitting quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        
@app.delete("/api/courses/{course_id}")
async def delete_course(course_id: str):
    """
    Deletes a course by its ID.
    """
    try:
        try:
            query = {"_id": ObjectId(course_id)}
        except:
            query = {"_id": course_id}
            
        result = await db.courses.delete_one(query)
        
        if result.deleted_count == 1:
            return {"message": "Course deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Course not found")
            
    except Exception as e:
        print(f"Error deleting course: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-skill-gap")
async def api_analyze_skill_gap(request: SkillGapRequest):
    """
    Analyzes the skill gap between employee skills and target role.
    """
    try:
        result = await analyze_skill_gap(request.employeeSkills, request.targetRole, request.targetRoleSkills)
        
        if not result or not isinstance(result, dict):
             raise HTTPException(status_code=500, detail="Invalid response from analysis agent")

        if "error" in result:
             raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        print(f"Error in analyze-skill-gap: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-gap-course")
async def api_generate_gap_course(request: UpskillingRequest):
    """
    Generates a course for missing skills.
    """
    try:
        print(f"DEBUG: Received upskilling request: {request}")
        result = await generate_upskilling_course(request.missingSkills, request.currentSkills, request.email)
        if "error" in result:
             raise HTTPException(status_code=500, detail=result["error"])
        return result

    except Exception as e:
        print(f"Error in generate-gap-course: {e}")
        raise HTTPException(status_code=500, detail=str(e))
