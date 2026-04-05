"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, AlertCircle, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExemptionResult = "EXEMPTED" | "REQUIRED" | null;

interface Question {
  id: string;
  question: string;
  description?: string;
  options: {
    label: string;
    result?: ExemptionResult;
    nextStep?: number;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: "date",
    question: "Quand avez-vous déposé ou prévoyez-vous de déposer votre demande ?",
    options: [
      { label: "Avant le 1er janvier 2026", result: "EXEMPTED" },
      { label: "À partir du 1er janvier 2026", nextStep: 1 },
    ],
  },
  {
    id: "type",
    question: "Quelle est la nature de votre demande ?",
    options: [
      { label: "Renouvellement d'un titre existant", result: "EXEMPTED" },
      { label: "Première demande de Carte de Séjour Pluriannuelle (CSP)", nextStep: 2 },
      { label: "Première demande de Carte de Résident (CR - 10 ans)", nextStep: 2 },
      { label: "Demande de naturalisation française", nextStep: 2 },
    ],
  },
  {
    id: "age",
    question: "Quel sera votre âge au moment du dépôt de la demande ?",
    options: [
      { label: "Moins de 18 ans", result: "EXEMPTED" },
      { label: "Entre 18 et 64 ans", nextStep: 3 },
      { label: "65 ans ou plus", result: "EXEMPTED" },
    ],
  },
  {
    id: "nationality",
    question: "Quelle est votre nationalité actuelle ?",
    options: [
      { label: "Française ou double nationalité", result: "EXEMPTED" },
      { label: "Ressortissant de l'Union Européenne, EEE ou Suisse", result: "EXEMPTED" },
      { label: "Autre nationalité", nextStep: 4 },
    ],
  },
  {
    id: "status",
    question: "Avez-vous un statut de protection spécifique ?",
    description: "(Réfugié, protection subsidiaire, apatride)",
    options: [
      { label: "Oui, j'ai l'un de ces statuts", result: "EXEMPTED" },
      { label: "Non", result: "REQUIRED" },
    ],
  },
];

export function EligibilityChecker() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [result, setResult] = useState<ExemptionResult>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const stepFocusRef = useRef<HTMLDivElement>(null);
  const resultFocusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // A11y focus management : Annonce du changement d'étape pour les lecteurs d'écran
    if (result && resultFocusRef.current) {
      resultFocusRef.current.focus();
    } else if (stepFocusRef.current) {
      stepFocusRef.current.focus();
    }
  }, [currentStep, result]);

  const handleOptionSelect = (option: Question["options"][0]) => {
    setAnswers({ ...answers, [currentStep]: option.label });

    if (option.result) {
      setResult(option.result);
    } else if (option.nextStep !== undefined) {
      setCurrentStep(option.nextStep);
    }
  };

  const resetAll = () => {
    setCurrentStep(0);
    setResult(null);
    setAnswers({});
  };

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl shadow-lg border border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
            Vérifiez votre éligibilité
          </h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-2">
            Répondez à quelques questions pour savoir si vous êtes concerné(e) par l'examen civique obligatoire.
          </p>
        </div>

        <div className="relative min-h-[300px]" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div 
                  className="mb-6 outline-none ring-0"
                  ref={stepFocusRef}
                  tabIndex={-1}
                  aria-label={`Question ${currentStep + 1} sur ${QUESTIONS.length}. ${currentQuestion.question}`}
                >
                  <div className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-2" aria-hidden="true">
                    Question {currentStep + 1}
                  </div>
                  <h3 className="text-xl font-medium text-[var(--color-foreground)]">
                    {currentQuestion.question}
                  </h3>
                  {currentQuestion.description && (
                    <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                      {currentQuestion.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3" role="group" aria-label="Options de réponse">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none transition-all text-left group"
                      aria-label={`Choisir la réponse : ${option.label}`}
                    >
                      <span className="text-[var(--color-foreground)] font-medium">
                        {option.label}
                      </span>
                      <ChevronRight aria-hidden="true" className="w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary)] transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex flex-col items-center justify-center text-center py-8 outline-none ring-0"
                ref={resultFocusRef}
                tabIndex={-1}
                aria-label={`Résultat de l'éligibilité : ${result === "EXEMPTED" ? "Vous êtes exempté(e)" : "Examen obligatoire"}`}
              >
                {result === "EXEMPTED" ? (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                      Vous êtes exempté(e)
                    </h3>
                    <p className="text-[var(--color-foreground)] max-w-md mx-auto">
                      D'après vos réponses, vous n'êtes **pas** tenu(e) de passer l'examen civique pour votre démarche.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      Examen obligatoire
                    </h3>
                    <p className="text-[var(--color-foreground)] max-w-md mx-auto">
                      Vous devez passer et réussir l'examen civique pour valider votre demande. 
                    </p>
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left border border-blue-100 dark:border-blue-800">
                      <div className="flex gap-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Bonne nouvelle !</strong> Vous êtes au bon endroit pour vous préparer. Entraînez-vous dès maintenant sur QCM Civique.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <Button 
                    onClick={resetAll} 
                    variant="outline" 
                    className="flex items-center gap-2"
                    aria-label="Recommencer le test d'éligibilité"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    Recommencer le test
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
