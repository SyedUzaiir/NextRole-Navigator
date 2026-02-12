import { employees } from "@/data/mockData";
import RotationTimeline from "@/components/admin/RotationTimeline";

export default function RotationsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Role Rotations & History</h1>
                <p className="text-zinc-400">Track and manage employee career progression.</p>
            </div>

            <RotationTimeline employees={employees} />
        </div>
    );
}
