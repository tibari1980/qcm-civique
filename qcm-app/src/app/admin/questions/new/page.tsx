'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Eye } from 'lucide-react';
import { AdminService, type QuestionFormData } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';

const THEMES = ['vals_principes', 'histoire', 'geographie', 'institutions', 'societe', 'civique'];
const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];
const EXAM_TYPES = ['titre_sejour', 'carte_resident', 'naturalisation'];

const EMPTY: QuestionFormData = {
    theme: 'vals_principes',
    level: 'Débutant',
    exam_type: 'titre_sejour',
    question: '',
    choices: ['', '', '', ''],
    correct_index: 0,
    explanation: '',
    tags: [],
    is_active: true,
};

export default function AdminNewQuestionPage() {
    useAdminGuard();
    const router = useRouter();
    const [form, setForm] = useState<QuestionFormData>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState(false);
    const [tagInput, setTagInput] = useState('');

    const set = <K extends keyof QuestionFormData>(k: K, v: QuestionFormData[K]) =>
        setForm(f => ({ ...f, [k]: v }));

    const setChoice = (i: number, v: string) =>
        setForm(f => { const c = [...f.choices]; c[i] = v; return { ...f, choices: c }; });

    const addChoice = () => setForm(f => ({ ...f, choices: [...f.choices, ''] }));
    const removeChoice = (i: number) =>
        setForm(f => ({
            ...f,
            choices: f.choices.filter((_, idx) => idx !== i),
            correct_index: f.correct_index >= i && f.correct_index > 0 ? f.correct_index - 1 : f.correct_index,
        }));

    const addTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            set('tags', [...form.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleSubmit = async () => {
        if (!form.question.trim()) { setError('La question est obligatoire.'); return; }
        if (form.choices.some(c => !c.trim())) { setError('Toutes les réponses doivent être remplies.'); return; }
        setSaving(true);
        setError(null);
        try {
            await AdminService.createQuestion(form);
            router.push('/admin/questions');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.');
            setSaving(false);
        }
    };

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <button onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#002394] mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Retour
            </button>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Nouvelle question</h1>
                <button onClick={() => setPreview(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#002394] transition-colors">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    {preview ? 'Formulaire' : 'Aperçu'}
                </button>
            </div>

            {error && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
                    {error}
                </div>
            )}

            {preview ? (
                /* ── Aperçu ── */
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex gap-2 mb-4 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{form.theme}</span>
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full">{form.level}</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-5">{form.question || '(question vide)'}</p>
                    <div className="space-y-2">
                        {form.choices.map((c, i) => (
                            <div key={i} className={[
                                'flex items-center gap-3 p-3 rounded-xl border-2',
                                i === form.correct_index
                                    ? 'border-emerald-400 bg-emerald-50'
                                    : 'border-gray-200 bg-gray-50'
                            ].join(' ')}>
                                <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold">
                                    {letters[i]}
                                </span>
                                <span className="text-sm">{c || '(vide)'}</span>
                            </div>
                        ))}
                    </div>
                    {form.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                            💡 {form.explanation}
                        </div>
                    )}
                </div>
            ) : (
                /* ── Formulaire ── */
                <div className="space-y-5">
                    {/* Metadata */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-900 mb-4">Métadonnées</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {([
                                { label: 'Thème', key: 'theme' as const, options: THEMES },
                                { label: 'Niveau', key: 'level' as const, options: LEVELS },
                                { label: 'Type d\'examen', key: 'exam_type' as const, options: EXAM_TYPES },
                            ] as const).map(({ label, key, options }) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                                    <select value={String(form[key])} onChange={e => set(key, e.target.value as never)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30">
                                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <input type="checkbox" id="is_active" checked={form.is_active}
                                onChange={e => set('is_active', e.target.checked)}
                                className="w-4 h-4 accent-[#002394]" />
                            <label htmlFor="is_active" className="text-sm text-gray-600">Question active</label>
                        </div>
                    </div>

                    {/* Question text */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Texte de la question <span className="text-red-500">*</span>
                        </label>
                        <textarea value={form.question} onChange={e => set('question', e.target.value)}
                            rows={3} placeholder="Rédigez votre question ici…"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30 resize-none" />
                    </div>

                    {/* Choices */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="font-semibold text-gray-900 mb-1">Réponses</h2>
                        <p className="text-xs text-gray-400 mb-4">Sélectionnez la bonne réponse avec le bouton radio.</p>
                        <div className="space-y-2" role="radiogroup" aria-label="Choix de la bonne réponse">
                            {form.choices.map((c, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <input type="radio" name="correct" checked={form.correct_index === i}
                                        onChange={() => set('correct_index', i)}
                                        className="w-4 h-4 accent-[#002394]"
                                        aria-label={`Réponse ${letters[i]} correcte`} />
                                    <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                                        {letters[i]}
                                    </span>
                                    <input type="text" value={c} onChange={e => setChoice(i, e.target.value)}
                                        placeholder={`Réponse ${letters[i]}…`}
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30" />
                                    {form.choices.length > 2 && (
                                        <button onClick={() => removeChoice(i)}
                                            className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                                            aria-label={`Supprimer le choix ${letters[i]}`}>
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {form.choices.length < 6 && (
                            <button onClick={addChoice}
                                className="mt-3 flex items-center gap-1 text-sm text-[#002394] hover:underline">
                                <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter un choix
                            </button>
                        )}
                    </div>

                    {/* Explanation */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Explication (affichée après réponse)</label>
                        <textarea value={form.explanation} onChange={e => set('explanation', e.target.value)}
                            rows={2} placeholder="Pourquoi cette réponse est correcte…"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30 resize-none" />
                    </div>

                    {/* Tags */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Tags</label>
                        <div className="flex gap-2 mb-2">
                            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Ajouter un tag…"
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002394]/30" />
                            <button onClick={addTag}
                                className="px-3 py-2 bg-blue-50 text-[#002394] rounded-lg text-sm hover:bg-blue-100 transition-colors">
                                Ajouter
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {form.tags.map(t => (
                                <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    {t}
                                    <button onClick={() => set('tags', form.tags.filter(x => x !== t))}
                                        className="text-gray-400 hover:text-red-500" aria-label={`Supprimer le tag ${t}`}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Save button */}
            <div className="mt-6 flex justify-end">
                <button onClick={handleSubmit} disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#002394] text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors disabled:opacity-50"
                    aria-busy={saving}>
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" aria-hidden="true" />
                    )}
                    {saving ? 'Enregistrement…' : 'Enregistrer la question'}
                </button>
            </div>
        </div>
    );
}
