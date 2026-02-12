import pytest
import sys
import os

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.agent import analyze_skill_gap

@pytest.mark.asyncio
async def test_analyze_skill_gap():
    employee_skills = ["Python", "JavaScript", "React"]
    target_role = "Senior Full Stack Engineer"
    target_role_skills = ["Python", "JavaScript", "React", "AWS", "Docker", "System Design"]
    
    result = await analyze_skill_gap(employee_skills, target_role, target_role_skills)
    
    print(f"Skill Gap Result: {result}")
    
    assert "missingSkills" in result
    assert "matchPercentage" in result
    assert "estimatedTime" in result
    assert "recommendations" in result
    
    # Check logic (roughly)
    assert isinstance(result["missingSkills"], list)
    assert isinstance(result["matchPercentage"], (int, float))

@pytest.mark.asyncio
async def test_generate_upskilling_course():
    missing_skills = ["Docker", "Kubernetes"]
    current_skills = ["Python", "React", "Git"]
    
    from backend.agent import generate_upskilling_course
    
    # Mocking generation to avoid full API costs/latency if possible, 
    # but for integration test we might want real call. 
    # Since I don't have mock setup easily, I'll run real call or just trust previous manual steps.
    # I'll rely on the real call as per previous pattern.
    
    result = await generate_upskilling_course(missing_skills, current_skills)
    
    print(f"Upskilling Course Result: {result}")
    
    assert "title" in result
    assert "modules" in result
    assert len(result["modules"]) > 0
    assert result["category"] == "Upskilling"
