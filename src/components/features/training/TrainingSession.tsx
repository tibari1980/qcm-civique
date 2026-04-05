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
                const track = profile?.track || 'csp';
                
                // Récupération de la mémoire anti-répétition (limite à 200 pour reset)
                let seenIds: string[] = [];
                try {
                    seenIds = JSON.parse(localStorage.getItem('qcm_seen_ids') || '[]');
                } catch(e) {}
                
                const fetched = await QuestionService.getQuestionsByTheme(themeId, 20, track, seenIds);
                setQuestions(fetched);

                // Sauvegarde de l'historique local "Zéro Doublon"
                const newSeenIds = [...new Set([...seenIds, ...fetched.map(q => q.id)])];
                if (newSeenIds.length > 200) newSeenIds.splice(0, newSeenIds.length - 200); // Nettoyage FIFO
                localStorage.setItem('qcm_seen_ids', JSON.stringify(newSeenIds));
            }
        } catch (error) {
            console.error("Error loading questions:", error);
        } finally {
            setIsLoadingData(false);
        }
    }, [themeId, user]);

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
    }, [currentQuestionIndex, questions, user, answers, score, themeId, reviewMode, userProfile]);

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
                        <Button onClick={() => router.push('/dashboard')} className="mt-4">Retour</Button>
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
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/50" role="main" aria-label="Résultats de la session">
                <Card className="w-full max-w-2xl border-none shadow-3d-lg bg-white/90 backdrop-blur-md overflow-hidden glass-card" tabIndex={-1} ref={resultRef} aria-label={`Résultats : ${percentage} pourcent de réussite, ${score} sur ${questions.length} questions correctes`}>
                    <CardHeader className="text-center pb-2 pt-10">
                        <CardTitle className="text-4xl font-black mb-1 tracking-tight">
                            {reviewMode ? 'Révision terminée !' : isSuccess ? 'Félicitations ! 🎉' : 'Séance terminée'}
                        </CardTitle>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Récapitulatif de votre session</p>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-8">
                        <motion.div 
                            initial={{ scale: 0.8, rotate: -5 }} 
                            animate={{ scale: 1, rotate: 0 }} 
                            className={`relative w-48 h-48 flex flex-col items-center justify-center rounded-full border-[8px] shadow-3d-md mb-8 ${isSuccess ? 'border-green-500 bg-green-50 text-green-700' : 'border-orange-500 bg-orange-50 text-orange-700'}`} 
                            role="img" 
                            aria-label={`Score : ${percentage} pourcent de réussite`}
                        >
                            <span className="text-6xl font-black tracking-tighter" aria-hidden="true">{percentage}%</span>
                            <span className="text-[10px] font-black mt-1 uppercase tracking-widest opacity-60" aria-hidden="true">Maîtrise</span>
                        </motion.div>
                        <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-4 mb-6" role="list" aria-label="Statistiques de la session">
                            <div className="premium-card-3d bg-blue-50/50 p-4 text-center" role="listitem">
                                <span className="block text-2xl font-black text-blue-700">{questions.length}</span>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Questions</span>
                            </div>
                            <div className="premium-card-3d bg-purple-50/50 p-4 text-center" role="listitem">
                                <span className="block text-2xl font-black text-purple-700">{score * 10}</span>
                                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">XP Gagnés</span>
                            </div>
                            <div className="premium-card-3d bg-orange-50/50 p-4 text-center" role="listitem">
                                <span className="block text-2xl font-black text-orange-600" aria-hidden="true">🔥{maxStreak}</span>
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Streak</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 bg-slate-50/50 p-8 border-t border-slate-100">
                        <Button onClick={resetSession} variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl font-bold border-2 hover:bg-white shadow-sm" aria-label="Réessayer avec de nouvelles questions">
                            <RotateCcw className="mr-2 h-5 w-5" aria-hidden="true" /> Recommencer
                        </Button>
                        {wrongQuestions.length > 0 && !reviewMode && (
                            <Button onClick={startReview} variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl font-bold border-2 border-orange-200 text-orange-700 hover:bg-orange-50 shadow-sm" aria-label={`Revoir les ${wrongQuestions.length} erreurs`}>
                                <Eye className="mr-2 h-5 w-5" aria-hidden="true" /> Revoir Erreurs
                            </Button>
                        )}
                        <Button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black shadow-lg shadow-blue-200" aria-label="Retour au tableau de bord">
                            <Home className="mr-2 h-5 w-5" aria-hidden="true" /> Accueil
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50/30 flex flex-col">
            {/* Live region for answer feedback */}
            <div className="sr-only" aria-live="assertive" aria-atomic="true" id="training-feedback" />
            <div className="fixed top-[4rem] left-0 right-0 h-1.5 bg-slate-200 z-10" role="progressbar" aria-valuenow={currentQuestionIndex + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label={`Question ${currentQuestionIndex + 1} sur ${questions.length}`}>
                <motion.div className="h-full bg-primary shadow-3d-sm" initial={{ width: 0 }} animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col">
                <header className="flex justify-between items-center mb-10 mt-6" aria-label="Progression de l'entraînement">
                    <div className="flex items-center gap-4">
                        <div className="premium-card-3d bg-white px-4 py-2 rounded-2xl flex items-center gap-2 border border-slate-100" aria-live="polite" aria-atomic="true">
                            <span className="text-sm font-black text-slate-900">
                                Question {currentQuestionIndex + 1} <span className="text-slate-400 font-bold">/ {questions.length}</span>
                            </span>
                        </div>
                        {reviewMode && <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-3d-sm" role="status">Mode Révision</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        {streak >= 2 && (
                            <motion.div key={streak} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl text-sm font-black shadow-3d-sm" role="status" aria-label={`Série de ${streak} bonnes réponses consécutives`}>
                                <Flame className="h-5 w-5" aria-hidden="true" /> {streak}
                            </motion.div>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setIsAudioEnabled(!isAudioEnabled)} className={`w-12 h-12 rounded-2xl transition-all ${isAudioEnabled ? 'text-primary bg-blue-50 shadow-3d-sm' : 'text-slate-400 bg-white'}`} aria-label={isAudioEnabled ? 'Désactiver la lecture audio' : 'Activer la lecture audio'} aria-pressed={isAudioEnabled}>
                            {isAudioEnabled ? <Volume2 className="h-6 w-6" aria-hidden="true" /> : <VolumeX className="h-6 w-6" aria-hidden="true" />}
                        </Button>
                        <Button onClick={() => router.push('/dashboard')} variant="ghost" size="icon" className="w-12 h-12 rounded-2xl text-slate-400 bg-white hover:text-red-500 hover:bg-red-50 transition-all shadow-sm" aria-label="Quitter l'entraînement">
                            <XCircle className="h-6 w-6" aria-hidden="true" />
                        </Button>
                    </div>
                </header>

                <main className="flex-1" aria-label="Zone de quiz">
                    <AnimatePresence mode="wait">
                        <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                            <Card className="premium-card-3d border-none bg-white overflow-visible mb-24 p-2 md:p-4">
                                <div className="absolute -top-3 left-10 px-4 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-30">
                                    {themeId.replace('_', ' ')}
                                </div>
                                <CardContent className="p-8 md:p-12 relative">
                                    <h2 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight mb-12 outline-none tracking-tight" ref={questionRef} tabIndex={-1} id="current-question">
                                        <PedagogicalText text={currentQuestion.question} />
                                    </h2>
                                    <div className="grid grid-cols-1 gap-5" role="radiogroup" aria-labelledby="current-question" aria-describedby="training-feedback">
                                        {currentQuestion.choices.map((choice, index) => {
                                            const isSelected = selectedAnswer === index;
                                            const isCorrectChoice = index === currentQuestion.correct_index;
                                            let styleClass = 'relative p-6 rounded-[2.5rem] border-2 text-left transition-all w-full flex items-center gap-6 ';
                                            
                                            if (isAnswered) {
                                                if (isCorrectChoice) styleClass += 'border-green-500 bg-green-50 shadow-3d-sm text-green-900 z-10 ';
                                                else if (isSelected) styleClass += 'border-red-500 bg-red-50 shadow-3d-sm text-red-900 z-10 ';
                                                else styleClass += 'border-slate-50 text-slate-300 opacity-40 ';
                                            } else if (isSelected) {
                                                styleClass += 'border-primary bg-blue-50/50 shadow-3d-md z-10 ';
                                            } else {
                                                styleClass += 'border-slate-50 hover:border-slate-200 hover:shadow-3d-sm bg-white/50 hover:bg-white ';
                                            }

                                            let accessibleLabel = `Réponse ${String.fromCharCode(65 + index)} : ${choice}`;
                                            if (isAnswered && isCorrectChoice) accessibleLabel += ' — Bonne réponse';
                                            if (isAnswered && isSelected && !isCorrectChoice) accessibleLabel += ' — Mauvaise réponse';

                                            return (
                                                <motion.button 
                                                    key={index} 
                                                    whileHover={!isAnswered ? { y: -4, scale: 1.01 } : {}}
                                                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                                                    onClick={() => handleAnswerSelect(index)} 
                                                    disabled={isAnswered} 
                                                    className={styleClass} 
                                                    role="radio" 
                                                    aria-checked={isSelected} 
                                                    aria-label={accessibleLabel}
                                                >
                                                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl border transition-all duration-300 ${isSelected ? 'bg-primary text-white shadow-3d-sm scale-110 rotate-6' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-primary border-slate-100 shadow-sm'}`} aria-hidden="true">
                                                        {String.fromCharCode(65 + index)}
                                                    </div>
                                                    <span className={`text-lg md:text-xl transition-colors w-full text-left ${isSelected ? 'font-black text-slate-900' : 'font-bold text-slate-600 group-hover:text-slate-900 font-medium'}`}>
                                                        <PedagogicalText text={choice} />
                                                    </span>
                                                    {isAnswered && (isCorrectChoice || isSelected) && (
                                                        <div className={`premium-card-3d p-2.5 rounded-2xl shadow-sm ml-auto ${isCorrectChoice ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}>
                                                            {isCorrectChoice ? <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" /> : <XCircle className="h-6 w-6 text-white" aria-hidden="true" />}
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {isAnswered && currentQuestion.explanation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className="mt-16"
                                            role="region"
                                            aria-label="Explication de la réponse"
                                        >
                                            <div className="premium-card-3d bg-slate-900 text-white p-10 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full -mr-24 -mt-24 blur-[80px] animate-pulse" aria-hidden="true" />
                                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/20 rounded-full -ml-24 -mb-24 blur-[80px] animate-pulse delay-700" aria-hidden="true" />
                                                
                                                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                                                    <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl flex-shrink-0 border border-white/10 shadow-3d-sm group-hover:rotate-12 transition-transform duration-700" aria-hidden="true">
                                                        <BookOpen className="h-10 w-10 text-blue-300" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
                                                            L&apos;Essentiel à Retenir
                                                            <div className="h-1.5 w-16 bg-gradient-to-r from-blue-500 to-red-500 rounded-full" />
                                                        </h3>
                                                        <p className="text-slate-300 leading-relaxed text-xl font-medium antialiased">
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

            <div className="sticky bottom-0 mt-auto left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-50 shadow-2xl">
                <div className="container mx-auto max-w-4xl flex justify-end">
                    {!isAnswered ? (
                        <Button size="lg" onClick={handleValidate} disabled={selectedAnswer === null} className="w-full sm:w-auto min-w-[200px] h-14 rounded-2xl font-black text-lg bg-primary hover:bg-blue-700 shadow-3d-md" aria-label={selectedAnswer === null ? 'Sélectionnez une réponse avant de vérifier' : 'Vérifier ma réponse'}>
                            Vérifier
                        </Button>
                    ) : (
                        <Button size="lg" onClick={handleNext}
                            className={`w-full sm:w-auto min-w-[220px] h-14 rounded-2xl font-black text-lg relative overflow-hidden transition-all hover:scale-[1.03] shadow-3d-md hover:shadow-3d-lg
                                ${status === 'correct'
                                    ? 'bg-white text-green-700 border-2 border-green-500 hover:bg-green-50'
                                    : 'bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 flex" aria-hidden="true">
                                <div className="h-full w-1/3 bg-blue-600" />
                                <div className="h-full w-1/3 bg-white" />
                                <div className="h-full w-1/3 bg-red-600" />
                            </div>
                            <span className="flex items-center gap-3">
                                {currentQuestionIndex < questions.length - 1 ? 'Continuer' : 'Voir Résultats'}
                                <ArrowRight className="h-6 w-6" aria-hidden="true" />
                            </span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
