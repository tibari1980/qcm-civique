'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Sparkles, CheckCircle2, XCircle, RotateCcw, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAIQCM, type AIQCMSession } from '@/hooks/useAIQCM';
import { UserService } from '@/services/user.service';
import Link from 'next/link';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const NIVEAU_LABELS: Record<string, string> = {
    A1: 'Débutant', A2: 'Élémentaire', B1: 'Intermédiaire', B2: 'Avancé'
};
const THEME_LABELS: Record<string, string> = {
    vie_quotidienne: 'Vie quotidienne', administration: 'Administration',
    civique: 'Civic', travail: 'Travail', voyage: 'Voyage', famille: 'Famille',
};

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/* ─────────────────────────────────────────────
   Session View
───────────────────────────────────────────── */
function SessionPlayer({
    session,
    onFinish,
}: {
    session: AIQCMSession;
    onFinish: (answers: Record<number, number>, timeSpent: number) => void;
}) {
    const { questions, metadata } = session;
    const durationSeconds = 15 * 60;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(durationSeconds);
    const questionRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        questionRef.current?.focus();
    }, [currentIndex]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onFinish(answers, durationSeconds);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [answers, onFinish, durationSeconds]);

    const question = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
            {/* Header session */}
            <div className="flex items-center justify-between mb-6 gap-4" role="status" aria-label="Progression de l'examen">
                <div className="text-sm font-medium text-gray-600">
                    <span aria-label={`Question ${currentIndex + 1} sur ${questions.length}`}>
                        Q <strong>{currentIndex + 1}</strong> / {questions.length}
                    </span>
                    <span className="ml-3 text-xs text-gray-400">
                        Niveau {metadata.niveau} · {THEME_LABELS[metadata.theme] || metadata.theme}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-mono font-semibold text-gray-700"
                    aria-label={`Temps restant : ${formatTime(timeLeft)}`}
                    aria-live="off"
                >
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6" role="progressbar"
                aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
                aria-label={`${progress}% complété`}>
                <div className="bg-[var(--color-primary)] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }} />
            </div>

            {/* Question */}
            <Card className="p-6 mb-4">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                    <span className="text-xs font-medium text-[var(--color-primary)] bg-blue-50 px-2 py-0.5 rounded-full">
                        {question.competence || 'FLE'}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{question.difficulte || ''}</span>
                </div>
                <h2
                    ref={questionRef}
                    tabIndex={-1}
                    className="text-lg font-semibold text-gray-900 mb-6 outline-none"
                    id={`question-${currentIndex}`}
                >
                    {question.question}
                </h2>

                {/* Options */}
                <div
                    role="radiogroup"
                    aria-labelledby={`question-${currentIndex}`}
                    className="space-y-3"
                >
                    {question.choices.map((choice, i) => {
                        const letter = String.fromCharCode(65 + i); // A, B, C, D
                        const isSelected = answers[currentIndex] === i;
                        return (
                            <button
                                key={i}
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setAnswers(prev => ({ ...prev, [currentIndex]: i }))}
                                className={[
                                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                                    isSelected
                                        ? 'border-[var(--color-primary)] bg-blue-50 text-[var(--color-primary)]'
                                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-800',
                                ].join(' ')}
                                aria-label={`Option ${letter} : ${choice}`}
                            >
                                <span className={[
                                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2',
                                    isSelected
                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                                        : 'border-gray-300 text-gray-500',
                                ].join(' ')} aria-hidden="true">
                                    {letter}
                                </span>
                                <span className="text-sm">{choice}</span>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
                <Button
                    variant="outline"
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    aria-label="Question précédente"
                >
                    Précédent
                </Button>
                {isLast ? (
                    <Button
                        onClick={() => onFinish(answers, durationSeconds - timeLeft)}
                        disabled={answers[currentIndex] === undefined}
                        aria-label="Terminer le QCM et voir mes résultats"
                        className="gap-2"
                    >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Terminer
                    </Button>
                ) : (
                    <Button
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={answers[currentIndex] === undefined}
                        aria-label="Question suivante"
                    >
                        Suivant
                    </Button>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Results View
───────────────────────────────────────────── */
function ResultsView({
    session,
    answers,
    onRegenerate,
}: {
    session: AIQCMSession;
    answers: Record<number, number>;
    onRegenerate: () => void;
}) {
    const { questions, metadata } = session;
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        resultRef.current?.focus();
    }, []);

    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct_index ? 1 : 0), 0);
    const percent = Math.round((score / questions.length) * 100);
    const passed = percent >= metadata.seuil_reussite;

    return (
        <div className="container mx-auto px-4 py-10 max-w-2xl">
            {/* Score principal */}
            <div
                ref={resultRef}
                tabIndex={-1}
                className="outline-none text-center mb-10"
                aria-label={`Résultats : ${score} bonnes réponses sur ${questions.length}. Score : ${percent}%. ${passed ? 'Réussi' : 'À améliorer'}`}
            >
                <div className={[
                    'mx-auto w-36 h-36 rounded-full flex flex-col items-center justify-center border-8 mb-6',
                    passed ? 'border-green-400 bg-green-50 text-green-700' : 'border-orange-400 bg-orange-50 text-orange-700',
                ].join(' ')} aria-hidden="true">
                    <span className="text-4xl font-bold">{percent}%</span>
                    <span className="text-xs font-semibold mt-1">{passed ? '✅ Réussi' : '📚 À revoir'}</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {score} / {questions.length} bonnes réponses
                </h1>
                <p className="text-gray-500">
                    Niveau <strong>{metadata.niveau}</strong> · {THEME_LABELS[metadata.theme] || metadata.theme}
                    {' '}· Seuil : {metadata.seuil_reussite}%
                </p>
                {passed ? (
                    <p className="mt-3 text-green-700 font-semibold text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-2 inline-block">
                        🎉 Félicitations ! Vous dépassez le seuil de {metadata.seuil_reussite}%.
                    </p>
                ) : (
                    <p className="mt-3 text-orange-700 font-semibold text-sm bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 inline-block">
                        Continuez à vous entraîner pour atteindre {metadata.seuil_reussite}%.
                    </p>
                )}
            </div>

            {/* Correction détaillée */}
            <section aria-label="Correction détaillée" className="space-y-4 mb-10">
                <h2 className="text-lg font-bold text-gray-900">Correction</h2>
                {questions.map((q, i) => {
                    const userAnswer = answers[i];
                    const isCorrect = userAnswer === q.correct_index;
                    return (
                        <Card key={q.id} className={[
                            'p-5 border-l-4',
                            isCorrect ? 'border-l-green-500' : 'border-l-red-400',
                        ].join(' ')}>
                            <div className="flex items-start gap-3 mb-3">
                                {isCorrect
                                    ? <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" aria-label="Correct" />
                                    : <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" aria-label="Incorrect" />
                                }
                                <p className="text-sm font-semibold text-gray-900">{q.question}</p>
                            </div>

                            {!isCorrect && userAnswer !== undefined && (
                                <p className="text-xs text-red-600 mb-1 ml-8">
                                    Votre réponse : <em>{q.choices[userAnswer]}</em>
                                </p>
                            )}
                            {userAnswer === undefined && (
                                <p className="text-xs text-gray-400 mb-1 ml-8">
                                    <em>Question non répondue</em>
                                </p>
                            )}
                            <p className="text-xs text-green-700 font-medium mb-2 ml-8">
                                ✅ Bonne réponse : <em>{q.choices[q.correct_index]}</em>
                            </p>
                            <div className="ml-8 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                💡 {q.explanation}
                            </div>
                        </Card>
                    );
                })}
            </section>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                    onClick={onRegenerate}
                    className="gap-2"
                    aria-label="Générer un nouveau QCM personnalisé"
                >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Nouveau QCM
                </Button>
                <Link href="/dashboard">
                    <Button variant="outline" className="gap-2 w-full sm:w-auto" aria-label="Retour au tableau de bord">
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                        Tableau de bord
                    </Button>
                </Link>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */
export default function AIQuizSessionPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { getLastSession, clearSession } = useAIQCM();

    const [session, setSession] = useState<AIQCMSession | null>(null);
    const [answers, setAnswers] = useState<Record<number, number> | null>(null);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/login'); return; }
        if (!session) {
            const stored = getLastSession();
            if (!stored) { router.push('/ai-quiz'); return; }
            setSession(stored);
        }
    }, [authLoading, user, router, getLastSession, session]);

    const handleFinish = useCallback(async (finalAnswers: Record<number, number>, timeSpent: number) => {
        if (!session || !user) return;

        const score = session.questions.reduce(
            (acc, q, i) => acc + (finalAnswers[i] === q.correct_index ? 1 : 0), 0
        );

        setAnswers(finalAnswers);

        // Sauvegarde dans Firestore (type 'ai_qcm')
        try {
            await UserService.saveAttempt({
                user_id: user.uid,
                exam_type: 'ai_qcm' as never,
                score,
                total_questions: session.questions.length,
                time_spent: timeSpent,
                answers: session.questions.map((q, i) => ({
                    question_id: q.id,
                    choice_index: finalAnswers[i] ?? -1,
                    correct: finalAnswers[i] === q.correct_index,
                })),
            });
        } catch (e) {
            console.error('[AI QCM] Erreur sauvegarde attempt:', e);
        }
    }, [session, user]);

    const handleRegenerate = useCallback(() => {
        clearSession();
        router.push('/ai-quiz');
    }, [clearSession, router]);

    if (!session) {
        return (
            <div className="flex h-screen items-center justify-center" role="status" aria-live="polite">
                <p className="text-gray-500">Chargement de votre QCM...</p>
            </div>
        );
    }

    if (answers !== null) {
        return <ResultsView session={session} answers={answers} onRegenerate={handleRegenerate} />;
    }

    return <SessionPlayer session={session} onFinish={handleFinish} />;
}
