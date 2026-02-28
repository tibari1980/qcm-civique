'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Target, Clock, CheckCircle, ArrowRight, ChevronDown,
    UserPlus, Settings, BarChart3, FileText, Brain,
    Shield, Star, Lightbulb, Zap, GraduationCap, HelpCircle, ExternalLink,
    Heart, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */
const FAQ_ITEMS = [
    {
        q: "L'examen civique est-il obligatoire ?",
        a: "Oui. Depuis le 1er janvier 2026, l'examen civique est obligatoire pour toute première demande de carte de séjour pluriannuelle (CSP), de carte de résident (CR) et pour les demandes de naturalisation par décret. Il ne concerne pas les renouvellements."
    },
    {
        q: "Combien de questions comporte l'examen ?",
        a: "L'examen civique se compose de 40 questions à choix multiples (QCM) à réaliser sur ordinateur en 45 minutes maximum. Il faut obtenir au minimum 32 bonnes réponses (80%) pour réussir."
    },
    {
        q: "Quels sont les thèmes abordés ?",
        a: "5 thématiques officielles : Principes et valeurs de la République (11 questions), Système institutionnel (6 questions), Droits et devoirs (11 questions), Histoire, géographie et culture (8 questions), et Vivre en France (4 questions). L'examen inclut 28 questions de connaissances et 12 mises en situation."
    },
    {
        q: "CiviqQuiz est-il gratuit ?",
        a: "Oui, CiviqQuiz est entièrement gratuit. Vous pouvez vous entraîner autant de fois que nécessaire, sans limite, sur toutes les thématiques et en conditions d'examen."
    },
    {
        q: "Quelle est la différence entre Entraînement et Examen Blanc ?",
        a: "Le mode Entraînement vous permet de pratiquer par thème avec des corrections immédiates et détaillées après chaque question. L'Examen Blanc simule les conditions réelles : 40 questions, timer de 45 minutes, et résultat global à la fin."
    },
    {
        q: "Mes données sont-elles en sécurité ?",
        a: "Absolument. CiviqQuiz utilise Firebase Authentication de Google pour sécuriser vos données. Vos informations personnelles ne sont jamais partagées avec des tiers. Vous pouvez supprimer votre compte à tout moment."
    },
    {
        q: "Puis-je m'entraîner sans créer de compte ?",
        a: "Oui ! Vous pouvez accéder au mode invité pour essayer l'entraînement par thème. Toutefois, créer un compte gratuit vous permet de sauvegarder votre progression, d'accéder au tableau de bord et d'obtenir un certificat de réussite."
    },
    {
        q: "Qui peut bénéficier d'une dispense d'examen ?",
        a: "Des dispenses peuvent être accordées en cas de handicap, d'état de santé déficient chronique, ou pour les étrangers de plus de 65 ans. Renseignez-vous auprès de votre préfecture."
    }
];

const GUIDE_STEPS = [
    {
        icon: UserPlus,
        title: "1. Créez votre compte",
        description: "Inscription gratuite en 30 secondes avec votre email. Vous pouvez aussi essayer en mode invité.",
        details: [
            "Cliquez sur « Inscription » en haut de la page",
            "Renseignez votre nom, email et mot de passe",
            "Choisissez votre parcours : Titre de Séjour ou Naturalisation",
            "Votre tableau de bord personnalisé est prêt !"
        ],
        color: "bg-blue-500",
        link: "/register"
    },
    {
        icon: Target,
        title: "2. Choisissez votre parcours",
        description: "Deux parcours adaptés à votre situation administrative.",
        details: [
            "Titre de Séjour : accès à l'entraînement thématique + examen blanc (40 questions, 45 min)",
            "Naturalisation : entraînement complet + quiz culture générale approfondi",
            "Vous pouvez changer de parcours à tout moment dans vos paramètres"
        ],
        color: "bg-indigo-500",
        link: "/onboarding"
    },
    {
        icon: BookOpen,
        title: "3. Entraînez-vous par thème",
        description: "5 thématiques officielles avec corrections détaillées après chaque réponse.",
        details: [
            "Histoire & Géographie de la France (dates clés, personnages historiques)",
            "Institutions de la République (Président, Parlement, Constitution)",
            "Valeurs & Principes (laïcité, devise, symboles républicains)",
            "Droits & Devoirs des citoyens (justice, égalité, droits fondamentaux)",
            "Société française (vie quotidienne, intégration, services publics)",
            "Chaque réponse est expliquée pour mieux comprendre et retenir"
        ],
        color: "bg-green-500",
        link: "/training"
    },
    {
        icon: Clock,
        title: "4. Passez des examens blancs",
        description: "Simulez l'examen officiel en conditions réelles pour vous préparer au mieux.",
        details: [
            "40 questions aléatoires couvrant les 5 thématiques",
            "Timer de 45 minutes comme le jour J",
            "Score minimum requis : 80% (32/40 bonnes réponses)",
            "Analyse détaillée de vos résultats à la fin",
            "Navigation libre entre les questions pendant l'examen"
        ],
        color: "bg-red-500",
        link: "/exam"
    },
    {
        icon: BarChart3,
        title: "5. Suivez votre progression",
        description: "Tableau de bord complet pour visualiser vos forces et faiblesses.",
        details: [
            "Score moyen par thématique",
            "Nombre total de tests effectués",
            "Historique de vos sessions récentes",
            "Barre de progression vers le certificat",
            "Identification des thèmes à renforcer"
        ],
        color: "bg-purple-500",
        link: "/dashboard"
    },
    {
        icon: GraduationCap,
        title: "6. Obtenez votre certificat",
        description: "Lorsque tous les thèmes sont maîtrisés, votre certificat de réussite est débloqué.",
        details: [
            "Maîtrisez les 5 thématiques officielles",
            "Certificat de réussite CiviqQuiz à télécharger",
            "Preuve de préparation pour votre dossier",
            "Partageable avec votre entourage"
        ],
        color: "bg-amber-500",
        link: "/profile"
    }
];

const EXAM_THEMES = [
    {
        name: "Principes & Valeurs",
        questions: 11,
        topics: ["Devise républicaine (Liberté, Égalité, Fraternité)", "Symboles de la République (drapeau, Marianne, hymne national)", "Laïcité et séparation Église-État", "Déclaration des droits de l'homme et du citoyen"],
        color: "from-blue-500 to-blue-700",
        icon: Shield
    },
    {
        name: "Institutions",
        questions: 6,
        topics: ["Constitution et pouvoir exécutif", "Président de la République et son rôle", "Gouvernement et Assemblée nationale", "Sénat, collectivités territoriales, justice"],
        color: "from-indigo-500 to-indigo-700",
        icon: Settings
    },
    {
        name: "Droits & Devoirs",
        questions: 11,
        topics: ["Droits fondamentaux (liberté d'expression, droit de vote)", "Égalité homme-femme", "Devoir fiscal et service national", "Justice, protection sociale et accès aux soins"],
        color: "from-emerald-500 to-emerald-700",
        icon: FileText
    },
    {
        name: "Histoire & Culture",
        questions: 8,
        topics: ["Grandes périodes historiques (Révolution, Guerres mondiales)", "Personnages clés (De Gaulle, Victor Hugo, Simone Veil)", "Patrimoine culturel et artistique", "Géographie de la France métropolitaine et d'outre-mer"],
        color: "from-amber-500 to-amber-700",
        icon: BookOpen
    },
    {
        name: "Vivre en France",
        questions: 4,
        topics: ["S'installer et résider en France", "Système éducatif et santé", "Vie quotidienne et intégration", "Services publics et démarches administratives"],
        color: "from-rose-500 to-rose-700",
        icon: Users
    }
];

/* ═══════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════ */
function FAQItem({ item, id }: { item: typeof FAQ_ITEMS[0], id: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-colors">
            <h3 className="m-0">
                <button
                    id={`faq-btn-${id}`}
                    onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
                    aria-expanded={open}
                    aria-controls={`faq-answer-${id}`}
                >
                    <span className="font-bold text-gray-900 dark:text-white pr-4">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
            </h3>
            <AnimatePresence>
                {open && (
                    <motion.div
                        id={`faq-answer-${id}`}
                        role="region"
                        aria-labelledby={`faq-btn-${id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="px-5 pb-5 text-gray-600 dark:text-gray-300 leading-relaxed">
                            {item.a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function GuidePage() {
    return (
        <div className="min-h-screen">
            {/* HERO */}
            <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-950 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-40" aria-hidden="true" />
                <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" aria-hidden="true" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" aria-hidden="true" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm font-bold mb-6 border border-white/20">
                            <BookOpen className="h-4 w-4" aria-hidden="true" />
                            Guide complet — Mis à jour 2026
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                            <span className="sr-only">Guide CiviqQuiz : Réussissez votre naturalisation, titre de séjour et carte de résident en France</span>
                            <span aria-hidden="true">
                                Guide d'utilisation<br />
                                <span className="bg-gradient-to-r from-blue-300 via-white to-red-300 bg-clip-text text-transparent">
                                    CiviqQuiz
                                </span>
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 font-light leading-relaxed">
                            Le guide de référence pour préparer efficacement votre <strong className="text-white font-semibold">test de naturalisation française</strong>, votre <strong className="text-white font-semibold">titre de séjour</strong> et votre <strong className="text-white font-semibold">carte de résident en France</strong> grâce à des QCM conformes aux exigences officielles.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/register">
                                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-bold text-lg px-8 shadow-xl">
                                    Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                                </Button>
                            </Link>
                            <a href="#guide-steps">
                                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold text-lg px-8">
                                    Voir le guide <ChevronDown className="ml-2 h-5 w-5" aria-hidden="true" />
                                </Button>
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* KEY NUMBERS */}
            <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: "40", label: "Questions QCM", icon: FileText },
                            { value: "45 min", label: "Durée de l'examen", icon: Clock },
                            { value: "80%", label: "Score minimum (32/40)", icon: CheckCircle },
                            { value: "5", label: "Thématiques officielles", icon: BookOpen },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-center gap-2"
                            >
                                <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-1" aria-hidden="true" />
                                <span className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">{stat.value}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHAT IS THE EXAM */}
            <section className="py-20 bg-gray-50 dark:bg-gray-950">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6 text-center">
                            Qu'est-ce que l'examen civique ?
                        </h2>
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 md:p-12 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                            <p className="text-lg">
                                <strong className="text-gray-900 dark:text-white">Depuis le 1er janvier 2026</strong>, l'examen civique français est devenu <strong className="text-blue-600 dark:text-blue-400">obligatoire</strong> pour toute première demande de :
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Carte de séjour pluriannuelle (CSP)",
                                    "Carte de résident (CR)",
                                    "Naturalisation par décret"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                    <div>
                                        <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">Bon à savoir</p>
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            L'examen n'est <strong>pas requis</strong> pour les renouvellements de cartes. Des dispenses existent pour les personnes en situation de handicap, d'état de santé déficient chronique, ou âgées de plus de 65 ans.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p>
                                L'examen se présente sous forme de <strong className="text-gray-900 dark:text-white">40 questions à choix multiples (QCM)</strong> sur ordinateur, à compléter en <strong className="text-gray-900 dark:text-white">45 minutes maximum</strong>. Il inclut 28 questions de connaissances générales et 12 mises en situation. Le score minimum requis est de <strong className="text-red-600 dark:text-red-400">80% (32/40)</strong>.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 5 THEMES */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-4">
                        Les 5 thématiques de l'examen
                    </h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                        L'examen couvre l'ensemble des connaissances nécessaires pour vivre en France en tant que citoyen informé et responsable.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {EXAM_THEMES.map((theme, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                            >
                                <div className={`bg-gradient-to-r ${theme.color} p-5 flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        <theme.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                        <h3 className="font-bold text-white text-lg">{theme.name}</h3>
                                    </div>
                                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-bold">
                                        {theme.questions} Q
                                    </span>
                                </div>
                                <ul className="p-5 space-y-2.5">
                                    {theme.topics.map((topic, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <span className="text-blue-500 mt-1 flex-shrink-0" aria-hidden="true">•</span>
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STEP BY STEP GUIDE */}
            <section id="guide-steps" className="py-20 bg-gray-50 dark:bg-gray-950 scroll-mt-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-4">
                        Comment utiliser CiviqQuiz ?
                    </h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
                        Suivez ces 6 étapes pour vous préparer efficacement et maximiser vos chances de réussite.
                    </p>

                    <div className="space-y-8">
                        {GUIDE_STEPS.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow p-8 border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className={`${step.color} p-4 rounded-2xl text-white flex-shrink-0`} aria-hidden="true">
                                        <step.icon className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">{step.description}</p>
                                        <ul className="space-y-2 mb-4">
                                            {step.details.map((detail, j) => (
                                                <li key={j} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                        <Link href={step.link}>
                                            <Button variant="outline" size="sm" className="group">
                                                Accéder <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TIPS */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4 max-w-5xl">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-12">
                        <Lightbulb className="inline h-8 w-8 text-amber-500 mr-2" aria-hidden="true" />
                        Conseils pour réussir
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                icon: Zap,
                                title: "Révisez régulièrement",
                                text: "15 à 20 minutes par jour sont plus efficaces qu'une longue session par semaine. La régularité facilite la mémorisation.",
                                tag: "Méthode"
                            },
                            {
                                icon: Target,
                                title: "Ciblez vos faiblesses",
                                text: "Consultez votre tableau de bord pour identifier les thèmes où vous avez le score le plus bas. Concentrez vos efforts dessus.",
                                tag: "Stratégie"
                            },
                            {
                                icon: Brain,
                                title: "Comprenez, ne mémorisez pas",
                                text: "L'examen inclut des mises en situation. Essayez de comprendre le « pourquoi » derrière chaque règle plutôt que d'apprendre par cœur.",
                                tag: "Approche"
                            },
                            {
                                icon: Clock,
                                title: "Entraînez-vous en temps réel",
                                text: "Faites au moins 3 examens blancs en conditions réelles avant le jour J. Habituez-vous au stress du timer de 45 minutes.",
                                tag: "Préparation"
                            },
                            {
                                icon: BookOpen,
                                title: "Lisez le Livret du citoyen",
                                text: "Le livret officiel du ministère de l'Intérieur est la référence de base. Complétez avec le QCM CiviqQuiz pour tester vos connaissances.",
                                tag: "Ressource"
                            },
                            {
                                icon: Star,
                                title: "Visez plus de 90%",
                                text: "Le seuil est à 80% (32/40), mais visez 36/40 minimum pour avoir une marge confortable le jour de l'examen.",
                                tag: "Objectif"
                            }
                        ].map((tip, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex-shrink-0" aria-hidden="true">
                                        <tip.icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white">{tip.title}</h3>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">{tip.tag}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tip.text}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* USEFUL LINKS */}
            <section className="py-16 bg-gray-50 dark:bg-gray-950">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-8">
                        Ressources officielles
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { title: "Service-Public.fr — Examen civique", url: "https://www.service-public.fr" },
                            { title: "Ministère de l'Intérieur — Naturalisation", url: "https://www.interieur.gouv.fr" },
                            { title: "France Éducation International", url: "https://www.france-education-international.fr" },
                            { title: "Formation civique officielle", url: "https://www.lefrancaisdesaffaires.fr" },
                        ].map((link, i) => (
                            <a
                                key={i}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all group"
                            >
                                <ExternalLink className="h-4 w-4 text-blue-500 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{link.title}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-black text-center text-gray-900 dark:text-white mb-4">
                        <HelpCircle className="inline h-8 w-8 text-blue-500 mr-2" aria-hidden="true" />
                        Questions fréquentes
                    </h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
                        Tout ce que vous devez savoir sur l'examen civique et CiviqQuiz.
                    </p>
                    <div className="space-y-3">
                        {FAQ_ITEMS.map((item, i) => (
                            <FAQItem key={i} id={`faq-${i}`} item={item} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <Heart className="h-12 w-12 text-red-300 mx-auto mb-6 animate-pulse" aria-hidden="true" />
                        <h2 className="text-3xl md:text-5xl font-black mb-6">Prêt à réussir ?</h2>
                        <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto font-light">
                            Rejoignez les milliers de candidats qui se préparent avec CiviqQuiz. Inscription gratuite, sans engagement.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/register">
                                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-lg px-10 shadow-xl">
                                    S'inscrire gratuitement
                                </Button>
                            </Link>
                            <Link href="/training">
                                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold text-lg px-10">
                                    Essayer sans compte
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
