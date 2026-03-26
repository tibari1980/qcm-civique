'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Home, Volume2, VolumeX, Loader2, Flame, Eye, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { Question, QuestionService } from '../../../services/question.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSoundEffects } from '../../../hooks/useSoundEffects';
import { Skeleton } from '../../../components/ui/Skeleton';
import { PedagogicalText } from '../../../components/features/PedagogicalText';

export default function TrainingSession() {
    const { user, userProfile, loading } = useAuth();
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
    const startTimeRef = useRef<number>(Date.now());

    // ── Redirect si non connecté ──
    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    // ── Charger les questions ──
    const loadQuestions = useCallback(async (mode: 'normal' | 'review' = 'normal', wrongQs: Question[] = []) => {
        setIsLoadingData(true);
        try {
            if (mode === 'review') {
                setQuestions(wrongQs);
            } else {
                const profile = await UserService.getUserProfile(user?.uid || '');
                const track = profile?.track === 'naturalisation' ? 'naturalisation' : 'titre_sejour';
                const fetched = await QuestionService.getQuestionsByTheme(themeId, 20, track);
                setQuestions(fetched);
            }
        } catch (error) {
            console.error("Error loading questions:", error);
        } finally {
            setIsLoadingData(false);
        }
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

    const startReview = useCallback(() => {
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
        // Announce selection to screen readers
        const announcement = document.getElementById('global-announcement');
        if (announcement) {
            const currentQ = questions[currentQuestionIndex];
            if (currentQ) announcement.textContent = `Réponse ${String.fromCharCode(65 + index)} sélectionnée : ${currentQ.choices[index]}`;
        }
    }, [isAnswered, questions, currentQuestionIndex]);

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
                    const timeSpentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
                    await UserService.saveAttempt({
                        user_id: user.uid,
                        exam_type: userProfile?.track === 'naturalisation' ? 'naturalisation' : 'titre_sejour',
                        theme: themeId,
                        score,
                        total_questions: questions.length,
                        time_spent: timeSpentSeconds,
                        answers: finalAnswers
                    });

                    // Send notification on high success (80%+)
                    const percentage = Math.round((score / questions.length) * 100);
                    if (percentage >= 80) {
                        await NotificationService.sendNotification({
                            userId: user.uid,
                            title: 'Excellent entraînement ! 🧠',
                            message: `Vous avez terminé votre séance sur "${themeId}" avec un score impressionnant de ${percentage}%. Félicitations !`,
                            type: 'success',
                            link: `/training/${themeId}`
                        });
                    }
                } catch (error) {
                    console.error('Failed to save attempt:', error);
                }
            }
        }
    }, [currentQuestionIndex, questions, user, answers, score, themeId, reviewMode]);

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
            <div className="container mx-auto px-4 py-12 max-w-4xl space-y-10" role="status" aria-busy="true" aria-live="polite">
                <p className="sr-only">Chargement des questions en cours, veuillez patienter…</p>
                <header className="flex justify-between items-center">
                    <Skeleton width="150px" height="2rem" className="rounded-full" />
                    <div className="flex gap-2">
                        <Skeleton width="40px" height="40px" className="rounded-full" />
                        <Skeleton width="40px" height="40px" className="rounded-full" />
                    </div>
                </header>
                <Card className="border-none shadow-xl bg-white p-8 space-y-8">
                    <Skeleton height="3rem" width="80%" />
                    <div className="space-y-4">
                        <Skeleton height="4rem" className="rounded-xl" />
                        <Skeleton height="4rem" className="rounded-xl" />
                        <Skeleton height="4rem" className="rounded-xl" />
                        <Skeleton height="4rem" className="rounded-xl" />
                    </div>
                </Card>
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t flex justify-end">
                    <Skeleton width="200px" height="3rem" className="rounded-lg" />
                </div>
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

    if (isFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        const isSuccess = percentage >= 80;
        const wrongQuestions = questions.filter((_, i) => correctFlags[i] === false);

        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50/50" role="main" aria-label="Résultats de la session">
                <Card className="w-full max-w-2xl border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden" tabIndex={-1} ref={resultRef} aria-label={`Résultats : ${percentage} pourcent de réussite, ${score} sur ${questions.length} questions correctes`}>
                    <CardHeader className="text-center pb-2 pt-8">
                        <CardTitle className="text-3xl font-bold mb-1">
                            {reviewMode ? 'Révision terminée !' : isSuccess ? 'Félicitations ! 🎉' : 'Séance terminée'}
                        </CardTitle>
                        <p className="text-muted-foreground">Voici le récapitulatif de votre session</p>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-8">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`relative w-44 h-44 flex flex-col items-center justify-center rounded-full border-[6px] ${isSuccess ? 'border-green-500 bg-green-50 text-green-700' : 'border-orange-500 bg-orange-50 text-orange-700'} mb-6 shadow-inner`} role="img" aria-label={`Score : ${percentage} pourcent de réussite`}>
                            <span className="text-5xl font-extrabold tracking-tighter" aria-hidden="true">{percentage}%</span>
                            <span className="text-xs font-semibold mt-1 uppercase tracking-wide opacity-80" aria-hidden="true">De réussite</span>
                        </motion.div>
                        <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-4 mb-6" role="list" aria-label="Statistiques de la session">
                            <div className="bg-blue-50 p-3 rounded-xl text-center border border-blue-100" role="listitem">
                                <span className="block text-2xl font-bold text-blue-700">{questions.length}</span>
                                <span className="text-xs font-semibold text-blue-600 uppercase">Questions</span>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-xl text-center border border-purple-100" role="listitem">
                                <span className="block text-2xl font-bold text-purple-700">{score * 10}</span>
                                <span className="text-xs font-semibold text-purple-600 uppercase">Points XP</span>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-xl text-center border border-orange-100" role="listitem">
                                <span className="sr-only">Série maximale : {maxStreak}</span>
                                <span className="block text-2xl font-bold text-orange-600" aria-hidden="true">🔥{maxStreak}</span>
                                <span className="text-xs font-semibold text-orange-600 uppercase">Streak max</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 bg-gray-50/80 p-6 border-t">
                        <Button onClick={resetSession} variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:bg-white" aria-label="Réessayer avec de nouvelles questions">
                            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Réessayer
                        </Button>
                        {wrongQuestions.length > 0 && !reviewMode && (
                            <Button onClick={startReview} variant="outline" size="lg" className="w-full sm:w-auto border-2 border-orange-300 text-orange-700 hover:bg-orange-50" aria-label={`Revoir les ${wrongQuestions.length} erreurs`}>
                                <Eye className="mr-2 h-4 w-4" aria-hidden="true" /> Revoir mes erreurs
                            </Button>
                        )}
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg" aria-label="Retour au tableau de bord">
                                <Home className="mr-2 h-4 w-4" aria-hidden="true" /> Dashboard
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/30 flex flex-col">
            {/* Live region for answer feedback */}
            <div className="sr-only" aria-live="assertive" aria-atomic="true" id="training-feedback" />
            <div className="fixed top-[4rem] left-0 right-0 h-1 bg-gray-200 z-10" role="progressbar" aria-valuenow={currentQuestionIndex + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label={`Question ${currentQuestionIndex + 1} sur ${questions.length}`}>
                <motion.div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" initial={{ width: 0 }} animate={{ width: `${(currentQuestionIndex / questions.length) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col">
                <header className="flex justify-between items-center mb-8 mt-4" aria-label="Progression de l'entraînement">
                    <div className="flex items-center gap-3">
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-blue-600 shadow-sm border border-blue-100" aria-live="polite" aria-atomic="true">
                            Question {currentQuestionIndex + 1} <span className="text-gray-400 font-normal">/ {questions.length}</span>
                        </span>
                        {reviewMode && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-bold" role="status">Mode Révision</span>}
                    </div>
                    <div className="flex items-center gap-3">
                        {streak >= 2 && (
                            <motion.div key={streak} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-sm font-bold" role="status" aria-label={`Série de ${streak} bonnes réponses consécutives`}>
                                <Flame className="h-4 w-4" aria-hidden="true" /> {streak}
                            </motion.div>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setIsAudioEnabled(!isAudioEnabled)} className={`rounded-full ${isAudioEnabled ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`} aria-label={isAudioEnabled ? 'Désactiver la lecture audio de la question' : 'Activer la lecture audio de la question'} aria-pressed={isAudioEnabled}>
                            {isAudioEnabled ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
                        </Button>
                        <Link href="/dashboard" aria-label="Quitter l'entraînement et retourner au tableau de bord">
                            <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-red-500" aria-label="Quitter">
                                <XCircle className="h-5 w-5" aria-hidden="true" />
                            </Button>
                        </Link>
                    </div>
                </header>

                <main className="flex-1" aria-label="Zone de quiz">
                    <AnimatePresence mode="wait">
                        <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Card className="border-none shadow-lg bg-white overflow-hidden mb-24">
                                <CardContent className="p-6 md:p-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-8" ref={questionRef} tabIndex={-1} id="current-question">
                                        <PedagogicalText text={currentQuestion.question} />
                                    </h2>
                                    <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-labelledby="current-question" aria-describedby="training-feedback">
                                        {currentQuestion.choices.map((choice, index) => {
                                            const isSelected = selectedAnswer === index;
                                            const isCorrectChoice = index === currentQuestion.correct_index;
                                            let styleClass = 'relative p-4 rounded-xl border-2 text-left transition-all w-full flex items-start gap-4 ';
                                            if (isAnswered) {
                                                if (isCorrectChoice) styleClass += 'border-green-500 bg-green-50 text-green-900';
                                                else if (isSelected) styleClass += 'border-red-200 bg-red-50 text-red-900';
                                                else styleClass += 'border-gray-50 text-gray-300 opacity-50';
                                            } else if (isSelected) {
                                                styleClass += 'border-blue-600 bg-blue-50 text-blue-700 shadow-inner';
                                            } else {
                                                styleClass += 'border-gray-100 hover:border-gray-200 bg-white';
                                            }

                                            // Build accessible label
                                            let accessibleLabel = `Réponse ${String.fromCharCode(65 + index)} : ${choice}`;
                                            if (isAnswered && isCorrectChoice) accessibleLabel += ' — Bonne réponse';
                                            if (isAnswered && isSelected && !isCorrectChoice) accessibleLabel += ' — Mauvaise réponse';

                                            return (
                                                <button key={index} onClick={() => handleAnswerSelect(index)} disabled={isAnswered} className={styleClass} role="radio" aria-checked={isSelected} aria-label={accessibleLabel}>
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold border transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`} aria-hidden="true">
                                                        {String.fromCharCode(65 + index)}
                                                    </div>
                                                    <span className="text-lg font-medium w-full text-left">
                                                        <PedagogicalText text={choice} />
                                                    </span>
                                                    {isAnswered && isCorrectChoice && <CheckCircle className="ml-auto h-6 w-6 text-green-500" aria-hidden="true" />}
                                                    {isAnswered && isSelected && !isCorrectChoice && <XCircle className="ml-auto h-6 w-6 text-red-500" aria-hidden="true" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {/* Explication (République Française design) */}
                                    {isAnswered && currentQuestion.explanation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="mt-8 overflow-hidden"
                                            role="region"
                                            aria-label="Explication de la réponse"
                                        >
                                            <div className="bg-gradient-to-br from-slate-50 to-white border-l-4 border-l-blue-600 rounded-r-2xl p-6 shadow-sm relative border border-slate-100">
                                                {/* Subtil liseré tricolore en haut pour rappeler la République Française */}
                                                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-white to-red-600 opacity-80" aria-hidden="true" />

                                                <div className="flex items-start gap-4">
                                                    <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-700 flex-shrink-0 shadow-sm" aria-hidden="true">
                                                        <BookOpen className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">
                                                            Le saviez-vous ?
                                                        </h3>
                                                        <p className="text-slate-700 leading-relaxed text-[1.05rem]">
                                                            {currentQuestion.explanation}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Screen reader feedback after answer */}
                                    {isAnswered && (
                                        <div className="sr-only" role="status" aria-live="assertive">
                                            {status === 'correct'
                                                ? `Bonne réponse ! La réponse correcte est ${currentQuestion.choices[currentQuestion.correct_index]}.`
                                                : `Mauvaise réponse. La bonne réponse était ${currentQuestion.choices[currentQuestion.correct_index]}.`
                                            }
                                            {currentQuestion.explanation ? ` Explication : ${currentQuestion.explanation}` : ''}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
                <div className="container mx-auto max-w-4xl flex justify-end">
                    {!isAnswered ? (
                        <Button size="lg" onClick={handleValidate} disabled={selectedAnswer === null} className="w-full sm:w-auto min-w-[180px] font-bold shadow-blue-500/20" aria-label={selectedAnswer === null ? 'Sélectionnez une réponse avant de vérifier' : 'Vérifier ma réponse'}>
                            Vérifier
                        </Button>
                    ) : (
                        <Button size="lg" onClick={handleNext}
                            className={`w-full sm:w-auto min-w-[200px] font-bold relative overflow-hidden transition-all hover:scale-[1.02] shadow-lg
                                ${status === 'correct'
                                    ? 'bg-white text-green-700 border-2 border-green-500 hover:bg-green-50'
                                    : 'bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 flex">
                                <div className="h-full w-1/3 bg-blue-600" />
                                <div className="h-full w-1/3 bg-white" />
                                <div className="h-full w-1/3 bg-red-600" />
                            </div>
                            <span className="flex items-center gap-2">
                                {currentQuestionIndex < questions.length - 1 ? 'Continuer' : 'Voir Résultats'}
                                <ArrowRight className="h-5 w-5" aria-hidden="true" />
                            </span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
