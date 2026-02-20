'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { AdminService, type AdminQuestion, type QuestionFormData } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const THEMES = ['vals_principes', 'histoire', 'geographie', 'institutions', 'societe', 'civique'];
const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];
const EXAM_TYPES = ['titre_sejour', 'carte_resident', 'naturalisation'];
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function AdminEditQuestionPage() {
    useAdminGuard();
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [form, setForm] = useState<QuestionFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState(false);

    useEffect(() => {
        if (!id) return;
        getDoc(doc(db, 'questions', id)).then(snap => {
            if (snap.exists()) {
                const d = snap.data() as AdminQuestion;
                setForm({
                    theme: d.theme, level: d.level, exam_type: d.exam_type,
                    question: d.question, choices: d.choices,
                    correct_index: d.correct_index, explanation: d.explanation,
                    tags: d.tags || [], is_active: d.is_active !== false,
                });
            }
            setLoading(false);
        });
    }, [id]);

    const set = <K extends keyof QuestionFormData>(k: K, v: QuestionFormData[K]) =>
        setForm(f => f ? { ...f, [k]: v } : f);

    const setChoice = (i: number, v: string) =>
        setForm(f => { if (!f) return f; const c = [...f.choices]; c[i] = v; return { ...f, choices: c }; });

    const handleSave = async () => {
        if (!form || !id) return;
        if (!form.question.trim()) { setError('La question est obligatoire.'); return; }
        if (form.choices.some(c => !c.trim())) { setError('Toutes les réponses doivent être remplies.'); return; }
        setSaving(true); setError(null);
        try {
            await AdminService.updateQuestion(id, form);
            router.push('/admin/questions');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur.');
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!form) return <div className="p-6 text-gray-500">Question introuvable.</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <button onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Modifier la question</h1>
                <button onClick={() => setPreview(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[var(--color-primary)] transition-colors">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    {preview ? 'Formulaire' : 'Aperçu'}
                </button>
            </div>

            {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">{error}</div>}

            {preview ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex gap-2 mb-4 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{form.theme}</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">{form.level}</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-5">{form.question}</p>
                    <div className="space-y-2">
                        {form.choices.map((c, i) => (
                            <div key={i} className={['flex items-center gap-3 p-3 rounded-xl border-2',
                                i === form.correct_index ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-gray-50'].join(' ')}>
                                <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold">{LETTERS[i]}</span>
                                <span className="text-sm">{c}</span>
                            </div>
                        ))}
                    </div>
                    {form.explanation && <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">💡 {form.explanation}</div>}
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-900 mb-4">Métadonnées</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {([
                                { label: 'Thème', key: 'theme' as const, options: THEMES },
                                { label: 'Niveau', key: 'level' as const, options: LEVELS },
                                { label: 'Type', key: 'exam_type' as const, options: EXAM_TYPES },
                            ] as const).map(({ label, key, options }) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                                    <select value={String(form[key])} onChange={e => set(key, e.target.value as never)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30">
                                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <input type="checkbox" id="is_active" checked={form.is_active}
                                onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-[var(--color-primary)]" />
                            <label htmlFor="is_active" className="text-sm text-gray-600">Question active</label>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Texte de la question</label>
                        <textarea value={form.question} onChange={e => set('question', e.target.value)}
                            rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none" />
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-900 mb-4">Réponses</h2>
                        <div className="space-y-2">
                            {form.choices.map((c, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <input type="radio" name="correct" checked={form.correct_index === i}
                                        onChange={() => set('correct_index', i)} className="w-4 h-4 accent-[var(--color-primary)]"
                                        aria-label={`Réponse ${LETTERS[i]} correcte`} />
                                    <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{LETTERS[i]}</span>
                                    <input type="text" value={c} onChange={e => setChoice(i, e.target.value)}
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Explication</label>
                        <textarea value={form.explanation} onChange={e => set('explanation', e.target.value)}
                            rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none" />
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-colors disabled:opacity-50"
                    aria-busy={saving}>
                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                    {saving ? 'Enregistrement…' : 'Sauvegarder'}
                </button>
            </div>
        </div>
    );
}
