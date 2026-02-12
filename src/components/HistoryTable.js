"use client";

import { useState, useEffect } from 'react';
import { History, Award, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthGuard from '@/components/AuthGuard';

export default function HistoryTable() {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) return;

            try {
                const res = await fetch(`/api/courses/history?email=${session.user.email}`);
                const data = await res.json();
                if (data.courses) {
                    setHistoryData(data.courses);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

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
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <History size={24} />
                    </div>
                    <h1 className="text-3xl font-bold">Learning History</h1>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-6 font-semibold text-gray-300">Course Title</th>
                                    <th className="p-6 font-semibold text-gray-300">Last Active</th>
                                    <th className="p-6 font-semibold text-gray-300">Category</th>
                                    <th className="p-6 font-semibold text-gray-300">Status</th>
                                    <th className="p-6 font-semibold text-gray-300 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {historyData.length > 0 ? (
                                    historyData.map((item) => (
                                        <tr key={item._id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-6 font-medium text-white">{item.title}</td>
                                            <td className="p-6 text-gray-400">
                                                {new Date(item.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-6">
                                                <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300 text-xs border border-white/10">
                                                    {item.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                {item.status === 'completed' ? (
                                                    <span className="px-3 py-1 rounded-full text-xs border bg-green-500/10 border-green-500/20 text-green-400">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs border bg-blue-500/10 border-blue-500/20 text-blue-400">
                                                        In Progress
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                <Link
                                                    href={`/learning/${item._id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
                                                >
                                                    <RefreshCw size={14} /> Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-400">
                                            No completed courses yet. Keep learning!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

