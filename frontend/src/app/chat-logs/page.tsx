'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { History, MessageSquare, Trash2, ChevronDown, ChevronUp, FileText, Search, Clock, MessagesSquare } from 'lucide-react';
import { chat, logs } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface ChatMessageItem {
    question: string;
    answer: string;
    sources: Array<{ source: string; text: string; score: number }>;
    timestamp: string;
}

interface ChatSession {
    id: string;
    userId: string;
    messages: ChatMessageItem[];
    createdAt: string;
    updatedAt: string;
}

export default function ChatLogsPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSession, setExpandedSession] = useState<string | null>(null);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await chat.getSessions();
            setSessions(res.data.sessions || []);
        } catch (error) {
            toast.error('Failed to load chat sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSessions(); }, []);

    const handleClearAll = async () => {
        if (!confirm('Clear ALL chat logs?')) return;
        try {
            await logs.clear();
            toast.success('All cleared');
            fetchSessions();
        } catch {
            toast.error('Failed to clear');
        }
    };

    const toggleSession = (sessionId: string) => {
        setExpandedSession(expandedSession === sessionId ? null : sessionId);
    };

    // Filter sessions by search query
    const filteredSessions = sessions.filter(session =>
        session.messages.some(msg =>
            msg.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            msg.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <DashboardLayout>
            <Toaster position="top-right" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat Sessions</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">View conversation history grouped by session</p>
                    </div>
                    <button onClick={handleClearAll} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                        <Trash2 className="h-4 w-4" />Clear All
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in chat sessions..."
                        className="w-full h-12 pl-12 pr-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E6602F]"
                    />
                </div>

                {/* Sessions */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-4 border-[#E6602F] border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sessions...</p>
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                        <MessagesSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No chat sessions yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Start a conversation in the chatbot</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSessions.map((session) => (
                            <div key={session.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {/* Session Header */}
                                <button
                                    onClick={() => toggleSession(session.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-[#E6602F]/10 flex items-center justify-center">
                                            <MessagesSquare className="h-5 w-5 text-[#E6602F]" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {session.messages[0]?.question.substring(0, 50) || 'New Session'}
                                                {session.messages[0]?.question.length > 50 ? '...' : ''}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDate(session.updatedAt)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    {session.messages.length} messages
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {expandedSession === session.id ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>

                                {/* Session Messages */}
                                {expandedSession === session.id && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                                        {session.messages.map((msg, idx) => (
                                            <div key={idx} className="space-y-2">
                                                {/* User Question */}
                                                <div className="flex justify-end">
                                                    <div className="max-w-[80%] bg-[#E6602F] text-white px-4 py-2 rounded-lg rounded-br-sm">
                                                        <p className="text-sm">{msg.question}</p>
                                                        <p className="text-xs text-white/70 mt-1">{formatDate(msg.timestamp)}</p>
                                                    </div>
                                                </div>
                                                {/* Bot Answer */}
                                                <div className="flex justify-start">
                                                    <div className="max-w-[80%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg rounded-bl-sm">
                                                        <p className="text-sm text-gray-900 dark:text-white">{msg.answer}</p>
                                                        {msg.sources && msg.sources.length > 0 && (
                                                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                                    <FileText className="h-3 w-3" />
                                                                    {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
