import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TempProcessedData from '@/models/TempProcessedData';
import { Parser } from 'json2csv';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { sessionId } = await params;

        const record = await TempProcessedData.findOne({ sessionId });
        if (!record) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }

        if (record.status !== 'APPROVED') {
            return NextResponse.json({ error: 'Data not approved yet' }, { status: 403 });
        }

        const json2csvParser = new Parser();
        const csvOutput = json2csvParser.parse(record.processedData);

        return new NextResponse(csvOutput, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="final_processed_data.csv"',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
