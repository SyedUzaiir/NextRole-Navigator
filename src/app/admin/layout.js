import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />
            </div>

            <AdminNavbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
