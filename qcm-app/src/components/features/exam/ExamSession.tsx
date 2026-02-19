'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Question, QuestionService } from '@/services/question.service';
import { UserService } from '@/services/user.service';
import { Loader2 } from 'lucide-react';

import { useSoundEffects } from '@/hooks/useSoundEffects';

export default function ExamSession() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    // const { playSound } = useSoundEffects();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({}); // Index -> ChoiceIndex
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
    const [isFinished, setIsFinished] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const loadExam = async () => {
            setIsLoadingData(true);
            const fetched = await QuestionService.getExamQuestions(40);
            setQuestions(fetched);
            setIsLoadingData(false);
        };

        if (user) {
            loadExam();
        }
    }, [user]);

    const finishExam = useCallback(async () => {
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
            } catch (error) {
                console.error('Failed to save exam attempt:', error);
            }
        }
    }, [user, questions, answers, userProfile, timeLeft]);

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

    // --- ALL REFS AND THEIR EFFECTS MUST BE BEFORE CONDITIONAL RETURNS ---
    const questionHeaderRef = useRef<HTMLHeadingElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    // Initial focus on question when changed
    useEffect(() => {
        if (!loading && !isLoadingData && !isFinished && questionHeaderRef.current) {
            questionHeaderRef.current.focus();
        }
    }, [currentQuestionIndex, loading, isLoadingData, isFinished]);

    // Focus on result when finished
    useEffect(() => {
        if (isFinished && resultRef.current) {
            resultRef.current.focus();
        }
    }, [isFinished]);



    const handleAnswerSelect = useCallback((choiceIndex: number) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: choiceIndex }));
    }, [currentQuestionIndex]);

    const calculateScore = useCallback(() => {
        return questions.reduce((acc, q, index) => {
            return acc + (answers[index] === q.correct_index ? 1 : 0);
        }, 0);
    }, [questions, answers]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (loading || isLoadingData || isFinished) return;

            // A, B, C, D to select answers
            if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
                const index = e.key.toLowerCase().charCodeAt(0) - 97;
                if (index < (questions[currentQuestionIndex]?.choices.length || 0)) {
                    handleAnswerSelect(index);
                }
            }

            // Left/Right arrows for Prev/Next
            if (e.key === 'ArrowRight') {
                if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                }
            }
            if (e.key === 'ArrowLeft') {
                if (currentQuestionIndex > 0) {
                    setCurrentQuestionIndex(prev => prev - 1);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentQuestionIndex, questions, loading, isLoadingData, isFinished, handleAnswerSelect]);


    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading || isLoadingData) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4" role="status" aria-busy="true" aria-live="polite">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" aria-hidden="true" />
                <p className="text-gray-500 font-medium">Préparation de l&apos;examen...</p>
            </div>
        );
    }

    if (isFinished) {
        const score = calculateScore();
        const percentage = Math.round((score / questions.length) * 100);
        const isSuccess = percentage >= 80;

        return (
            <main className="container mx-auto px-4 py-12 max-w-2xl text-center" ref={resultRef} tabIndex={-1} aria-labelledby="result-title">
                <Card className={isSuccess ? "border-green-500 border-t-8" : "border-red-500 border-t-8"}>
                    <CardHeader>
                        <CardTitle id="result-title" className="text-3xl font-bold">Résultat de l&apos;Examen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className={`mx-auto p-6 rounded-full w-40 h-40 flex flex-col items-center justify-center border-8 ${isSuccess ? 'border-green-500 bg-green-50 text-green-600' : 'border-red-500 bg-red-50 text-red-600'}`} aria-label={`Score: ${score} sur ${questions.length}. ${isSuccess ? 'Admis' : 'Ajourné'}`}>
                            <span className="text-4xl font-bold" aria-hidden="true">{score}/{questions.length}</span>
                            <span className="text-lg font-bold mt-2" aria-hidden="true">{isSuccess ? 'ADMIS' : 'AJOURNÉ'}</span>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 mb-2">Temps restant : {formatTime(timeLeft)}</p>
                            <p className="text-sm text-gray-500">Pour réussir, vous devez obtenir au moins 32/40 (80%).</p>
                        </div>

                        {!isSuccess && (
                            <div className="bg-red-50 p-4 rounded-lg text-left text-sm text-red-800 flex gap-3" role="alert">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                                <p>
                                    Continuez à vous entraîner ! Révisez les thèmes où vous avez commis des erreurs.
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="justify-center gap-4">
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Retenter un examen
                        </Button>
                        <Link href="/dashboard">
                            <Button size="lg">Retour au tableau de bord</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </main>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <main className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
            {/* Header bar */}
            <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 gap-4 sticky top-20 z-40">
                <div role="status" aria-label={`Question ${currentQuestionIndex + 1} sur ${questions.length}`}>
                    <span className="text-sm text-gray-500 uppercase font-semibold block" aria-hidden="true">Question</span>
                    <div className="text-2xl font-bold" aria-hidden="true">{currentQuestionIndex + 1} <span className="text-gray-400 text-lg">/ {questions.length}</span></div>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md" role="timer" aria-label={`Temps restant: ${Math.floor(timeLeft / 60)} minutes et ${timeLeft % 60} secondes`}>
                    <Clock className={`h-5 w-5 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`} aria-hidden="true" />
                    <span className={`text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-gray-900'}`} aria-hidden="true">{formatTime(timeLeft)}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={finishExam} className="w-full sm:w-auto" aria-label="Terminer et valider l'examen maintenant">Terminer maintenant</Button>
            </header>

            <Card>
                <CardContent className="pt-8 pb-8">
                    <h2
                        className="text-xl md:text-2xl font-semibold mb-8 leading-relaxed outline-none"
                        tabIndex={-1}
                        ref={questionHeaderRef}
                    >
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-3" role="radiogroup" aria-label="Choix de réponse">
                        {currentQuestion.choices.map((choice, index) => {
                            const isSelected = answers[currentQuestionIndex] === index;
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    role="radio"
                                    aria-checked={isSelected}
                                    className={`w-full flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all text-left ${isSelected
                                        ? 'border-[var(--color-primary)] bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white' : 'border-gray-300 text-gray-400'
                                        }`} aria-hidden="true">
                                        {isSelected ? <div className="w-2.5 h-2.5 bg-white rounded-full" /> : <span className="text-sm font-bold">{String.fromCharCode(65 + index)}</span>}
                                    </div>
                                    <span className={`text-lg ${isSelected ? 'font-medium text-[var(--color-primary)]' : 'text-gray-700'}`}>
                                        {choice}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6 bg-gray-50">
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        aria-label="Question précédente"
                    >
                        Précédent
                    </Button>

                    <div className="flex gap-2">
                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                aria-label="Question suivante"
                            >
                                Suivant
                            </Button>
                        ) : (
                            <Button onClick={finishExam} className="bg-green-600 hover:bg-green-700 text-white" aria-label="Valider l'examen">
                                Valider l&apos;examen
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>

            {/* Navigation Map */}
            <nav className="mt-8 mb-12" aria-label="Navigation des questions">
                <h3 className="text-sm font-semibold text-gray-500 mb-3" id="nav-map-heading">Navigation rapide</h3>
                <div role="list" className="flex flex-wrap gap-2" aria-labelledby="nav-map-heading">
                    {questions.map((_, idx) => {
                        const isAnswered = answers[idx] !== undefined;
                        const isCurrent = currentQuestionIndex === idx;
                        let label = `Question ${idx + 1}`;
                        if (isCurrent) label += " (Actuelle)";
                        else if (isAnswered) label += " (Répondue)";
                        else label += " (Non répondue)";

                        return (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestionIndex(idx)}
                                aria-label={label}
                                aria-current={isCurrent ? 'step' : undefined}
                                className={`w-8 h-8 text-xs font-medium rounded flex items-center justify-center transition-colors ${isCurrent
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : isAnswered
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        )
                    })}
                </div>
            </nav>
        </main>
    );
}
