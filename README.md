# Next Role Navigate (v2)

A career progression platform built with Next.js 14+, Tailwind CSS, MongoDB, and Supabase.

## Features

- **Role-Based Learning Paths**: Explore and enroll in career paths.
- **Skill Gap Analysis**: Compare your skills with target roles.
- **Interactive Course Player**: Track progress through video modules.
- **Gamification**: Earn badges and track quiz scores.
- **Authentication**: Secure login via Supabase (Google OAuth + Email).

## Setup

1. **Install Dependencies**:
   - **Frontend**:
     ```bash
     npm install
     ```
   - **Backend**:
     ```bash
     pip install -r backend/requirements.txt
     ```

2. **Environment Variables**:
   Create a `.env.local` file in the root directory with the following keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   MONGODB_URI=your_mongodb_uri
   GOOGLE_API_KEY=your_gemini_api_key
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

3. **Run the Project**:
   You need to run both the backend and frontend terminals.

   - **Backend** (Python/FastAPI):
     ```bash
     cd backend
     uvicorn main:app --reload
     ```
     *Runs on http://localhost:8000*

   - **Frontend** (Next.js):
     ```bash
     npm run dev
     ```
     *Runs on http://localhost:3000*

## Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/lib`: Utilities (Supabase, MongoDB, Demo Data).
- `src/models`: Mongoose schemas.
- `backend/`: Python FastAPI backend and AI Agent.

## Data Strategy

The application uses `src/lib/demoData.js` for initial content rendering, allowing for immediate UI testing without a database connection. User progress is designed to be stored in MongoDB. AI Recommendations are fetched from the Python backend.
