"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Circle, PlayCircle, Loader } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import clsx from 'clsx';

export default function CoursePlayer({ roleId }) {
    // roleId is passed from the URL params, which is now the Course ID (MongoDB _id)
    const courseId = roleId;

    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedModuleId, setExpandedModuleId] = useState(null);
    const [completedModules, setCompletedModules] = useState([]);

    useEffect(() => {
        const fetchCourseContent = async () => {
            if (!courseId) return;

            try {
                setLoading(true);
                const res = await fetch(`/api/courses/${courseId}`);

                if (!res.ok) {
                    throw new Error(`Failed to fetch content: ${res.status}`);
                }

                const data = await res.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                if (data.course) {
                    setCourseData(data.course);
                    // Open first module by default
                    if (data.course.modules && data.course.modules.length > 0) {
                        // Use _id if available, otherwise use index as fallback ID for UI state
                        setExpandedModuleId(data.course.modules[0]._id || 0);
                    }
                }
            } catch (err) {
                console.error("Error fetching course content:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseContent();
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-white">
                <Loader className="animate-spin mr-2" /> Loading course content...
            </div>
        );
    }

    if (error) {
        return <div className="p-12 text-center text-red-400">Error: {error}</div>;
    }

    if (!courseData) {
        return <div className="p-12 text-center text-gray-400">Course not found</div>;
    }

    const { modules, title } = courseData;

    const toggleModule = (id) => {
        if (expandedModuleId === id) {
            setExpandedModuleId(null);
        } else {
            setExpandedModuleId(id);
        }
    };

    const toggleComplete = (e, id) => {
        e.stopPropagation();
        if (completedModules.includes(id)) {
            setCompletedModules(prev => prev.filter(m => m !== id));
        } else {
            setCompletedModules(prev => [...prev, id]);
        }
    };

    const currentModule = modules.find(m => (m._id || modules.indexOf(m)) === expandedModuleId);

    return (
        <AuthGuard>
            <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 h-[calc(100vh-5rem)]">
                {/* Sidebar / Timeline */}
                <div className="w-full lg:w-1/3 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden h-full">
                    <div className="p-6 border-b border-white/10 bg-white/5">
                        <h2 className="text-xl font-bold text-white capitalize">{title}</h2>
                        <p className="text-sm text-gray-400 mt-1">{completedModules.length} / {modules.length} Completed</p>
                        <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${(completedModules.length / modules.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {modules.map((module, index) => {
                            const moduleId = module._id || index;
                            const isCompleted = completedModules.includes(moduleId);
                            const isActive = expandedModuleId === moduleId;

                            return (
                                <div
                                    key={moduleId}
                                    onClick={() => setExpandedModuleId(moduleId)}
                                    className={clsx(
                                        "p-4 rounded-xl cursor-pointer transition-all border",
                                        isActive
                                            ? "bg-primary/10 border-primary/50"
                                            : "bg-transparent border-transparent hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={(e) => toggleComplete(e, moduleId)}
                                            className={clsx(
                                                "mt-0.5 transition-colors",
                                                isCompleted ? "text-green-400" : "text-gray-500 hover:text-gray-300"
                                            )}
                                        >
                                            {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                                        </button>

                                        <div className="flex-1">
                                            <h4 className={clsx(
                                                "font-medium text-sm mb-1",
                                                isActive ? "text-white" : "text-gray-300"
                                            )}>
                                                {index + 1}. {module.moduleTitle}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <PlayCircle size={12} />
                                                <span>{module.duration}</span>
                                            </div>
                                        </div>

                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
                    {currentModule ? (
                        <>
                            <div className="aspect-video w-full bg-black relative">
                                <iframe
                                    src={currentModule.videoUrl?.replace("watch?v=", "embed/")} // Ensure embed format
                                    className="w-full h-full absolute inset-0"
                                    allowFullScreen
                                    title={currentModule.moduleTitle}
                                />
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h1 className="text-2xl font-bold text-white">{currentModule.moduleTitle}</h1>
                                    <button
                                        onClick={(e) => toggleComplete(e, currentModule._id || modules.indexOf(currentModule))}
                                        className={clsx(
                                            "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2",
                                            completedModules.includes(currentModule._id || modules.indexOf(currentModule))
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-white/10 text-white hover:bg-white/20"
                                        )}
                                    >
                                        {completedModules.includes(currentModule._id || modules.indexOf(currentModule)) ? (
                                            <>
                                                <CheckCircle size={18} /> Completed
                                            </>
                                        ) : (
                                            <>
                                                <Circle size={18} /> Mark as Completed
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="prose prose-invert max-w-none">
                                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        {currentModule.moduleContent}
                                    </p>

                                    <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm">
                                        <p className="font-semibold mb-1">Learning Tip</p>
                                        <p>Take notes while watching the video and try to implement the concepts in a separate project.</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a module to start learning
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
