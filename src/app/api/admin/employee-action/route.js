import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
    try {
        await dbConnect();

        const { action, userIds } = await request.json();

        if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 }
            );
        }

        let updateData = {};
        let emailSubject = '';
        let emailBody = '';

        if (action === 'accept') {
            updateData = { accountStatus: 'ACCEPTED' };
            emailSubject = 'Role Application Accepted';
            emailBody = 'You have been accepted for the role: [Current Role Name].';
        } else if (action === 'reject') {
            updateData = { accountStatus: 'REJECTED' };
            emailSubject = 'Role Application Rejected';
            emailBody = 'You have been rejected for the role. Please contact HR for more details.';
        } else {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

        const usersToUpdate = await User.find({ _id: { $in: userIds } });

        // Simulate sending emails
        usersToUpdate.forEach(user => {
            console.log(`[EMAIL SIMULATION] To: ${user.email}`);
            console.log(`[EMAIL SIMULATION] Subject: ${emailSubject}`);
            console.log(`[EMAIL SIMULATION] Body: ${emailBody.replace('[Current Role Name]', user.currentRole || 'Role')}`);
            console.log('------------------------------------------------');
        });

        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { $set: updateData }
        );

        return NextResponse.json(
            { message: `Successfully updated ${result.modifiedCount} users`, modifiedCount: result.modifiedCount },
            { status: 200 }
        );

    } catch (error) {
        console.error('Employee Action Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
