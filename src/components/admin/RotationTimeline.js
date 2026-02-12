"use client";

import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { Check, ChevronsUpDown, Calendar, Briefcase, PlusCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function RotationTimeline({ employees }) {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [query, setQuery] = useState("");
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [newRoleData, setNewRoleData] = useState({ title: "", year: new Date().getFullYear().toString() });

    // Autocomplete Filtering
    const filteredEmployees =
        query === ""
            ? employees
            : employees.filter((person) => {
                return person.name.toLowerCase().includes(query.toLowerCase()) ||
                    person.email.toLowerCase().includes(query.toLowerCase());
            });

    const handleUpdateRole = (e) => {
        e.preventDefault();
        if (!newRoleData.title) return toast.error("Role title is required");

        const updatedHistory = [
            ...selectedEmployee.history.map(h => ({ ...h, status: "completed" })), // Mark previous as completed
            { role: newRoleData.title, year: newRoleData.year, status: "current" }
        ];

        // Update local state for visualization
        const updatedEmployee = {
            ...selectedEmployee,
            role: newRoleData.title,
            history: updatedHistory
        };

        setSelectedEmployee(updatedEmployee);
        setIsAddingRole(false);
        setNewRoleData({ title: "", year: new Date().getFullYear().toString() });
        toast.success("Role Updated Successfully");
    };

    return (
        <div className="mx-auto max-w-4xl">
            {/* Search Interface */}
            <div className={`transition-all duration-500 ease-in-out ${selectedEmployee ? "mb-8 bg-white/5 p-4 rounded-xl border border-white/5" : "flex h-[60vh] flex-col items-center justify-center bg-white/5 p-10 rounded-2xl border border-white/5"}`}>
                {!selectedEmployee && (
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Find Employee Journey</h2>
                        <p className="text-zinc-400">Search for an employee to view their career rotation history.</p>
                    </div>
                )}

                <div className={`relative ${selectedEmployee ? "w-full" : "w-full max-w-lg"}`}>
                    <Combobox value={selectedEmployee} onChange={setSelectedEmployee}>
                        <div className="relative mt-1">
                            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-[#0f0f11] text-left border border-white/10 focus-within:ring-2 focus-within:ring-indigo-500 sm:text-sm shadow-xl">
                                <Combobox.Input
                                    className="w-full border-none py-3 pl-4 pr-10 text-sm leading-5 text-white bg-transparent focus:ring-0 placeholder:text-zinc-500"
                                    displayValue={(person) => person?.name}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search by name or email..."
                                />
                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronsUpDown className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                                </Combobox.Button>
                            </div>
                            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#18181b] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 border border-white/10">
                                {filteredEmployees.length === 0 && query !== "" ? (
                                    <div className="relative cursor-default select-none px-4 py-2 text-gray-400">
                                        Nothing found.
                                    </div>
                                ) : (
                                    filteredEmployees.map((person) => (
                                        <Combobox.Option
                                            key={person.id}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-indigo-600/20 text-indigo-300" : "text-zinc-300"
                                                }`
                                            }
                                            value={person}
                                        >
                                            {({ selected, active }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                                        {person.name} <span className="text-xs text-zinc-500 ml-2">({person.email})</span>
                                                    </span>
                                                    {selected ? (
                                                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? "text-indigo-300" : "text-indigo-400"}`}>
                                                            <Check className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Combobox.Option>
                                    ))
                                )}
                            </Combobox.Options>
                        </div>
                    </Combobox>
                </div>
            </div>

            {/* Timeline View */}
            {selectedEmployee && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <img src={selectedEmployee.image} alt="" className="h-16 w-16 rounded-full border-2 border-indigo-500/50" />
                            <div>
                                <h2 className="text-2xl font-bold text-white">{selectedEmployee.name}</h2>
                                <p className="text-zinc-400">{selectedEmployee.role}</p>
                            </div>
                        </div>
                        {/* {!isAddingRole && (
                            <button
                                onClick={() => setIsAddingRole(true)}
                                className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
                            >
                                <PlusCircle className="h-4 w-4" /> Update Role
                            </button>
                        )} */}
                    </div>

                    <div className="relative border-l border-white/10 pl-8 ml-8 space-y-12">
                        {[...selectedEmployee.history].reverse().map((role, idx) => (
                            <div key={idx} className="relative group">
                                {/* Dot */}
                                <div className={`absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-[#0f0f11] ${role.status === 'current' ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-700'}`}>
                                    {role.status === 'current' && <div className="h-2 w-2 rounded-full bg-white" />}
                                </div>

                                {/* Content */}
                                <div className={`p-6 rounded-2xl border ${role.status === 'current' ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-white/5 bg-white/5'} transition-all hover:bg-white/10`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className={`text-lg font-bold ${role.status === 'current' ? 'text-indigo-400' : 'text-zinc-300'}`}>
                                            {role.role}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 bg-black/20 px-2 py-1 rounded">
                                            <Calendar className="h-3 w-3" />
                                            {role.year}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                        <Briefcase className="h-4 w-4" />
                                        <span>{role.status === 'current' ? 'Current Position' : 'Previous Position'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Role Form */}
                    {isAddingRole && (
                        <div className="mt-8 relative border-l border-white/10 pl-8 ml-8">
                            <div className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-[#0f0f11] bg-indigo-500">
                                <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                            <form onSubmit={handleUpdateRole} className="p-6 rounded-2xl border border-indigo-500/50 bg-indigo-900/10 space-y-4 animate-in fade-in zoom-in duration-300">
                                <h3 className="text-lg font-bold text-white mb-4">Assign New Role</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">New Role Title</label>
                                        <input
                                            type="text"
                                            value={newRoleData.title}
                                            onChange={(e) => setNewRoleData({ ...newRoleData, title: e.target.value })}
                                            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white placeholder:text-zinc-600 focus:ring-indigo-500"
                                            placeholder="e.g. Senior Product Manager"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Effective Year</label>
                                        <input
                                            type="text"
                                            value={newRoleData.year}
                                            onChange={(e) => setNewRoleData({ ...newRoleData, year: e.target.value })}
                                            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white placeholder:text-zinc-600 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingRole(false)}
                                        className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                    >
                                        Confirm Change <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
