'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Loader2, Sparkles, GraduationCap, FileText,
    Building2, Briefcase, Plane, Heart, Globe,
    Database, Lightbulb
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
    useAIQCM,
    type AIQCMParams, type NiveauCECRL, type ThemeQCM, type ModuleQCM,
    type FirestoreTheme, FIRESTORE_THEME_LABELS
} from '@/hooks/useAIQCM';

/* ─────────────────────────────────────────────
   Données commun : niveaux CECRL
───────────────────────────────────────────── */
const NIVEAUX: { id: NiveauCECRL; label: string; sublabel: string; color: string; objectif: string }[] = [
    { id: 'A1', label: 'A1', sublabel: 'Débutant', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', objectif: 'Découverte du français' },
    { id: 'A2', label: 'A2', sublabel: 'Élémentaire', color: 'bg-blue-50 border-blue-200 text-blue-700', objectif: '✅ Carte de séjour' },
    { id: 'B1', label: 'B1', sublabel: 'Intermédiaire', color: 'bg-violet-50 border-violet-200 text-violet-700', objectif: '✅ Carte résident 10 ans' },
    { id: 'B2', label: 'B2', sublabel: 'Avancé', color: 'bg-amber-50 border-amber-200 text-amber-700', objectif: '✅ Naturalisation française' },
];

/* ─────────────────────────────────────────────
   Données mode IA (Gemini)
───────────────────────────────────────────── */
const AI_THEMES: { id: ThemeQCM; label: string; icon: React.ReactNode }[] = [
    { id: 'vie_quotidienne', label: 'Vie quotidienne', icon: <Heart className="h-5 w-5" aria-hidden="true" /> },
    { id: 'administration', label: 'Administration', icon: <Building2 className="h-5 w-5" aria-hidden="true" /> },
    { id: 'civique', label: 'Civic & République', icon: <GraduationCap className="h-5 w-5" aria-hidden="true" /> },
    { id: 'travail', label: 'Travail & Emploi', icon: <Briefcase className="h-5 w-5" aria-hidden="true" /> },
    { id: 'voyage', label: 'Voyage & Transport', icon: <Plane className="h-5 w-5" aria-hidden="true" /> },
    { id: 'famille', label: 'Famille & Société', icon: <Globe className="h-5 w-5" aria-hidden="true" /> },
];

const AI_MODULES: { id: ModuleQCM; label: string; description: string }[] = [
    { id: 'general', label: 'Général', description: 'Questions variées tous thèmes' },
    { id: 'carte_sejour_A2', label: 'Carte de séjour A2', description: 'Préparation officielle OFII niveau A2' },
    { id: 'carte_resident_B1', label: 'Carte résident B1', description: 'Préparation résidence 10 ans niveau B1' },
    { id: 'nationalite_B2', label: 'Naturalisation B2', description: 'Préparation entretien civique B2' },
];

/* ─────────────────────────────────────────────
   Données mode Banque (Firestore)
───────────────────────────────────────────── */
const FS_THEMES: { id: FirestoreTheme; icon: React.ReactNode }[] = [
    { id: 'vals_principes', icon: <Lightbulb className="h-5 w-5" aria-hidden="true" /> },
    { id: 'histoire', icon: <FileText className="h-5 w-5" aria-hidden="true" /> },
    { id: 'geographie', icon: <Globe className="h-5 w-5" aria-hidden="true" /> },
    { id: 'institutions', icon: <Building2 className="h-5 w-5" aria-hidden="true" /> },
    { id: 'societe', icon: <Heart className="h-5 w-5" aria-hidden="true" /> },
];

/* ─────────────────────────────────────────────
   Composant principal
───────────────────────────────────────────── */
export default function AIQuizConfigPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { generateQCM, fetchFromFirestore, isLoading, error } = useAIQCM();

    // Mode actif : 'banque' (Firestore) ou 'ia' (Gemini)
    const [mode, setMode] = useState<'banque' | 'ia'>('banque');

    // Sélections communes
    const [niveau, setNiveau] = useState<NiveauCECRL>('A2');

    // Sélections mode IA
    const [aiTheme, setAiTheme] = useState<ThemeQCM>('administration');
    const [moduleQCM, setModuleQCM] = useState<ModuleQCM>('carte_sejour_A2');

    // Sélections mode Banque
    const [fsTheme, setFsTheme] = useState<FirestoreTheme>('vals_principes');

    React.useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    const handleGenerate = async () => {
        if (mode === 'banque') {
            const session = await fetchFromFirestore(fsTheme, niveau, 10);
            if (session) router.push('/ai-quiz/session');
        } else {
            const params: AIQCMParams = { niveau, theme: aiTheme, module: moduleQCM };
            const session = await generateQCM(params);
            if (session) router.push('/ai-quiz/session');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="container mx-auto px-4 py-10 max-w-3xl">

                {/* Hero */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        QCM Personnalisé
                    </h1>
                    <p className="text-gray-500">
                        Choisissez votre source de questions, votre niveau et votre thème.
                    </p>
                </div>

                {/* ── Toggle MODE ── */}
                <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-8 shadow-sm" role="group" aria-label="Source des questions">
                    <button
                        role="radio"
                        aria-checked={mode === 'banque'}
                        onClick={() => setMode('banque')}
                        className={[
                            'flex-1 flex items-center justify-center gap-3 py-4 px-6 transition-all font-semibold text-sm',
                            mode === 'banque'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50',
                        ].join(' ')}
                    >
                        <Database className="h-5 w-5" aria-hidden="true" />
                        <span>
                            📚 Banque de questions
                            <span className="block text-xs font-normal opacity-75">Vos questions Firestore</span>
                        </span>
                    </button>
                    <button
                        role="radio"
                        aria-checked={mode === 'ia'}
                        onClick={() => setMode('ia')}
                        className={[
                            'flex-1 flex items-center justify-center gap-3 py-4 px-6 transition-all font-semibold text-sm border-l border-gray-200',
                            mode === 'ia'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50',
                        ].join(' ')}
                    >
                        <Sparkles className="h-5 w-5" aria-hidden="true" />
                        <span>
                            ✨ Génération IA
                            <span className="block text-xs font-normal opacity-75">Gemini génère de nouvelles questions</span>
                        </span>
                    </button>
                </div>

                {/* Erreur */}
                {error && (
                    <div role="alert" aria-live="assertive"
                        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm">
                        <span className="sr-only">Erreur : </span>
                        <strong>Erreur.</strong> {error}
                        {error.includes('GEMINI_API_KEY') && (
                            <p className="mt-2">
                                👉 Ajoutez votre clé dans <code className="bg-red-100 px-1 rounded">.env.local</code>{' '}
                                ou basculez sur le mode <strong>Banque de questions</strong>.
                            </p>
                        )}
                    </div>
                )}

                {/* ── ÉTAPE 1 : Niveau (commun aux deux modes) ── */}
                <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        1. Choisissez votre niveau CECRL
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        {mode === 'banque'
                            ? 'Filtre les questions par niveau dans la base de données.'
                            : 'Chaque niveau correspond à un objectif de titre de séjour.'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="radiogroup" aria-label="Niveau CECRL">
                        {NIVEAUX.map((n) => (
                            <button
                                key={n.id}
                                role="radio"
                                aria-checked={niveau === n.id}
                                onClick={() => setNiveau(n.id)}
                                className={[
                                    'border-2 rounded-xl p-4 text-left transition-all',
                                    niveau === n.id
                                        ? `${n.color} border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20`
                                        : 'border-gray-200 bg-white hover:border-gray-300',
                                ].join(' ')}
                                aria-label={`Niveau ${n.id} — ${n.sublabel} — ${n.objectif}`}
                            >
                                <div className="text-2xl font-bold mb-1">{n.id}</div>
                                <div className="text-xs font-medium">{n.sublabel}</div>
                                <div className="text-xs text-gray-500 mt-1">{n.objectif}</div>
                            </button>
                        ))}
                    </div>
                    {mode === 'banque' && (
                        <p className="text-xs text-gray-500 mt-3 bg-blue-50 p-2 rounded-lg" aria-live="polite">
                            💡 Si peu de questions correspondent à ce niveau, toutes les questions du thème seront utilisées.
                        </p>
                    )}
                </Card>

                {/* ── ÉTAPE 2 : Thème ── */}
                <Card className="p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        2. Choisissez le thème
                    </h2>

                    {/* ─── Mode Banque : thèmes Firestore ─── */}
                    {mode === 'banque' && (
                        <>
                            <p className="text-sm text-gray-500 mb-4">
                                Thèmes disponibles dans votre base Firestore.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup" aria-label="Thème Firestore">
                                {FS_THEMES.map((t) => (
                                    <button
                                        key={t.id}
                                        role="radio"
                                        aria-checked={fsTheme === t.id}
                                        onClick={() => setFsTheme(t.id)}
                                        className={[
                                            'flex items-center gap-3 border-2 rounded-xl p-4 text-left transition-all',
                                            fsTheme === t.id
                                                ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]'
                                                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700',
                                        ].join(' ')}
                                    >
                                        {t.icon}
                                        <div>
                                            <div className="text-sm font-semibold">{FIRESTORE_THEME_LABELS[t.id]}</div>
                                            <div className="text-xs text-gray-400 font-mono">{t.id}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ─── Mode IA : thèmes Gemini ─── */}
                    {mode === 'ia' && (
                        <>
                            <p className="text-sm text-gray-500 mb-4">
                                Les questions seront générées par Gemini pour ce thème.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="radiogroup" aria-label="Thème IA">
                                {AI_THEMES.map((t) => (
                                    <button
                                        key={t.id}
                                        role="radio"
                                        aria-checked={aiTheme === t.id}
                                        onClick={() => setAiTheme(t.id)}
                                        className={[
                                            'flex items-center gap-3 border-2 rounded-xl p-4 text-left transition-all',
                                            aiTheme === t.id
                                                ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]'
                                                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700',
                                        ].join(' ')}
                                    >
                                        {t.icon}
                                        <span className="text-sm font-medium">{t.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Module (mode IA uniquement) */}
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Module</h3>
                                <div className="space-y-2" role="radiogroup" aria-label="Module administratif">
                                    {AI_MODULES.map((m) => (
                                        <button
                                            key={m.id}
                                            role="radio"
                                            aria-checked={moduleQCM === m.id}
                                            onClick={() => setModuleQCM(m.id)}
                                            className={[
                                                'w-full flex items-center gap-4 border-2 rounded-xl p-3 text-left transition-all',
                                                moduleQCM === m.id
                                                    ? 'border-[var(--color-primary)] bg-blue-50'
                                                    : 'border-gray-200 bg-white hover:border-gray-300',
                                            ].join(' ')}
                                        >
                                            <div className={[
                                                'w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors',
                                                moduleQCM === m.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300',
                                            ].join(' ')} aria-hidden="true" />
                                            <div>
                                                <div className="font-medium text-sm text-gray-900">{m.label}</div>
                                                <div className="text-xs text-gray-400">{m.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </Card>

                {/* Bouton Générer */}
                <div className="text-center">
                    <Button
                        size="lg"
                        className="px-10 py-6 text-base font-semibold gap-3"
                        onClick={handleGenerate}
                        disabled={isLoading}
                        aria-busy={isLoading}
                        aria-label={isLoading
                            ? 'Chargement des questions, veuillez patienter'
                            : mode === 'banque'
                                ? 'Lancer le QCM avec mes questions Firestore'
                                : 'Générer mon QCM avec Gemini IA'
                        }
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                                {mode === 'banque' ? 'Chargement des questions...' : 'Gemini génère votre QCM...'}
                            </>
                        ) : mode === 'banque' ? (
                            <>
                                <Database className="h-5 w-5" aria-hidden="true" />
                                Lancer le QCM
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" aria-hidden="true" />
                                Générer mon QCM IA
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-gray-400 mt-3">
                        10 questions · 15 minutes · Seuil de réussite : 70%
                        {mode === 'banque' && ' · Aucune clé API requise'}
                    </p>
                </div>

            </div>
        </div>
    );
}
