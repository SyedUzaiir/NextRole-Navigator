import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
    try {
        await dbConnect();

        // Basic auth check
        const token = request.cookies.get('admin_token');
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { userId, newRole } = await request.json();

        if (!userId || !newRole) {
            return NextResponse.json(
                { error: 'User ID and New Role are required' },
                { status: 400 }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { currentRole: newRole },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Role updated successfully', user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update role error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
