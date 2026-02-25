'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RotateCcw, Home, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Question, QuestionService } from '@/services/question.service';
import { UserService } from '@/services/user.service';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export default function ReviewSession() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { playSound } = useSoundEffects();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const loadReviewQuestions = async () => {
            if (!user) return;
            setIsLoadingData(true);
            try {
                const incorrectIds = await UserService.getIncorrectQuestionIds(user.uid);

                if (incorrectIds.length === 0) {
                    setQuestions([]);
                    setIsLoadingData(false);
                    return;
                }

                const fetchedQuestions = await QuestionService.getQuestionsByIds(incorrectIds);
                setQuestions(fetchedQuestions.sort(() => Math.random() - 0.5).slice(0, 20));
            } catch (error) {
                console.error('Failed to load review questions', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user) {
            loadReviewQuestions();
        }
    }, [user]);

    // --- ALL REFS AND THEIR EFFECTS MUST BE BEFORE CONDITIONAL RETURNS ---
    const questionHeaderRef = useRef<HTMLHeadingElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && !isLoadingData && !isFinished && questionHeaderRef.current) {
            questionHeaderRef.current.focus();
        } else if (isFinished && resultRef.current) {
            resultRef.current.focus();
        }
    }, [currentQuestionIndex, loading, isLoadingData, isFinished]);



    const triggerConfetti = useCallback(() => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
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

        if (isCorrect) {
            setScore(s => s + 1);
            triggerConfetti();
            playSound('success');
        } else {
            playSound('error');
        }
    }, [selectedAnswer, questions, currentQuestionIndex, triggerConfetti, playSound]);

    const handleNext = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setStatus('idle');
        } else {
            setIsFinished(true);
            if (score > questions.length / 2) {
                playSound('finish');
            }
        }
    }, [currentQuestionIndex, questions, score, playSound]);

    const handleRetry = () => {
        window.location.reload();
    };

    // Keyboard navigation - MUST be before any conditional returns
    useEffect(() => {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isAnswered || isFinished) return;

            if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
                const index = e.key.toLowerCase().charCodeAt(0) - 97;
                if (index < currentQuestion.choices.length) {
                    handleAnswerSelect(index);
                }
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
                <p className="text-gray-500 font-medium">Analyse de vos erreurs...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center max-w-lg">
                <Card>
                    <CardContent className="pt-10 pb-10 flex flex-col items-center gap-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <h2 className="text-2xl font-bold">Tout est parfait !</h2>
                        <p className="text-gray-600">Vous n&apos;avez aucune erreur à réviser pour le moment.</p>
                        <Link href="/dashboard">
                            <Button className="mt-4" size="lg">Retour au tableau de bord</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- CONDITIONAL RETURNS AFTER ALL HOOKS ---
    const currentQuestion = questions[currentQuestionIndex];


    if (isFinished) {
        return (
            <main className="container mx-auto px-4 py-12 max-w-2xl animate-in fade-in duration-500" ref={resultRef} tabIndex={-1} aria-labelledby="review-result-title">
                <Card className="text-center overflow-hidden border-t-8 border-t-purple-500">
                    <CardHeader>
                        <CardTitle id="review-result-title" className="text-3xl font-bold mb-4">Révision Terminée</CardTitle>
                        <div className="mx-auto p-6 rounded-full w-40 h-40 flex flex-col items-center justify-center border-8 border-purple-200 bg-purple-50 text-purple-700" aria-label={`Score : ${score} sur ${questions.length}`}>
                            <span className="text-4xl font-bold" aria-hidden="true">{score}/{questions.length}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            Vous avez corrigé {score} erreurs sur {questions.length} questions revues.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 bg-gray-50 p-8">
                        <Button onClick={handleRetry} variant="outline" size="lg">
                            <RotateCcw className="mr-2 h-5 w-5" aria-hidden="true" /> Continuer à réviser
                        </Button>
                        <Link href="/dashboard">
                            <Button size="lg">
                                <Home className="mr-2 h-5 w-5" aria-hidden="true" /> Tableau de bord
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 py-6 max-w-3xl min-h-screen flex flex-col">
            {/* Top Bar for Review Mode */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-purple-600 font-bold bg-purple-50 px-4 py-2 rounded-full" role="status">
                    <AlertCircle className="h-5 w-5" aria-hidden="true" />
                    Mode Révision
                </div>
                <Link href="/dashboard" aria-label="Quitter le mode révision">
                    <XCircle className="text-gray-400 hover:text-gray-600 h-8 w-8 transition-colors" aria-hidden="true" />
                </Link>
            </header>

            {/* Question Card */}
            <div className="flex-1 flex flex-col justify-center pb-24">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h1
                            className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-snug outline-none"
                            tabIndex={-1}
                            ref={questionHeaderRef}
                        >
                            {currentQuestion.question}
                        </h1>

                        <div className="grid gap-4" role="radiogroup" aria-label="Choix de réponse">
                            {currentQuestion.choices.map((choice, index) => {
                                const isSelected = selectedAnswer === index;
                                const isCorrectChoice = index === currentQuestion.correct_index;

                                let variantClass = "border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300";
                                let ariaLabel = choice;

                                if (isAnswered) {
                                    if (isCorrectChoice) {
                                        variantClass = "border-green-500 bg-green-50 text-green-800";
                                        ariaLabel += " (Bonne réponse)";
                                    } else if (isSelected && !isCorrectChoice) {
                                        variantClass = "border-red-500 bg-red-50 text-red-800";
                                        ariaLabel += " (Votre réponse, incorrecte)";
                                    } else {
                                        variantClass = "border-gray-100 opacity-50";
                                    }
                                } else if (isSelected) {
                                    variantClass = "border-purple-500 bg-purple-50 text-purple-900 border-b-4";
                                    ariaLabel += " (Sélectionné)";
                                } else {
                                    variantClass = "border-gray-200 border-b-4 active:border-b-2 active:translate-y-[2px]";
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerSelect(index)}
                                        disabled={isAnswered}
                                        role="radio"
                                        aria-checked={isSelected}
                                        aria-label={ariaLabel}
                                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-4 text-lg font-medium ${variantClass}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border-2 flex-shrink-0 
                                            ${isAnswered && isCorrectChoice ? 'border-green-600 text-green-600 bg-white' :
                                                isAnswered && isSelected ? 'border-red-600 text-red-600 bg-white' :
                                                    isSelected ? 'border-purple-500 text-purple-500 bg-white' :
                                                        'border-gray-300 text-gray-400'}`} aria-hidden="true">
                                            {String.fromCharCode(65 + index)}
                                        </div>
                                        {choice}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Verification Bar */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 border-t-2 transition-colors duration-300 ${status === 'correct' ? 'bg-green-100 border-green-200' :
                status === 'wrong' ? 'bg-red-100 border-red-200' : 'bg-white border-gray-200'
                }`} role="status" aria-live="polite">
                <div className="container mx-auto max-w-3xl flex justify-between items-center">
                    {status === 'idle' ? (
                        <div className="ml-auto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto px-8 text-lg font-bold tracking-wide uppercase bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={handleValidate}
                                disabled={selectedAnswer === null}
                                aria-label="Vérifier la réponse"
                            >
                                Vérifier
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full justify-between items-center animate-in slide-in-from-bottom-5">
                            <div className="flex gap-4 items-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-sm ${status === 'correct' ? 'text-green-500' : 'text-red-500'
                                    }`} aria-hidden="true">
                                    {status === 'correct' ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${status === 'correct' ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                        {status === 'correct' ? 'Bien joué !' : 'Encore raté...'}
                                    </h3>
                                    {status === 'wrong' && (
                                        <p className="text-red-700 hidden sm:block">
                                            La bonne réponse était : <span className="font-bold">{currentQuestion.choices[currentQuestion.correct_index]}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                size="lg"
                                variant={status === 'correct' ? 'default' : 'destructive'}
                                className={`px-8 text-lg font-bold tracking-wide uppercase ${status === "correct" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                                onClick={handleNext}
                                autoFocus
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Suivant' : 'Résultat'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
