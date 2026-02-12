import { Users, UserCheck, TrendingUp, UserMinus } from "lucide-react";

export default function DashboardStats({ employees }) {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => {
        // Assuming 'current' status in history means active, or just all are active in mock data
        // Let's assume all are active for now unless we add a 'status' field to the root object.
        // In mockData we didn't explicitly add 'status' to root, but let's assume all are active.
        return true;
    }).length;

    const avgPerformance = Math.round(
        employees.reduce((acc, curr) => acc + curr.performance, 0) / totalEmployees
    );

    // Mocking "On Bench" as those with role "Junior Dev" or similar just for variety, 
    // or maybe employees with no current project. 
    // Let's mock it as random or specific property if it existed.
    // For now, let's say anyone with performance < 70 is 'On Bench' or potential candidate for bench.
    // OR just a hardcoded/random calc for the mock.
    const onBench = employees.filter(e => e.project === "Bench" || e.workingYears < 1).length;

    const stats = [
        {
            name: "Total Employees",
            value: totalEmployees,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
        },
        {
            name: "Active Employees",
            value: activeEmployees,
            icon: UserCheck,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
        },
        {
            name: "Avg Performance",
            value: `${avgPerformance}%`,
            icon: TrendingUp,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
        },
        {
            name: "On Bench",
            value: onBench, // defaulting to 0 based on mock logic
            icon: UserMinus,
            color: "text-rose-400",
            bg: "bg-rose-400/10",
            border: "border-rose-400/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.name}
                        className={`relative overflow-hidden rounded-2xl border ${stat.border} bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10`}
                    >
                        <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${stat.bg} opacity-50 blur-2xl`} />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-400">{stat.name}</p>
                                <p className="mt-2 text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                            </div>
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} ${stat.border} border`}>
                                <Icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
