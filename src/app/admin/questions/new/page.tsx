'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Eye, EyeOff, RotateCcw, CheckCircle2 } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AdminService, type QuestionFormData } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';
import { normalizeQuestionText } from '@/utils/cleaning';

/* ─── Thèmes avec libellés lisibles ─── */
const THEME_OPTIONS: { value: string; label: string }[] = [
    { value: 'vals_principes', label: 'Valeurs & Principes de la République' },
    { value: 'histoire', label: 'Histoire de France' },
    { value: 'geographie', label: 'Géographie' },
    { value: 'institutions', label: 'Institutions françaises' },
    { value: 'societe', label: 'Société et citoyenneté' },
    { value: 'droits', label: 'Droits et devoirs' },
];

const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];
const EXAM_TYPES: { value: string; label: string }[] = [
    { value: 'titre_sejour', label: 'Titre de séjour' },
    { value: 'carte_resident', label: 'Carte de résident' },
    { value: 'naturalisation', label: 'Naturalisation' },
];

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const MAX_QUESTION_LENGTH = 500;
const MIN_QUESTION_LENGTH = 10;

const EMPTY: QuestionFormData = {
    theme: 'vals_principes',
    level: 'Débutant',
    exam_types: ['titre_sejour'], // Modification ici : collection de parcours
    question: '',
    choices: ['', '', '', ''],
    correct_index: 0,
    explanation: '',
    tags: [],
    is_active: true,
};

type Errors = Partial<Record<string, string>>;

/* ── Validation ── */
function validate(form: QuestionFormData): Errors {
    const errors: Errors = {};

    // Question
    const q = form.question.trim();
    if (!q) {
        errors.question = 'La question est obligatoire.';
    } else if (q.length < MIN_QUESTION_LENGTH) {
        errors.question = `La question doit contenir au moins ${MIN_QUESTION_LENGTH} caractères.`;
    } else if (q.length > MAX_QUESTION_LENGTH) {
        errors.question = `La question ne peut pas dépasser ${MAX_QUESTION_LENGTH} caractères.`;
    }

    // Thème
    if (!THEME_OPTIONS.some(t => t.value === form.theme)) {
        errors.theme = 'Veuillez sélectionner un thème valide.';
    }

    // Réponses
    const trimmed = form.choices.map(c => c.trim());
    form.choices.forEach((c, i) => {
        if (!c.trim()) {
            errors[`choice_${i}`] = `La réponse ${LETTERS[i]} est obligatoire.`;
        } else if (c.trim().length < 2) {
            errors[`choice_${i}`] = `La réponse ${LETTERS[i]} est trop courte (min. 2 caractères).`;
        }
    });

    // Doublons entre réponses
    const unique = new Set(trimmed.filter(Boolean));
    if (unique.size < trimmed.filter(Boolean).length) {
        errors.choices_duplicate = 'Deux réponses ne peuvent pas être identiques.';
    }

    // Bonne réponse pointe vers réponse vide
    if (!form.choices[form.correct_index]?.trim()) {
        errors.correct_index = 'La bonne réponse sélectionnée est vide.';
    }

    // Parcours
    if (!form.exam_types || form.exam_types.length === 0) {
        errors.exam_types = 'Veuillez sélectionner au moins un parcours.';
    }

    return errors;
}

export default function AdminNewQuestionPage() {
    useAdminGuard();
    const router = useRouter();

    const [form, setForm] = useState<QuestionFormData>(EMPTY);
    const [errors, setErrors] = useState<Errors>({});
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    /* ─ Setters ─ */
    const set = <K extends keyof QuestionFormData>(k: K, v: QuestionFormData[K]) => {
        setForm(f => ({ ...f, [k]: v }));
        setErrors(e => { const n = { ...e }; delete n[k as string]; return n; });
    };

    const setChoice = (i: number, v: string) => {
        setForm(f => { const c = [...f.choices]; c[i] = v; return { ...f, choices: c }; });
        setErrors(e => { const n = { ...e }; delete n[`choice_${i}`]; delete n.choices_duplicate; return n; });
    };

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

    const reset = () => { setForm(EMPTY); setErrors({}); setTagInput(''); };

    /* ─ Soumission ─ */
    const handleSubmit = async () => {
        // 1. Validation locale
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            // Scroll vers la première erreur
            const first = document.querySelector('[role="alert"]');
            first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setSaving(true);
        setErrors({});

        try {
            // 2. Vérification doublon en base (plus robuste)
            const snap = await getDocs(collection(db, 'questions'));
            const normNew = normalizeQuestionText(form.question);
            const duplicate = snap.docs.find(d => normalizeQuestionText(d.data().question || '') === normNew);

            if (duplicate) {
                setErrors({ question: '⚠️ Cette question existe déjà dans la base de données.' });
                setSaving(false);
                return;
            }

            // 3. Création
            await AdminService.createQuestion({
                ...form,
                question: form.question.trim(),
                choices: form.choices.map(c => c.trim()),
            });

            // 4. Toast de succès puis redirection
            setToast('✅ Question ajoutée avec succès !');
            setTimeout(() => {
                router.push('/admin/questions');
            }, 2000);

        } catch (e) {
            setErrors({ _global: e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.' });
            setSaving(false);
        }
    };

    const charCount = form.question.length;
    const charCountColor = charCount > MAX_QUESTION_LENGTH ? 'text-red-500' :
        charCount > MAX_QUESTION_LENGTH * 0.85 ? 'text-amber-500' : 'text-gray-400';

    return (
        <div className="p-6 max-w-3xl mx-auto">

            {/* Toast */}
            {toast && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in slide-in-from-top-2"
                >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {toast}
                </div>
            )}

            {/* Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nouvelle question</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Les champs marqués <span className="text-red-500 font-bold">*</span> sont obligatoires.</p>
                </div>
                <button
                    onClick={() => setPreview(v => !v)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[var(--color-primary)] transition-colors"
                    aria-pressed={preview}
                >
                    {preview
                        ? <><EyeOff className="h-4 w-4" aria-hidden="true" /> Formulaire</>
                        : <><Eye className="h-4 w-4" aria-hidden="true" /> Aperçu</>
                    }
                </button>
            </div>

            {/* Erreur globale */}
            {errors._global && (
                <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
                    {errors._global}
                </div>
            )}

            {preview ? (
                /* ── Aperçu ── */
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {THEME_OPTIONS.find(t => t.value === form.theme)?.label ?? form.theme}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{form.level}</span>
                        {(form.exam_types || []).map(type => (
                            <span key={type} className={`px-2 py-0.5 rounded-full text-xs font-medium ${type === 'naturalisation' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                {EXAM_TYPES.find(e => e.value === type)?.label ?? type}
                            </span>
                        ))}
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-5">{form.question || <em className="text-gray-400">(question vide)</em>}</p>
                    <div className="space-y-2">
                        {form.choices.map((c, i) => (
                            <div key={i} className={[
                                'flex items-center gap-3 p-3 rounded-xl border-2',
                                i === form.correct_index
                                    ? 'border-emerald-400 bg-emerald-50'
                                    : 'border-gray-200 bg-gray-50'
                            ].join(' ')}>
                                <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {LETTERS[i]}
                                </span>
                                <span className="text-sm">{c || <em className="text-gray-400">(vide)</em>}</span>
                                {i === form.correct_index && (
                                    <span className="ml-auto text-xs text-emerald-600 font-semibold">✓ Bonne réponse</span>
                                )}
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

                    {/* ─ Métadonnées ─ */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" aria-label="Métadonnées">
                        <h2 className="font-semibold text-gray-900 mb-4">Métadonnées</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* Thème */}
                            <div>
                                <label htmlFor="field-theme" className="block text-xs font-medium text-gray-600 mb-1">
                                    Thème <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="field-theme"
                                    value={form.theme}
                                    onChange={e => set('theme', e.target.value)}
                                    className={[
                                        'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30',
                                        errors.theme ? 'border-red-400 bg-red-50' : 'border-gray-200',
                                    ].join(' ')}
                                    aria-describedby={errors.theme ? 'err-theme' : undefined}
                                >
                                    {THEME_OPTIONS.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                                {errors.theme && (
                                    <p id="err-theme" role="alert" className="mt-1 text-xs text-red-600">{errors.theme}</p>
                                )}
                            </div>

                            {/* Niveau */}
                            <div>
                                <label htmlFor="field-level" className="block text-xs font-medium text-gray-600 mb-1">Niveau</label>
                                <select
                                    id="field-level"
                                    value={form.level}
                                    onChange={e => set('level', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                                >
                                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>

                            {/* Parcours (Multi-select) */}
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-2">
                                    Parcours associés <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-4 p-3 border border-gray-200 rounded-lg bg-gray-50/30">
                                    {EXAM_TYPES.map(e => (
                                        <label key={e.value} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={(form.exam_types || []).includes(e.value)}
                                                onChange={ev => {
                                                    const checked = ev.target.checked;
                                                    const current = form.exam_types || [];
                                                    const next = checked
                                                        ? [...current, e.value]
                                                        : current.filter(v => v !== e.value);
                                                    set('exam_types', next);
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                                {e.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {errors.exam_types && (
                                    <p id="err-exam" role="alert" className="mt-1 text-xs text-red-600">{errors.exam_types}</p>
                                )}
                            </div>
                        </div>

                        {/* Statut actif */}
                        <div className="mt-4 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="field-is-active"
                                checked={form.is_active}
                                onChange={e => set('is_active', e.target.checked)}
                                className="w-4 h-4 accent-[var(--color-primary)]"
                            />
                            <label htmlFor="field-is-active" className="text-sm text-gray-600">
                                Question active (visible pour les utilisateurs)
                            </label>
                        </div>
                    </section>

                    {/* ─ Texte de la question ─ */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" aria-label="Texte de la question">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="field-question" className="block text-sm font-semibold text-gray-900">
                                Texte de la question <span className="text-red-500">*</span>
                            </label>
                            <span className={`text-xs font-mono ${charCountColor}`}>
                                {charCount}/{MAX_QUESTION_LENGTH}
                            </span>
                        </div>
                        <textarea
                            id="field-question"
                            value={form.question}
                            onChange={e => set('question', e.target.value)}
                            rows={3}
                            placeholder="Rédigez votre question ici… (min. 10 caractères)"
                            maxLength={MAX_QUESTION_LENGTH + 10}
                            className={[
                                'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none',
                                errors.question ? 'border-red-400 bg-red-50' : 'border-gray-200',
                            ].join(' ')}
                            aria-describedby={errors.question ? 'err-question' : undefined}
                        />
                        {errors.question && (
                            <p id="err-question" role="alert" className="mt-1 text-xs text-red-600">{errors.question}</p>
                        )}
                    </section>

                    {/* ─ Réponses ─ */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" aria-label="Réponses possibles">
                        <h2 className="font-semibold text-gray-900 mb-1">
                            Réponses <span className="text-red-500">*</span>
                        </h2>
                        <p className="text-xs text-gray-400 mb-4">Sélectionnez la bonne réponse avec le bouton radio. Toutes les réponses doivent être remplies.</p>

                        {errors.choices_duplicate && (
                            <p role="alert" className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {errors.choices_duplicate}
                            </p>
                        )}
                        {errors.correct_index && (
                            <p role="alert" className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                {errors.correct_index}
                            </p>
                        )}

                        <div className="space-y-2" role="radiogroup" aria-label="Sélectionner la bonne réponse">
                            {form.choices.map((c, i) => (
                                <div key={i} className="space-y-0.5">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="correct"
                                            id={`choice-radio-${i}`}
                                            checked={form.correct_index === i}
                                            onChange={() => set('correct_index', i)}
                                            className="w-4 h-4 accent-[var(--color-primary)] flex-shrink-0"
                                            aria-label={`Définir la réponse ${LETTERS[i]} comme bonne réponse`}
                                        />
                                        <label
                                            htmlFor={`choice-radio-${i}`}
                                            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 cursor-pointer"
                                        >
                                            {LETTERS[i]}
                                        </label>
                                        <input
                                            type="text"
                                            value={c}
                                            onChange={e => setChoice(i, e.target.value)}
                                            placeholder={`Réponse ${LETTERS[i]}…`}
                                            aria-label={`Texte de la réponse ${LETTERS[i]}`}
                                            aria-describedby={errors[`choice_${i}`] ? `err-choice-${i}` : undefined}
                                            className={[
                                                'flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30',
                                                errors[`choice_${i}`] ? 'border-red-400 bg-red-50' : 'border-gray-200',
                                                form.correct_index === i ? 'border-emerald-400 bg-emerald-50/50' : '',
                                            ].filter(Boolean).join(' ')}
                                        />
                                        {form.choices.length > 2 && (
                                            <button
                                                onClick={() => removeChoice(i)}
                                                className="p-1 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                                                aria-label={`Supprimer la réponse ${LETTERS[i]}`}
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>
                                    {errors[`choice_${i}`] && (
                                        <p id={`err-choice-${i}`} role="alert" className="text-xs text-red-600 pl-10">
                                            {errors[`choice_${i}`]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {form.choices.length < 6 && (
                            <button
                                onClick={addChoice}
                                className="mt-4 flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:underline"
                            >
                                <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter un choix
                            </button>
                        )}
                    </section>

                    {/* ─ Explication ─ */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" aria-label="Explication">
                        <label htmlFor="field-explanation" className="block text-sm font-semibold text-gray-900 mb-2">
                            Explication <span className="text-gray-400 font-normal text-xs">(facultatif — affichée après réponse)</span>
                        </label>
                        <textarea
                            id="field-explanation"
                            value={form.explanation}
                            onChange={e => set('explanation', e.target.value)}
                            rows={2}
                            placeholder="Expliquez pourquoi cette réponse est correcte…"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none"
                        />
                    </section>

                    {/* ─ Tags ─ */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" aria-label="Tags">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Tags <span className="text-gray-400 font-normal text-xs">(facultatif)</span>
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Ajouter un tag et appuyer sur Entrée…"
                                aria-label="Nouveau tag"
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                            />
                            <button
                                onClick={addTag}
                                className="px-3 py-2 bg-blue-50 text-[var(--color-primary)] rounded-lg text-sm hover:bg-blue-100 transition-colors"
                            >
                                Ajouter
                            </button>
                        </div>
                        {form.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {form.tags.map(t => (
                                    <span key={t} className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">
                                        {t}
                                        <button
                                            onClick={() => set('tags', form.tags.filter(x => x !== t))}
                                            className="text-blue-400 hover:text-red-500 ml-1 leading-none"
                                            aria-label={`Supprimer le tag ${t}`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* ─ Actions ─ */}
            <div className="mt-6 flex items-center justify-between">
                <button
                    onClick={reset}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
                    aria-label="Réinitialiser le formulaire"
                >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Réinitialiser
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    aria-busy={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm hover:brightness-110 transition-colors disabled:opacity-50"
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    ) : (
                        <Save className="h-4 w-4" aria-hidden="true" />
                    )}
                    {saving ? 'Vérification & enregistrement…' : 'Enregistrer la question'}
                </button>
            </div>
        </div>
    );
}
