"use client";
import { useState, useMemo } from 'react';
import { getNineBoxCategory } from '@/utils/nineBox';
import CategoryListModal from './CategoryListModal';

export default function NineBoxGrid({ employees }) {
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Filter employees into categories
    const categoryGroups = useMemo(() => {
        const groups = {
            'Stars': [],
            'High Performers': [],
            'Workhorses': [],
            'High Potential': [],
            'Core Players': [],
            'Effective': [],
            'Dilemmas': [],
            'Risk': [],
            'Underperformers': []
        };

        employees.forEach(emp => {
            const category = getNineBoxCategory(emp.idpScore);
            if (groups[category]) {
                groups[category].push(emp);
            }
        });

        return groups;
    }, [employees]);

    // Grid layout definition (row by row)
    const gridLayout = [
        [
            { name: 'Stars', color: 'bg-purple-500', textColor: 'text-purple-200' },
            { name: 'High Performers', color: 'bg-indigo-500', textColor: 'text-indigo-200' },
            { name: 'Workhorses', color: 'bg-blue-500', textColor: 'text-blue-200' }
        ],
        [
            { name: 'High Potential', color: 'bg-emerald-500', textColor: 'text-emerald-200' },
            { name: 'Core Players', color: 'bg-teal-500', textColor: 'text-teal-200' },
            { name: 'Effective', color: 'bg-cyan-500', textColor: 'text-cyan-200' }
        ],
        [
            { name: 'Dilemmas', color: 'bg-yellow-500', textColor: 'text-yellow-200' },
            { name: 'Risk', color: 'bg-orange-500', textColor: 'text-orange-200' },
            { name: 'Underperformers', color: 'bg-red-500', textColor: 'text-red-200' }
        ]
    ];

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Performance Matrix (9-Box)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
                {gridLayout.flat().map((box) => {
                    const count = categoryGroups[box.name]?.length || 0;
                    return (
                        <div
                            key={box.name}
                            onClick={() => count > 0 && setSelectedCategory(box.name)}
                            className={`
                                relative overflow-hidden rounded-xl p-6 border border-white/5 
                                transition-all duration-300 group
                                ${count > 0 ? 'cursor-pointer hover:border-white/20 hover:shadow-2xl hover:scale-[1.02]' : 'opacity-80 cursor-default'}
                                bg-[#0f0f11]
                            `}
                        >
                            {/* Background Glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${box.color} rounded-full blur-[60px] opacity-[0.15] group-hover:opacity-[0.25] transition-opacity`} />

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h3 className={`font-semibold ${box.textColor} mb-1`}>{box.name}</h3>
                                    <div className="text-4xl font-bold text-white tracking-tight">
                                        {count}
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                                    <span>Employees</span>
                                    {count > 0 && (
                                        <span className="group-hover:translate-x-1 transition-transform text-zinc-300">
                                            View List →
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <CategoryListModal
                isOpen={!!selectedCategory}
                onClose={() => setSelectedCategory(null)}
                category={selectedCategory}
                employees={categoryGroups[selectedCategory] || []}
            />
        </div>
    );
}
