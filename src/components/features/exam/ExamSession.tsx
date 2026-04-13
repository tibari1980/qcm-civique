'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Clock, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Loader2, Eye, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Question, QuestionService } from '../../../services/question.service';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { motion, AnimatePresence } from 'framer-motion';
import { PedagogicalText } from '../../../components/features/PedagogicalText';

export default function ExamSession() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Hooks (Always at the top)
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const [isFinished, setIsFinished] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [direction, setDirection] = useState(0);
    const [score, setScore] = useState(0);
    const [showReview, setShowReview] = useState(false);

    const questionHeaderRef = useRef<HTMLHeadingElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    // 2. Auth Guard
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // 3. Derived State (Safe)
    const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;

    // 4. Methods
    const finishExam = useCallback(async () => {
        if (isFinished || questions.length === 0) return;
        setIsFinished(true);

        const calculatedScore = questions.reduce((acc, q, index) => {
            return acc + (answers[index] === q.correct_index ? 1 : 0);
        }, 0);
        setScore(calculatedScore);

        if (user) {
            try {
                const track = userProfile?.track || 'csp';
                
                const attemptAnswers = questions.map((q, index) => ({
                    question_id: q.id,
                    choice_index: answers[index] ?? -1,
                    correct: answers[index] === q.correct_index
                }));

                await UserService.saveAttempt({
                    user_id: user.uid,
                    exam_type: track,
                    score: calculatedScore,
                    total_questions: questions.length,
                    time_spent: 45 * 60 - timeLeft,
                    answers: attemptAnswers
                });

                if (calculatedScore >= 32) {
                    await NotificationService.sendNotification({
                        userId: user.uid,
                        title: 'Félicitations ! 🎉',
                        message: `Vous avez réussi l'examen blanc avec un score de ${calculatedScore}/${questions.length}. Continuez ainsi !`,
                        type: 'success',
                        link: '/profile'
                    });
                }
            } catch (error) {
                console.error("Error saving exam result:", error);
            }
        }
    }, [user, questions, answers, userProfile, timeLeft, isFinished]);

    const handleAnswerSelect = useCallback((choiceIndex: number) => {
        if (isFinished) return;
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: choiceIndex }));
    }, [currentQuestionIndex, isFinished]);

    const goToNext = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setDirection(1);
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishExam();
        }
    }, [currentQuestionIndex, questions.length, finishExam]);

    const goToPrev = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setDirection(-1);
            setCurrentQuestionIndex(prev => prev - 1);
        }
    }, [currentQuestionIndex]);

    // 5. Secondary Effects

    // Timer
    useEffect(() => {
        if (loading || !user || isFinished || isLoadingData || questions.length === 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isFinished, loading, user, isLoadingData, questions.length, finishExam]);

    // Accessibility Focus
    useEffect(() => {
        if (!loading && !isLoadingData && !isFinished && questions.length > 0 && questionHeaderRef.current) {
            questionHeaderRef.current.focus();
        }
    }, [currentQuestionIndex, loading, isLoadingData, isFinished, questions.length]);

    useEffect(() => {
        if (isFinished && resultRef.current) {
            resultRef.current.focus();
        }
    }, [isFinished]);

    // Keyboard Navigation
    useEffect(() => {
        if (isFinished || isLoadingData || loading || !currentQuestion) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['a', 'b', 'c', 'd'].includes(key)) {
                const index = key.charCodeAt(0) - 97;
                if (currentQuestion.choices[index] !== undefined) handleAnswerSelect(index);
            } else if (['1', '2', '3', '4'].includes(key)) {
                const index = parseInt(key) - 1;
                if (currentQuestion.choices[index] !== undefined) handleAnswerSelect(index);
            }
            if (e.key === 'ArrowRight' || (e.key === 'Enter' && answers[currentQuestionIndex] !== undefined)) {
                goToNext();
            } else if (e.key === 'ArrowLeft') {
                goToPrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentQuestionIndex, answers, isFinished, isLoadingData, loading, currentQuestion, handleAnswerSelect, goToNext, goToPrev]);

    // Load Data
    useEffect(() => {
        const loadExam = async () => {
            setIsLoadingData(true);
            try {
                const track = userProfile?.track || 'csp';
                
                // Récupération de la mémoire anti-répétition (limite à 200 pour reset)
                let seenIds: string[] = [];
                try {
                    seenIds = JSON.parse(localStorage.getItem('qcm_seen_ids') || '[]');
                } catch(e) {}

                const fetched = await QuestionService.getExamQuestions(40, track, seenIds);
                setQuestions(fetched);

                if (fetched.length > 0) {
                     // Sauvegarde de l'historique local "Zéro Doublon"
                     const newSeenIds = [...new Set([...seenIds, ...fetched.map(q => q.id)])];
                     if (newSeenIds.length > 200) newSeenIds.splice(0, newSeenIds.length - 200); // Nettoyage FIFO
                     localStorage.setItem('qcm_seen_ids', JSON.stringify(newSeenIds));
                }
            } catch (error) {
                console.error("Error loading exam:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        if (user) loadExam();
    }, [user, userProfile]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading || isLoadingData) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4 bg-slate-50" role="status" aria-busy="true" aria-live="polite">
                <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-slate-200 border-t-[var(--color-primary)] animate-spin" aria-hidden="true" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-slate-300" aria-hidden="true" />
                    </div>
                </div>
                <p className="text-slate-600 font-semibold animate-pulse">Installation de votre grille d'examen... Prenez une grande inspiration ! 🧘‍♂️</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <main className="container mx-auto px-4 py-20 max-w-2xl text-center" aria-label="Examen non disponible">
                <Card className="glass-card border-none overflow-hidden">
                    <div className="h-2 bg-amber-500" aria-hidden="true" />
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
                            <AlertCircle className="h-8 w-8 text-amber-500" aria-hidden="true" />
                            Session non disponible
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-slate-600">
                            Oups, petit souci réseau. Nos serveurs n'ont pas pu préparer votre grille d'examen. Vérifiez votre connexion et on réessaie !
                        </p>
                    </CardContent>
                    <CardFooter className="justify-center py-8">
                        <Button onClick={() => router.push('/dashboard')} size="lg" className="rounded-full px-8">Retour au tableau de bord</Button>
                    </CardFooter>
                </Card>
            </main>
        );
    }

    if (isFinished) {
        const score = questions.reduce((acc, q, index) => acc + (answers[index] === q.correct_index ? 1 : 0), 0);
        const isSuccess = score >= 32;

        return (
            <main className="container mx-auto px-4 py-12 max-w-3xl" ref={resultRef} tabIndex={-1} aria-label={`Résultats de l'examen : ${score} sur ${questions.length}, ${isSuccess ? 'Admis' : 'Ajourné'}`}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="glass-card border-none overflow-hidden shadow-2xl !bg-white/90">
                        <div className={`h-3 ${isSuccess ? 'bg-green-500' : 'bg-red-500'} shadow-lg`} aria-hidden="true" />
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Résultats Finaux</CardTitle>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Examen Blanc Officiel</p>
                        </CardHeader>
                        <CardContent className="space-y-10 pt-6">
                            <div className="flex flex-col items-center">
                                <div className={`relative h-56 w-56 rounded-full flex flex-col items-center justify-center shadow-3d-lg mb-6 transform transition-transform hover:scale-105 ${isSuccess ? 'bg-green-50 text-green-600 border-4 border-green-500/20' : 'bg-red-50 text-red-600 border-4 border-red-500/20'}`} role="img" aria-label={`Score : ${score} sur ${questions.length}`}>
                                    <span className="text-6xl font-black" aria-hidden="true">{score}</span>
                                    <span className="text-xl font-bold opacity-60" aria-hidden="true">/ {questions.length}</span>
                                    {isSuccess && (
                                        <motion.div 
                                            initial={{ scale: 0, rotate: -20 }} 
                                            animate={{ scale: 1, rotate: 0 }} 
                                            className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-2xl shadow-3d-lg"
                                        >
                                            <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
                                        </motion.div>
                                    )}
                                </div>
                                <div className={`px-10 py-3 rounded-2xl text-2xl font-black tracking-[0.2em] shadow-sm ${isSuccess ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200'}`} role="status">
                                    {isSuccess ? 'ADMIS' : 'AJOURNÉ'}
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Button 
                                    onClick={() => setShowReview(true)} 
                                    variant="outline" 
                                    className="h-12 px-8 rounded-2xl border-2 border-slate-100 font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                                >
                                    <Eye className="h-5 w-5" />
                                    Revoir mes réponses
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-6" role="list" aria-label="Détails des résultats">
                                <div className="premium-card-3d bg-slate-50 p-6 text-center" role="listitem">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Précision</div>
                                    <div className="text-3xl font-black text-slate-800">{Math.round((score / questions.length) * 100)}%</div>
                                </div>
                                <div className="premium-card-3d bg-slate-50 p-6 text-center" role="listitem">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Temps Utilisé</div>
                                    <div className="text-3xl font-black text-slate-800" aria-label={`${Math.floor((45 * 60 - timeLeft) / 60)} minutes utilisés`}>{formatTime(45 * 60 - timeLeft)}</div>
                                </div>
                            </div>

                            {!isSuccess && (
                                <div className="bg-red-50 p-6 rounded-2xl flex gap-4 items-start border border-red-100" role="alert">
                                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" aria-hidden="true" />
                                    <div>
                                        <p className="text-red-900 font-bold mb-1">Encore un petit effort !</p>
                                        <p className="text-red-700 text-sm">Il vous manque {(32 - score)} point(s) pour valider cet examen blanc. Ne vous découragez pas !</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row gap-4 p-10 bg-slate-50/50">
                            <Button variant="outline" className="w-full h-14 rounded-2xl font-bold text-lg" onClick={() => window.location.reload()} aria-label="Recommencer un nouvel examen">
                                Recommencer l&apos;Examen
                            </Button>
                            <Button onClick={() => router.push('/dashboard')} className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg" aria-label="Retour au tableau de bord">
                                Tableau de Bord
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </main>
        );
    }

    if (showReview) {
        return (
            <main className="container mx-auto px-4 py-12 max-w-4xl" aria-label="Révision des réponses">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Révision de l&apos;Examen</h1>
                        <p className="text-slate-500 font-medium">Analysez vos erreurs pour mieux progresser.</p>
                    </div>
                    <Button 
                        onClick={() => setShowReview(false)} 
                        variant="ghost" 
                        className="rounded-2xl font-bold h-12 px-6"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" /> Retour au score
                    </Button>
                </header>

                <div className="space-y-8">
                    {questions.map((q, idx) => {
                        const isCorrect = answers[idx] === q.correct_index;
                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                key={q.id} 
                                className={`premium-card-3d bg-white p-8 rounded-[2.5rem] border-l-8 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {idx + 1} — {q.theme.replace('_', ' ')}</span>
                                    {isCorrect ? (
                                        <span className="flex items-center gap-2 text-green-600 font-black text-sm uppercase">
                                            <CheckCircle2 className="h-5 w-5" /> Correct
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 text-red-600 font-black text-sm uppercase">
                                            <AlertCircle className="h-5 w-5" /> Incorrect
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-8 leading-tight">
                                    <PedagogicalText text={q.question} />
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <div className={`p-5 rounded-2xl border-2 ${isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Votre réponse</div>
                                        <div className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                            {answers[idx] !== undefined ? <PedagogicalText text={q.choices[answers[idx]]} /> : 'Aucune réponse'}
                                        </div>
                                    </div>
                                    {!isCorrect && (
                                        <div className="p-5 rounded-2xl border-2 border-green-100 bg-green-50/30">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Réponse correcte</div>
                                            <div className="font-bold text-green-700"><PedagogicalText text={q.choices[q.correct_index]} /></div>
                                        </div>
                                    )}
                                </div>

                                {q.explanation && (
                                    <div className="premium-card-3d bg-slate-900 text-white p-10 rounded-[2rem] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/20 rounded-full -mr-24 -mt-24 blur-[80px] animate-pulse" aria-hidden="true" />
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/20 rounded-full -ml-24 -mb-24 blur-[80px] animate-pulse delay-700" aria-hidden="true" />
                                        
                                        <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                                            <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl flex-shrink-0 border border-white/10 shadow-3d-sm group-hover:rotate-12 transition-transform duration-700" aria-hidden="true">
                                                <Lightbulb className="h-10 w-10 text-amber-300" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight flex items-center gap-3">
                                                    Le saviez-vous ?
                                                    <div className="h-1.5 w-16 bg-gradient-to-r from-amber-400 to-blue-500 rounded-full" />
                                                </h3>
                                                <p className="text-slate-300 leading-relaxed text-xl font-medium antialiased">
                                                    {q.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-16 text-center">
                    <Button 
                        size="lg" 
                        onClick={() => {
                            setShowReview(false);
                            window.scrollTo(0, 0);
                        }}
                        className="rounded-[2rem] h-16 px-12 font-black text-lg bg-primary hover:bg-blue-800 shadow-3d-md"
                    >
                        Retour aux résultats
                    </Button>
                </div>
            </main>
        );
    }

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (dir: number) => ({
            zIndex: 0,
            x: dir < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-20" aria-label="Examen blanc en cours">
            {/* Live region for timer alerts */}
            <div className="sr-only" aria-live="assertive" aria-atomic="true" id="exam-timer-alert" />
            {/* Senior Mesh Header */}
            <div className="h-64 relative overflow-hidden bg-slate-900" aria-hidden="false">
                <div className="absolute inset-0 opacity-40" aria-hidden="true">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
                    <div className="absolute top-1/2 -right-20 w-96 h-96 bg-red-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000" />
                </div>
                <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-3 border border-blue-500/30">
                                Mode Examen Blanc
                            </span>
                            <h1 className="text-4xl font-black text-white" aria-live="polite" aria-atomic="true">Question {currentQuestionIndex + 1} <span className="text-slate-500 text-2xl font-normal">/ {questions.length}</span></h1>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-white mb-2 shadow-2xl" role="timer" aria-label={`Temps restant : ${Math.floor(timeLeft / 60)} minutes et ${timeLeft % 60} secondes`} aria-live={timeLeft < 300 ? 'assertive' : 'off'}>
                                <Clock className={`h-6 w-6 ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`} aria-hidden="true" />
                                <span className={`text-3xl font-black font-mono leading-none ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>{formatTime(timeLeft)}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mr-2" aria-hidden="true">Temps Restant</p>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5" role="progressbar" aria-valuenow={currentQuestionIndex + 1} aria-valuemin={1} aria-valuemax={questions.length} aria-label={`Progression : question ${currentQuestionIndex + 1} sur ${questions.length}`}>
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 via-white to-red-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-20">
                <Card className="premium-card-3d border-none bg-white p-6 md:p-10 min-h-[550px] flex flex-col justify-between overflow-visible">
                    <div className="absolute top-0 right-10 w-20 h-1 bg-primary rounded-b-full shadow-sm" aria-hidden="true" />
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        {currentQuestion && (
                            <motion.div
                                key={currentQuestionIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="flex-grow flex-col"
                            >
                                <div className="mb-10">
                                    <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-sm uppercase tracking-widest mb-6" aria-hidden="true">
                                        <div className="w-8 h-0.5 bg-[var(--color-primary)] rounded-full" />
                                        {currentQuestion.theme.replace('_', ' ')}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight outline-none" tabIndex={-1} ref={questionHeaderRef} id="exam-question">
                                        <span className="sr-only">Thème : {currentQuestion.theme.replace('_', ' ')}. </span>
                                        <PedagogicalText text={currentQuestion.question} />
                                    </h2>
                                </div>

                                <div className="space-y-4 mb-10" role="radiogroup" aria-labelledby="exam-question">
                                    {currentQuestion.choices.map((choice, index) => {
                                        const isSelected = answers[currentQuestionIndex] === index;
                                        return (
                                            <motion.button
                                                key={index}
                                                whileHover={{ y: -4, scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAnswerSelect(index)}
                                                role="radio"
                                                aria-checked={isSelected}
                                                aria-label={`Réponse ${String.fromCharCode(65 + index)} : ${choice}`}
                                                className={`w-full group flex items-center p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden ${isSelected
                                                    ? 'border-primary bg-blue-50/50 shadow-3d-md z-10'
                                                    : 'border-slate-50 bg-white/50 hover:border-slate-200 hover:bg-white hover:shadow-3d-sm'
                                                    }`}
                                            >
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black mr-6 transition-all duration-300 ${isSelected ? 'bg-primary text-white shadow-3d-sm rotate-6' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-primary border border-slate-100 shadow-sm'}`} aria-hidden="true">
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className={`text-lg md:text-xl transition-colors w-full text-left ${isSelected ? 'font-black text-slate-900' : 'font-bold text-slate-600 group-hover:text-slate-900 font-medium'}`}>
                                                    <PedagogicalText text={choice} />
                                                </span>
                                                {isSelected && <div className="absolute left-0 w-2 h-full bg-primary" aria-hidden="true" />}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <CardFooter className="flex justify-between items-center px-0 pt-8 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            size="lg"
                            className="rounded-2xl font-bold gap-2 text-slate-500"
                            onClick={goToPrev}
                            disabled={currentQuestionIndex === 0}
                            aria-label={`Question précédente${currentQuestionIndex === 0 ? ' (désactivé)' : ''}`}
                        >
                            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                            Précédent
                        </Button>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="rounded-2xl font-bold px-6 border-slate-200 hidden sm:flex"
                                onClick={finishExam}
                                aria-label="Terminer l'examen et voir les résultats"
                            >
                                Terminer
                            </Button>
                            <Button
                                size="lg"
                                className={`rounded-2xl font-black px-10 shadow-lg gap-2 ${currentQuestionIndex === questions.length - 1 ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                onClick={goToNext}
                                disabled={answers[currentQuestionIndex] === undefined}
                                aria-label={currentQuestionIndex === questions.length - 1 ? 'Valider l\'examen et voir les résultats' : `Passer à la question ${currentQuestionIndex + 2}`}
                            >
                                {currentQuestionIndex === questions.length - 1 ? 'Valider l\'Examen' : 'Suivant'}
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* Question Map - Compact Senior Style */}
                <div className="mt-12" role="navigation" aria-label="Navigation rapide entre les questions">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest" id="question-map-heading">Navigation Rapide</h3>
                        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest" aria-hidden="true">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Répondue</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-200" /> En attente</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-20 gap-2" role="list" aria-labelledby="question-map-heading">
                        {questions.map((_, idx) => {
                            const isAnswered = answers[idx] !== undefined;
                            const isCurrent = currentQuestionIndex === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setDirection(idx > currentQuestionIndex ? 1 : -1);
                                        setCurrentQuestionIndex(idx);
                                    }}
                                    aria-label={`Question ${idx + 1}${isAnswered ? ', répondue' : ', en attente'}${isCurrent ? ', actuelle' : ''}`}
                                    aria-current={isCurrent ? 'step' : undefined}
                                    className={`aspect-square sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${isCurrent
                                        ? 'bg-[var(--color-primary)] text-white shadow-lg scale-110 z-10'
                                        : isAnswered
                                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                            : 'bg-white border border-slate-200 text-slate-300 hover:border-slate-400 hover:text-slate-600 shadow-sm'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}
