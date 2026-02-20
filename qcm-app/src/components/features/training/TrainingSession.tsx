'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Home, Volume2, VolumeX, Loader2, Flame, Eye } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Question, QuestionService } from '@/services/question.service';
import { UserService } from '@/services/user.service';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export default function TrainingSession() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const themeId = params?.themeId as string;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [correctFlags, setCorrectFlags] = useState<Record<number, boolean>>({});
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

    // Streak
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);

    // Mode révision des erreurs
    const [reviewMode, setReviewMode] = useState(false);

    const { playSound } = useSoundEffects();
    const questionRef = useRef<HTMLHeadingElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    // ── Redirect si non connecté ──
    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    // ── Charger les questions ──
    const loadQuestions = useCallback(async (mode: 'normal' | 'review' = 'normal', wrongQs: Question[] = []) => {
        setIsLoadingData(true);
        if (mode === 'review') {
            setQuestions(wrongQs);
        } else {
            const fetched = await QuestionService.getQuestionsByTheme(themeId, 20);
            setQuestions(fetched);
        }
        setIsLoadingData(false);
    }, [themeId]);

    useEffect(() => {
        if (user && themeId && questions.length === 0 && !reviewMode) {
            loadQuestions();
        }
    }, [user, themeId, loadQuestions, questions.length, reviewMode]);

    // ── Audio ──
    useEffect(() => {
        if (!isAudioEnabled || !questions[currentQuestionIndex]) {
            window.speechSynthesis?.cancel();
            return;
        }
        const utter = new SpeechSynthesisUtterance(questions[currentQuestionIndex].question);
        utter.lang = 'fr-FR';
        window.speechSynthesis.speak(utter);
        return () => window.speechSynthesis.cancel();
    }, [currentQuestionIndex, isAudioEnabled, questions]);

    // ── Focus accessibility ──
    useEffect(() => {
        if (!isLoadingData && !isFinished && questionRef.current) questionRef.current.focus();
        else if (isFinished && resultRef.current) resultRef.current.focus();
    }, [currentQuestionIndex, isLoadingData, isFinished]);

    // ── Reset session → nouvelles questions ──
    const resetSession = useCallback(() => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswers({});
        setCorrectFlags({});
        setIsAnswered(false);
        setScore(0);
        setIsFinished(false);
        setStatus('idle');
        setStreak(0);
        setMaxStreak(0);
        setReviewMode(false);
        loadQuestions('normal');
    }, [loadQuestions]);

    // ── Lancer le mode révision des erreurs ──
    const startReview = useCallback(() => {
        // Collect wrong questions
        const wrong = questions.filter((_, i) => correctFlags[i] === false);
        if (wrong.length === 0) return;
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setAnswers({});
        setCorrectFlags({});
        setIsAnswered(false);
        setScore(0);
        setIsFinished(false);
        setStatus('idle');
        setStreak(0);
        setMaxStreak(0);
        setReviewMode(true);
        setQuestions(wrong);
    }, [questions, correctFlags]);

    const triggerConfetti = useCallback(() => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#2563eb', '#3b82f6', '#60a5fa'] });
    }, []);

    const handleAnswerSelect = useCallback((index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
    }, [isAnswered]);

    const handleValidate = useCallback(() => {
        if (selectedAnswer === null) return;
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correct_index;
        setIsAnswered(true);
        setStatus(isCorrect ? 'correct' : 'wrong');
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedAnswer }));
        setCorrectFlags(prev => ({ ...prev, [currentQuestionIndex]: isCorrect }));

        if (isCorrect) {
            setScore(s => s + 1);
            setStreak(s => {
                const next = s + 1;
                setMaxStreak(m => Math.max(m, next));
                return next;
            });
            triggerConfetti();
            playSound('success');
        } else {
            setStreak(0);
            playSound('error');
        }
    }, [selectedAnswer, questions, currentQuestionIndex, triggerConfetti, playSound]);

    const handleNext = useCallback(async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setStatus('idle');
        } else {
            setIsFinished(true);
            if (user && !reviewMode) {
                try {
                    const finalAnswers = questions.map((q, index) => ({
                        question_id: q.id,
                        choice_index: answers[index] ?? -1,
                        correct: answers[index] === q.correct_index
                    }));
                    await UserService.saveAttempt({
                        user_id: user.uid,
                        exam_type: 'titre_sejour',
                        theme: themeId,
                        score,
                        total_questions: questions.length,
                        time_spent: 0,
                        answers: finalAnswers
                    });
                } catch (error) {
                    console.error('Failed to save attempt:', error);
                }
            }
        }
    }, [currentQuestionIndex, questions, user, answers, score, themeId, reviewMode]);

    // ── Clavier ──
    useEffect(() => {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isAnswered || isFinished) return;
            if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
                const index = e.key.toLowerCase().charCodeAt(0) - 97;
                if (index < currentQuestion.choices.length) handleAnswerSelect(index);
            } else if (e.key === 'Enter' && selectedAnswer !== null) {
                handleValidate();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, isFinished, selectedAnswer, questions, currentQuestionIndex, handleAnswerSelect, handleValidate]);

    if (loading || isLoadingData) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                <p className="text-gray-500 font-medium">
                    {reviewMode ? 'Préparation de la révision…' : 'Préparation de votre séance…'}
                </p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <Card>
                    <CardContent className="pt-6">
                        <p>Aucune question trouvée pour ce thème.</p>
                        <Link href="/dashboard"><Button className="mt-4">Retour</Button></Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── Écran de fin ──
    if (isFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        const isSuccess = percentage >= 80;
        const wrongQuestions = questions.filter((_, i) => correctFlags[i] === false);

        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50/50" role="main">
                <Card className="w-full max-w-2xl border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden" tabIndex={-1} ref={resultRef}>
                    <CardHeader className="text-center pb-2 pt-8">
                        <CardTitle className="text-3xl font-bold mb-1" tabIndex={0}>
                            {reviewMode ? 'Révision terminée !' : isSuccess ? 'Félicitations ! 🎉' : 'Séance terminée'}
                        </CardTitle>
                        <p className="text-muted-foreground">Voici le récapitulatif de votre session</p>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center py-8">
                        {/* Score circulaire */}
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                            className={`relative w-44 h-44 flex flex-col items-center justify-center rounded-full border-[6px] ${isSuccess ? 'border-green-500 bg-green-50 text-green-700' : 'border-orange-500 bg-orange-50 text-orange-700'} mb-6 shadow-inner`}
                        >
                            <span className="text-5xl font-extrabold tracking-tighter">{percentage}%</span>
                            <span className="text-xs font-semibold mt-1 uppercase tracking-wide opacity-80">De réussite</span>
                            <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full shadow-md text-sm font-bold border border-gray-100">
                                {score}/{questions.length} Correctes
                            </div>
                        </motion.div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-4 mb-6">
                            <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100">
                                <span className="block text-2xl font-bold text-blue-700">{questions.length}</span>
                                <span className="text-xs font-semibold text-blue-600 uppercase">Questions</span>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-xl text-center border border-purple-100">
                                <span className="block text-2xl font-bold text-purple-700">{score * 10}</span>
                                <span className="text-xs font-semibold text-purple-600 uppercase">Points XP</span>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-xl text-center border border-orange-100">
                                <span className="block text-2xl font-bold text-orange-600">🔥{maxStreak}</span>
                                <span className="text-xs font-semibold text-orange-600 uppercase">Streak max</span>
                            </div>
                        </div>

                        {/* Récap question par question */}
                        <div className="w-full max-w-md space-y-2 max-h-48 overflow-y-auto pr-1">
                            {questions.map((q, i) => (
                                <div key={q.id} className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${correctFlags[i] ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {correctFlags[i]
                                        ? <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                                        : <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600" />}
                                    <span className="line-clamp-2">{q.question}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 bg-gray-50/80 p-6 border-t">
                        <Button onClick={resetSession} variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:bg-white" aria-label="Réessayer avec de nouvelles questions">
                            <RotateCcw className="mr-2 h-4 w-4" /> Réessayer
                        </Button>
                        {wrongQuestions.length > 0 && !reviewMode && (
                            <Button onClick={startReview} variant="outline" size="lg" className="w-full sm:w-auto border-2 border-orange-300 text-orange-700 hover:bg-orange-50" aria-label="Revoir uniquement vos erreurs">
                                <Eye className="mr-2 h-4 w-4" /> Revoir mes {wrongQuestions.length} erreur{wrongQuestions.length > 1 ? 's' : ''}
                            </Button>
                        )}
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full bg-[var(--color-primary)] hover:bg-blue-700 shadow-lg shadow-blue-500/20" aria-label="Retour au Tableau de bord">
                                <Home className="mr-2 h-4 w-4" /> Tableau de bord
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // ── Session active ──
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/30 flex flex-col">
            {/* Barre de progression */}
            <div className="fixed top-[4rem] left-0 right-0 h-1 bg-gray-200 z-10" role="progressbar"
                aria-valuenow={Math.round((currentQuestionIndex / questions.length) * 100)}
                aria-valuemin={0} aria-valuemax={100} aria-label="Progression de la séance">
                <motion.div
                    className="h-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col">
                {/* Header */}
                <header className="flex justify-between items-center mb-8 mt-4">
                    <div className="flex items-center gap-3">
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-[var(--color-primary)] shadow-sm border border-blue-100"
                            aria-label={`Question ${currentQuestionIndex + 1} sur ${questions.length}`}>
                            Question {currentQuestionIndex + 1} <span className="text-gray-400 font-normal">/ {questions.length}</span>
                        </span>
                        {reviewMode && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold border border-orange-200">
                                Mode Révision
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Streak en temps réel */}
                        <AnimatePresence>
                            {streak >= 2 && (
                                <motion.div
                                    key={streak}
                                    initial={{ scale: 0.7, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.7, opacity: 0 }}
                                    className="flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-600 px-2.5 py-1 rounded-full text-sm font-bold"
                                    aria-label={`Série de ${streak} bonnes réponses`}
                                >
                                    <Flame className="h-4 w-4" aria-hidden="true" />
                                    {streak}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="hidden sm:flex items-center gap-1" aria-label={`Score : ${score} points`}>
                            <span className="text-sm text-gray-500">Score :</span>
                            <span className="text-sm font-bold text-[var(--color-primary)]">{score}</span>
                        </div>

                        <Button variant="ghost" size="icon"
                            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                            className={`rounded-full ${isAudioEnabled ? 'text-[var(--color-primary)] bg-blue-50' : 'text-gray-400'}`}
                            aria-label={isAudioEnabled ? 'Désactiver la lecture audio' : 'Activer la lecture audio'}
                            aria-pressed={isAudioEnabled}>
                            {isAudioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                        </Button>

                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50" aria-label="Quitter l'entraînement">
                                <XCircle className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Question */}
                <main className="flex-1" aria-live="polite">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Card className="border-none shadow-lg bg-white overflow-hidden mb-24">
                                <CardContent className="p-6 md:p-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-8 outline-none"
                                        tabIndex={-1} ref={questionRef}>
                                        {currentQuestion.question}
                                    </h2>

                                    <div className="space-y-3" role="radiogroup" aria-label="Choix de réponse">
                                        {currentQuestion.choices.map((choice, index) => {
                                            const isSelected = selectedAnswer === index;
                                            const isCorrectChoice = index === currentQuestion.correct_index;

                                            let styleClass = 'relative p-4 rounded-xl border-2 text-left transition-all duration-200 w-full flex items-start gap-4 focus:ring-4 focus:ring-blue-200 outline-none ';
                                            if (isAnswered) {
                                                if (isCorrectChoice) styleClass += 'border-green-500 bg-green-50/50 text-green-900 shadow-sm';
                                                else if (isSelected) styleClass += 'border-red-200 bg-red-50/50 text-red-900 opacity-80';
                                                else styleClass += 'border-gray-100 text-gray-400 grayscale opacity-60';
                                            } else if (isSelected) {
                                                styleClass += 'border-[var(--color-primary)] bg-blue-50/50 text-[var(--color-primary)] shadow-md ring-1 ring-blue-500/20';
                                            } else {
                                                styleClass += 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm';
                                            }

                                            let ariaLabel = `Option ${String.fromCharCode(65 + index)} : ${choice}.`;
                                            if (isAnswered) {
                                                if (isCorrectChoice) ariaLabel += ' (Bonne réponse)';
                                                else if (isSelected) ariaLabel += ' (Votre réponse, incorrecte)';
                                            } else if (isSelected) ariaLabel += ' (Sélectionné)';

                                            return (
                                                <button key={index} onClick={() => handleAnswerSelect(index)}
                                                    disabled={isAnswered} className={styleClass}
                                                    aria-label={ariaLabel} aria-checked={isSelected} role="radio">
                                                    <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold border transition-colors
                                                        ${isAnswered && isCorrectChoice ? 'bg-green-500 border-green-500 text-white' :
                                                            isAnswered && isSelected ? 'bg-red-500 border-red-500 text-white' :
                                                                isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' :
                                                                    'bg-gray-100 border-gray-200 text-gray-500'}`} aria-hidden="true">
                                                        {String.fromCharCode(65 + index)}
                                                    </div>
                                                    <span className="text-lg font-medium leading-relaxed">{choice}</span>
                                                    {isAnswered && isCorrectChoice && (
                                                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-green-500" aria-hidden="true" />
                                                    )}
                                                    {isAnswered && isSelected && !isCorrectChoice && (
                                                        <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-red-500" aria-hidden="true" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-6 italic text-center" aria-hidden="true">
                                        Astuce : Utilisez les touches A, B, C, D de votre clavier pour répondre.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Barre d'action fixe en bas */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
                <div className="container mx-auto max-w-4xl flex justify-between items-center">
                    {!isAnswered ? (
                        <div className="w-full flex justify-end">
                            <Button size="lg" onClick={handleValidate} disabled={selectedAnswer === null}
                                className="w-full sm:w-auto min-w-[200px] text-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] focus:ring-4 focus:ring-blue-300"
                                aria-label="Valider ma réponse">
                                Vérifier
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-between gap-4" role="alert" aria-live="assertive">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${status === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {status === 'correct' ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                                </div>
                                <div className="hidden sm:block">
                                    <p className={`font-bold ${status === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                                        {status === 'correct'
                                            ? streak >= 3 ? `🔥 ${streak} bonnes réponses d'affilée !` : 'Bonne réponse !'
                                            : 'Mauvaise réponse'}
                                    </p>
                                    {status !== 'correct' && (
                                        <p className="text-xs text-muted-foreground">La réponse était : <span className="font-semibold">{currentQuestion.choices[currentQuestion.correct_index]}</span></p>
                                    )}
                                </div>
                            </div>
                            <Button size="lg" onClick={handleNext}
                                className={`min-w-[160px] text-lg font-bold shadow-lg transition-transform hover:scale-[1.02] focus:ring-4 ${status === 'correct'
                                    ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20 focus:ring-green-300'
                                    : 'bg-gray-900 hover:bg-black shadow-gray-500/20 focus:ring-gray-500'}`}
                                aria-label={currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}>
                                {currentQuestionIndex < questions.length - 1 ? 'Continuer' : 'Voir Résultats'}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
