'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar />
            <div className="pl-64">
                <Header />
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}
