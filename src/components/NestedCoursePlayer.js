"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Circle, PlayCircle, BookOpen, Lightbulb, Trophy, Lock, AlertCircle } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import clsx from 'clsx';

export default function NestedCoursePlayer({ courseId }) {
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedModuleId, setExpandedModuleId] = useState(null);
    const [selectedSubModule, setSelectedSubModule] = useState(null);
    const [completedSubModules, setCompletedSubModules] = useState([]); // Array of subModule IDs
    const [showQuiz, setShowQuiz] = useState(false);


    // Quiz State
    const [quizAnswers, setQuizAnswers] = useState({}); // { questionIndex: selectedOption }
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizResult, setQuizResult] = useState(null); // { score, passed }

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

                    // Initialize completed sub-modules
                    const completed = [];
                    data.course.modules.forEach(m => {
                        m.subModules.forEach(s => {
                            if (s.isCompleted) completed.push(s._id);
                        });
                    });
                    setCompletedSubModules(completed);

                    // Initialize state
                    if (data.course.modules && data.course.modules.length > 0) {
                        const firstModule = data.course.modules[0];
                        setExpandedModuleId(firstModule._id);
                        if (firstModule.subModules && firstModule.subModules.length > 0) {
                            setSelectedSubModule(firstModule.subModules[0]);
                        }
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

    const toggleModule = (moduleId) => {
        setExpandedModuleId(expandedModuleId === moduleId ? null : moduleId);
    };

    const handleSubModuleClick = async (subModule, moduleIndex, subModuleIndex) => {
        setSelectedSubModule(subModule);
        setShowQuiz(false);
        setQuizSubmitted(false);
        setQuizResult(null);
        setQuizAnswers({});

        // Video is no longer fetched automatically. User is guided to search on YouTube.
    };

    const markSubModuleComplete = async (moduleIndex, subModuleIndex, subModuleId) => {
        if (completedSubModules.includes(subModuleId)) return;

        try {
            // Optimistic update
            setCompletedSubModules(prev => [...prev, subModuleId]);

            const res = await fetch(`/api/courses/${courseId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moduleIndex, subModuleIndex, isCompleted: true })
            });

            if (!res.ok) {
                throw new Error('Failed to update progress');
            }
        } catch (err) {
            console.error("Error updating progress:", err);
            // Revert on error
            setCompletedSubModules(prev => prev.filter(id => id !== subModuleId));
        }
    };

    const isModuleFullyCompleted = (module) => {
        return module.subModules.every(sub => completedSubModules.includes(sub._id));
    };

    const handleQuizSubmit = async (moduleIndex) => {
        try {
            const res = await fetch(`/api/courses/${courseId}/progress`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moduleIndex,
                    answers: Object.values(quizAnswers) // Assuming ordered index 0..N
                })
            });

            if (!res.ok) throw new Error('Failed to submit quiz');

            const result = await res.json();
            setQuizResult(result);
            setQuizSubmitted(true);
        } catch (err) {
            console.error("Error submitting quiz:", err);
            alert("Failed to submit quiz. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-12 text-center text-red-400 bg-gray-950 h-screen">Error: {error}</div>;
    }

    if (!courseData) {
        return <div className="p-12 text-center text-gray-400 bg-gray-950 h-screen">Course not found</div>;
    }

    const { modules, title } = courseData;
    const currentModule = modules.find(m => m._id === expandedModuleId);

    return (
        <AuthGuard>
            <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
                {/* Sidebar */}
                <div className="w-80 flex-shrink-0 border-r border-gray-800 bg-gray-900/50 flex flex-col">
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${(completedSubModules.length / modules.flatMap(m => m.subModules).length) * 100}%` }}
                                />
                            </div>
                            <span>{Math.round((completedSubModules.length / modules.flatMap(m => m.subModules).length) * 100)}%</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {modules.map((module, index) => {
                            const isExpanded = expandedModuleId === module._id;
                            const isCompleted = isModuleFullyCompleted(module);

                            return (
                                <div key={module._id} className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900/30">
                                    <button
                                        onClick={() => toggleModule(module._id)}
                                        className={clsx(
                                            "w-full flex items-center justify-between p-4 text-left transition-colors",
                                            isExpanded ? "bg-gray-800/50 text-white" : "hover:bg-gray-800/30 text-gray-300"
                                        )}
                                    >
                                        <span className="font-medium text-sm flex-1">Module {index + 1}: {module.moduleTitle}</span>
                                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    </button>

                                    {isExpanded && (
                                        <div className="bg-gray-950/50 border-t border-gray-800">
                                            {module.subModules.map((sub, subIndex) => {
                                                const isSubCompleted = completedSubModules.includes(sub._id);
                                                const isActive = selectedSubModule?._id === sub._id && !showQuiz;

                                                return (
                                                    <button
                                                        key={sub._id}
                                                        onClick={() => handleSubModuleClick(sub, index, subIndex)}
                                                        className={clsx(
                                                            "w-full flex items-center gap-3 p-3 pl-6 text-sm transition-all border-l-2",
                                                            isActive
                                                                ? "border-blue-500 bg-blue-500/10 text-blue-200"
                                                                : "border-transparent hover:bg-gray-800/30 text-gray-400 hover:text-gray-200"
                                                        )}
                                                    >
                                                        {isSubCompleted ? (
                                                            <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                                        ) : (
                                                            <PlayCircle size={14} className={isActive ? "text-blue-400" : "text-gray-600"} />
                                                        )}
                                                        <span className="truncate text-left">{sub.subTitle}</span>
                                                    </button>
                                                );
                                            })}

                                            {/* Quiz Button */}
                                            <button
                                                onClick={() => {
                                                    if (isCompleted) {
                                                        setSelectedSubModule(null);
                                                        setShowQuiz(true);
                                                        setQuizSubmitted(false);
                                                        setQuizResult(null);
                                                        setQuizAnswers({});
                                                    }
                                                }}
                                                disabled={!isCompleted}
                                                className={clsx(
                                                    "w-full flex items-center gap-3 p-3 pl-6 text-sm transition-all border-l-2 border-transparent",
                                                    showQuiz && expandedModuleId === module._id
                                                        ? "bg-purple-500/10 text-purple-300 border-purple-500"
                                                        : isCompleted
                                                            ? "hover:bg-purple-500/5 text-purple-400 cursor-pointer"
                                                            : "text-gray-600 cursor-not-allowed opacity-50"
                                                )}
                                            >
                                                {isCompleted ? <Trophy size={14} /> : <Lock size={14} />}
                                                <span>Module Quiz</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-950 relative">
                    {showQuiz && currentModule ? (
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="max-w-3xl mx-auto w-full">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold text-white mb-2">Module Quiz</h2>
                                    <p className="text-gray-400">Test your knowledge for: <span className="text-blue-400">{currentModule.moduleTitle}</span></p>
                                </div>

                                {quizSubmitted ? (
                                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                                        <div className={clsx(
                                            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                                            quizResult.passed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                                        )}>
                                            {quizResult.passed ? <Trophy size={40} /> : <AlertCircle size={40} />}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {quizResult.passed ? "Quiz Passed!" : "Keep Learning"}
                                        </h3>
                                        <p className="text-gray-400 mb-6">
                                            You scored <span className="text-white font-bold">{quizResult.score}%</span>
                                        </p>
                                        <button
                                            onClick={() => {
                                                setShowQuiz(false);
                                                // Optionally move to next module
                                            }}
                                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Back to Course
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {currentModule.quiz && currentModule.quiz.map((q, qIndex) => (
                                            <div key={qIndex} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                                                <h4 className="text-lg font-medium text-white mb-4">{qIndex + 1}. {q.question}</h4>
                                                <div className="space-y-3">
                                                    {q.options.map((option, oIndex) => (
                                                        <label
                                                            key={oIndex}
                                                            className={clsx(
                                                                "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                                                                quizAnswers[qIndex] === option
                                                                    ? "bg-blue-500/10 border-blue-500 text-blue-200"
                                                                    : "bg-gray-950 border-gray-800 text-gray-300 hover:bg-gray-800"
                                                            )}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${qIndex}`}
                                                                value={option}
                                                                checked={quizAnswers[qIndex] === option}
                                                                onChange={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: option }))}
                                                                className="hidden"
                                                            />
                                                            <div className={clsx(
                                                                "w-5 h-5 rounded-full border flex items-center justify-center",
                                                                quizAnswers[qIndex] === option ? "border-blue-500" : "border-gray-600"
                                                            )}>
                                                                {quizAnswers[qIndex] === option && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                                            </div>
                                                            <span>{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex justify-end pt-4 pb-12">
                                            <button
                                                onClick={() => handleQuizSubmit(modules.findIndex(m => m._id === currentModule._id))}
                                                disabled={Object.keys(quizAnswers).length < currentModule.quiz.length}
                                                className={clsx(
                                                    "px-8 py-3 rounded-lg font-bold text-lg transition-all",
                                                    Object.keys(quizAnswers).length < currentModule.quiz.length
                                                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                                )}
                                            >
                                                Submit Quiz
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : selectedSubModule ? (
                        <div className="flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                            {/* Video Player (Scrolls with content) */}
                            <div className="w-full bg-gray-900 border-b border-gray-800 aspect-video max-h-[60vh] flex-shrink-0 relative shadow-2xl flex flex-col items-center justify-center p-2 text-center">
                                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg border border-gray-700">
                                    <PlayCircle size={40} className="text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Video Lesson</h3>
                                <p className="text-gray-400 mb-8 max-w-lg leading-relaxed">
                                    Videos for this lesson are available on YouTube. Click below to view relevant resources.
                                    {/* Videos for this lesson are available on YouTube. Click below to view relevant resources for <span className="text-blue-400 font-medium">{selectedSubModule.subTitle}</span>. */}
                                </p>
                                <a
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${selectedSubModule.subTitle} ${currentModule?.moduleTitle || ''}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-8 py-4 bg-slate-700 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/25 hover:scale-105 border border-slate-600 hover:border-blue-500"
                                >
                                    <PlayCircle size={20} />
                                    Search for '{selectedSubModule.subTitle}' on YouTube
                                </a>
                            </div>

                            {/* Content (Scrolls with video) */}
                            <div className="w-full p-8 max-w-4xl mx-auto">
                                <div className="flex items-start justify-between gap-4 mb-8">
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-2">{selectedSubModule.subTitle}</h1>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs font-medium border border-blue-500/20">Video Lesson</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => markSubModuleComplete(expandedModuleId ? modules.findIndex(m => m._id === expandedModuleId) : 0, modules.find(m => m._id === expandedModuleId).subModules.indexOf(selectedSubModule), selectedSubModule._id)}
                                        className={clsx(
                                            "px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm",
                                            completedSubModules.includes(selectedSubModule._id)
                                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                                        )}
                                    >
                                        {completedSubModules.includes(selectedSubModule._id) ? (
                                            <>
                                                <CheckCircle size={16} /> Completed
                                            </>
                                        ) : (
                                            <>
                                                <Circle size={16} /> Mark Complete
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="grid gap-8 pb-12">
                                    {/* Explanation */}
                                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                                        <div className="flex items-center gap-2 mb-4 text-blue-400">
                                            <BookOpen size={20} />
                                            <h3 className="font-semibold text-lg">Explanation</h3>
                                        </div>
                                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                                            {selectedSubModule.explanation}
                                        </div>
                                    </div>

                                    {/* Examples */}
                                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                                        <div className="flex items-center gap-2 mb-4 text-amber-400">
                                            <Lightbulb size={20} />
                                            <h3 className="font-semibold text-lg">Practical Examples</h3>
                                        </div>
                                        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-line">
                                            {selectedSubModule.examples}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a lesson to start learning
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
