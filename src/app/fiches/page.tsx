import React from 'react';
import { Metadata } from 'next';
import { BookOpen, Calendar, Flag, Scale, Landmark, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Fiches Mémo de Révision | CiviQ",
    description: "L'essentiel à connaître pour réussir vos examens de citoyenneté française. Révisez les dates clés, les symboles et les institutions.",
};

const FICHE_CATEGORIES = [
    {
        id: 'histoire',
        title: "Dates clés de l'histoire de France",
        description: "L'Histoire et la culture : des événements fondateurs à nos jours.",
        icon: <Calendar className="w-8 h-8 text-blue-500" />,
        color: 'border-blue-200 hover:border-blue-500 hover:shadow-blue-100',
        bg: 'bg-blue-50'
    },
    {
        id: 'valeurs',
        title: "Symboles et valeurs de la République",
        description: "Principes, valeurs et laïcité : les fondements de la nation.",
        icon: <Flag className="w-8 h-8 text-red-500" />,
        color: 'border-red-200 hover:border-red-500 hover:shadow-red-100',
        bg: 'bg-red-50'
    },
    {
        id: 'droits',
        title: "Droits et devoirs du résident",
        description: "Droits sociaux, obligations civiques et vie quotidienne en France.",
        icon: <Scale className="w-8 h-8 text-emerald-500" />,
        color: 'border-emerald-200 hover:border-emerald-500 hover:shadow-emerald-100',
        bg: 'bg-emerald-50'
    },
    {
        id: 'institutions',
        title: "Institutions et vie politique",
        description: "Le fonctionnement de l'État : Président, Parlement, et vote.",
        icon: <Landmark className="w-8 h-8 text-purple-500" />,
        color: 'border-purple-200 hover:border-purple-500 hover:shadow-purple-100',
        bg: 'bg-purple-50'
    },
];

export default function FichesMemoPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">

                {/* Header section */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 group hover:shadow-md transition-shadow">
                        <span className="text-3xl mr-3 group-hover:scale-110 transition-transform block">📚</span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-800 via-gray-800 to-red-800 dark:from-blue-400 dark:via-white dark:to-red-400 bg-clip-text text-transparent">
                            Fiches Mémo de Révision
                        </h1>
                    </div>

                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        L&apos;essentiel à connaître pour réussir vos examens de naturalisation et de titre de séjour.
                        Révisez de manière simple et concise les thématiques principales de l&apos;entretien civique.
                    </p>
                </div>

                {/* Grid of Fiches Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {FICHE_CATEGORIES.map((category, idx) => (
                        <Link
                            key={category.id}
                            href={`/fiches/${category.id}`}
                            className={`group bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border-2 ${category.color} shadow-sm transition-all duration-300 transform hover:-translate-y-1`}
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`${category.bg} p-4 rounded-xl shrink-0 dark:bg-gray-800`}>
                                    {category.icon}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                                        {category.title}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
                                        {category.description}
                                    </p>

                                    <div className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300">
                                        Lire la fiche
                                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer Tip */}
                <div className="mt-16 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-6 text-center shadow-inner">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        💡 <strong className="mr-1">Astuce :</strong> Prenez le temps de relire une fiche par jour.
                        L&apos;apprentissage se fait étape par étape !
                    </p>
                </div>
            </div>
        </main >
    );
}
