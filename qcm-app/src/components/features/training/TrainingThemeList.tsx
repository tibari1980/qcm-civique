'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Book, Scale, Landmark, Globe, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserService } from '@/services/user.service';

const themes = [
    {
        id: 'principes',
        title: 'Principes et Valeurs',
        description: 'La Marseillaise, la devise, la laïcité et les symboles de la République.',
        icon: Scale,
        color: 'text-blue-600',
        questionsCount: 50
    },
    {
        id: 'institutions',
        title: 'Institutions Françaises',
        description: 'Le Président, le Parlement, les collectivités territoriales et l\'UE.',
        icon: Landmark,
        color: 'text-red-600',
        questionsCount: 45
    },
    {
        id: 'histoire',
        title: 'Histoire et Géographie',
        description: 'Les grandes dates de l\'histoire de France et sa géographie physique et humaine.',
        icon: Globe,
        color: 'text-green-600',
        questionsCount: 60
    },
    {
        id: 'societe',
        title: 'Vie en Société',
        description: 'Santé, éducation, emploi, logement et vie quotidienne en France.',
        icon: Users,
        color: 'text-orange-600',
        questionsCount: 40
    },
    {
        id: 'droits',
        title: 'Droits et Devoirs',
        description: 'Les droits fondamentaux et les devoirs du citoyen responsable.',
        icon: Book,
        color: 'text-purple-600',
        questionsCount: 35
    }
];

export default function TrainingThemeList() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = React.useState<any>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Fetch User Stats to make cards dynamic
    useEffect(() => {
        const fetchStats = async () => {
            if (user) {
                try {
                    const data = await UserService.getUserStats(user.uid, userProfile?.track || undefined);
                    setStats(data.theme_stats);
                } catch (error) {
                    console.error("Error fetching stats for training page", error);
                }
            }
        };
        fetchStats();
    }, [user, userProfile]);

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Chargement...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Entraînement par Thème</h1>
                <p className="text-gray-600">Choisissez un sujet pour approfondir vos connaissances.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme) => {
                    const Icon = theme.icon;
                    // Get stats for this specific theme
                    // Note: theme.id matches the keys in theme_stats (e.g. 'principes', 'histoire')
                    const themeStat = stats ? stats[theme.id] : null;
                    const hasStarted = !!themeStat;
                    const successRate = themeStat ? Math.round(themeStat.success_rate) : 0;

                    return (
                        <Card key={theme.id} className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-transparent hover:border-t-[var(--color-primary)] flex flex-col">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className={`p-2 rounded-lg bg-gray-50 ${theme.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                    {theme.questionsCount} Q
                                </span>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <CardTitle className="mb-2 text-xl">{theme.title}</CardTitle>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {theme.description}
                                </p>

                                {/* Dynamic Progress Section */}
                                {hasStarted ? (
                                    <div className="mt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 font-medium">Réussite moyenne</span>
                                            <span className={`font-bold ${successRate >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                                                {successRate}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${successRate >= 80 ? 'bg-green-500' : 'bg-orange-500'}`}
                                                style={{ width: `${successRate}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-400 text-right">Based on {themeStat.attempts} sessions</p>
                                    </div>
                                ) : (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-sm text-gray-400 italic">Non commencé</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Link href={`/training/${theme.id}`} className="w-full">
                                    <Button variant={hasStarted ? "secondary" : "outline"} className="w-full justify-between group">
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
