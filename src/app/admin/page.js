import { employees } from "@/data/mockData";
import DashboardStats from "@/components/admin/DashboardStats";
import NineBoxGrid from "@/components/admin/NineBoxGrid";

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
                <p className="text-zinc-400">Overview of your organization's talent and performance.</p>
            </div>

            <DashboardStats employees={employees} />

            <NineBoxGrid employees={employees} />
        </div>
    );
}
