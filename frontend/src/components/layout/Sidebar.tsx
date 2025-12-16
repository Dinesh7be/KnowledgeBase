'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Database,
    MessageSquare,
    History,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Base', href: '/knowledge-base', icon: Database },
    { name: 'Chatbot', href: '/chatbot', icon: MessageSquare },
    { name: 'Chat Logs', href: '/chat-logs', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-5 border-b border-gray-200 dark:border-gray-800">
                <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-lg" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">Chat Base</span>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-[#E6602F] text-white font-medium'
                                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
