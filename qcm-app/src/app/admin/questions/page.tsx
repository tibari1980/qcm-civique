'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { AdminService, type AdminQuestion } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';

const THEMES = ['vals_principes', 'histoire', 'geographie', 'institutions', 'societe', 'civique'];
const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];

export default function AdminQuestionsPage() {
    useAdminGuard();
    const [questions, setQuestions] = useState<AdminQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterTheme, setFilterTheme] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const data = await AdminService.getQuestions({}, 200);
            setQuestions(data);
        } catch (error) {
            console.error("Failed to load questions:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = useMemo(() => {
        let list = questions;
        if (filterTheme) list = list.filter(q => q.theme === filterTheme);
        if (filterLevel) list = list.filter(q => q.level === filterLevel);
        if (search) {
            const s = search.toLowerCase();
            list = list.filter(q => q.question.toLowerCase().includes(s));
        }
        return list;
    }, [search, filterTheme, filterLevel, questions]);

    const toggleActive = async (q: AdminQuestion) => {
        setProcessingId(q.id);
        await AdminService.toggleQuestionActive(q.id, !q.is_active);
        setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, is_active: !q.is_active } : x));
        setProcessingId(null);
    };

    const handleDelete = async (id: string) => {
        setProcessingId(id);
        await AdminService.deleteQuestion(id);
        setQuestions(prev => prev.filter(x => x.id !== id));
        setDeleteConfirm(null);
        setProcessingId(null);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
                    <p className="text-gray-500 text-sm mt-1">{filtered.length} / {questions.length} question(s)</p>
                </div>
                <Link
                    href="/admin/questions/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002394] text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
                >
                    <Plus className="h-4 w-4" aria-hidden="true" /> Nouvelle question
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                    <input type="search" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30"
                        aria-label="Rechercher une question" />
                </div>
                <select value={filterTheme} onChange={e => setFilterTheme(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30"
                    aria-label="Filtrer par thème">
                    <option value="">Tous les thèmes</option>
                    {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30"
                    aria-label="Filtrer par niveau">
                    <option value="">Tous les niveaux</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[#002394] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" aria-label="Liste des questions">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                                    <th className="px-4 py-3 font-semibold text-gray-600">Question</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Thème</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Niveau</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Statut</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(q => (
                                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 max-w-xs">
                                            <p className="truncate text-gray-800" title={q.question}>{q.question}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">{q.theme}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{q.level}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => toggleActive(q)}
                                                disabled={processingId === q.id}
                                                aria-label={q.is_active !== false ? 'Désactiver la question' : 'Activer la question'}
                                                className="text-gray-400 hover:text-[#002394] transition-colors disabled:opacity-50"
                                            >
                                                {q.is_active !== false
                                                    ? <ToggleRight className="h-6 w-6 text-emerald-500" aria-hidden="true" />
                                                    : <ToggleLeft className="h-6 w-6" aria-hidden="true" />
                                                }
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/questions/${q.id}`}
                                                    className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#002394] transition-colors"
                                                    aria-label="Modifier">
                                                    <Pencil className="h-4 w-4" aria-hidden="true" />
                                                </Link>
                                                {deleteConfirm === q.id ? (
                                                    <span className="flex items-center gap-1 text-xs">
                                                        <button onClick={() => handleDelete(q.id)}
                                                            className="text-red-600 font-semibold hover:underline">Confirmer</button>
                                                        <button onClick={() => setDeleteConfirm(null)}
                                                            className="text-gray-400 hover:underline">Annuler</button>
                                                    </span>
                                                ) : (
                                                    <button onClick={() => setDeleteConfirm(q.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                        aria-label="Supprimer">
                                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-400">Aucune question trouvée</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
