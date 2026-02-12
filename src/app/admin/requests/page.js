"use client";

import { useState, useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/requests');
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchRequests();

        // Poll every 5 seconds for real-time updates
        const interval = setInterval(fetchRequests, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (id, status) => {
        try {
            const res = await fetch(`/api/requests/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                toast.success(`Request ${status.toLowerCase()} successfully`);
                fetchRequests(); // Refresh list immediately
            } else {
                toast.error('Failed to update request');
            }
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Error updating request');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-white animate-pulse">Loading requests...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Code Generation Requests</h1>
                <p className="text-gray-400">Review and approve employee code generation requests</p>
            </div>

            {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-2xl border border-white/10">
                    <AlertCircle className="w-12 h-12 text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium text-white">No Pending Requests</h3>
                    <p className="text-gray-400 mt-2">All caught up! New requests will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((request) => (
                        <div
                            key={request._id}
                            className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 flex items-center justify-between transition-all hover:border-white/20"
                        >
                            <div className="flex flex-col gap-1">
                                <h3 className="text-lg font-semibold text-white">{request.codeName}</h3>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-400">Employee ID:</span>
                                    <code className="bg-white/5 px-2 py-0.5 rounded text-indigo-300 font-mono">
                                        {request.employeeId}
                                    </code>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleAction(request._id, 'ACCEPTED')}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
                                >
                                    <Check className="w-4 h-4" />
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleAction(request._id, 'REJECTED')}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
