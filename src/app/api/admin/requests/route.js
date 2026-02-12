import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CodeRequest from '@/models/CodeRequest';

export async function GET() {
    try {
        await dbConnect();
        // Fetch only PENDING requests as per requirements
        const requests = await CodeRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
