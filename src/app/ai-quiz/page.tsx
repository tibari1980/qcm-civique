'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import {
    Loader2, Sparkles, GraduationCap, FileText,
    Building2, Briefcase, Plane, Heart, Globe,
    Database, Lightbulb, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    useAIQCM,
    type AIQCMParams, type NiveauCECRL, type ThemeQCM, type ModuleQCM,
    type FirestoreTheme, FIRESTORE_THEME_LABELS
} from '../../hooks/useAIQCM';

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
   Données mode IA (CiviqQuiz)
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

    // Mode actif : 'banque' (Firestore) ou 'ia' (AI)
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
        if (!user) return;
        if (mode === 'banque') {
            const session = await fetchFromFirestore(fsTheme, niveau, user.uid, 10);
            if (session) router.push('/ai-quiz/session');
        } else {
            const params: AIQCMParams = { niveau, theme: aiTheme, module: moduleQCM };
            const session = await generateQCM(params, user.uid);
            if (session) router.push('/ai-quiz/session');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Senior Mesh Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-400/20 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="container mx-auto px-4 py-10 max-w-4xl relative z-10">

                {/* Hero High-End */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-xs font-black uppercase tracking-widest mb-4 border border-blue-200">
                        <Sparkles className="h-3 w-3" />
                        Expert Mode
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        QCM <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-red-600">Sur Mesure</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
                        Notre algorithme analyse votre historique pour générer une session unique sans répétition.
                    </p>
                </div>

                {/* ── Toggle MODE Glassmorphism ── */}
                <div className="flex p-2 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/60 mb-12 shadow-2xl max-w-2xl mx-auto" role="group" aria-label="Source des questions">
                    <button
                        role="radio"
                        aria-checked={mode === 'banque'}
                        onClick={() => setMode('banque')}
                        className={[
                            'flex-1 flex flex-col items-center justify-center gap-1 py-4 px-6 rounded-xl transition-all font-black text-sm relative overflow-hidden',
                            mode === 'banque'
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-900',
                        ].join(' ')}
                    >
                        <Database className="h-6 w-6" aria-hidden="true" />
                        <span className="uppercase tracking-widest text-[10px]">Banque Firestore</span>
                    </button>
                    <button
                        role="radio"
                        aria-checked={mode === 'ia'}
                        onClick={() => setMode('ia')}
                        className={[
                            'flex-1 flex flex-col items-center justify-center gap-1 py-4 px-6 rounded-xl transition-all font-black text-sm relative overflow-hidden',
                            mode === 'ia'
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-900',
                        ].join(' ')}
                    >
                        <Sparkles className="h-6 w-6" aria-hidden="true" />
                        <span className="uppercase tracking-widest text-[10px]">Assistant Intelligent</span>
                    </button>
                </div>

                {/* Erreur High-End */}
                {error && (
                    <div role="alert" aria-live="assertive"
                        className="bg-red-50 border-2 border-red-100 text-red-700 p-6 rounded-3xl mb-12 text-sm flex items-start gap-4 shadow-sm">
                        <AlertCircle className="h-6 w-6 flex-shrink-0" />
                        <div>
                            <strong className="block font-black text-base mb-1">Attention</strong>
                            {error}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column : Config */}
                    <div className="lg:col-span-12 space-y-8">

                        {/* ── ÉTAPE 1 : Niveau ── */}
                        <Card className="glass-card border-none p-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">01</span>
                                Objectif & Niveau
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="radiogroup" aria-label="Niveau CECRL">
                                {NIVEAUX.map((n) => (
                                    <button
                                        key={n.id}
                                        role="radio"
                                        aria-checked={niveau === n.id}
                                        onClick={() => setNiveau(n.id)}
                                        className={[
                                            'group relative overflow-hidden border-2 rounded-3xl p-6 text-left transition-all hover:shadow-xl',
                                            niveau === n.id
                                                ? 'border-blue-500 bg-white shadow-2xl scale-[1.02] z-10'
                                                : 'border-slate-100 bg-slate-50/50 hover:border-slate-300',
                                        ].join(' ')}
                                    >
                                        <div className="text-4xl font-black mb-2 text-slate-900">{n.id}</div>
                                        <div className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-3">{n.sublabel}</div>
                                        <div className="text-xs text-slate-400 font-medium leading-relaxed">{n.objectif}</div>
                                        {niveau === n.id && <div className="absolute top-4 right-4 text-blue-500"><GraduationCap className="h-6 w-6" /></div>}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* ── ÉTAPE 2 : Thème ── */}
                        <Card className="glass-card border-none p-8 overflow-hidden relative">
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full" />
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-tight">
                                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">02</span>
                                Thématique d&apos;expertise
                            </h2>

                            {/* Mode Banque */}
                            {mode === 'banque' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="radiogroup" aria-label="Thème Firestore">
                                    {FS_THEMES.map((t) => (
                                        <button
                                            key={t.id}
                                            role="radio"
                                            aria-checked={fsTheme === t.id}
                                            onClick={() => setFsTheme(t.id)}
                                            className={[
                                                'flex items-center gap-4 border-2 rounded-2xl p-5 text-left transition-all group',
                                                fsTheme === t.id
                                                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl scale-[1.02]'
                                                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-300',
                                            ].join(' ')}
                                        >
                                            <div className={[
                                                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                                                fsTheme === t.id ? 'bg-white/10 text-white' : 'bg-white text-slate-400 group-hover:text-slate-600 shadow-sm border border-slate-100'
                                            ].join(' ')}>
                                                {t.icon}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black uppercase tracking-tight">{FIRESTORE_THEME_LABELS[t.id]}</div>
                                                <div className={`text-[10px] font-bold font-mono opacity-50 ${fsTheme === t.id ? 'text-white' : 'text-slate-400'}`}>{t.id.toUpperCase()}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" role="radiogroup" aria-label="Thème IA">
                                        {AI_THEMES.map((t) => (
                                            <button
                                                key={t.id}
                                                role="radio"
                                                aria-checked={aiTheme === t.id}
                                                onClick={() => setAiTheme(t.id)}
                                                className={[
                                                    'flex flex-col items-center justify-center gap-3 border-2 rounded-2xl p-6 text-center transition-all group aspect-square',
                                                    aiTheme === t.id
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                                                        : 'border-slate-100 bg-slate-50/50 hover:border-slate-300',
                                                ].join(' ')}
                                            >
                                                <div className={`transition-transform group-hover:scale-110 ${aiTheme === t.id ? 'text-blue-600' : 'text-slate-400'}`}>{t.icon}</div>
                                                <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Bouton Générer Extra Senior */}
                <div className="mt-16 text-center relative">
                    {isLoading && (
                        <div className="mb-6 flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="h-8 w-8 text-blue-400 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-black text-slate-800 animate-pulse">Curation Intelligente en cours...</p>
                                <p className="text-sm text-slate-400 font-medium italic">Analyse de vos points forts pour un tirage sur mesure</p>
                            </div>
                        </div>
                    )}

                    <Button
                        size="lg"
                        className={[
                            "px-16 h-20 text-xl font-black gap-4 rounded-3xl shadow-2xl transition-all transform active:scale-95 group overflow-hidden relative",
                            isLoading ? "opacity-0 invisible pointer-events-none" : "bg-slate-900 hover:bg-black text-white"
                        ].join(' ')}
                        onClick={handleGenerate}
                        disabled={isLoading}
                    >
                        {mode === 'banque' ? (
                            <>
                                <Database className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                <span>LANCER LE QCM EXPERT</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-6 w-6 group-hover:animate-bounce transition-transform" />
                                <span>GÉNÉRER MON QCM PERSONNALISÉ</span>
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </Button>

                    {!isLoading && (
                        <div className="mt-6 flex items-center justify-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> 10 Questions</div>
                            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> 15 Minutes</div>
                            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" /> Anti-Répétition</div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
