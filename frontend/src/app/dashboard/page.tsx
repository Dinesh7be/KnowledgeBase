'use client';

import { useState, useEffect } from 'react';
import { FileText, MessageSquare, Database, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { documents, logs } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
    const [stats, setStats] = useState({ documents: 0, chunks: 0, conversations: 0 });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [docsRes, logsRes] = await Promise.all([documents.stats(), logs.list(1, 5)]);
                setStats({
                    documents: docsRes.data.stats?.documentCount || 0,
                    chunks: docsRes.data.stats?.totalChunks || 0,
                    conversations: logsRes.data.total || 0,
                });
                setRecentActivity(logsRes.data.logs || []);
            } catch { }
            finally { setLoading(false); }
        }
        fetchData();
    }, []);

    const statCards = [
        { label: 'Documents', value: stats.documents, icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
        { label: 'Total Chunks', value: stats.chunks, icon: Database, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
        { label: 'Conversations', value: stats.conversations, icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
        { label: 'Accuracy', value: '98%', icon: TrendingUp, color: 'text-[#E6602F]', bgColor: 'bg-[#E6602F]/10' },
    ];

    return (
        <DashboardLayout>
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Here's what's happening with your knowledge base</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat) => (
                        <div key={stat.label} className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                            <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Link href="/knowledge-base" className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-[#E6602F]/5 border border-gray-200 dark:border-gray-600 hover:border-[#E6602F]/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-[#E6602F]/10 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-[#E6602F]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Upload Document</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Add new knowledge</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#E6602F]" />
                            </Link>
                            <Link href="/chatbot" className="flex items-center justify-between p-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-[#E6602F]/5 border border-gray-200 dark:border-gray-600 hover:border-[#E6602F]/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-[#E6602F]/10 flex items-center justify-center">
                                        <MessageSquare className="h-5 w-5 text-[#E6602F]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Start Chat</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Ask questions</p>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#E6602F]" />
                            </Link>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                            <Link href="/chat-logs" className="text-sm text-[#E6602F] hover:underline">View all</Link>
                        </div>
                        {loading ? (
                            <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />)}</div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((a, i) => (
                                    <div key={i} className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                        <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{a.question}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(a.timestamp).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
