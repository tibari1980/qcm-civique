'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Volume2 } from 'lucide-react';

// Dictionnaire de traduction pédagogique pour le public préparant l'examen civique.
const DICTIONARY: Record<string, string> = {
    'république': "Un système où le pouvoir appartient aux citoyens. Les dirigeants sont élus et non pas des rois.",
    'république indivisible': "L'État est un. La loi est la même pour tout le monde, partout sur le territoire français.",
    'laïque': "L'État est neutre. Chacun est libre d'avoir une religion ou de ne pas en avoir, dans la sphère privée.",
    'laïcité': "L'État est complètement neutre avec la religion. Chacun a le droit de croire ou de ne pas croire.",
    'indivisible': "Qui ne peut pas être divisé. Les mêmes lois s'appliquent de la même façon pour tout le monde en France.",
    'souveraineté': "Le fait d'avoir le pouvoir total de décider. C'est le peuple qui a le vrai pouvoir final.",
    'dignité': "Le respect absolu qui est naturel et dû à chaque être humain, sans exception.",
    'promulgue': "L'acte formel et officiel qui rend une nouvelle loi obligatoire.",
    'assimilation': "Le fait d'adopter la langue, les valeurs et les principes de la vie en France.",
    'référendum': "Un vote où l'on pose une question à tous les habitants, et ils répondent directement par OUI ou par NON.",
    'institutions': "Les grandes structures qui organisent le pays (Parlement, Justice, Gouvernement...).",
    'démocratie': "Un pays où le gouvernement représente le peuple. Les citoyens ont le pouvoir de choisir en votant.",
    'décret': "Une décision administrative importante, souvent prise par le Président ou le Premier ministre.",
    'préfecture': "L'endroit où travaille le Préfet, qui représente l'État (la sécurité, les titres de séjour, etc.) dans une région.",
    'naturalisation': "La décision officielle d'accorder la nationalité française à une personne étrangère.",
    'loi': "Une règle décidée par le gouvernement et que tout le monde est obligé de respecter.",
    'parlement': "L'Assemblée (députés) et le Sénat (sénateurs). Ce sont eux qui votent les lois.",
    'suffrage universel': "Le droit donné à tous les citoyens (hommes et femmes, riches ou pauvres) de voter librement.",
    'tolérance': "Le fait d'accepter les gens même s'ils ont une religion ou des idées différentes de vous.",
    'fraude': "Un mensonge grave ou une tricherie volontaire avec la loi.",
    'hymne': "La chanson officielle d'un pays. En France, c'est « La Marseillaise ».",
    'devise': "Une phrase très importante qui résume le pays. Pour la France, c'est : Liberté, Égalité, Fraternité.",
    'impôts': "L'argent demandé par l'État aux citoyens pour pouvoir financer les écoles, hôpitaux, routes, etc."
};

// Hook for internal text-to-speech for definitions
function playHintAudio(text: string) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'fr-FR';
        utter.rate = 0.85; // Speak a bit slower for non-natives
        utter.pitch = 1.1;
        window.speechSynthesis.speak(utter);
    }
}

interface PedagogicalTextProps {
    text: string;
    className?: string;
}

// Optimization: Pre-compile Regex once for entire application lifecycle
const SORTED_KEYS = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);
const ESCAPED_KEYS = SORTED_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const DICT_REGEX = new RegExp(`\\b(${ESCAPED_KEYS.join('|')})\\b`, 'gi');

export function PedagogicalText({ text, className = '' }: PedagogicalTextProps) {
    const [activeWord, setActiveWord] = useState<string | null>(null);

    // Fonction pour découper le texte et trouver les mots du dictionnaire
    const renderTextWithTooltips = () => {
        const pieces = text.split(DICT_REGEX);

        return pieces.map((piece, i) => {
            const lowerPiece = piece.toLowerCase();
            const definition = DICTIONARY[lowerPiece];

            if (definition) {
                const isActive = activeWord === lowerPiece;
                return (
                    <span key={i} className="relative inline-block group">
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveWord(isActive ? null : lowerPiece);
                                if (!isActive) {
                                    playHintAudio(definition);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveWord(isActive ? null : lowerPiece);
                                    if (!isActive) {
                                        playHintAudio(definition);
                                    }
                                }
                            }}
                            onMouseEnter={() => setActiveWord(lowerPiece)}
                            onMouseLeave={() => setActiveWord(null)}
                            onFocus={() => setActiveWord(lowerPiece)}
                            onBlur={() => setActiveWord(null)}
                            className="inline-flex items-baseline text-blue-700 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-800 border-b-2 border-dashed border-blue-300 font-semibold px-1 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mx-0.5 relative z-10 cursor-help"
                            aria-expanded={isActive}
                            aria-label={`Définition de ${piece}`}
                        >
                            {piece}
                        </span>

                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-[280px] sm:w-[320px] bg-slate-900 border border-slate-700 text-white rounded-xl shadow-2xl z-50 p-4 pointer-events-none"
                                    role="tooltip"
                                    id={`tooltip-${lowerPiece}`}
                                >
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" aria-hidden="true" />
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg shrink-0">
                                            <Info className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white mb-1 capitalize border-b border-slate-700/50 pb-1">{piece}</h4>
                                            <p className="text-sm text-slate-200 leading-relaxed font-medium">
                                                {definition}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Petit label d'accessibilité TTS interne */}
                                    <div className="mt-2 flex items-center justify-end gap-1.5 text-xs text-slate-400 font-medium">
                                        <Volume2 className="h-3.5 w-3.5" />
                                        <span>Audio joué automatiquement</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </span>
                );
            }
            return <span key={i}>{piece}</span>;
        });
    };

    return (
        <span className={`inline-block w-full ${className}`}>
            {renderTextWithTooltips()}
        </span>
    );
}
