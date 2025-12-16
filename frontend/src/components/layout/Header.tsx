'use client';

import { useState, useEffect } from 'react';
import { LogOut, User, Bell, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';

export function Header() {
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');
        if (token && email) {
            setUser({ email });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        router.push('/login');
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex h-full items-center justify-between px-6">
                {/* Spacer */}
                <div className="flex-1" />

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle - Simple button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Toggle theme"
                    >
                        {resolvedTheme === 'dark' ? (
                            <Sun className="h-5 w-5 text-yellow-500" />
                        ) : (
                            <Moon className="h-5 w-5 text-gray-600" />
                        )}
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#E6602F]" />
                    </button>

                    {/* User Menu */}
                    <div className="relative ml-2">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="h-8 w-8 rounded-full bg-[#E6602F] flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white hidden sm:block">
                                {user?.email?.split('@')[0] || 'User'}
                            </span>
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500">Signed in as</p>
                                    <p className="text-sm text-gray-900 dark:text-white truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
