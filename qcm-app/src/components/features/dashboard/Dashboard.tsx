'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trophy, Target, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserService } from '@/services/user.service';

export default function Dashboard() {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    // In a real app, we would fetch these from Firestore based on user.uid
    const [stats, setStats] = useState({
        totalTests: 0,
        averageScore: 0,
        completedThemes: 0,
    });

    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (user && userProfile) {
                try {
                    const statsData = await UserService.getUserStats(user.uid, userProfile.track || undefined);
                    setStats({
                        totalTests: statsData.total_attempts,
                        averageScore: statsData.average_score,
                        completedThemes: Object.values(statsData.theme_stats).filter((s: any) => s.success_rate >= 75 || s.last_score >= 80).length,
                    });

                    const activity = await UserService.getRecentActivity(user.uid);
                    const formattedActivity = activity.map(a => {
                        const date = new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                        const percentage = (a.score / a.total_questions) * 100;
                        let status = 'neutral';
                        if (percentage >= 80) status = 'success';
                        else if (percentage < 50) status = 'fail';
                        else status = 'warning';

                        return {
                            id: a.id,
                            theme: a.theme ? `Thème: ${a.theme}` : (a.exam_type === 'naturalisation' ? 'Entretien' : 'Examen Blanc'),
                            date: date,
                            score: `${a.score}/${a.total_questions}`,
                            status: status
                        };
                    });
                    setRecentActivity(formattedActivity);
                } catch (error) {
                    console.error("Error loading dashboard data:", error);
                }
            }
        };

        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (userProfile && !userProfile.track) {
                router.push('/onboarding');
            } else {
                loadDashboardData();
            }
        }
    }, [user, userProfile, loading, router]);

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Chargement...</div>;
    }

    return (
        <main className="container mx-auto px-4 py-8" id="main-content">
            <h1 className="text-3xl font-bold mb-2">Tableau de Bord</h1>
            <p className="text-gray-500 mb-8" aria-label={`Bienvenue, ${user.displayName || 'Candidat'}. Parcours : ${userProfile?.track === 'residence' ? 'Titre de Séjour' : 'Naturalisation'}.`}>
                Bienvenue, <span className="font-semibold text-[var(--color-primary)]">{user.displayName || 'Candidat'}</span> !
                {userProfile?.track && (
                    <span className="ml-4 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600" aria-hidden="true">
                        Parcours : {userProfile.track === 'residence' ? 'Titre de Séjour' : 'Naturalisation'}
                    </span>
                )}
            </p>

            {/* Stats Cards - Live Region for meaningful updates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" aria-label="Statistiques Globales">
                <Card role="region" aria-label="Tests Réalisés">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tests Réalisés</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTests}</div>
                        <p className="text-xs text-muted-foreground">Commencez votre premier test !</p>
                    </CardContent>
                </Card>
                <Card role="region" aria-label="Score Moyen">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[var(--color-primary)]">{stats.averageScore}%</div>
                        <p className="text-xs text-muted-foreground">Objectif: 80%</p>
                    </CardContent>
                </Card>
                <Card role="region" aria-label="Thèmes Maîtrisés">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Thèmes Maîtrisés</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedThemes} / 5</div>
                        <p className="text-xs text-muted-foreground">Continuez vos efforts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action - Start Training */}
                <section className="lg:col-span-2" aria-labelledby="actions-heading">
                    <h2 id="actions-heading" className="sr-only">Actions Rapides</h2>
                    <Card className="h-full bg-gradient-to-br from-[var(--color-primary)] to-blue-700 text-white border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                {userProfile?.track === 'naturalisation' ? 'Préparez votre Entretien' : 'Prêt pour une session QCM ?'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Common QCM Training */}
                                <Link href="/training" className="block h-full group focus:outline-none">
                                    <div className="h-full bg-white text-gray-900 rounded-xl p-6 transition-all hover:shadow-lg group-focus:ring-4 group-focus:ring-blue-300">
                                        <div className="flex items-center text-lg font-bold mb-4">
                                            <span className="bg-blue-100 p-2 rounded-full mr-3 text-[var(--color-primary)]" aria-hidden="true">
                                                <Target className="w-5 h-5" />
                                            </span>
                                            Mode Entraînement
                                        </div>
                                        <p className="text-gray-500 mb-4 text-sm">Entraînez-vous par thématique (Histoire, Valeurs, Institutions...)</p>
                                        <div className={`w-full py-2 px-4 rounded-md text-center font-medium transition-colors ${userProfile?.track === 'residence' ? 'bg-[var(--color-primary)] text-white group-hover:bg-blue-700' : 'bg-gray-100 text-gray-900 group-hover:bg-gray-200'}`}>
                                            Commencer
                                        </div>
                                    </div>
                                </Link>

                                {/* Exam Mode */}
                                {userProfile?.track === 'residence' && (
                                    <Link href="/exam" className="block h-full group focus:outline-none">
                                        <div className="h-full bg-white text-gray-900 rounded-xl p-6 transition-all hover:shadow-lg group-focus:ring-4 group-focus:ring-red-300">
                                            <div className="flex items-center text-lg font-bold mb-4">
                                                <span className="bg-red-100 p-2 rounded-full mr-3 text-red-600" aria-hidden="true">
                                                    <Clock className="w-5 h-5" />
                                                </span>
                                                Examen Blanc
                                            </div>
                                            <p className="text-gray-500 mb-4 text-sm">Simulation réelle (40 questions, 45 minutes).</p>
                                            <div className="w-full py-2 px-4 rounded-md text-center font-medium bg-red-600 text-white group-hover:bg-red-700 transition-colors">
                                                Lancer l'examen
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Interview Simulator */}
                                {userProfile?.track === 'naturalisation' && (
                                    <Link href="/interview" className="block h-full group focus:outline-none">
                                        <div className="h-full bg-white text-gray-900 rounded-xl p-6 transition-all hover:shadow-lg group-focus:ring-4 group-focus:ring-purple-300">
                                            <div className="flex items-center text-lg font-bold mb-4">
                                                <span className="bg-purple-100 p-2 rounded-full mr-3 text-purple-600" aria-hidden="true">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                                </span>
                                                Simulateur Entretien
                                            </div>
                                            <p className="text-gray-500 mb-4 text-sm">Questions orales fréquentes (Motivations, Culture...).</p>
                                            <div className="w-full py-2 px-4 rounded-md text-center font-medium bg-purple-600 text-white group-hover:bg-purple-700 transition-colors">
                                                S'entraîner à l'oral
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Culture G */}
                                {userProfile?.track === 'naturalisation' && (
                                    <Link href="/training/culture" className="block h-full group focus:outline-none">
                                        <div className="h-full bg-white text-gray-900 rounded-xl p-6 transition-all hover:shadow-lg group-focus:ring-4 group-focus:ring-yellow-300">
                                            <div className="flex items-center text-lg font-bold mb-4">
                                                <span className="bg-yellow-100 p-2 rounded-full mr-3 text-yellow-600" aria-hidden="true">
                                                    <Trophy className="w-5 h-5" />
                                                </span>
                                                Culture Générale
                                            </div>
                                            <p className="text-gray-500 mb-4 text-sm">Géographie, Histoire, Symboles de la France.</p>
                                            <div className="w-full py-2 px-4 rounded-md text-center font-medium border border-gray-300 text-gray-700 group-hover:bg-gray-50 transition-colors">
                                                Réviser
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </section>


                {/* Vertical Stack for Review & Activity */}
                <aside className="space-y-8" aria-label="Barre latérale">
                    {/* Review Mode Card */}
                    <Link href="/review" className="block group focus:outline-none" aria-label="Accéder au Mode Révision">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-orange-50 border-orange-200 group-focus:ring-4 group-focus:ring-orange-300">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center text-lg text-orange-800">
                                    <span className="bg-orange-100 p-2 rounded-full mr-3 text-orange-600" aria-hidden="true">
                                        <AlertCircle className="w-5 h-5" />
                                    </span>
                                    Mode Révision
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-orange-700 mb-4 text-sm">Retravaillez vos erreurs passées pour ne plus les commettre.</p>
                                <div className="w-full py-2 px-4 rounded-md text-center font-medium border border-orange-300 text-orange-700 group-hover:bg-orange-100 transition-colors">
                                    Corriger mes fautes
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Recent Activity List */}
                    <Card className="h-full" role="region" aria-label="Historique d'activité">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" aria-hidden="true" />
                                Activité Récente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentActivity.length > 0 ? (
                                <ul className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <li key={activity.id} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0" tabIndex={0}>
                                            <div>
                                                <p className="font-medium text-sm">{activity.theme}</p>
                                                <p className="text-xs text-gray-500">Le {activity.date}</p>
                                            </div>
                                            <div className={`text-sm font-bold ${activity.status === 'success' ? 'text-green-600' :
                                                activity.status === 'fail' ? 'text-red-600' : 'text-orange-500'
                                                }`} aria-label={`Score : ${activity.score}`}>
                                                {activity.score}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    Aucune activité récente.
                                    <br />
                                    <Link href="/training" className="text-[var(--color-primary)] hover:underline focus:ring-2 focus:ring-blue-300 rounded px-1">
                                        Commencer un test
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </main>
    );
}
