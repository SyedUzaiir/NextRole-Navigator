"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import OnboardingWizard from '@/components/OnboardingWizard';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
                return;
            }

            try {
                const res = await fetch('/api/user');
                if (res.ok) {
                    const data = await res.json();
                    if (data.isOnboardingComplete) {
                        router.push('/'); // Already onboarded
                    } else {
                        setUserData(data);
                    }
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <div className="flex-1 flex items-center justify-center py-12">
                <OnboardingWizard initialData={userData} />
            </div>
        </div>
    );
}
