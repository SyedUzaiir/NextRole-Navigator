import AddRoleForm from "@/components/admin/AddRoleForm";

export default function AddRolePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Add New Role</h1>
                <p className="text-zinc-400">Define requirements for a new position in the organization.</p>
            </div>

            <AddRoleForm />
        </div>
    );
}
