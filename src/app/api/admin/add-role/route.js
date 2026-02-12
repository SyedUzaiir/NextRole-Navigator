import dbConnect from '@/lib/db';
import Requirement from '@/models/Requirement';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { roleName, description, skills, requirements } = body;

        // Basic Validation
        if (!roleName || !description || !skills || skills.length === 0) {
            return NextResponse.json(
                { error: 'Please provide all required fields: roleName, description, and at least one skill.' },
                { status: 400 }
            );
        }

        const requirement = await Requirement.create({
            roleName,
            description,
            skills,
            requirements: requirements || [], // Optional field
        });

        return NextResponse.json({ success: true, data: requirement }, { status: 201 });
    } catch (error) {
        console.error('Error creating role requirement:', error);
        return NextResponse.json(
            { error: 'Failed to create role requirement' },
            { status: 500 }
        );
    }
}
