'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Home, Volume2, VolumeX, Loader2 } from 'lucide-react';
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
    const [answers, setAnswers] = useState<Record<number, number>>({}); // Store all answers
    const [isAnswered, setIsAnswered] = useState(false); // Validated
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const { playSound } = useSoundEffects();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Fetch Questions
    useEffect(() => {
        const loadQuestions = async () => {
            if (!themeId) return;
            setIsLoadingData(true);
            const fetched = await QuestionService.getQuestionsByTheme(themeId, 20); // Fetch 20 random questions
            setQuestions(fetched);
            setIsLoadingData(false);
        };

        if (user) {
            loadQuestions();
        }
    }, [themeId, user]);

    // Audio Logic (Simplified for brevity, ensuring robustness)
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


    if (loading || isLoadingData) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />
                <p className="text-gray-500 font-medium">Préparation de votre séance...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <Card>
                    <CardContent className="pt-6">
                        <p>Aucune question trouvée pour ce thème.</p>
                        <Link href="/dashboard">
                            <Button className="mt-4">Retour</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    const handleAnswerSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
    };

    const handleValidate = () => {
        if (selectedAnswer === null) return;

        const isCorrect = selectedAnswer === currentQuestion.correct_index;
        setIsAnswered(true);
        setStatus(isCorrect ? 'correct' : 'wrong');

        // Store answer
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedAnswer }));

        if (isCorrect) {
            setScore(score + 1);
            triggerConfetti();
            playSound('success');
        } else {
            playSound('error');
        }
    };

    const handleFinish = async () => {
        setIsFinished(true);
        if (score > questions.length / 2) {
            triggerConfetti();
            playSound('success');
        } else {
            playSound('error');
        }

        if (user) {
            try {
                // Construct answers array
                const attemptAnswers = questions.map((q, index) => ({
                    question_id: q.id,
                    choice_index: answers[index] ?? -1,
                    correct: answers[index] === q.correct_index
                }));

                await UserService.saveAttempt({
                    user_id: user.uid,
                    exam_type: 'titre_sejour',
                    theme: themeId,
                    score: score,
                    total_questions: questions.length,
                    time_spent: 0,
                    answers: attemptAnswers
                });
                console.log("Attempt saved successfully!");
            } catch (error) {
                console.error("Failed to save attempt:", error);
            }
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setStatus('idle');
        } else {
            setIsFinished(true);
        }
    };

    // Focus management for accessibility
    const questionRef = React.useRef<HTMLHeadingElement>(null);
    const resultRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoadingData && !isFinished && questionRef.current) {
            questionRef.current.focus();
        } else if (isFinished && resultRef.current) {
            resultRef.current.focus();
        }
    }, [currentQuestionIndex, isLoadingData, isFinished]);

    // Keyboard navigation
    useEffect(() => {
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
    }, [isAnswered, isFinished, selectedAnswer, currentQuestion]);


    const handleRetry = () => {
        window.location.reload();
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd']
        });
    };

    if (isFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        const isSuccess = percentage >= 80;

        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50/50" role="main" aria-label="Résultats de la session">
                <Card className="w-full max-w-2xl border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden" tabIndex={-1} ref={resultRef}>
                    <CardHeader className="text-center pb-2 pt-8">
                        <CardTitle className="text-3xl font-bold mb-1" tabIndex={0}>
                            {isSuccess ? 'Félicitations ! 🎉' : 'Séance Terminée'}
                        </CardTitle>
                        <p className="text-muted-foreground">Voici le récapitulatif de votre session</p>
                    </CardHeader>
                    {/* ... content ... */}
                    <CardContent className="flex flex-col items-center py-8">
                        <div
                            className="sr-only"
                            role="status"
                            aria-live="polite"
                        >
                            Session terminée. Votre score est de {score} sur {questions.length}, soit {percentage}%.
                            {isSuccess ? "Excellent travail, vous avez réussi !" : "Continuez à vous entraîner."}
                        </div>

                        {/* Visual content remains similar but formatted for accessibility */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className={`relative w-48 h-48 flex flex-col items-center justify-center rounded-full border-[6px] ${isSuccess ? 'border-green-500 bg-green-50 text-green-700' : 'border-orange-500 bg-orange-50 text-orange-700'} mb-8 shadow-inner`}
                            aria-hidden="true"
                        >
                            <span className="text-5xl font-extrabold tracking-tighter">{percentage}%</span>
                            <span className="text-sm font-semibold mt-1 uppercase tracking-wide opacity-80">De réussite</span>
                            <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full shadow-md text-sm font-bold border border-gray-100">
                                {score}/{questions.length} Correctes
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-md" aria-hidden="true">
                            {/* Stats visuals */}
                            <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                                <span className="block text-2xl font-bold text-blue-700">{questions.length}</span>
                                <span className="text-xs font-semibold text-blue-600 uppercase">Questions</span>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-100">
                                <span className="block text-2xl font-bold text-purple-700">{score * 10}</span>
                                <span className="text-xs font-semibold text-purple-600 uppercase">Points XP</span>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 bg-gray-50/80 p-6 border-t">
                        <Button onClick={handleRetry} variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:bg-white" aria-label="Réessayer une nouvelle série">
                            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" /> Réessayer
                        </Button>
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full bg-[var(--color-primary)] hover:bg-blue-700 shadow-lg shadow-blue-500/20" aria-label="Retour au Tableau de bord">
                                <Home className="mr-2 h-4 w-4" aria-hidden="true" /> Retour au Tableau de bord
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/30 flex flex-col">
            {/* ProgressBar Fixed Top */}
            <div className="fixed top-[4rem] left-0 right-0 h-1 bg-gray-200 z-10" role="progressbar" aria-valuenow={Math.round(((currentQuestionIndex) / questions.length) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Progression de la séance">
                <motion.div
                    className="h-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col">
                {/* Header Info */}
                <header className="flex justify-between items-center mb-8 mt-4">
                    <div className="flex items-center gap-2">
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-[var(--color-primary)] shadow-sm border border-blue-100" aria-label={`Question ${currentQuestionIndex + 1} sur ${questions.length}`}>
                            Question {currentQuestionIndex + 1} <span className="text-gray-400 font-normal" aria-hidden="true">/ {questions.length}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="mr-2 hidden sm:block" aria-label={`Score actuel : ${score} points`}>
                            <span className="text-sm font-medium text-gray-500" aria-hidden="true">Score: </span>
                            <span className="text-sm font-bold text-[var(--color-primary)]">{score}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                            className={`rounded-full ${isAudioEnabled ? "text-[var(--color-primary)] bg-blue-50" : "text-gray-400 hover:text-gray-600"}`}
                            aria-label={isAudioEnabled ? "Désactiver la lecture audio" : "Activer la lecture audio"}
                            aria-pressed={isAudioEnabled}
                        >
                            {isAudioEnabled ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
                        </Button>
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50" aria-label="Quitter l'entraînement">
                                <XCircle className="h-5 w-5" aria-hidden="true" />
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Question Section */}
                <main className="flex-1" aria-live="polite">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="flex-1"
                        >
                            <Card className="border-none shadow-lg bg-white overflow-hidden mb-24">
                                <CardContent className="p-6 md:p-8">
                                    <h2
                                        className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-8 outline-none"
                                        tabIndex={-1}
                                        ref={questionRef}
                                    >
                                        {currentQuestion.question}
                                    </h2>

                                    <div className="space-y-3" role="radiogroup" aria-label="Choix de réponse">
                                        {currentQuestion.choices.map((choice, index) => {
                                            const isSelected = selectedAnswer === index;
                                            const isCorrectChoice = index === currentQuestion.correct_index;

                                            // Accessibility labeling logic
                                            let ariaLabel = `Option ${String.fromCharCode(65 + index)} : ${choice}.`;
                                            if (isAnswered) {
                                                if (isCorrectChoice) ariaLabel += " (Bonne réponse)";
                                                else if (isSelected) ariaLabel += " (Votre réponse, incorrecte)";
                                            } else if (isSelected) {
                                                ariaLabel += " (Sélectionné)";
                                            }

                                            // Styled logic...
                                            let styleClass = "relative p-4 rounded-xl border-2 text-left transition-all duration-200 group w-full flex items-start gap-4 hover:bg-gray-50 focus:ring-4 focus:ring-blue-200 outline-none";
                                            // ... (Logic from before maintained but simplified for brevity in prompt, reusing existing class logic)
                                            if (isAnswered) {
                                                if (isCorrectChoice) {
                                                    styleClass = "relative p-4 rounded-xl border-green-500 bg-green-50/50 text-green-900 w-full flex items-start gap-4 shadow-sm focus:ring-4 focus:ring-green-200 outline-none";
                                                } else if (isSelected && !isCorrectChoice) {
                                                    styleClass = "relative p-4 rounded-xl border-red-200 bg-red-50/50 text-red-900 w-full flex items-start gap-4 opacity-80 focus:ring-4 focus:ring-red-200 outline-none";
                                                } else {
                                                    styleClass = "relative p-4 rounded-xl border-gray-100 text-gray-400 w-full flex items-start gap-4 grayscale opacity-60";
                                                }
                                            } else if (isSelected) {
                                                styleClass = "relative p-4 rounded-xl border-[var(--color-primary)] bg-blue-50/50 text-[var(--color-primary)] w-full flex items-start gap-4 shadow-md ring-1 ring-blue-500/20 focus:ring-4 focus:ring-blue-300 outline-none";
                                            } else {
                                                styleClass = "relative p-4 rounded-xl border-gray-200 hover:border-gray-300 text-gray-700 w-full flex items-start gap-4 hover:shadow-sm focus:ring-4 focus:ring-blue-100 outline-none";
                                            }
                                            // End style logic

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleAnswerSelect(index)}
                                                    disabled={isAnswered}
                                                    className={styleClass}
                                                    aria-label={ariaLabel}
                                                    aria-checked={isSelected}
                                                    role="radio"
                                                >
                                                    <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold border transition-colors
                                                        ${isAnswered && isCorrectChoice ? 'bg-green-500 border-green-500 text-white' :
                                                            isAnswered && isSelected ? 'bg-red-500 border-red-500 text-white' :
                                                                isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' :
                                                                    'bg-gray-100 border-gray-200 text-gray-500'}`} aria-hidden="true">
                                                        {String.fromCharCode(65 + index)}
                                                    </div>
                                                    <span className="text-lg font-medium leading-relaxed">{choice}</span>

                                                    {/* Status Icons */}
                                                    {isAnswered && isCorrectChoice && (
                                                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-green-500 animate-in fade-in zoom-in" aria-hidden="true" />
                                                    )}
                                                    {isAnswered && isSelected && !isCorrectChoice && (
                                                        <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-red-500 animate-in fade-in zoom-in" aria-hidden="true" />
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

            {/* Bottom Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
                <div className="container mx-auto max-w-4xl flex justify-between items-center transition-all">
                    {!isAnswered ? (
                        <div className="w-full flex justify-end">
                            <Button
                                size="lg"
                                onClick={handleValidate}
                                disabled={selectedAnswer === null}
                                className="w-full sm:w-auto min-w-[200px] text-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] focus:ring-4 focus:ring-blue-300"
                                aria-label="Valider ma réponse"
                            >
                                Vérifier
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2" role="alert" aria-live="assertive">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${status === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {status === 'correct' ? <CheckCircle className="h-6 w-6" aria-hidden="true" /> : <XCircle className="h-6 w-6" aria-hidden="true" />}
                                </div>
                                <div className="hidden sm:block">
                                    <p className={`font-bold ${status === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                                        {status === 'correct' ? 'Bonne réponse !' : 'Mauvaise réponse'}
                                    </p>
                                    {status !== 'correct' && (
                                        <p className="text-xs text-muted-foreground">La réponse était : <span className="font-semibold">{currentQuestion.choices[currentQuestion.correct_index]}</span></p>
                                    )}
                                </div>
                            </div>

                            <Button
                                size="lg"
                                onClick={handleNext}
                                className={`min-w-[160px] text-lg font-bold shadow-lg transition-transform hover:scale-[1.02] focus:ring-4 ${status === 'correct'
                                        ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20 focus:ring-green-300'
                                        : 'bg-gray-900 hover:bg-black shadow-gray-500/20 focus:ring-gray-500'
                                    }`}
                                aria-label={currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Continuer' : 'Voir Résultats'}
                                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
