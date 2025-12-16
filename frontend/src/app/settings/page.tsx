'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Sliders, Database, RefreshCw, Trash2, Save, AlertTriangle, Check } from 'lucide-react';
import { settings as settingsApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

interface Settings {
    chunkSize: number;
    chunkOverlap: number;
    similarityThreshold: number;
    topK: number;
    maxTokens: number;
    temperature: number;
}

interface SystemInfo {
    vectorCount: number;
    vectorDbStatus: string;
    documentCount: number;
    totalChunks: number;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        chunkSize: 600,
        chunkOverlap: 50,
        similarityThreshold: 0.7,
        topK: 5,
        maxTokens: 1000,
        temperature: 0.1
    });
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clearing, setClearing] = useState(false);

    const fetchSettings = async () => {
        try {
            const res = await settingsApi.get();
            setSettings(res.data.settings);
            setSystemInfo(res.data.systemInfo);
        } catch (error) {
            // Settings not available
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsApi.update(settings);
            toast.success('Settings saved');
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleClearVectors = async () => {
        if (!confirm('Clear all vectors? Documents will need to be re-uploaded.')) return;
        setClearing(true);
        try {
            await settingsApi.clearVectors();
            toast.success('Vectors cleared');
            fetchSettings();
        } catch (error) {
            toast.error('Failed to clear');
        } finally {
            setClearing(false);
        }
    };

    return (
        <DashboardLayout>
            <Toaster position="top-right" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Configure your knowledge base chatbot</p>
                    </div>

                    {/* RAG Settings */}
                    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <Sliders className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">RAG Configuration</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Adjust retrieval and generation parameters</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Chunk Size */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Chunk Size (tokens)</label>
                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{settings.chunkSize}</span>
                                </div>
                                <input
                                    type="range"
                                    min={100}
                                    max={2000}
                                    step={50}
                                    value={settings.chunkSize}
                                    onChange={(e) => setSettings({ ...settings, chunkSize: Number(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Recommended: 500-800 tokens</p>
                            </div>

                            {/* Similarity Threshold */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Similarity Threshold</label>
                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{settings.similarityThreshold.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={settings.similarityThreshold}
                                    onChange={(e) => setSettings({ ...settings, similarityThreshold: Number(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Higher = more strict matching</p>
                            </div>

                            {/* Top K */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Top K Results</label>
                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{settings.topK}</span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={20}
                                    step={1}
                                    value={settings.topK}
                                    onChange={(e) => setSettings({ ...settings, topK: Number(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Number of chunks to retrieve for context</p>
                            </div>

                            {/* Temperature */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Temperature</label>
                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{settings.temperature.toFixed(1)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={settings.temperature}
                                    onChange={(e) => setSettings({ ...settings, temperature: Number(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Lower = more factual, higher = more creative</p>
                            </div>

                            {/* Max Tokens */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-gray-900 dark:text-white">Max Response Tokens</label>
                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{settings.maxTokens}</span>
                                </div>
                                <input
                                    type="range"
                                    min={100}
                                    max={4000}
                                    step={100}
                                    value={settings.maxTokens}
                                    onChange={(e) => setSettings({ ...settings, maxTokens: Number(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Maximum length of chatbot responses</p>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium disabled:opacity-50 transition-colors"
                            >
                                {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">System Status</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Vector database and document statistics</p>
                            </div>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="h-32 flex items-center justify-center">
                                    <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
                                </div>
                            ) : systemInfo ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemInfo.documentCount}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemInfo.totalChunks}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Chunks</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemInfo.vectorCount}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Vectors</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {systemInfo.vectorDbStatus === 'green' ? (
                                                <Check className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                            )}
                                            <span className="text-lg font-medium text-gray-900 dark:text-white">
                                                {systemInfo.vectorDbStatus === 'green' ? 'Healthy' : systemInfo.vectorDbStatus}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">DB Status</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center">Unable to load system info</p>
                            )}
                        </div>
                    </div>

                    {/* Embed Script Generator */}
                    <EmbedScriptGenerator />

                    {/* Danger Zone */}
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-200 dark:border-red-900/30">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900 dark:text-white">Danger Zone</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Irreversible actions</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">Clear Vector Database</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Remove all document embeddings</p>
                                </div>
                                <button
                                    onClick={handleClearVectors}
                                    disabled={clearing}
                                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 transition-colors"
                                >
                                    {clearing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    Clear Vectors
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Embed Script Generator Component
function EmbedScriptGenerator() {
    const [widgetConfig, setWidgetConfig] = useState({
        title: 'Chat Base',
        subtitle: 'Ask me anything!',
        primaryColor: '#E6602F',
        position: 'bottom-right',
    });
    const [copied, setCopied] = useState(false);
    const [widgetKey, setWidgetKey] = useState<string>('');

    useEffect(() => {
        // Fetch user's widget key
        const fetchWidgetKey = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await fetch(`${typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':3001') : 'http://localhost:3001'}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.success && data.user?.widgetKey) {
                        setWidgetKey(data.user.widgetKey);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch widget key:', error);
            }
        };
        fetchWidgetKey();
    }, []);

    const apiUrl = typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':3001') : 'http://localhost:3001';
    const widgetUrl = typeof window !== 'undefined' ? window.location.origin + '/widget.js' : 'http://localhost:3000/widget.js';

    const generateScript = () => {
        return `<!-- Chat Base Widget -->
<script>
  window.CHATBASE_API_URL = "${apiUrl}";
  window.CHATBASE_WIDGET_KEY = "${widgetKey || 'YOUR_WIDGET_KEY'}";
  window.CHATBASE_TITLE = "${widgetConfig.title}";
  window.CHATBASE_SUBTITLE = "${widgetConfig.subtitle}";
  window.CHATBASE_PRIMARY_COLOR = "${widgetConfig.primaryColor}";
  window.CHATBASE_POSITION = "${widgetConfig.position}";
</script>
<script src="${widgetUrl}"></script>`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateScript());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </div>
                <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">Embed Chatbot Widget</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add chatbot to any website with a script tag</p>
                </div>
            </div>
            <div className="p-6 space-y-6">
                {/* Widget Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Widget Title</label>
                        <input
                            type="text"
                            value={widgetConfig.title}
                            onChange={(e) => setWidgetConfig({ ...widgetConfig, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtitle</label>
                        <input
                            type="text"
                            value={widgetConfig.subtitle}
                            onChange={(e) => setWidgetConfig({ ...widgetConfig, subtitle: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={widgetConfig.primaryColor}
                                onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                                className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-600"
                            />
                            <input
                                type="text"
                                value={widgetConfig.primaryColor}
                                onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
                        <select
                            value={widgetConfig.position}
                            onChange={(e) => setWidgetConfig({ ...widgetConfig, position: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E6602F]/50"
                        >
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
                        </select>
                    </div>
                </div>

                {/* Generated Script */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Embed Code</label>
                    <div className="relative">
                        <pre className="p-4 rounded-lg bg-gray-900 text-gray-100 text-sm overflow-x-auto">
                            <code>{generateScript()}</code>
                        </pre>
                        <button
                            onClick={copyToClipboard}
                            className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm flex items-center gap-2 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">How to use:</h4>
                    <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                        <li>Copy the embed code above</li>
                        <li>Paste it before the closing <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">&lt;/body&gt;</code> tag of your website</li>
                        <li>The chatbot widget will appear on your website</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
