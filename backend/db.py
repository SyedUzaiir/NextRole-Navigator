import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env.local")

MONGODB_URI = os.getenv("MONGODB_URI")

client = None
db = None

if MONGODB_URI:
    try:
        client = AsyncIOMotorClient(MONGODB_URI)
        db = client.get_database() # Uses the database name from the URI
    except Exception as e:
        print(f"Warning: Failed to connect to MongoDB: {e}")
else:
    print("Warning: MONGODB_URI is not set in environment variables. Database features will be unavailable.")

# Test connection
async def test_connection():
    try:
        await client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_connection())
