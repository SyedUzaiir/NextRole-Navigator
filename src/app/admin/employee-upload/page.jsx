'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, FileUp, Download, Loader2, CheckCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeUploadPage() {
    const router = useRouter();
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [processedBlob, setProcessedBlob] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setProcessedBlob(null); // Reset previous result
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setProcessing(true);
        const toastId = toast.loading('Processing CSV file...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/admin/employee-upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.details || 'Upload failed');
            }

            const data = await response.json();

            if (data.success && data.sessionId) {
                toast.success('File Processed. Redirecting to review...', { id: toastId });
                router.push(`/admin/employee-upload/review/${data.sessionId}`);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error(`Error: ${error.message}`, { id: toastId });
        } finally {
            setProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!processedBlob) return;
        const url = window.URL.createObjectURL(processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_employees_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (e.dataTransfer.files[0].type === "text/csv" || e.dataTransfer.files[0].name.endsWith('.csv')) {
                setFile(e.dataTransfer.files[0]);
                setProcessedBlob(null);
            } else {
                toast.error("Please upload a CSV file");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    Smart CSV Processor
                </h1>
                <p className="mt-2 text-gray-400">
                    Upload employee data to automatically assign roles and calculate skill gaps using AI.
                </p>
            </div>

            <div className="max-w-xl mx-auto mt-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
                >
                    {!processedBlob ? (
                        <div className="space-y-6">
                            <div
                                className={`
                                    border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300
                                    ${file ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-indigo-400/50 hover:bg-white/5'}
                                    cursor-pointer
                                `}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    ref={fileInputRef}
                                />

                                {file ? (
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="bg-indigo-500/20 p-4 rounded-full">
                                            <FileText className="h-10 w-10 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-lg">{file.name}</p>
                                            <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                        <p className="text-xs text-indigo-300 mt-2">Click to change file</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="bg-white/5 p-4 rounded-full">
                                            <Upload className="h-10 w-10 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-lg">Click or Drag CSV here</p>
                                            <p className="text-sm text-gray-400">Supports .csv files</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!file || processing}
                                className={`
                                    w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all
                                    ${!file || processing
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20'}
                                `}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileUp className="h-5 w-5" />
                                        <span>Upload & Process</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-6"
                        >
                            <div className="bg-green-500/10 text-green-400 p-6 rounded-full inline-block mb-2">
                                <CheckCircle className="h-16 w-16" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
                                <p className="text-gray-300">Your file has been processed successfully.</p>
                            </div>

                            <button
                                onClick={handleDownload}
                                className="w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white transition-all shadow-lg shadow-green-500/20"
                            >
                                <Download className="h-5 w-5" />
                                <span>Download Output File</span>
                            </button>

                            <button
                                onClick={() => {
                                    setFile(null);
                                    setProcessedBlob(null);
                                }}
                                className="text-sm text-gray-400 hover:text-white transition-colors underline"
                            >
                                Process another file
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
