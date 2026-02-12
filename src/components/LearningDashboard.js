"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, FileText, CheckCircle, Plus, ArrowRight, Loader2, Sparkles, MoreVertical, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthGuard from '@/components/AuthGuard';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export default function LearningDashboard() {
    const router = useRouter();
    const [activeCourses, setActiveCourses] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [generating, setGenerating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) return;

            try {
                // 1. Fetch User Role (optional, for header) & Active Courses
                const activeRes = await fetch(`/api/courses/active?email=${session.user.email}`);
                const activeData = await activeRes.json();
                if (activeData.courses) setActiveCourses(activeData.courses);

                // 2. Fetch Recommendations
                const recRes = await fetch(`/api/recommendations?email=${session.user.email}`);
                const recData = await recRes.json();
                if (recData.courses) setRecommendations(recData.courses);

                // Set user role from recommendations context or user profile if available
                // For now, we'll just use a generic header or try to get it from the first recommendation's context
                if (recData.courses && recData.courses.length > 0) {
                    // Assuming recommendations are relevant to the role
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleRefreshRecommendations = async () => {
        setRefreshing(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) return;

        try {
            const res = await fetch('/api/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session.user.email }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.courses) setRecommendations(data.courses);
            }
        } catch (error) {
            console.error("Error refreshing recommendations:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleStartRecommendation = async (courseTitle) => {
        setGenerating(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.email) return;

        try {
            const res = await fetch('/api/courses/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: courseTitle, // Using title as the topic/role
                    email: session.user.email,
                }),
            });

            if (res.ok) {
                // Refresh active courses
                const activeRes = await fetch(`/api/courses/active?email=${session.user.email}`);
                const activeData = await activeRes.json();
                if (activeData.courses) setActiveCourses(activeData.courses);

                // Scroll to top or show success
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error("Error starting course:", error);
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteCourse = async (e, courseId) => {
        e.stopPropagation(); // Prevent navigation
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setActiveCourses(prev => prev.filter(c => c._id !== courseId));
            } else {
                alert("Failed to delete course");
            }
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("Error deleting course");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="container mx-auto px-4 py-12">

                {/* Section 1: Continuing Courses */}
                <div className="mb-16">
                    <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <Play className="text-primary" fill="currentColor" />
                        Continuing Courses
                    </h1>

                    {activeCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeCourses.map((course) => {
                                const completedModules = course.modules?.filter(m => m.isCompleted).length || 0;
                                const totalModules = course.modules?.length || 0;
                                const calculatedProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

                                return (
                                    <div key={course._id} className="glass-panel rounded-2xl overflow-hidden flex flex-col group hover:border-primary/50 transition-colors relative">

                                        {/* 3-Dashes Menu */}
                                        <div className="absolute top-3 right-3 z-20">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === course._id ? null : course._id);
                                                }}
                                                className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeMenuId === course._id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-200">
                                                    <button
                                                        onClick={(e) => handleDeleteCourse(e, course._id)}
                                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Trash2 size={16} /> Delete Course
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 p-6 flex items-end relative overflow-hidden">
                                            <div className="absolute inset-0 bg-black/20" />
                                            <h3 className="text-xl font-bold text-white relative z-10 pr-8">{course.title}</h3>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                                                <span>{completedModules}/{totalModules} Modules</span>
                                                <span className="text-primary">{calculatedProgress}% Complete</span>
                                            </div>

                                            <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                    style={{ width: `${calculatedProgress}%` }}
                                                />
                                            </div>

                                            <div className="mt-auto">
                                                <Link
                                                    href={`/learning/${course._id}`} // Assuming dynamic route uses ID
                                                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold text-center transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-black"
                                                >
                                                    Continue Learning <ArrowRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                            <p className="text-gray-400 mb-4">You haven't started any courses yet.</p>
                            <Link href="/" className="text-primary hover:underline">Find a course to start</Link>
                        </div>
                    )}
                </div>

                {/* Section 2: Recommended for You */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Sparkles className="text-secondary" />
                            Recommended for You
                        </h2>
                        <button
                            onClick={handleRefreshRecommendations}
                            disabled={refreshing}
                            className="text-sm text-primary hover:text-primary/80 flex items-center gap-2 disabled:opacity-50"
                        >
                            {refreshing ? <Loader2 size={16} className="animate-spin" /> : null}
                            {refreshing ? 'Refreshing...' : 'Refresh Recommendations'}
                        </button>
                    </div>

                    {recommendations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendations.map((course, index) => (
                                <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1">
                                    <div className="mb-4">
                                        <span className={clsx(
                                            "text-xs px-2 py-1 rounded-full border",
                                            course.category === 'Mastering' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                        )}>
                                            {course.category}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 h-14">{course.title}</h3>
                                    <p className="text-sm text-gray-400 mb-6 line-clamp-3 h-12">{course.description}</p>

                                    <button
                                        onClick={() => handleStartRecommendation(course.title)}
                                        disabled={generating}
                                        className="w-full py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        {generating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        Start Course
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            No recommendations available at the moment.
                        </div>
                    )}
                </div>

                {/* Loading Overlay for Generation */}
                {generating && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="bg-gray-900 p-8 rounded-2xl border border-white/10 flex flex-col items-center">
                            <Loader2 size={40} className="text-primary animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-white">Adding Course...</h3>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}

