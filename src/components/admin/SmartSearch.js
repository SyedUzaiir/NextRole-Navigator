import { Search } from "lucide-react";

export default function SmartSearch({ value, onChange, placeholder = "Search..." }) {
    return (
        <div className="relative w-full max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-zinc-400" aria-hidden="true" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full rounded-full border-0 bg-white/5 py-3 pl-11 pr-4 text-white placeholder:text-zinc-500 hover:bg-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-all shadow-lg shadow-black/20"
                placeholder={placeholder}
            />
            <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <kbd className="inline-flex items-center rounded border border-white/10 px-2 font-sans text-xs text-zinc-400">
                    ⌘K
                </kbd>
            </div>
        </div>
    );
}
