"use client";

import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Building, Award, Save, X, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';

export default function ProfilePage({ isOnboarding = false }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        currentRole: '',
        companyEmail: '',
        department: '',
        proficiencyLevel: '',
        reportingManager: '',
        workExperience: '',
        softSkills: [],
        technicalSkills: [],
        certifications: []
    });

    const [metrics, setMetrics] = useState({
        potential: 0,
        performance: 0,
        idpScore: 0
    });

    // Temp state for adding list items
    const [tempSoftSkill, setTempSoftSkill] = useState('');
    const [tempTechSkill, setTempTechSkill] = useState('');
    const [tempCert, setTempCert] = useState('');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user && !isOnboarding) {
                try {
                    const res = await fetch('/api/user');
                    if (res.ok) {
                        const data = await res.json();
                        setFormData({
                            fullName: data.fullName || '',
                            username: data.username || '',
                            currentRole: data.currentRole || '',
                            companyEmail: data.companyEmail || '',
                            department: data.department || '',
                            proficiencyLevel: data.proficiencyLevel || '',
                            reportingManager: data.reportingManager || '',
                            workExperience: data.workExperience || '',
                            softSkills: data.softSkills || [],
                            technicalSkills: data.technicalSkills || [],
                            certifications: data.certifications || []
                        });
                        setMetrics({
                            potential: data.calculatedMetrics?.potential || 0,
                            performance: data.calculatedMetrics?.performance || 0,
                            idpScore: data.idpScore || 0
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch user profile", err);
                }
            }
            setLoading(false);
        };
        getUser();
    }, [isOnboarding]);

    const handleSave = async () => {
        setError('');
        setSuccess('');
        try {
            // Use the onboarding endpoint for updates as it handles all fields
            const res = await fetch('/api/user/onboarding', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
                return;
            }

            if (isOnboarding) {
                router.push('/profile');
            } else {
                setSuccess('Profile updated successfully!');
            }
        } catch (err) {
            setError('Failed to save profile');
            console.error(err);
        }
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

    if (loading) return <div className="text-white text-center mt-10">Loading...</div>;

    return (
        <AuthGuard>
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-8">{isOnboarding ? 'Complete Your Profile' : 'My Profile'}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: User Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* IDP Score & Metrics Card */}
                        {!isOnboarding && (
                            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                                    {/* IDP Score - Radial Dial */}
                                    <div className="flex-shrink-0 relative group">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="relative w-48 h-48 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                                                    strokeDasharray={502}
                                                    strokeDashoffset={502 - (502 * metrics.idpScore) / 100}
                                                    strokeLinecap="round"
                                                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                                <span className="text-5xl font-bold tracking-tighter">{Math.round(metrics.idpScore)}</span>
                                                <span className="text-xs text-primary font-bold uppercase tracking-widest mt-1">IDP Score</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics - Progress Bars */}
                                    <div className="flex-1 w-full space-y-8">
                                        <div>
                                            <div className="flex justify-between mb-2 items-end">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                        Potential <span className="text-xs font-normal text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">ADS Score x 10</span>
                                                    </h3>
                                                </div>
                                                <span className="text-2xl font-bold text-white">{Math.round(metrics.potential)}<span className="text-sm text-gray-500 font-normal">/100</span></span>
                                            </div>
                                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-0 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${Math.min(metrics.potential, 100)}%` }}></div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between mb-2 items-end">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                        Performance <span className="text-xs font-normal text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">Tasks + Courses</span>
                                                    </h3>
                                                </div>
                                                <span className="text-2xl font-bold text-white">{Math.round(metrics.performance)}</span>
                                            </div>
                                            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-0 transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(metrics.performance, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="glass-panel p-8 rounded-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white">
                                    {formData.fullName ? formData.fullName.charAt(0) : (user?.email?.charAt(0) || 'U')}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{formData.fullName || 'New User'}</h2>
                                    <p className="text-gray-400">{formData.currentRole || 'Role not set'}</p>
                                </div>
                            </div>

                            {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded mb-4">{error}</div>}
                            {success && <div className="bg-green-500/20 border border-green-500 text-green-500 p-3 rounded mb-4">{success}</div>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary/50 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Department</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary/50 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Current Role</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={formData.currentRole}
                                            onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary/50 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Reporting Manager</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={formData.reportingManager}
                                            onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary/50 outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Proficiency Level</label>
                                    <select
                                        value={formData.proficiencyLevel}
                                        onChange={(e) => setFormData({ ...formData, proficiencyLevel: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 outline-none transition-colors appearance-none"
                                    >
                                        <option value="" disabled>Select Level</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Work Experience</label>
                                    <input
                                        type="text"
                                        value={formData.workExperience}
                                        onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 outline-none transition-colors"
                                    />
                                </div>

                                {/* Skills & Certs - Full Width */}
                                <div className="md:col-span-2 space-y-6 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Soft Skills</label>
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
                                                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary/50 outline-none"
                                                placeholder="Add soft skill..."
                                            />
                                            <button onClick={() => addItem('softSkills', tempSoftSkill, setTempSoftSkill)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Plus size={20} /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Technical Skills</label>
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
                                                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary/50 outline-none"
                                                placeholder="Add technical skill..."
                                            />
                                            <button onClick={() => addItem('technicalSkills', tempTechSkill, setTempTechSkill)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Plus size={20} /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Certifications</label>
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
                                                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary/50 outline-none"
                                                placeholder="Add certification..."
                                            />
                                            <button onClick={() => addItem('certifications', tempCert, setTempCert)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Plus size={20} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                                >
                                    <Save size={18} /> {isOnboarding ? 'Complete Profile' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Badges (Static for now) */}
                    {!isOnboarding && (
                        <div className="lg:col-span-1">
                            <div className="glass-panel p-6 rounded-2xl h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                                        <Award size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Achievements</h3>
                                </div>
                                <p className="text-gray-400 text-sm">Badges will appear here as you complete courses.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
