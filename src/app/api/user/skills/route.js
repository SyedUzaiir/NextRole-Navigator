import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !supabaseUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Find user by email from the auth session
        const user = await User.findOne({ email: supabaseUser.email }).select('softSkills technicalSkills');

        if (!user) {
            return NextResponse.json({ skills: [] });
        }

        // Aggregate skills
        const skills = [
            ...(user.softSkills || []),
            ...(user.technicalSkills || [])
        ];

        // Remove duplicates and empty strings
        const uniqueSkills = [...new Set(skills)].filter(Boolean);

        return NextResponse.json({ skills: uniqueSkills });

    } catch (error) {
        console.error('Error fetching user skills:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
