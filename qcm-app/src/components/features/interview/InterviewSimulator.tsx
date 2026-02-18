'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCw, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock Interview Questions
const interviewQuestions = [
    {
        id: 1,
        question: "Pourquoi voulez-vous devenir Français ?",
        answer: "Parce que je vis ici depuis longtemps, je partage les valeurs de la République, ma vie est ici et je souhaite participer pleinement à la vie citoyenne (voter)."
    },
    {
        id: 2,
        question: "Quelle est la devise de la République ?",
        answer: "Liberté, Égalité, Fraternité."
    },
    {
        id: 3,
        question: "Citez trois droits du citoyen.",
        answer: "Le droit de vote, la liberté d'expression, le droit à la sûreté, la liberté de culte."
    },
    {
        id: 4,
        question: "Citez trois devoirs du citoyen.",
        answer: "Respecter la loi, payer ses impôts, participer à la défense nationale (JAPD/JDC), être juré si convoqué."
    },
    {
        id: 5,
        question: "Qu'est-ce que la laïcité ?",
        answer: "C'est la neutralité de l'État en matière religieuse. L'État ne reconnaît ni ne subventionne aucune religion. Chacun est libre de croire ou de ne pas croire."
    }
];

export default function InterviewSimulator() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Chargement...</div>;
    }

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % interviewQuestions.length);
        }, 300); // Wait for flip back
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + interviewQuestions.length) % interviewQuestions.length);
        }, 300);
    };

    const handleSpeak = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft' && currentIndex > 0) handlePrev();
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFlipped(!isFlipped);
        }
    };

    const currentCard = interviewQuestions[currentIndex];

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4" onKeyDown={handleKeyDown}>
            <div className="container mx-auto max-w-2xl">
                <header className="mb-8 flex items-center justify-between">
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm" aria-label="Retour au tableau de bord">
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Retour
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Simulateur d'Entretien</h1>
                    <div className="w-20" aria-hidden="true"></div> {/* Spacer */}
                </header>

                <div
                    className="perspective-1000 h-96 cursor-pointer group focus:outline-none"
                    onClick={() => setIsFlipped(!isFlipped)}
                    onKeyDown={handleKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-label={`Carte ${currentIndex + 1} sur ${interviewQuestions.length}. ${isFlipped ? 'Réponse affichée : ' + currentCard.answer : 'Question : ' + currentCard.question}. Appuyez sur Entrée pour retourner la carte.`}
                    aria-pressed={isFlipped}
                >
                    <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                        {/* Front Face (Question) */}
                        <Card className="absolute w-full h-full backface-hidden flex flex-col items-center justify-center p-8 bg-white border-2 border-blue-100 hover:border-blue-300 transition-colors group-focus:ring-4 group-focus:ring-blue-300" aria-hidden={isFlipped}>
                            <div className="text-sm uppercase tracking-widest text-blue-500 font-semibold mb-6">
                                Question {currentIndex + 1} / {interviewQuestions.length}
                            </div>
                            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                                {currentCard.question}
                            </h2>
                            <div className="mt-auto text-gray-400 flex items-center text-sm" aria-hidden="true">
                                <RotateCw className="mr-2 h-4 w-4" /> Cliquer ou Entrée pour voir la réponse
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 z-10"
                                onClick={(e) => handleSpeak(currentCard.question, e)}
                                onKeyDown={(e) => e.stopPropagation()}
                                aria-label="Écouter la question"
                            >
                                <Volume2 className="h-5 w-5" aria-hidden="true" />
                            </Button>
                        </Card>

                        {/* Back Face (Answer) */}
                        <Card className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-green-50 border-2 border-green-200 group-focus:ring-4 group-focus:ring-green-300" aria-hidden={!isFlipped}>
                            <div className="text-sm uppercase tracking-widest text-green-600 font-semibold mb-6">
                                Réponse suggérée
                            </div>
                            <p className="text-xl text-center text-gray-800 leading-relaxed">
                                {currentCard.answer}
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-4 right-4 text-gray-400 hover:text-green-600 z-10"
                                onClick={(e) => handleSpeak(currentCard.answer, e)}
                                onKeyDown={(e) => e.stopPropagation()}
                                aria-label="Écouter la réponse"
                            >
                                <Volume2 className="h-5 w-5" aria-hidden="true" />
                            </Button>
                        </Card>
                    </div>
                </div>

                <nav className="mt-8 flex justify-between items-center" aria-label="Navigation des questions">
                    <Button onClick={(e) => { e.stopPropagation(); handlePrev(); }} disabled={currentIndex === 0} variant="outline" aria-label="Question précédente">
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Précédent
                    </Button>
                    <span className="sr-only" aria-live="polite">Question {currentIndex + 1} sur {interviewQuestions.length}</span>
                    <Button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="min-w-[120px]" aria-label="Question suivante">
                        Suivant <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                </nav>
            </div>
        </main>
    );
}
