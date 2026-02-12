'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function AuthErrorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-6">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
            <p className="text-gray-400 max-w-md mb-8">
                There was a problem signing you in. This could be due to a configuration issue or an expired session.
            </p>
            <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium"
            >
                <ArrowLeft size={20} />
                Back to Home
            </Link>
        </div>
    );
}
