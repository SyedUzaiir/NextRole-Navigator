import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CodeRequest from '@/models/CodeRequest';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { employeeId, codeName } = body;

        if (!employeeId || !codeName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newRequest = await CodeRequest.create({
            employeeId,
            codeName,
            status: 'PENDING'
        });

        return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
    } catch (error) {
        console.error('Error creating request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
