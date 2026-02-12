"use client";

import React from 'react';
import clsx from 'clsx';

export default function HomePage() {
    const teamMembers = [
        { name: "Mohammed Abdul Raheem (Team Lead)", role: "[Backend Developer]", college: "[Placeholder]", skills: "[Placeholder]", isLead: true },
        { name: "Syed Uzair Mohiuddin", role: "[ Backend & Authorization Developer]", college: "[Placeholder]", skills: "[Placeholder]", isLead: false },
        { name: "M Vishal", role: "[Database Administrator]", college: "[Placeholder]", skills: "[Placeholder]", isLead: false },
        { name: "Monoj Kumar", role: "[Frontend Developer]", college: "[Placeholder]", skills: "[Placeholder]", isLead: false },
        { name: "Faiz Uddin Uzair", role: "[Authentication & Authorization Developer]", college: "[Placeholder]", skills: "[Placeholder]", isLead: false },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center py-10 px-4 font-sans relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-blue-500/20 blur-[120px] rounded-full -z-10" />
            {/* Header Section */}
            <header className="text-center mb-10 space-y-2 animate-in fade-in slide-in-from-top-8 duration-700">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Next Level Navigator
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    A Multi-Agent System
                </h2>
                <p className="text-base md:text-lg text-gray-500 font-medium tracking-wide uppercase letter-spacing-2">
                    Domain: Open Innovation
                </p>
            </header>

            {/* Team/Member Section */}
            <div className="w-full max-w-3xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-center mb-6 text-gray-200">Meet the Team</h2>
                <div className="space-y-4">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-center justify-between group border-b border-gray-800/50 pb-3 last:border-0 last:pb-0 hover:bg-white/5 p-2 rounded-lg transition-colors">
                            <span className={clsx("font-medium text-base", member.isLead ? "text-blue-400" : "text-gray-200")}>
                                {member.name}
                            </span>
                            <span className="hidden md:block text-gray-600 mx-4"></span>
                            <span className="text-gray-400 font-light text-sm">
                                {member.role.replace(/[\[\]]/g, '')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

