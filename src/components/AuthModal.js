"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { X, Mail, Lock, Loader2, AlertCircle, Check } from 'lucide-react';
import clsx from 'clsx';

export default function AuthModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            toast.success("Login successfully!");
            onClose();
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.reload(); // Refresh to update UI state
        } catch (e) {
            setError(e.message);
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            const msg = "Passwords do not match";
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
        }

        try {
            const { error, data } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;

            if (data?.user && data?.session) {
                // User signed up and logged in immediately (if email confirmation is off)
                toast.success("Registered successfully!");
                onClose();
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
            } else {
                toast.success("Check your email for the confirmation link.");
                setSuccessMessage("Check your email for the confirmation link.");
            }
        } catch (e) {
            setError(e.message);
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        setError(null);
        setSuccessMessage(null);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {activeTab === 'login'
                            ? 'Enter your details to access your employee account'
                            : 'Sign up to start your employee journey'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-2 mx-8 mt-6 bg-white/5 rounded-xl">
                    <button
                        onClick={() => switchTab('login')}
                        className={clsx(
                            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                            activeTab === 'login'
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => switchTab('signup')}
                        className={clsx(
                            "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                            activeTab === 'signup'
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0A0A0A] px-2 text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Error and Success messages removed in favor of toasts */}

                    <form onSubmit={activeTab === 'login' ? handleEmailLogin : handleEmailSignUp} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {activeTab === 'signup' && (
                            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                                <label className="text-xs font-medium text-gray-400 ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                activeTab === 'login' ? 'Log In' : 'Sign Up'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
