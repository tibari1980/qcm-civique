'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Book, Scale, Landmark, Globe, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserService } from '@/services/user.service';
import { QuestionService } from '@/services/question.service';

/* ──────────────────────────────────────────────────────────────
   Mapping : id interne → valeur du champ `theme` en Firestore
   ────────────────────────────────────────────────────────────── */
const themes = [
    {
        id: 'vals_principes',
        title: 'Principes et Valeurs',
        description: 'La Marseillaise, la devise, la laïcité et les symboles de la République.',
        icon: Scale,
        color: 'text-blue-600',
    },
    {
        id: 'institutions',
        title: 'Institutions Françaises',
        description: 'Le Président, le Parlement, les collectivités territoriales et l\'UE.',
        icon: Landmark,
        color: 'text-red-600',
    },
    {
        id: 'histoire',
        title: 'Histoire et Géographie',
        description: 'Les grandes dates de l\'histoire de France et sa géographie physique et humaine.',
        icon: Globe,
        color: 'text-green-600',
    },
    {
        id: 'societe',
        title: 'Vie en Société',
        description: 'Santé, éducation, emploi, logement et vie quotidienne en France.',
        icon: Users,
        color: 'text-orange-600',
    },
    {
        id: 'droits',
        title: 'Droits et Devoirs',
        description: 'Les droits fondamentaux et les devoirs du citoyen responsable.',
        icon: Book,
        color: 'text-purple-600',
    },
];

/* ── Skeleton d'une carte thème ── */
function ThemeCardSkeleton() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col gap-3 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-gray-100" />
                {/* badge compteur skeleton */}
                <div className="w-12 h-5 rounded-full bg-gray-100" />
            </div>
            <div className="h-5 w-3/4 rounded bg-gray-100" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-5/6 rounded bg-gray-100" />
            <div className="mt-2 h-2 w-full rounded-full bg-gray-100" />
            <div className="h-9 w-full rounded-lg bg-gray-100 mt-1" />
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

    /* Redirect si non connecté */
    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    /* Charger stats utilisateur + compteurs Firestore en parallèle */
    useEffect(() => {
        if (!user) return;

        if (!stats) setStatsLoading(true);
        if (Object.keys(themeCounts).length === 0) setCountsLoading(true);

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

    /* Skeleton complet pendant l'auth */
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="h-8 w-64 rounded bg-gray-100 animate-pulse mb-2" />
                    <div className="h-4 w-80 rounded bg-gray-100 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themes.map(t => <ThemeCardSkeleton key={t.id} />)}
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Entraînement par Thème</h1>
                <p className="text-gray-600">Choisissez un sujet pour approfondir vos connaissances.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => {
                    const Icon = theme.icon;
                    const themeStat = stats ? stats[theme.id] : null;
                    const hasStarted = !!themeStat;
                    const successRate = themeStat ? Math.round(themeStat.success_rate) : 0;
                    const qCount = themeCounts[theme.id];

                    return (
                        <Card
                            key={theme.id}
                            className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-transparent hover:border-t-[var(--color-primary)] flex flex-col"
                        >
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className={`p-2 rounded-lg bg-gray-50 ${theme.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>

                                {/* Compteur dynamique avec skeleton */}
                                {countsLoading ? (
                                    <div className="w-12 h-5 rounded-full bg-gray-100 animate-pulse" />
                                ) : (
                                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {qCount !== undefined ? `${qCount} Q` : '— Q'}
                                    </span>
                                )}
                            </CardHeader>

                            <CardContent className="flex-1">
                                <CardTitle className="mb-2 text-xl">{theme.title}</CardTitle>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {theme.description}
                                </p>

                                {/* Stats ou skeleton de progression */}
                                {statsLoading ? (
                                    <div className="mt-4 space-y-2 animate-pulse">
                                        <div className="h-3 w-full rounded bg-gray-100" />
                                        <div className="h-2 w-full rounded-full bg-gray-100" />
                                    </div>
                                ) : hasStarted ? (
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 font-medium">Réussite moyenne</span>
                                            <span className={`font-bold ${successRate >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                                {successRate}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-700 ${successRate >= 80 ? 'bg-green-500' : 'bg-orange-500'}`}
                                                style={{ width: `${successRate}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 text-right">
                                            {themeStat.attempts} session(s)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-sm text-gray-400 italic">Non commencé</p>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter>
                                <Link href={`/training/${theme.id}`} className="w-full">
                                    <Button
                                        variant={hasStarted ? 'secondary' : 'outline'}
                                        className="w-full justify-between group"
                                    >
                                        {hasStarted ? 'Continuer' : 'Commencer'}
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
