import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TempProcessedData from '@/models/TempProcessedData';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { sessionId } = await params;

        const record = await TempProcessedData.findOne({ sessionId });
        if (!record) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { sessionId } = await params;
        const body = await request.json();
        const { processedData } = body;

        const record = await TempProcessedData.findOneAndUpdate(
            { sessionId },
            { processedData },
            { new: true }
        );

        if (!record) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: record });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
