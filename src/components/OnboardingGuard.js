"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function OnboardingGuard({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkOnboarding = async () => {
            // Skip check for public routes or onboarding page itself
            if (pathname === '/onboarding' || pathname === '/auth/callback' || pathname === '/admin/login') {
                setAuthorized(true);
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // Not logged in, allow access (protected routes handled by middleware/other guards if any)
                // For now, assuming public access is allowed for home, etc. unless specific page protection.
                // But if we want to FORCE onboarding for logged in users:
                setAuthorized(true);
                setLoading(false);
                return;
            }

            try {
                // Fetch user status from our API (which checks MongoDB)
                const res = await fetch('/api/user');
                if (res.ok) {
                    const user = await res.json();
                    if (!user.isOnboardingComplete) {
                        // Redirect to onboarding if not complete
                        router.push('/onboarding');
                        return;
                    }
                }
            } catch (error) {
                console.error("Error checking onboarding status:", error);
            }

            setAuthorized(true);
            setLoading(false);
        };

        checkOnboarding();
    }, [pathname, router]);

    if (loading) {
        // Optional: Show a loading screen while checking status to prevent flash of content
        // For better UX, maybe just return children but with a transparent overlay or similar if critical.
        // Here we return null to block rendering until check is done.
        return null;
    }

    return authorized ? children : null;
}
