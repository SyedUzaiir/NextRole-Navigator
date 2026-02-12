"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mail, ArrowUp, ArrowDown, LogOut } from 'lucide-react';
import clsx from 'clsx';
import EmployeeTable from '@/components/admin/EmployeeTable';

import NineBoxGrid from '@/components/admin/NineBoxGrid';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/dashboard-data');
                if (res.status === 401) {
                    router.push('/admin/login');
                    return;
                }
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await res.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleLogout = () => {
        // Clear cookie by setting it to expire
        document.cookie = 'admin_token=; Max-Age=0; path=/;';
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-gray-400">View and manage all employees (Sorted by Performance)</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>

                {/* 9-Box Grid */}
                <NineBoxGrid employees={users} />



                {/* <EmployeeTable employees={users} /> */}
            </div>
        </div>
    );
}
