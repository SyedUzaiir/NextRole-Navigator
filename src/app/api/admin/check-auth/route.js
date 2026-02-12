import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
    const token = request.cookies.get('admin_token');

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
        jwt.verify(token.value, process.env.JWT_SECRET || 'default_secret');
        return NextResponse.json({ authenticated: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
