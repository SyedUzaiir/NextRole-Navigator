"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Mail, ArrowUp, ArrowDown, LogOut, Download } from 'lucide-react';
import Papa from 'papaparse';
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

    const handleExportCSV = () => {
        if (!users || users.length === 0) return;

        // Transform data for CSV
        const csvData = users.map((user, index) => ({
            Rank: index + 1,
            Email: user.email,
            Name: user.name,
            Department: user.department,
            'Current Role': user.role,
            Manager: user.reportingManager,
            Experience: user.workingYears,
            'IDP Score': user.idpScore
        }));

        const csv = Papa.unparse(csvData);

        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* 9-Box Grid */}
                {/* <NineBoxGrid employees={users} /> */}



                <EmployeeTable employees={users} />
            </div>
        </div>
    );
}
