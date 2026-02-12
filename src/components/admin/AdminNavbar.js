"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Repeat, UserPlus, LogOut, FileUp, BarChart2, Check } from "lucide-react";
import toast from "react-hot-toast";

const AdminNavbar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Employees", href: "/admin/employee", icon: Users },
        { name: "History", href: "/admin/rotations", icon: Repeat }
        // { name: "Add Role", href: "/admin/add-role", icon: UserPlus },
        // { name: "Import&Export", href: "/admin/employee-upload", icon: FileUp },
        // { name: "Skill Gap", href: "/admin/skill-gap", icon: BarChart2 },
        // { name: "Requests", href: "/admin/requests", icon: Check },
    ];

    const handleLogout = () => {
        toast.success("Logged out successfully");
        // In a real app, we would call a logout API and clear cookies/tokens
        // For mock purposes, just valid toast response
        window.location.href = "/login";
    };

    const isActive = (path) => {
        if (path === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(path);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">
                        Admin<span className="text-white/60">Portal</span>
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${active
                                    ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon className={`h-4 w-4 transition-colors ${active ? "text-indigo-400" : "text-zinc-500 group-hover:text-indigo-400"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center">
                    {/* <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button> */}
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;
