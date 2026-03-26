'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ArrowRight, Book, Scale, Landmark, Globe, Users, Trophy } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserService } from '../../../services/user.service';
import { QuestionService } from '../../../services/question.service';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES, THEME_LABELS } from '../../../constants/app-constants';
import { Skeleton } from '../../../components/ui/Skeleton';

const THEME_DETAILS: Record<string, { description: string; icon: any; color: string; bg: string }> = {
    vals_principes: {
        description: 'La Marseillaise, la devise, la laïcité et les symboles de la République.',
        icon: Scale,
        color: 'text-blue-600',
        bg: 'bg-blue-50 shadow-blue-100',
    },
    institutions: {
        description: 'Le Président, le Parlement, les collectivités territoriales et l\'UE.',
        icon: Landmark,
        color: 'text-red-600',
        bg: 'bg-red-50 shadow-red-100',
    },
    histoire: {
        description: 'Les grandes dates de l\'histoire de France et sa géographie physique et humaine.',
        icon: Globe,
        color: 'text-green-600',
        bg: 'bg-green-50 shadow-green-100',
    },
    societe: {
        description: 'Santé, éducation, emploi, logement et vie quotidienne en France.',
        icon: Users,
        color: 'text-orange-600',
        bg: 'bg-orange-50 shadow-orange-100',
    },
    droits: {
        description: 'Les droits fondamentaux et les devoirs du citoyen responsable.',
        icon: Book,
        color: 'text-purple-600',
        bg: 'bg-purple-50 shadow-purple-100',
    },
};

const themes = THEMES.map(id => ({
    id,
    title: (THEME_LABELS as any)[id] || id,
    ...(THEME_DETAILS[id] || {
        description: 'Explorer ce thème pour approfondir vos connaissances.',
        icon: Book,
        color: 'text-gray-600',
        bg: 'bg-gray-50'
    })
}));

function ThemeCardSkeleton() {
    return (
        <div className="premium-card-3d bg-white p-6 flex flex-col gap-4 animate-pulse">
            <div className="w-14 h-14 rounded-2xl bg-slate-100" />
            <div className="h-6 w-3/4 rounded bg-slate-100" />
            <div className="space-y-2">
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-5/6 rounded bg-slate-100" />
            </div>
            <div className="mt-4 h-12 w-full rounded-2xl bg-slate-100" />
        </div>
    );
}

export default function TrainingThemeList() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = React.useState<any>(null);
    const [statsLoading, setStatsLoading] = React.useState(true);
    const [themeCounts, setThemeCounts] = React.useState<Record<string, number>>({});
    const [countsLoading, setCountsLoading] = React.useState(true);

    const isLoadingData = statsLoading || countsLoading;

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;

        Promise.all([
            UserService.getUserStats(user.uid, userProfile?.track || undefined),
            QuestionService.getCountsByTheme(),
        ])
            .then(([userData, counts]) => {
                setStats(userData.theme_stats);
                setThemeCounts(counts);
            })
            .catch(err => console.error('Error loading training page data', err))
            .finally(() => {
                setStatsLoading(false);
                setCountsLoading(false);
            });
    }, [user, userProfile]);

    if (loading || isLoadingData) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-7xl space-y-12">
                <div className="text-center md:text-left">
                    <Skeleton width="40%" height="3.5rem" className="rounded-2xl mb-4" />
                    <Skeleton width="60%" height="1.5rem" className="rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {themes.map(t => <ThemeCardSkeleton key={t.id} />)}
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <header className="mb-12 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 antialiased">
                        Entraînement par thématique
                    </span>
                </h1>
                <p className="text-lg text-slate-500 font-medium max-w-2xl antialiased">
                    Maîtrisez chaque sujet à votre rythme avec nos modules spécialisés.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {themes.map((theme, idx) => {
                    const Icon = theme.icon;
                    const themeStat = stats ? stats[theme.id] : null;
                    const hasStarted = !!themeStat;
                    const successRate = themeStat ? Math.round(themeStat.success_rate) : 0;
                    const qCount = themeCounts[theme.id];

                    return (
                        <motion.div
                            key={theme.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            whileHover={{ y: -8 }}
                        >
                            <Card className="premium-card-3d border-none bg-white p-2 h-full flex flex-col overflow-visible group">
                                <CardHeader className="p-6 flex flex-row items-start justify-between">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-3d-sm ${theme.bg}`}>
                                        <Icon className={`h-8 w-8 ${theme.color} animate-float`} aria-hidden="true" />
                                    </div>

                                    {userProfile?.role === 'admin' && (
                                        <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-3d-sm">
                                            {qCount !== undefined ? `${qCount} Questions` : '—'}
                                        </div>
                                    )}
                                </CardHeader>

                                <CardContent className="px-6 pb-2 flex-1">
                                    <CardTitle className="text-2xl font-black mb-3 tracking-tight group-hover:text-primary transition-colors">
                                        {theme.title}
                                    </CardTitle>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                                        {theme.description}
                                    </p>

                                    <div className="mt-auto space-y-4">
                                        {hasStarted ? (
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maîtrise</span>
                                                    <span className={`text-base font-black ${successRate >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                                        {successRate}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${successRate}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className={`h-full rounded-full shadow-3d-sm ${successRate >= 80 ? 'bg-green-500' : 'bg-orange-500'}`}
                                                    />
                                                </div>
                                                <div className="flex justify-between mt-2">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{themeStat.attempts} sessions passées</span>
                                                    {successRate >= 80 && <Trophy className="h-3 w-3 text-amber-500" />}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center">
                                                <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Module non débuté</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="p-6 pt-2">
                                    <Link href={`/training/${theme.id}`} className="w-full">
                                        <Button
                                            className={`w-full h-14 rounded-2xl font-black text-lg transition-all duration-300 relative overflow-hidden group/btn shadow-3d-md hover:shadow-3d-lg
                                                ${hasStarted ? 'bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50' : 'bg-primary text-white hover:bg-blue-700'}`}
                                        >
                                            {/* Flag decoration for primary button */}
                                            {!hasStarted && (
                                                <div className="absolute top-0 left-0 right-0 h-1 flex opacity-30">
                                                    <div className="h-full w-1/3 bg-blue-600" />
                                                    <div className="h-full w-1/3 bg-white" />
                                                    <div className="h-full w-1/3 bg-red-600" />
                                                </div>
                                            )}
                                            <span className="flex items-center justify-center gap-3">
                                                {hasStarted ? 'Continuer' : 'Commencer'}
                                                <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                            </span>
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
