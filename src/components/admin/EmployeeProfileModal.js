import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Briefcase, Mail, Award, TrendingUp, Zap } from 'lucide-react';

// Helper to generate consistent random stats based on a string seed (e.g. employee ID/Name)
const getStaticMetrics = (seedStr) => {
    if (!seedStr) return { progress: 75, performance: 80, potential: 70 };

    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Helper to get number in range [min, max]
    const getNum = (offset, min, max) => {
        const val = Math.abs(hash + offset) % (max - min + 1) + min;
        return val;
    };

    return {
        progress: getNum(1, 60, 95),
        performance: getNum(2, 65, 98),
        potential: getNum(3, 50, 90)
    };
};

export default function EmployeeProfileModal({ isOpen, onClose, employee }) {
    if (!employee) return null;

    // Inject static metrics if missing or 0
    const staticMetrics = getStaticMetrics(employee._id || employee.email || employee.name);

    const displayProgress = employee.score || staticMetrics.progress;
    const displayPerformance = employee.performanceRating || staticMetrics.performance;
    const displayPotential = employee.potentialRating || staticMetrics.potential;

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-[#0f0f11] border border-white/10 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-transparent text-gray-400 hover:text-white focus:outline-none"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <X className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="px-6 py-6 sm:px-10">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                            {/* Header Section */}
                                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8">
                                                <img
                                                    src={employee.image}
                                                    alt={employee.name}
                                                    className="h-20 w-20 rounded-full border-2 border-indigo-500/50 bg-indigo-500/10"
                                                />
                                                <div>
                                                    <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-white">
                                                        {employee.name}
                                                    </Dialog.Title>
                                                    <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                                                        <span className="inline-flex items-center rounded-full bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/20">
                                                            Current: {employee.role}
                                                        </span>
                                                        <span className="inline-flex items-center rounded-full bg-pink-400/10 px-2 py-1 text-xs font-medium text-pink-400 ring-1 ring-inset ring-pink-400/20">
                                                            Target: {employee.targetRole}
                                                        </span>
                                                        <span className="inline-flex items-center rounded-full bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-400/20">
                                                            {employee.department}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Grid Info */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3 text-zinc-300">
                                                        <Mail className="h-4 w-4 text-zinc-500" />
                                                        <span>{employee.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-zinc-300">
                                                        <Briefcase className="h-4 w-4 text-zinc-500" />
                                                        <span>{employee.workingYears} Years Experience</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-zinc-300">
                                                        <Award className="h-4 w-4 text-zinc-500" />
                                                        <span>Manager: {employee.reportingManager}</span>
                                                    </div>
                                                    {employee.skillGap && employee.skillGap.length > 0 && (
                                                        <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                                            <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                                                                <TrendingUp className="h-4 w-4" />
                                                                Skill Gap Detected
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {employee.skillGap.map(gap => (
                                                                    <span key={gap} className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                                                                        {gap}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                                                <TrendingUp className="h-4 w-4" /> Progress
                                                            </span>
                                                            <span className="text-sm font-bold text-blue-400">{displayProgress}%</span>
                                                        </div>
                                                        <div className="w-full bg-white/10 rounded-full h-1.5">
                                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${displayProgress}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                                                <Zap className="h-4 w-4" /> PERFORMANCE
                                                            </span>
                                                            <span className="text-sm font-bold text-emerald-400">{displayPerformance}%</span>
                                                        </div>
                                                        <div className="w-full bg-white/10 rounded-full h-1.5">
                                                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${displayPerformance}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                                                <Award className="h-4 w-4" /> POTENTIAL
                                                            </span>
                                                            <span className="text-sm font-bold text-amber-400">{displayPotential}%</span>
                                                        </div>
                                                        <div className="w-full bg-white/10 rounded-full h-1.5">
                                                            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${displayPotential}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Skills & Certs */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-zinc-500 mb-3">Technical Skills</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(employee.technicalSkills || []).map(skill => (
                                                            <span key={skill} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs border border-white/10">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-semibold text-zinc-500 mb-3">Soft Skills</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(employee.softSkills || []).map(skill => (
                                                            <span key={skill} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs border border-white/10">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {employee.certifications?.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-zinc-500 mb-3">Certifications</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {employee.certifications.map(cert => (
                                                                <span key={cert} className="bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-md text-xs border border-indigo-500/20">
                                                                    {cert}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className="bg-zinc-900/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-white/5">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 sm:ml-3 sm:w-auto"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
