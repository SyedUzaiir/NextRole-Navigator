import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { createClient } from '@/utils/supabase/server';

export async function PUT(request) {
    try {
        const supabase = await createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            fullName,
            department,
            proficiencyLevel,
            reportingManager,
            workExperience,
            softSkills,
            technicalSkills,
            certifications,
            currentRole,
            adsScore,
            tasksCompleted
        } = body;

        // Validation for required fields
        if (!department || !proficiencyLevel || !reportingManager) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate IDP Score
        // Potential = adsScore * 10
        // Performance = tasksCompleted + numberOfCoursesCompleted (Assuming 0 for onboarding)
        const potential = (Number(adsScore) || 0) * 10;
        const performance = (Number(tasksCompleted) || 0);
        const idpScore = (potential + performance) / 2;

        await dbConnect();

        // Try to update existing user
        let updatedUser = await User.findOneAndUpdate(
            { email: supabaseUser.email },
            {
                fullName, // Update name if provided
                department,
                proficiencyLevel,
                reportingManager,
                workExperience,
                softSkills,
                technicalSkills,
                certifications,
                currentRole,
                isOnboardingComplete: true,
                experience: {
                    adsScore: Number(adsScore) || 0,
                    tasksCompleted: Number(tasksCompleted) || 0,
                },
                idpScore
            },
            { new: true }
        );

        // If user doesn't exist (e.g. first time login via Google), create them
        if (!updatedUser) {
            const username = supabaseUser.email.split('@')[0] + Math.floor(Math.random() * 1000);

            updatedUser = await User.create({
                email: supabaseUser.email,
                username,
                companyEmail: supabaseUser.email,
                fullName: fullName || supabaseUser.email.split('@')[0],
                currentRole: currentRole || 'New Hire',
                department,
                proficiencyLevel,
                reportingManager,
                workExperience,
                softSkills,
                technicalSkills,
                certifications,
                isOnboardingComplete: true,
                status: 'Ongoing',
                experience: {
                    adsScore: Number(adsScore) || 0,
                    tasksCompleted: Number(tasksCompleted) || 0,
                },
                idpScore
            });
        }

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error('Error submitting onboarding:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
