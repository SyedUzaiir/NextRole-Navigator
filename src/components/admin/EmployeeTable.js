"use client";

import { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { MoreVertical, Mail, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { Fragment } from "react";
import SmartSearch from "./SmartSearch";
import EmployeeProfileModal from "./EmployeeProfileModal";
import { getNineBoxCategory } from "@/utils/nineBox";
import RoleChangeModal from "./RoleChangeModal";
import { RefreshCw } from "lucide-react";
import toast from 'react-hot-toast';

export default function EmployeeTable({ employees }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [roleChangeEmployee, setRoleChangeEmployee] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'idpScore', direction: 'desc' });
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionStatus, setActionStatus] = useState({}); // Local state for optimistic UI updates

    // Bulk selection logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedEmployees(filteredEmployees.map(emp => emp.id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedEmployees(prev => [...prev, id]);
        } else {
            setSelectedEmployees(prev => prev.filter(empId => empId !== id));
        }
    };

    const handleAction = async (action, userIds, userName = null) => {
        if (!userIds || userIds.length === 0) return;

        const confirmMessage = userName
            ? `Are you sure you want to ${action} ${userName}?`
            : `Are you sure you want to ${action} ${userIds.length} employees?`;

        // No alert, but maybe a standard confirm or just proceed? User said "No Alerts".
        // Using window.confirm is technically an alert-style blocking popup.
        // Assuming browser native confirm is okay, OR we can just proceed.
        // Given prompt "No Alerts: Do not use the JavaScript alert() function", confirm() is likely discouraged too.
        // But for critical actions a confirmation is standard. I'll stick to a safer non-blocking approach or just proceed for now if no custom modal is built.
        // For this task, I will proceed to action directly or use a custom toast promise if valid. 
        // Let's use standard confirm for safety unless explicitly forbidden, but prompt said "No Alerts". 
        // I will assume simple flow: Click -> Action -> Toast.

        // Optimistic Update
        const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
        const newActionStatus = { ...actionStatus };
        userIds.forEach(id => {
            newActionStatus[id] = newStatus;
        });
        setActionStatus(newActionStatus);

        toast.success(action === 'accept' ? 'Employee Accepted Successfully' : 'Employee Rejected Successfully');
        setActionLoading(true);

        try {
            const res = await fetch('/api/admin/employee-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, userIds })
            });

            if (!res.ok) throw new Error('Action failed');

            // Success - no reload needed as local state handles display
        } catch (error) {
            console.error(error);
            toast.error('Failed to perform action');

            // Revert optimistic update on failure
            const revertedStatus = { ...actionStatus };
            userIds.forEach(id => {
                delete revertedStatus[id];
            });
            setActionStatus(revertedStatus);

        } finally {
            setActionLoading(false);
            // Clear selection if bulk action
            if (userIds.length > 1) {
                setSelectedEmployees([]);
            }
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const response = await fetch('/api/admin/update-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newRole }),
            });

            if (response.ok) {
                // Refresh logic - ideally verify with parent or router refresh
                // For now we'll force a reload or you might want to pass a refresh callback from parent
                window.location.reload();
            } else {
                console.error("Failed to update role");
            }
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    // Filtering Logic
    const filteredEmployees = employees.filter((employee) => {
        const query = searchQuery.toLowerCase();
        const searchableFields = [
            employee.name,
            employee.department,
            employee.role,
            employee.reportingManager,
            ...(employee.technicalSkills || [])
        ];

        return searchableFields.some(field =>
            field.toLowerCase().includes(query)
        );
    });

    // Sorting Logic
    const sortedEmployees = [...filteredEmployees].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <div className="h-4 w-4" />; // Placeholder
        return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <div className="space-y-6">
            {/* Search Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white/5 p-4 border border-white/5 backdrop-blur-sm">
                <SmartSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search by name, role, skill, or manager..."
                />
                <div className="text-sm text-zinc-400">
                    Showing <span className="text-white font-bold">{sortedEmployees.length}</span> employees
                </div>
                {/* Bulk Actions */}
                {selectedEmployees.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleAction('accept', selectedEmployees)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
                        >
                            Bulk Accept
                        </button>
                        <button
                            onClick={() => handleAction('reject', selectedEmployees)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/30 transition-colors"
                        >
                            Bulk Reject
                        </button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f11]/50 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500/20"
                                        onChange={handleSelectAll}
                                        checked={filteredEmployees.length > 0 && selectedEmployees.length === filteredEmployees.length}
                                    />
                                </th>
                                {[
                                    { key: 'rank', label: 'Rank', sortable: false },
                                    { key: 'name', label: 'Name' },
                                    { key: 'department', label: 'Department' },
                                    { key: 'role', label: 'Current Role' },
                                    { key: 'idpScore', label: 'IDP Score' },
                                    { key: 'actions', label: 'Actions / Status', sortable: false }
                                ].map((header) => (
                                    <th
                                        key={header.key}
                                        scope="col"
                                        className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 ${header.sortable !== false ? 'cursor-pointer hover:text-white hover:bg-white/5 transition-colors' : ''}`}
                                        onClick={() => header.sortable !== false && requestSort(header.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {header.label}
                                            {header.sortable !== false && <SortIcon columnKey={header.key} />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {sortedEmployees.map((person, index) => (
                                <tr key={person.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500/20"
                                            checked={selectedEmployees.includes(person.id)}
                                            onChange={(e) => handleSelectOne(e, person.id)}
                                        />
                                    </td>
                                    {/* Rank Column */}
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-400">
                                        {index + 1}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <button
                                            onClick={() => setSelectedProfile(person)}
                                            className="flex items-center group/btn text-left"
                                        >
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img className="h-10 w-10 rounded-full ring-2 ring-white/10 group-hover/btn:ring-indigo-500/50 transition-all" src={person.image} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-medium text-white group-hover/btn:text-indigo-400 underline decoration-indigo-500/30 underline-offset-4 decoration-2 transition-colors">
                                                    {person.name}
                                                </div>
                                            </div>
                                        </button>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-white/10">
                                            {person.department}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-300">
                                        {person.role}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                                        {person.idpScore}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {(() => {
                                            const currentStatus = actionStatus[person.id] || person.accountStatus;

                                            if (currentStatus === 'ACCEPTED') {
                                                return (
                                                    <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                                                        Accepted
                                                    </span>
                                                );
                                            } else if (currentStatus === 'REJECTED') {
                                                return (
                                                    <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
                                                        Rejected
                                                    </span>
                                                );
                                            } else {
                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleAction('accept', [person.id], person.name)}
                                                            disabled={actionLoading}
                                                            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/20 transition-colors"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction('reject', [person.id], person.name)}
                                                            disabled={actionLoading}
                                                            className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded border border-red-500/20 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <div>
                                                <Menu.Button className="flex items-center rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors focus:outline-none">
                                                    <span className="sr-only">Open options</span>
                                                    <MoreVertical className="h-5 w-5" aria-hidden="true" />
                                                </Menu.Button>
                                            </div>

                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-[#18181b] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-white/10 divide-y divide-white/5">
                                                    <div className="py-1">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <a
                                                                    href={`mailto:${person.email}`}
                                                                    className={`${active ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-300"
                                                                        } group flex items-center px-4 py-2 text-sm transition-colors`}
                                                                >
                                                                    <Mail className="mr-3 h-4 w-4 text-zinc-500 group-hover:text-indigo-400" aria-hidden="true" />
                                                                    Email
                                                                </a>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                    <div className="py-1">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={() => setSelectedProfile(person)}
                                                                    className={`${active ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-300"
                                                                        } group flex w-full items-center px-4 py-2 text-sm transition-colors`}
                                                                >
                                                                    <Eye className="mr-3 h-4 w-4 text-zinc-500 group-hover:text-indigo-400" aria-hidden="true" />
                                                                    Details
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {sortedEmployees.length === 0 && (
                        <div className="p-10 text-center text-zinc-500">
                            No employees found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </div>

            <EmployeeProfileModal
                isOpen={!!selectedProfile}
                onClose={() => setSelectedProfile(null)}
                employee={selectedProfile}
            />

            <RoleChangeModal
                isOpen={!!roleChangeEmployee}
                onClose={() => setRoleChangeEmployee(null)}
                employee={roleChangeEmployee}
                onConfirm={handleRoleUpdate}
            />
        </div>
    );
}
