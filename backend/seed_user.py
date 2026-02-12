from db import db
import asyncio
# from models import User

async def create_test_user():
    user_data = {
        "email": "test@example.com",
        "fullName": "Test User",
        "username": "testuser",
        "currentRole": "Junior Frontend Developer",
        "companyEmail": "test@company.com",
        "status": "Ongoing"
    }
    
    # Check if exists
    existing = await db.users.find_one({"email": user_data["email"]})
    if existing:
        print("Test user already exists")
        return

    result = await db.users.insert_one(user_data)
    print(f"Created test user with ID: {result.inserted_id}")

if __name__ == "__main__":
    asyncio.run(create_test_user())
