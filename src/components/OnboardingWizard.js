"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader2, Upload, X } from 'lucide-react';
import clsx from 'clsx';

const steps = [
    { id: 1, title: 'Basic Info', description: 'Tell us about your role' },
    { id: 2, title: 'Experience', description: 'Your level and history' },
    { id: 3, title: 'Skills', description: 'What are you good at?' },
    { id: 4, title: 'Certifications', description: 'Your achievements' },
];

export default function OnboardingWizard({ initialData }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: initialData?.fullName || '',
        department: '',
        currentRole: initialData?.currentRole || '',
        reportingManager: '',
        proficiencyLevel: '',
        workExperience: '',
        softSkills: [],
        technicalSkills: [],
        certifications: [],
        adsScore: '',
        tasksCompleted: '',
    });

    // Temporary state for inputs that add to arrays
    const [tempSoftSkill, setTempSoftSkill] = useState('');
    const [tempTechSkill, setTempTechSkill] = useState('');
    const [tempCert, setTempCert] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addItem = (field, value, setTemp) => {
        if (!value.trim()) return;
        if (formData[field].includes(value.trim())) return;
        setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
        setTemp('');
    };

    const removeItem = (field, itemToRemove) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(item => item !== itemToRemove)
        }));
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/onboarding', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to submit onboarding data');

            router.push('/');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.fullName && formData.department && formData.currentRole && formData.reportingManager;
            case 2:
            case 2:
                return formData.proficiencyLevel && formData.workExperience && formData.adsScore && formData.tasksCompleted;
            case 3:
                return formData.softSkills.length > 0 && formData.technicalSkills.length > 0;
            case 4:
                return true; // Certifications are optional
            default:
                return false;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            {/* Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 -z-10 rounded-full"></div>
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-[#0A0A0A] px-2">
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                currentStep >= step.id
                                    ? "border-primary bg-primary text-white"
                                    : "border-white/20 bg-[#0A0A0A] text-gray-500"
                            )}>
                                {currentStep > step.id ? <Check size={20} /> : step.id}
                            </div>
                            <div className="text-center hidden sm:block">
                                <p className={clsx(
                                    "text-sm font-medium transition-colors",
                                    currentStep >= step.id ? "text-white" : "text-gray-500"
                                )}>{step.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-2">{steps[currentStep - 1].title}</h2>
                        <p className="text-gray-400 mb-8">{steps[currentStep - 1].description}</p>

                        {currentStep === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Engineering"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Current Job Role</label>
                                    <input
                                        type="text"
                                        name="currentRole"
                                        value={formData.currentRole}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Senior Developer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Reporting Manager</label>
                                    <input
                                        type="text"
                                        name="reportingManager"
                                        value={formData.reportingManager}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Manager Name"
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-medium text-gray-300">Proficiency Level</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {['Beginner', 'Intermediate', 'Expert'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setFormData(prev => ({ ...prev, proficiencyLevel: level }))}
                                                className={clsx(
                                                    "p-4 rounded-xl border transition-all text-left group",
                                                    formData.proficiencyLevel === level
                                                        ? "bg-primary/20 border-primary text-white"
                                                        : "bg-black/20 border-white/10 text-gray-400 hover:border-white/30"
                                                )}
                                            >
                                                <div className="font-semibold mb-1">{level}</div>
                                                <div className="text-xs opacity-60">
                                                    {level === 'Beginner' && '0-2 years experience'}
                                                    {level === 'Intermediate' && '2-5 years experience'}
                                                    {level === 'Expert' && '5+ years experience'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Years of Experience</label>
                                    <input
                                        type="text"
                                        name="workExperience"
                                        value={formData.workExperience}
                                        onChange={handleInputChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="e.g. 4 years"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">ADS Score (0-10)</label>
                                        <input
                                            type="number"
                                            name="adsScore"
                                            value={formData.adsScore}
                                            onChange={handleInputChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="e.g. 7.5"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Tasks Completed</label>
                                        <input
                                            type="number"
                                            name="tasksCompleted"
                                            value={formData.tasksCompleted}
                                            onChange={handleInputChange}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="e.g. 15"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Soft Skills</label>
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {formData.softSkills.map((skill) => (
                                            <span key={skill} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white flex items-center gap-2">
                                                {skill}
                                                <button onClick={() => removeItem('softSkills', skill)} className="hover:text-red-400"><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tempSoftSkill}
                                            onChange={(e) => setTempSoftSkill(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addItem('softSkills', tempSoftSkill, setTempSoftSkill)}
                                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="Add a soft skill (e.g. Communication)"
                                        />
                                        <button
                                            onClick={() => addItem('softSkills', tempSoftSkill, setTempSoftSkill)}
                                            className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Technical Skills</label>
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {formData.technicalSkills.map((skill) => (
                                            <span key={skill} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white flex items-center gap-2">
                                                {skill}
                                                <button onClick={() => removeItem('technicalSkills', skill)} className="hover:text-red-400"><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tempTechSkill}
                                            onChange={(e) => setTempTechSkill(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addItem('technicalSkills', tempTechSkill, setTempTechSkill)}
                                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="Add a technical skill (e.g. React)"
                                        />
                                        <button
                                            onClick={() => addItem('technicalSkills', tempTechSkill, setTempTechSkill)}
                                            className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Certifications (Optional)</label>
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {formData.certifications.map((cert) => (
                                            <span key={cert} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white flex items-center gap-2">
                                                {cert}
                                                <button onClick={() => removeItem('certifications', cert)} className="hover:text-red-400"><X size={14} /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tempCert}
                                            onChange={(e) => setTempCert(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addItem('certifications', tempCert, setTempCert)}
                                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="Add a certification (e.g. AWS Certified)"
                                        />
                                        <button
                                            onClick={() => addItem('certifications', tempCert, setTempCert)}
                                            className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 text-white transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1 || loading}
                    className={clsx(
                        "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors",
                        currentStep === 1
                            ? "opacity-0 pointer-events-none"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                >
                    <ChevronLeft size={20} />
                    Back
                </button>
                <button
                    onClick={nextStep}
                    disabled={!isStepValid() || loading}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <>
                            {currentStep === steps.length ? 'Complete Setup' : 'Continue'}
                            {currentStep !== steps.length && <ChevronRight size={20} />}
                        </>
                    )}
                </button>
            </div>
        </div >
    );
}
