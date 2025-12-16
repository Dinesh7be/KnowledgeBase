'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileText, Sparkles, PlusCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { chat } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: Array<{ source: string; score: number; preview: string }>;
    timestamp: Date;
}

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Create session on component mount
    useEffect(() => {
        const initSession = async () => {
            try {
                const res = await chat.createSession();
                if (res.data.success && res.data.session) {
                    setSessionId(res.data.session.id);
                }
            } catch (error) {
                console.error('Failed to create session:', error);
            }
        };
        initSession();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleNewChat = async () => {
        try {
            const res = await chat.createSession();
            if (res.data.success && res.data.session) {
                setSessionId(res.data.session.id);
                setMessages([]);
                toast.success('New chat started!');
            }
        } catch (error) {
            toast.error('Failed to start new chat');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await chat.send(input.trim(), sessionId || undefined);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: res.data.message.answer,
                sources: res.data.message.sources?.map((s: any) => ({
                    source: s.source,
                    score: s.score,
                    preview: s.text
                })),
                timestamp: new Date(),
            }]);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed');
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Sorry, I encountered an error.', timestamp: new Date() }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <Toaster position="top-right" />
            <div className="h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#E6602F] flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Knowledge Assistant</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ask questions about your documents</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleNewChat}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E6602F] hover:bg-[#d4551f] text-white text-sm font-medium transition-colors"
                        >
                            <PlusCircle className="h-4 w-4" />
                            New Chat
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-green-700 dark:text-green-400 font-medium">Online</span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-100 dark:bg-gray-900">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 rounded-2xl bg-[#E6602F]/10 flex items-center justify-center mb-6">
                                <Bot className="h-10 w-10 text-[#E6602F]" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start a conversation</h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md">Ask me anything about your uploaded documents.</p>
                            <div className="mt-8 flex flex-wrap gap-2 justify-center">
                                {['What documents do we have?', 'Summarize the main topics', 'What is the leave policy?'].map(s => (
                                    <button key={s} onClick={() => setInput(s)} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-[#E6602F]/50 shadow-sm transition-all">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map(m => (
                        <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-[#E6602F]' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'}`}>
                                {m.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-[#E6602F]" />}
                            </div>
                            <div className={`flex-1 max-w-2xl ${m.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`inline-block rounded-2xl px-5 py-3 shadow-sm ${m.role === 'user' ? 'bg-[#E6602F] text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'}`}>
                                    <p className="whitespace-pre-wrap">{m.content}</p>
                                </div>
                                {m.sources && m.sources.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sources:</p>
                                        {m.sources.map((src, i) => (
                                            <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                                                <FileText className="h-4 w-4 text-[#E6602F] mt-0.5" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{src.source}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{src.preview}</p>
                                                </div>
                                                <span className="text-xs text-[#E6602F] font-medium">{Math.round(src.score * 100)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{formatDate(m.timestamp.toISOString())}</p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4">
                            <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center">
                                <Bot className="h-5 w-5 text-[#E6602F]" />
                            </div>
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 shadow-sm">
                                <Loader2 className="h-4 w-4 animate-spin text-[#E6602F]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask a question..." disabled={loading}
                            className="flex-1 h-12 px-5 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50 disabled:opacity-50 transition-all" />
                        <button type="submit" disabled={loading || !input.trim()} className="h-12 px-6 rounded-xl bg-[#E6602F] text-white font-medium hover:bg-[#d4551f] disabled:opacity-50 transition-all flex items-center gap-2">
                            <Send className="h-5 w-5" />Send
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
