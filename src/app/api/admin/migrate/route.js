import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
    try {
        await dbConnect();
        const users = await User.find({});
        let updatedCount = 0;

        for (const user of users) {
            let changed = false;

            // Ensure experience object exists and has defaults
            if (!user.experience) {
                user.experience = { adsScore: 0, tasksCompleted: 0 };
                changed = true;
            } else {
                if (typeof user.experience.adsScore === 'undefined') {
                    user.experience.adsScore = 0;
                    changed = true; // Although mongoose defaults might handle this on save, explicit is good
                }
                if (typeof user.experience.tasksCompleted === 'undefined') {
                    user.experience.tasksCompleted = 0;
                    changed = true;
                }
            }

            // Ensure idpScore exists
            if (typeof user.idpScore === 'undefined' || user.idpScore === null) {
                user.idpScore = Math.floor(Math.random() * 100) + 10;
                changed = true;
            }

            if (changed) {
                await user.save();
                updatedCount++;
            }
        }

        return NextResponse.json({ message: 'Migration completed', updatedCount, totalUsers: users.length });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json({ error: 'Migration failed', details: error.message }, { status: 500 });
    }
}
