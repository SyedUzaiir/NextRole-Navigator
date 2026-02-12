import { NextResponse } from 'next/server';
import User from '@/models/User';
import Course from '@/models/Course';
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

        const completedCourses = await Course.find({ userId: user._id, status: 'completed' }).sort({ updatedAt: -1 });

        return NextResponse.json({ courses: completedCourses }, { status: 200 });

    } catch (error) {
        console.error('Error fetching completed courses:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
