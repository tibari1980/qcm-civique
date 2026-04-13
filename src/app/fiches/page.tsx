import React from 'react';
import { Metadata } from 'next';
import { BookOpen, Calendar, Flag, Scale, Landmark, ChevronRight, Clock, BookMarked, Target } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: "Académie Civique | Fiches de Révision | CiviQ",
    description: "Le parcours indispensable pour réussir. Révisez de manière structurée les dates clés, les symboles et les institutions de la République française.",
};

const FICHE_MODULES = [
    {
        id: 'histoire',
        moduleNum: 'Module 1',
        title: "Histoire de France",
        description: "Des Gaulois à la Vème République : comprenez les événements fondateurs qui ont façonné le pays.",
        time: "15 min",
        icon: <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
        color: 'border-blue-200 hover:border-blue-500 hover:shadow-blue-200',
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        badge: 'Fondamental'
    },
    {
        id: 'valeurs',
        moduleNum: 'Module 2',
        title: "Valeurs de la République",
        description: "Liberté, Égalité, Fraternité, Laïcité : maîtrisez le sens profond de la devise française.",
        time: "10 min",
        icon: <Flag className="w-8 h-8 text-red-600 dark:text-red-400" />,
        color: 'border-red-200 hover:border-red-500 hover:shadow-red-200',
        bg: 'bg-red-50 dark:bg-red-900/30',
        badge: 'Essentiel'
    },
    {
        id: 'institutions',
        moduleNum: 'Module 3',
        title: "Institutions & Politique",
        description: "Le fonctionnement de l'État souverain : apprenez le rôle du Président, du Parlement et comment se déroule le vote.",
        time: "20 min",
        icon: <Landmark className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
        color: 'border-purple-200 hover:border-purple-500 hover:shadow-purple-200',
        bg: 'bg-purple-50 dark:bg-purple-900/30',
        badge: 'Technique'
    },
    {
        id: 'droits',
        moduleNum: 'Module 4',
        title: "Droits & Devoirs",
        description: "Droits sociaux, obligations civiques et impôts. L'essentiel juridique de la vie quotidienne en France.",
        time: "12 min",
        icon: <Scale className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
        color: 'border-emerald-200 hover:border-emerald-500 hover:shadow-emerald-200',
        bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        badge: 'Pratique'
    },
];

export default function FichesMemoPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 overflow-hidden">
            {/* Immersive Hero Section */}
            <div className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden mb-12">
                <div className="absolute inset-0 bg-slate-900 dark:bg-slate-950 z-0">
                    {/* Background decorations */}
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse" />
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-red-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
                </div>
                
                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <div className="inline-flex items-center justify-center p-2 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-blue-200 mb-8 font-black uppercase tracking-widest text-[10px] shadow-lg">
                        <BookMarked className="w-4 h-4 mr-2" />
                        Programme Officiel
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                        L&apos;Académie <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-red-400">Civique</span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                        Le parcours d&apos;apprentissage structuré pour maîtriser les 4 piliers de l&apos;examen. Prenez 15 minutes par jour pour garantir votre réussite.
                    </p>
                </div>
                
                {/* Custom wavy bottom divider */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-50 dark:bg-slate-950" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0% 100%)' }} />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20">
                {/* Stats / Motivation Bar */}
                <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16 -mt-20">
                    <div className="premium-card-3d bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 flex items-center gap-4 min-w-[250px]">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><Target className="w-8 h-8" /></div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Objectif</div>
                            <div className="text-xl font-black text-slate-900">4 Modules Clés</div>
                        </div>
                    </div>
                    <div className="premium-card-3d bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 flex items-center gap-4 min-w-[250px]">
                        <div className="bg-red-50 text-red-600 p-3 rounded-2xl"><Clock className="w-8 h-8" /></div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Temps Total</div>
                            <div className="text-xl font-black text-slate-900">~ 1 Heure</div>
                        </div>
                    </div>
                </div>

                {/* Course Journey / Grid */}
                <div className="space-y-6">
                    {FICHE_MODULES.map((module, idx) => (
                        <Link
                            key={module.id}
                            href={`/fiches/${module.id}`}
                            className={`group block premium-card-3d bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border-2 ${module.color} transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden`}
                        >
                            {/* Decorative background element for each card */}
                            <div className={`absolute top-0 right-0 w-64 h-64 ${module.bg} rounded-full -mr-20 -mt-20 opacity-50 blur-3xl`} aria-hidden="true" />
                            
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                                {/* Icon & Numbering */}
                                <div className="flex items-center gap-6 md:w-1/3 shrink-0">
                                    <div className="hidden sm:block text-5xl font-black text-slate-100 dark:text-slate-800 absolute -left-4 top-4 group-hover:text-blue-50 transition-colors pointer-events-none select-none -z-10">
                                        0{idx + 1}
                                    </div>
                                    <div className={`${module.bg} p-6 rounded-[1.5rem] shadow-sm transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                        {module.icon}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-1">
                                            {module.moduleNum}
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-[var(--color-primary)] transition-colors leading-tight">
                                            {module.title}
                                        </h2>
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1">
                                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-base font-medium leading-relaxed">
                                        {module.description}
                                    </p>
                                    
                                    <div className="flex items-center flex-wrap gap-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold">
                                            <Clock className="w-4 h-4" /> {module.time}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
                                            <BookOpen className="w-4 h-4" /> Fiche Synthèse
                                        </span>
                                        {module.badge === 'Fondamental' && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-xl text-xs font-black uppercase tracking-wider">🔥 Fondamental</span>}
                                        
                                        <div className="ml-auto inline-flex items-center text-sm font-black text-white bg-slate-900 px-5 py-2.5 rounded-full group-hover:bg-[var(--color-primary)] transition-colors shadow-md">
                                            Débuter
                                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer Tip */}
                <div className="mt-16 bg-blue-600 border border-blue-500 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                            <span className="text-3xl">💡</span>
                        </div>
                        <h3 className="text-2xl font-black mb-3">Conseil de l&apos;Académie</h3>
                        <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                            Ne lisez pas tout le même jour. La rétention d&apos;information est meilleure si vous étudiez <strong>un module par jour</strong>, suivi d&apos;une session d&apos;entraînement associée.
                        </p>
                    </div>
                </div>
            </div>
        </main >
    );
}
