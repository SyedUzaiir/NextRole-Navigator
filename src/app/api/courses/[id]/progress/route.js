import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { createClient } from '@/utils/supabase/server';

export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const { moduleIndex, subModuleIndex, isCompleted } = await req.json();

        const supabase = await createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const course = await Course.findById(id);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Validate indices
        if (!course.modules[moduleIndex]) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }
        if (!course.modules[moduleIndex].subModules[subModuleIndex]) {
            return NextResponse.json({ error: 'Sub-module not found' }, { status: 404 });
        }

        // Update completion status
        course.modules[moduleIndex].subModules[subModuleIndex].isCompleted = isCompleted;

        // Calculate total progress
        let totalSubModules = 0;
        let completedSubModules = 0;

        course.modules.forEach(m => {
            m.subModules.forEach(s => {
                totalSubModules++;
                if (s.isCompleted) completedSubModules++;
            });
        });

        course.totalProgress = totalSubModules > 0 ? Math.round((completedSubModules / totalSubModules) * 100) : 0;

        if (course.totalProgress === 100) {
            course.status = 'completed';
        }

        await course.save();

        return NextResponse.json({
            message: 'Progress updated',
            totalProgress: course.totalProgress,
            status: course.status
        });

    } catch (error) {
        console.error('Error updating progress:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const { moduleIndex, answers } = await req.json(); // answers: Array of options

        const supabase = await createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const course = await Course.findById(id);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const module = course.modules[moduleIndex];
        if (!module) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        // Calculate Score
        let correctCount = 0;
        const totalQuestions = module.quiz.length;

        module.quiz.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / totalQuestions) * 100);

        module.moduleScore = score;
        module.isModuleCompleted = true;

        await course.save();

        return NextResponse.json({
            message: 'Quiz submitted',
            score,
            passed: score >= 70
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
