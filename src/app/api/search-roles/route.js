import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Requirement from '@/models/Requirement';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ roles: [] });
        }

        // Case-insensitive search
        const roles = await Requirement.find({
            roleName: { $regex: query, $options: 'i' }
        })
            .select('roleName skills description') // Select fields we need
            .limit(10);

        return NextResponse.json({ roles });
    } catch (error) {
        console.error("Error searching roles:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
