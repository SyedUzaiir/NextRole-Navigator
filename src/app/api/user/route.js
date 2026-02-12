import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: supabaseUser.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate Scores
        const completedCoursesCount = await Course.countDocuments({ userId: user._id, status: 'completed' });

        const adsScore = user.experience?.adsScore || 0;
        const tasksCompleted = user.experience?.tasksCompleted || 0;

        const potential = adsScore * 10;
        const performance = tasksCompleted + completedCoursesCount;
        const newIdpScore = (potential + performance) / 2;

        // Update IDP Score if it changed
        if (user.idpScore !== newIdpScore) {
            user.idpScore = newIdpScore;
            await user.save();
        }

        // Return user data along with calculated metrics that might not be directly on user object (e.g. course count)
        const userData = user.toObject();
        return NextResponse.json({
            ...userData,
            completedCoursesCount,
            calculatedMetrics: {
                potential,
                performance
            }
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { fullName, username, currentRole, companyEmail } = body;

        // Basic validation
        if (!fullName || !username || !currentRole || !companyEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Check for existing username
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        // Check if user already exists by email to prevent duplicate profiles
        const existingProfile = await User.findOne({ email: supabaseUser.email });
        if (existingProfile) {
            return NextResponse.json({ error: 'Profile already exists' }, { status: 409 });
        }

        const newUser = await User.create({
            email: supabaseUser.email,
            fullName,
            username,
            currentRole,
            companyEmail,
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const supabase = await createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentRole } = body;

        if (!currentRole) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findOneAndUpdate(
            { email: supabaseUser.email },
            { currentRole },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
