'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Question, QuestionService } from '@/services/question.service';
import { UserService } from '@/services/user.service';
import { NotificationService } from '@/services/notification.service';
import { motion, AnimatePresence } from 'framer-motion';
import { PedagogicalText } from '@/components/features/PedagogicalText';

export default function ExamSession() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(45 * 60);
    const [isFinished, setIsFinished] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const loadExam = async () => {
            setIsLoadingData(true);
            try {
                // Fetch Exactly 40 questions with the improved randomization
                const track = userProfile?.track === 'naturalisation' ? 'naturalisation' : 'titre_sejour';
                const fetched = await QuestionService.getExamQuestions(40, track);
                setQuestions(fetched);
            } catch (error) {
                console.error("Error loading exam:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user) {
            loadExam();
        }
    }, [user]);

    const finishExam = useCallback(async () => {
        if (isFinished) return;
        setIsFinished(true);
        if (user) {
            try {
                const calculatedScore = questions.reduce((acc, q, index) => {
                    return acc + (answers[index] === q.correct_index ? 1 : 0);
                }, 0);

                const attemptAnswers = questions.map((q, index) => ({
                    question_id: q.id,
                    choice_index: answers[index] ?? -1,
                    correct: answers[index] === q.correct_index
                }));

                await UserService.saveAttempt({
                    user_id: user.uid,
                    exam_type: userProfile?.track === 'naturalisation' ? 'naturalisation' : 'titre_sejour',
                    score: calculatedScore,
                    total_questions: questions.length,
                    time_spent: 45 * 60 - timeLeft,
                    answers: attemptAnswers
                });

                // Send notification on success (32/40)
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
                console.error('Failed to save exam attempt:', error);
            }
        }
    }, [user, questions, answers, userProfile, timeLeft, isFinished]);

    useEffect(() => {
        if (loading || !user || isFinished || isLoadingData) return;

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
    }, [isFinished, loading, user, isLoadingData, finishExam]);

    const questionHeaderRef = useRef<HTMLHeadingElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && !isLoadingData && !isFinished && questionHeaderRef.current) {
            questionHeaderRef.current.focus();
        }
    }, [currentQuestionIndex, loading, isLoadingData, isFinished]);

    const handleAnswerSelect = useCallback((choiceIndex: number) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: choiceIndex }));
    }, [currentQuestionIndex]);

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
                <p className="text-slate-600 font-semibold animate-pulse">Préparation de votre session d&apos;examen...</p>
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
                            Nous n&apos;avons pas pu générer votre session. Vérifiez votre connexion ou réessayez dans quelques instants.
                        </p>
                    </CardContent>
                    <CardFooter className="justify-center py-8">
                        <Link href="/dashboard">
                            <Button size="lg" className="rounded-full px-8">Retour au tableau de bord</Button>
                        </Link>
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
                    <Card className="glass-card border-none overflow-hidden shadow-2xl">
                        <div className={`h-3 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true" />
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-4xl font-black text-slate-900 mb-2">Résultats Finaux</CardTitle>
                            <p className="text-slate-500 font-medium">Examen Blanc Officiel</p>
                        </CardHeader>
                        <CardContent className="space-y-10 pt-6">
                            <div className="flex flex-col items-center">
                                <div className={`relative h-48 w-48 rounded-full flex flex-col items-center justify-center shadow-xl mb-6 ${isSuccess ? 'bg-green-50 text-green-600 border-4 border-green-500/20' : 'bg-red-50 text-red-600 border-4 border-red-500/20'}`} role="img" aria-label={`Score : ${score} sur ${questions.length}`}>
                                    <span className="text-5xl font-black" aria-hidden="true">{score}</span>
                                    <span className="text-xl font-bold opacity-60" aria-hidden="true">/ {questions.length}</span>
                                    {isSuccess && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg"><CheckCircle2 className="h-10 w-10" aria-hidden="true" /></motion.div>}
                                </div>
                                <div className={`px-8 py-2 rounded-full text-xl font-black tracking-widest ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="status">
                                    {isSuccess ? 'ADMIS' : 'AJOURNÉ'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4" role="list" aria-label="Détails des résultats">
                                <div className="bg-slate-50 p-6 rounded-2xl text-center" role="listitem">
                                    <div className="text-sm font-semibold text-slate-400 uppercase mb-1">Précision</div>
                                    <div className="text-3xl font-black text-slate-800">{Math.round((score / questions.length) * 100)}%</div>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl text-center" role="listitem">
                                    <div className="text-sm font-semibold text-slate-400 uppercase mb-1">Temps Restant</div>
                                    <div className="text-3xl font-black text-slate-800" aria-label={`${Math.floor(timeLeft / 60)} minutes et ${timeLeft % 60} secondes restantes`}>{formatTime(timeLeft)}</div>
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
                            <Link href="/dashboard" className="w-full">
                                <Button className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg" aria-label="Retour au tableau de bord">
                                    Tableau de Bord
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </motion.div>
            </main>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

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

            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <Card className="glass-card border-none shadow-2xl p-4 md:p-8 min-h-[500px] flex flex-col justify-between">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
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
                            className="flex-grow flex flex-col"
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
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => handleAnswerSelect(index)}
                                            role="radio"
                                            aria-checked={isSelected}
                                            aria-label={`Réponse ${String.fromCharCode(65 + index)} : ${choice}`}
                                            className={`w-full group flex items-center p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden ${isSelected
                                                ? 'border-[var(--color-primary)] bg-blue-50/50 shadow-md'
                                                : 'border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black mr-6 transition-colors ${isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 border border-slate-200 shadow-sm'}`} aria-hidden="true">
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className={`text-lg transition-colors w-full text-left ${isSelected ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                                <PedagogicalText text={choice} />
                                            </span>
                                            {isSelected && <motion.div layoutId="selection-glow" className="absolute left-0 w-1.5 h-full bg-[var(--color-primary)]" aria-hidden="true" />}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
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
