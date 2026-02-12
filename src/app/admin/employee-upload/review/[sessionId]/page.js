"use client";

import { useState, useEffect, useCallback, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Download, Save, Trash2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Simple debounce hook implementation
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function ReviewPage({ params }) {
    const { sessionId } = use(params);
    const router = useRouter();

    // Primary State
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState('PENDING');
    const [headers, setHeaders] = useState([]);

    // Saving State
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Ref to track if initial load is done to prevent overwriting with empty
    const initialLoadDone = useRef(false);

    // Fetch Data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/temp-data/${sessionId}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error('Session not found');
                throw new Error('Failed to load data');
            }
            const result = await res.json();

            // Validate data structure
            if (result.processedData && Array.isArray(result.processedData)) {
                setData(result.processedData);
                setStatus(result.status);
                if (result.processedData.length > 0) {
                    setHeaders(Object.keys(result.processedData[0]));
                }
                initialLoadDone.current = true;
            } else {
                setData([]);
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Manual Save Function
    const saveData = async (currentData) => {
        if (!initialLoadDone.current) return;

        try {
            setIsSaving(true);
            const res = await fetch(`/api/temp-data/${sessionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ processedData: currentData })
            });

            if (!res.ok) throw new Error('Failed to auto-save');

            setLastSaved(new Date());
        } catch (err) {
            console.error("Auto-save failed", err);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    // Debounced Auto-Save for Cell Changes
    // We use a ref to store the latest data to save, and a timeout
    const saveTimeoutRef = useRef(null);

    const triggerDebouncedSave = (newData) => {
        setIsSaving(true); // Show saving indicator immediately
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
            saveData(newData);
        }, 1500); // 1.5s debounce
    };

    const handleCellChange = (rowIndex, key, value) => {
        const newData = [...data];
        newData[rowIndex] = { ...newData[rowIndex], [key]: value };
        setData(newData);
        triggerDebouncedSave(newData);
    };

    const handleDeleteRow = async (rowIndex) => {
        if (!confirm("Delete this row?")) return;

        const newData = data.filter((_, index) => index !== rowIndex);
        setData(newData);

        // Immediate Save for Delete
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); // Cancel any pending debounced save
        await saveData(newData);
        toast.success("Row deleted");
    };

    const handleApprove = async () => {
        // Ensure final state is saved before approving
        if (isSaving) {
            toast.loading("Waiting for save to complete...");
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {
            const res = await fetch(`/api/temp-data/${sessionId}/approve`, {
                method: 'POST'
            });

            if (res.ok) {
                setStatus('APPROVED');
                toast.success("Data Approved Successfully!");
                toast.success("Ready for download");
            } else {
                throw new Error("Approval failed");
            }
        } catch (error) {
            toast.error("Error approving data");
        }
    };

    const handleReject = () => {
        if (confirm("Are you sure you want to discard this upload? All unsaved changes will be lost.")) {
            router.push('/admin/employee-upload');
        }
    };

    const handleDownload = () => {
        window.location.href = `/api/temp-data/${sessionId}/download`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black/90">
                <Loader2 className="animate-spin mb-4 w-10 h-10 text-indigo-500" />
                <p className="text-gray-400">Loading review data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black/90">
                <AlertCircle className="mb-4 w-12 h-12 text-red-500" />
                <h2 className="text-2xl font-bold mb-2">Error Loading Session</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button onClick={() => router.push('/admin/employee-upload')} className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                    Back to Upload
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[95vw] mx-auto text-white pb-20">
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#000000] z-20 py-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full">
                        <ArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            Review Data
                            {status === 'APPROVED' && <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/20">Approved</span>}
                            {status === 'PENDING' && <span className="text-sm bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/20">Pending</span>}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                            <span>{data.length} Rows</span>
                            {isSaving ? (
                                <span className="flex items-center text-indigo-400 animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...</span>
                            ) : (
                                lastSaved && <span className="text-gray-500">Last saved: {lastSaved.toLocaleTimeString()}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {status === 'APPROVED' ? (
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20"
                        >
                            <Download size={20} />
                            Download CSV
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleReject}
                                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-medium border border-red-500/20 transition-all"
                            >
                                <X size={18} />
                                Discard
                            </button>
                            <button
                                onClick={handleApprove}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <Check size={20} />
                                Approve
                            </button>
                        </>
                    )}
                </div>
            </div>

            {status === 'APPROVED' ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white/5 rounded-3xl border border-white/10 animate-in fade-in zoom-in duration-300">
                    <div className="bg-green-500/20 p-8 rounded-full mb-6 ring-4 ring-green-500/10">
                        <Check size={64} className="text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-3">Ready for Download</h2>
                    <p className="text-gray-400 mb-8 text-lg max-w-md text-center">The data has been approved and finalized. Use the download button below to get your CSV file.</p>
                    <button
                        onClick={handleDownload}
                        className="px-10 py-5 bg-green-500 hover:bg-green-600 rounded-2xl font-bold text-xl shadow-xl shadow-green-500/20 transition-transform hover:scale-105 active:scale-95 flex items-center gap-3"
                    >
                        <Download size={24} />
                        Download Final CSV
                    </button>
                </div>
            ) : (
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                    {data.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No rows found in this dataset.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="text-xs uppercase bg-black/60 text-gray-400 font-medium tracking-wider">
                                    <tr>
                                        <th className="px-4 py-4 sticky left-0 bg-black/60 z-20 w-16 border-b border-white/10 text-center">Action</th>
                                        {headers.map(header => (
                                            <th key={header} className="px-6 py-4 whitespace-nowrap min-w-[200px] border-b border-white/10">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {data.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="group hover:bg-white/[0.02] transition-colors relative">
                                            <td className="px-2 py-3 sticky left-0 bg-zinc-900/95 group-hover:bg-zinc-900 z-10 border-r border-white/5 text-center">
                                                <button
                                                    onClick={() => handleDeleteRow(rowIndex)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    title="Delete Row"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                            {headers.map(header => (
                                                <td key={`${rowIndex}-${header}`} className="p-0 relative">
                                                    <input
                                                        type="text"
                                                        value={row[header] || ''}
                                                        onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                                                        className="w-full h-full px-6 py-4 bg-transparent border-none outline-none focus:bg-indigo-500/10 focus:text-indigo-200 transition-colors text-gray-300 focus:ring-1 focus:ring-inset focus:ring-indigo-500/30 font-mono text-sm"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="p-4 bg-black/40 text-xs text-center text-gray-500 border-t border-white/10">
                        {data.length} Rows &bull; Auto-saving changes...
                    </div>
                </div>
            )}
        </div>
    );
}
