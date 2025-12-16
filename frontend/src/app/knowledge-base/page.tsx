'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, Trash2, Search, Loader2, FolderOpen, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { documents } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast, { Toaster } from 'react-hot-toast';

interface Document { id: string; name: string; type: string; category: string; version: string; chunkCount: number; uploadedAt: string; }

export default function KnowledgeBasePage() {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [category, setCategory] = useState('General');

    const fetchDocuments = async () => { try { const res = await documents.list(); setDocs(res.data.documents || []); } catch { } finally { setLoading(false); } };
    useEffect(() => { fetchDocuments(); }, []);

    const onDrop = useCallback(async (files: FileList | null) => {
        if (!files?.[0]) return;
        const file = files[0];
        if (!['.pdf', '.docx', '.txt', '.md'].some(e => file.name.toLowerCase().endsWith(e))) { toast.error('Please upload PDF, DOCX, TXT, or MD files'); return; }
        setUploading(true);
        try { await documents.upload(file, category, 'v1.0'); toast.success(`${file.name} uploaded!`); fetchDocuments(); }
        catch (e: any) { toast.error(e.response?.data?.error || 'Upload failed'); }
        finally { setUploading(false); setDragActive(false); }
    }, [category]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try { await documents.delete(id); toast.success('Deleted'); fetchDocuments(); } catch { toast.error('Failed'); }
    };

    const filtered = docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <DashboardLayout>
            <Toaster position="top-right" />
            <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your document library</p>
                    </div>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="h-10 px-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm shadow-sm">
                        <option>General</option><option>HR</option><option>IT</option><option>Finance</option><option>Legal</option>
                    </select>
                </div>

                <div onDragOver={e => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={e => { e.preventDefault(); onDrop(e.dataTransfer.files); }}
                    className={`relative rounded-2xl border-2 border-dashed mb-8 bg-white dark:bg-gray-800 transition-all ${dragActive ? 'border-[#E6602F] bg-[#E6602F]/5' : 'border-gray-200 dark:border-gray-700 hover:border-[#E6602F]/50'}`}>
                    <input type="file" accept=".pdf,.docx,.txt,.md" onChange={e => onDrop(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
                    <div className="flex flex-col items-center justify-center py-12">
                        {uploading ? <><Loader2 className="h-12 w-12 text-[#E6602F] animate-spin mb-4" /><p className="text-gray-900 dark:text-white font-medium">Processing...</p></> :
                            <><div className="h-16 w-16 rounded-2xl bg-[#E6602F]/10 flex items-center justify-center mb-4"><Upload className="h-8 w-8 text-[#E6602F]" /></div>
                                <p className="text-gray-900 dark:text-white font-medium mb-1">Drop files or click to upload</p><p className="text-gray-600 dark:text-gray-400 text-sm">PDF, DOCX, TXT, MD</p></>}
                    </div>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..."
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm" />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2"><X className="h-5 w-5 text-gray-400" /></button>}
                </div>

                {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#E6602F]" /></div> :
                    filtered.length === 0 ? <div className="text-center py-20"><FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents</h3><p className="text-gray-600 dark:text-gray-400">Upload your first document</p></div> :
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map(doc => (
                                <div key={doc.id} className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-[#E6602F]/30 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-12 w-12 rounded-xl bg-[#E6602F]/10 flex items-center justify-center"><FileText className="h-6 w-6 text-[#E6602F]" /></div>
                                        <button onClick={() => handleDelete(doc.id, doc.name)} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 className="h-4 w-4 text-red-500" /></button>
                                    </div>
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate">{doc.name}</h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 rounded-md bg-[#E6602F]/10 text-[#E6602F] text-xs font-medium">{doc.category}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{doc.version}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                        <span>📎 {doc.chunkCount} chunks</span><span>{formatDate(doc.uploadedAt)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>}
            </div>
        </DashboardLayout>
    );
}
