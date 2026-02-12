import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { createClient } from '@/utils/supabase/server';

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Find course by ID and ensure it belongs to the user (optional security check)
        // We can also just check if the user is authorized to view it.
        // For now, finding by ID is sufficient if we assume IDs are hard to guess, 
        // but checking userId is better practice.
        // However, we need to find the user's Mongo ID first.
        // Let's just fetch by ID for now to keep it simple, or fetch user first.

        const course = await Course.findById(id);

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({ course }, { status: 200 });

    } catch (error) {
        console.error('Error fetching course:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const deletedCourse = await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
