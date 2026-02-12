"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, BookOpen, BarChart2, History, User, LogOut, LogIn, Shield, Briefcase } from 'lucide-react';
import clsx from 'clsx';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname?.startsWith('/admin')) return null;

    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            // Check Supabase User
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);

            // Check Admin User
            try {
                const res = await fetch('/api/admin/check-auth');
                if (res.ok) {
                    setIsAdmin(true);
                }
            } catch (e) {
                console.error("Admin check failed", e);
            }

            setLoading(false);
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        if (isAdmin) {
            await fetch('/api/admin/logout', { method: 'POST' });
            setIsAdmin(false);
            router.push('/admin/login');
        } else {
            await supabase.auth.signOut();
            router.push('/');
        }
        toast.success("Logged out successfully!");
        router.refresh();
    };

    const navItems = [
        { name: 'Home', href: '/', icon: LayoutDashboard },
        { name: 'Learning', href: '/learning', icon: BookOpen },
        { name: 'History', href: '/history', icon: History },
        { name: 'Skill Gap', href: '/skill-gap', icon: BarChart2 },
    ];

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <span className="text-gradient">Next Role Navigate</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-2 text-sm font-medium transition-colors hover:text-white",
                                        isActive ? "text-white" : "text-gray-400"
                                    )}
                                >
                                    <Icon size={16} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-4">
                        {!loading && (
                            (user || isAdmin) ? (
                                <div className="flex items-center gap-4">
                                    {user && (
                                        <Link href="/profile" className={clsx(
                                            "p-2 rounded-full hover:bg-white/10 transition-colors",
                                            pathname === '/profile' ? "text-white bg-white/10" : "text-gray-400"
                                        )}>
                                            <User size={20} />
                                        </Link>
                                    )}
                                    {isAdmin && (
                                        <span className="text-xs font-bold text-primary border border-primary/20 px-2 py-1 rounded bg-primary/10">ADMIN</span>
                                    )}
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/admin/login"
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors border border-primary/20"
                                    >
                                        <Shield size={16} />
                                        Admin
                                    </Link>
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/10"
                                    >
                                        <Briefcase size={16} />
                                        Employee
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </nav>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
}
