'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Qu'est-ce que l'examen civique 2026 ?",
    answer: "L'examen civique est une étape obligatoire pour les demandeurs de naturalisation française ou de certains titres de séjour. Il porte sur les valeurs de la République, l'histoire de France, ses institutions et les droits et devoirs du citoyen."
  },
  {
    question: "Combien de questions comporte l'examen réel ?",
    answer: "L'examen officiel se compose généralement de 40 questions à choix multiples (QCM). Pour réussir, vous devez obtenir un score d'au moins 32 bonnes réponses."
  },
  {
    question: "CiviqQuiz est-il conforme au programme officiel ?",
    answer: "Oui, notre base de données est régulièrement mise à jour pour inclure les questions du livret citoyen officiel fourni par le ministère de l'Intérieur."
  },
  {
    question: "Puis-je m'entraîner gratuitement ?",
    answer: "Absolument. CiviqQuiz propose un accès gratuit aux entraînements thématiques et aux examens blancs pour aider tous les candidats à réussir leur intégration."
  },
  {
    question: "Quels sont les thèmes abordés ?",
    answer: "Les questions couvrent 5 domaines : Institutions & État, Histoire de France, Valeurs & Principes, Droits & Devoirs, et Vie Quotidienne (mises en situation)."
  }
];

export function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-slate-50" aria-labelledby="faq-heading">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
            <HelpCircle className="w-3 h-3" /> Foire Aux Questions
          </div>
          <h2 id="faq-heading" className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
            Tout savoir sur l&apos;examen
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Retrouvez les réponses aux questions les plus fréquentes sur la préparation et le passage de votre test civique.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-blue-200"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeIndex === index ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {activeIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                      <div className="h-px w-full bg-gray-100 mb-6" />
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
