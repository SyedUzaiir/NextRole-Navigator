"use client";

import { useState } from "react";
import { Plus, X, List, Save, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function AddRoleForm() {
    const [formData, setFormData] = useState({
        roleName: "",
        description: "",
        skills: [],
        currentSkill: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            if (formData.currentSkill.trim()) {
                if (!formData.skills.includes(formData.currentSkill.trim())) {
                    setFormData(prev => ({
                        ...prev,
                        skills: [...prev.skills, prev.currentSkill.trim()],
                        currentSkill: ""
                    }));
                } else {
                    toast.error("Skill already added");
                }
            }
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.roleName || !formData.description || formData.skills.length === 0) {
            toast.error("Please fill in all fields (Role Name, Description, and at least one Skill)");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/admin/add-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roleName: formData.roleName,
                    description: formData.description,
                    skills: formData.skills
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("New Role Created Successfully!");
                // Reset Form
                setFormData({
                    roleName: "",
                    description: "",
                    skills: [],
                    currentSkill: ""
                });
            } else {
                toast.error(data.error || "Failed to add role");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left Side: Context / Preview */}
            <div className="hidden lg:block space-y-8 sticky top-24">
                <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500 blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-purple-500 blur-3xl opacity-50"></div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-4">Why define roles?</h3>
                        <ul className="space-y-4 text-indigo-100">
                            <li className="flex items-start gap-3">
                                <div className="p-1 rounded bg-indigo-500/30 backdrop-blur-sm mt-1">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <p>Clear career paths improve employee retention and satisfaction.</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="p-1 rounded bg-indigo-500/30 backdrop-blur-sm mt-1">
                                    <List className="h-4 w-4" />
                                </div>
                                <p>Standardized skills help in fair performance evaluations.</p>
                            </li>
                        </ul>

                        <div className="mt-8 pt-8 border-t border-indigo-500/30">
                            <h4 className="font-semibold text-white mb-2">Creating:</h4>
                            <div className="bg-indigo-900/40 rounded-xl p-4 border border-indigo-500/30 backdrop-blur-sm">
                                <div className="h-4 w-32 bg-indigo-400/20 rounded mb-2"></div>
                                <div className="h-3 w-48 bg-indigo-400/10 rounded mb-4"></div>
                                <div className="flex gap-2">
                                    <div className="h-6 w-16 bg-indigo-400/20 rounded-full"></div>
                                    <div className="h-6 w-20 bg-indigo-400/20 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <form onSubmit={handleSubmit} className="bg-white/5 rounded-2xl border border-white/5 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="roleName" className="block text-sm font-medium text-zinc-400 mb-2">Role Name</label>
                        <input
                            type="text"
                            name="roleName"
                            id="roleName"
                            value={formData.roleName}
                            onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                            className="block w-full rounded-lg border-0 bg-black/40 py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-all"
                            placeholder="e.g. Senior Backend Engineer"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-zinc-400 mb-2">Description & Requirements</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="block w-full rounded-lg border-0 bg-black/40 py-3 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-all"
                            placeholder="Describe the responsibilities and necessary experience..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Required Skills</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.currentSkill}
                                onChange={(e) => setFormData({ ...formData, currentSkill: e.target.value })}
                                onKeyDown={handleAddSkill}
                                className="block w-full rounded-lg border-0 bg-black/40 py-3 pr-12 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-600 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-all"
                                placeholder="Type and press Enter to add skills"
                            />
                            <button
                                type="button"
                                onClick={handleAddSkill}
                                className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-white"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        {/* Tags Display */}
                        <div className="mt-3 flex flex-wrap gap-2 min-h-[30px]">
                            {formData.skills.map((skill, index) => (
                                <span key={index} className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-white">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                            {formData.skills.length === 0 && (
                                <span className="text-xs text-zinc-600 italic">No skills added yet.</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all transform ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-indigo-400 hover:to-purple-500 hover:scale-[1.02]'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Create Role
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
