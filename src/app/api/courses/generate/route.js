import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import User from '@/models/User';
import Course from '@/models/Course';
import dbConnect from '@/lib/db';

export async function POST(req) {
    try {
        await dbConnect();
        const { role, email } = await req.json();

        if (!role || !email) {
            return NextResponse.json({ error: 'Role and email are required' }, { status: 400 });
        }

        // 1. Find User
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Check if Course Already Exists for this User and Role
        const existingCourse = await Course.findOne({
            userId: user._id,
            roleContext: role
        });

        if (existingCourse) {
            console.log(`Returning existing course for role: ${role}`);
            return NextResponse.json({ course: existingCourse }, { status: 200 });
        }

        // 3. Call Python Backend (or Mock) to Generate Course Content
        // ... (Existing comment about Python backend) ...

        // Mock Generation Data with NEW Schema
        const generatedCourseData = {
            title: `Mastering ${role}`,
            description: `A comprehensive guide to becoming a ${role}.`,
            category: 'Mastering',
            modules: [
                {
                    moduleTitle: `Introduction to ${role}`,
                    moduleContent: 'Overview of the role, key responsibilities, and career path.',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
                    duration: '10m',
                    isCompleted: false
                },
                {
                    moduleTitle: 'Core Skills & Tools',
                    moduleContent: 'Essential technical and soft skills required for success.',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    duration: '45m',
                    isCompleted: false
                },
                {
                    moduleTitle: 'Advanced Techniques',
                    moduleContent: 'Deep dive into complex scenarios and best practices.',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    duration: '1h 30m',
                    isCompleted: false
                },
                {
                    moduleTitle: 'Real-world Project',
                    moduleContent: 'Apply your knowledge in a simulated project environment.',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    duration: '2h',
                    isCompleted: false
                },
            ],
            roleContext: role,
            thumbnail: '/default-course-thumb.jpg'
        };

        // 4. Save to MongoDB as Active Course
        const newCourse = await Course.create({
            userId: user._id,
            ...generatedCourseData,
            status: 'active',
            progress: 0,
        });

        return NextResponse.json({ course: newCourse }, { status: 201 });

    } catch (error) {
        console.error('Error generating course:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
