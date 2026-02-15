
'use client';

import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/customers', label: 'Customers', icon: Users },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-900">
            <aside className="w-64 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col fixed h-screen">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h1 className="font-bold text-xl">BongaAdmin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 font-medium rounded-xl transition-colors ${isActive
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 pb-8">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto ml-64">
                {children}
            </main>
        </div>
    );
}
