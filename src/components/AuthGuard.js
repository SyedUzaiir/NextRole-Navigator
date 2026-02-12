"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Redirect to login (or home with login trigger)
                // For now, redirect to home
                router.push('/');
                return;
            }

            try {
                // Check if user has a profile in MongoDB
                const res = await fetch('/api/user');

                if (res.status === 404) {
                    // User has no profile, redirect to onboarding if not already there
                    if (pathname !== '/onboarding') {
                        router.push('/onboarding');
                        return;
                    }
                } else if (res.ok) {
                    // User has profile, redirect to profile if on onboarding
                    // Or allow them to proceed to requested page
                    if (pathname === '/onboarding') {
                        router.push('/profile');
                        return;
                    }
                }
            } catch (error) {
                console.error("Error checking profile status:", error);
            }

            setAuthenticated(true);
            setLoading(false);
        };

        checkAuth();
    }, [router, pathname]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!authenticated) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
