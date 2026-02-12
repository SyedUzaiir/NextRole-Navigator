import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TempProcessedData from '@/models/TempProcessedData';

export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { sessionId } = await params;

        const record = await TempProcessedData.findOneAndUpdate(
            { sessionId },
            { status: 'APPROVED' },
            { new: true }
        );

        if (!record) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Approved' });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
