import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Check if recommendations already exist in DB
        if (user.recommendedCourses && user.recommendedCourses.length > 0) {
            return NextResponse.json({ courses: user.recommendedCourses }, { status: 200 });
        }

        // 2. If not, generate them via Python Backend
        console.log("No cached recommendations found. Generating new ones...");
        const pythonApiUrl = (process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000') + '/api/recommendations';
        const res = await fetch(`${pythonApiUrl}?email=${email}`);

        if (!res.ok) {
            console.warn('Python backend failed, returning fallback recommendations');
            // Fallback (do not save to DB to allow retry)
            return NextResponse.json({
                courses: [
                    { title: `Advanced ${user.currentRole}`, description: 'Take your skills to the next level.', category: 'Mastering', roleContext: user.currentRole },
                    { title: 'Leadership Skills', description: 'Prepare for a management role.', category: 'Transitioning', roleContext: 'Manager' }
                ]
            }, { status: 200 });
        }

        const data = await res.json();

        // 3. Save generated recommendations to DB
        if (data.courses && Array.isArray(data.courses)) {
            user.recommendedCourses = data.courses;
            await user.save();
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Clear existing recommendations (optional step if we just overwrite, but good for clarity)
        user.recommendedCourses = [];
        await user.save();

        // 2. Call Python Backend to generate NEW recommendations
        console.log("Refreshing recommendations...");
        const pythonApiUrl = (process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000') + '/api/recommendations';
        const res = await fetch(`${pythonApiUrl}?email=${email}`);

        if (!res.ok) {
            throw new Error('Failed to fetch from Python backend');
        }

        const data = await res.json();

        // 3. Save new recommendations to DB
        if (data.courses && Array.isArray(data.courses)) {
            user.recommendedCourses = data.courses;
            await user.save();
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error('Error refreshing recommendations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
