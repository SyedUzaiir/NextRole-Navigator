import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';

export async function POST(request) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return NextResponse.json(
                { error: 'Admin already exists' },
                { status: 400 }
            );
        }

        const admin = await Admin.create({
            email,
            password,
        });

        return NextResponse.json(
            { message: 'Admin created successfully', admin: { email: admin.email, id: admin._id } },
            { status: 201 }
        );
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
