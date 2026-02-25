'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
    Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight,
    ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import { AdminService, type AdminQuestion } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';
import { THEMES, THEME_LABELS, LEVELS } from '@/constants/app-constants';
import { ExportUtils } from '@/lib/exportUtils';

export default function AdminQuestionsPage() {
    useAdminGuard();
    const [questions, setQuestions] = useState<AdminQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterTheme, setFilterTheme] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [filterExam, setFilterExam] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const load = useCallback(async () => {
        try {
            const data = await AdminService.getQuestions({}, 3000);
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

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterTheme, filterLevel, filterExam]);

    const filtered = useMemo(() => {
        let list = questions;
        if (filterTheme) list = list.filter(q => q.theme === filterTheme);
        if (filterLevel) list = list.filter(q => q.level === filterLevel);
        if (filterExam) list = list.filter(q => q.exam_type === filterExam);
        if (search) {
            const s = search.toLowerCase();
            list = list.filter(q => q.question.toLowerCase().includes(s));
        }
        return list;
    }, [search, filterTheme, filterLevel, filterExam, questions]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filtered.slice(start, start + ITEMS_PER_PAGE);
    }, [filtered, currentPage]);

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

    const handleBulkFixType = async (types: string[]) => {
        if (!filtered.length) return;
        const typeLabel = types.join(' + ');
        if (!window.confirm(`Passer les ${filtered.length} questions filtrées en parcours "${typeLabel}" ?`)) return;

        setLoading(true);
        try {
            const ids = filtered.map(q => q.id);
            await AdminService.bulkUpdateQuestions(ids, { exam_types: types });
            await load();
            alert(`✅ ${ids.length} questions mises à jour !`);
        } catch (error) {
            console.error("Bulk update failed:", error);
            alert("Erreur lors de la mise à jour en masse.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Export currently filtered list
        ExportUtils.jsonToExcel(filtered, {
            id: 'ID',
            theme: 'Thème',
            level: 'Niveau',
            exam_types: 'Parcours',
            question: 'Question',
            choices: 'Réponses',
            correct_index: 'Index Correct',
            explanation: 'Explication',
            created_at: 'Date Création'
        }, `questions_qcm_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
                    <p className="text-gray-500 text-sm mt-1">{filtered.length} / {questions.length} question(s)</p>
                </div>
                <div className="flex items-center gap-3">
                    {filtered.length > 0 && (
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => handleBulkFixType(['naturalisation'])}
                                className="px-2 py-1 text-[10px] font-bold uppercase hover:bg-white rounded transition-all text-purple-600"
                                title="Mettre tout en Naturalisation uniquement"
                            >
                                Nat.
                            </button>
                            <button
                                onClick={() => handleBulkFixType(['titre_sejour'])}
                                className="px-2 py-1 text-[10px] font-bold uppercase hover:bg-white rounded transition-all text-emerald-600"
                                title="Mettre tout en Titre de séjour uniquement"
                            >
                                Séjour
                            </button>
                            <button
                                onClick={() => handleBulkFixType(['titre_sejour', 'naturalisation'])}
                                className="px-2 py-1 text-[10px] font-bold uppercase hover:bg-white border-l border-gray-200 ml-1 rounded transition-all text-blue-600"
                                title="Assigner aux deux parcours (Recommandé)"
                            >
                                Fix Both
                            </button>
                        </div>
                    )}
                    <Link
                        href="/admin/questions/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" /> Nouvelle question
                    </Link>
                    <button
                        onClick={handleExport}
                        className="p-2.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200"
                        title="Exporter la liste filtrée en Excel"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                    <input type="search" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        aria-label="Rechercher une question" />
                </div>
                <select value={filterTheme} onChange={e => setFilterTheme(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    aria-label="Filtrer par thème">
                    <option value="">Tous les thèmes</option>
                    {THEMES.map(t => <option key={t} value={t}>{THEME_LABELS[t] || t}</option>)}
                </select>
                <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    aria-label="Filtrer par niveau">
                    <option value="">Tous les niveaux</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={filterExam} onChange={e => setFilterExam(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    aria-label="Filtrer par type d'examen">
                    <option value="">Tous les parcours</option>
                    <option value="titre_sejour">Titre de séjour</option>
                    <option value="naturalisation">Naturalisation</option>
                    <option value="carte_resident">Carte de résident</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" aria-label="Liste des questions">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                                    <th className="px-4 py-3 font-semibold text-gray-600">Question</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Thème</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Parcours</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Niveau</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Statut</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedItems.map(q => (
                                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 max-w-[150px] sm:max-w-xs md:max-w-md">
                                            <p className="truncate text-gray-800" title={q.question}>{q.question}</p>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                                                {(THEME_LABELS as any)[q.theme] || q.theme}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {(q.exam_types || [q.exam_type || 'titre_sejour']).map(type => (
                                                    <span key={type} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${type === 'naturalisation' ? 'bg-purple-100 text-purple-700' : type === 'carte_resident' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                        {type.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{q.level}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => toggleActive(q)}
                                                disabled={processingId === q.id}
                                                aria-label={q.is_active !== false ? 'Désactiver la question' : 'Activer la question'}
                                                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
                                            >
                                                {q.is_active !== false
                                                    ? <ToggleRight className="h-6 w-6 text-emerald-500" aria-hidden="true" />
                                                    : <ToggleLeft className="h-6 w-6" aria-hidden="true" />
                                                }
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/questions/edit?id=${q.id}`}
                                                    className="p-1.5 rounded-lg hover:bg-[var(--color-primary-soft)] text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                                    aria-label={`Modifier la question : ${q.question.substring(0, 50)}...`}>
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
                                                        aria-label={`Supprimer la question : ${q.question.substring(0, 50)}...`}>
                                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400">Aucune question trouvée</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                Affichage de {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 rounded bg-white border border-gray-200 text-gray-400 hover:text-[var(--color-primary)] disabled:opacity-50 transition-colors"
                                    aria-label="Page précédente"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = currentPage;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage > totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;

                                    if (pageNum <= 0 || pageNum > totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            aria-label={`Aller à la page ${pageNum}`}
                                            aria-current={currentPage === pageNum ? 'page' : undefined}
                                            className={`w-7 h-7 flex items-center justify-center rounded text-xs font-semibold transition-colors ${currentPage === pageNum
                                                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 rounded bg-white border border-gray-200 text-gray-400 hover:text-[var(--color-primary)] disabled:opacity-50 transition-colors"
                                    aria-label="Page suivante"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
