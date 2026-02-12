import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CodeRequest from '@/models/CodeRequest';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedRequest = await CodeRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedRequest });
    } catch (error) {
        console.error('Error updating request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const codeRequest = await CodeRequest.findById(id);

        if (!codeRequest) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        return NextResponse.json(codeRequest);
    } catch (error) {
        console.error('Error fetching request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
