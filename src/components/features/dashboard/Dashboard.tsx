'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, Trophy, Target, TrendingUp, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserService } from '@/services/user.service';
import { NotificationService } from '@/services/notification.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton, StatsCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    const { user, userProfile, loading: authLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState({
        totalTests: 0,
        averageScore: 0,
        completedThemes: 0,
    });
    const [dataLoading, setDataLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<{ id: string; theme: string; date: string; score: string; status: string }[]>([]);
    const [certificateInfo, setCertificateInfo] = useState<{ eligible: boolean; progress: number; missingThemes: string[] }>({ eligible: false, progress: 0, missingThemes: [] });

    useEffect(() => {
        const loadDashboardData = async () => {
            if (user && userProfile) {
                setDataLoading(true);
                try {
                    const statsData = await UserService.getUserStats(user.uid, userProfile.track || undefined);
                    setStats({
                        totalTests: statsData.total_attempts,
                        averageScore: statsData.average_score,
                        completedThemes: Object.values(statsData.theme_stats).filter((s) => s.last_score >= 80).length,
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

                    const cert = await UserService.getCertificateStatus(user.uid);
                    setCertificateInfo(cert);

                    // Engagement: Vérifier l'inactivity (3j)
                    await NotificationService.checkInactivity(user, userProfile);
                } catch (error) {
                    console.error("Error loading dashboard data:", error);
                } finally {
                    setDataLoading(false);
                }
            }
        };

        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (userProfile) {
                if (!userProfile.track) {
                    console.log("[Dashboard] Track missing, redirecting to onboarding...");
                    router.push('/onboarding');
                } else {
                    loadDashboardData();
                }
            } else {
                // User is authenticated but profile is not yet in context
                // This happens during initial registration sync
                // We show the loader/skeleton while waiting
                console.log("[Dashboard] Waiting for userProfile...");
            }
        }
    }, [user, userProfile, authLoading, router]);

    // Shell rendering while auth is loading or user is being redirected
    if (authLoading || (!user && !authLoading)) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-8">
                <Skeleton width="40%" height="2.5rem" className="mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Skeleton height="350px" className="rounded-2xl" />
                    </div>
                    <div>
                        <Skeleton height="350px" className="rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.main
                key={userProfile?.track || 'dashboard'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="container mx-auto px-4 py-8"
                id="main-content"
            >
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Tableau de Bord</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-gray-500">
                            Bienvenue, <span className="font-semibold text-[var(--color-primary)]">{user.displayName || 'Candidat'}</span> !
                        </p>
                        {userProfile?.track && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100" aria-hidden="true">
                                Parcours : {userProfile.track === 'residence' ? 'Titre de Séjour' : 'Naturalisation'}
                            </span>
                        )}
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8" aria-label="Statistiques Globales">
                    {dataLoading ? (
                        <>
                            <StatsCardSkeleton />
                            <StatsCardSkeleton />
                            <StatsCardSkeleton />
                        </>
                    ) : (
                        <>
                            <Card role="region" aria-label="Total Attempts" className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tests Total</CardTitle>
                                    <FileText className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stats.totalTests}</div>
                                    <p className="text-xs text-green-600 font-medium mt-1">En progression</p>
                                </CardContent>
                            </Card>
                            <Card role="region" aria-label="Average Score" className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Score Moyen</CardTitle>
                                    <Award className="h-4 w-4 text-green-500" aria-hidden="true" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">{stats.averageScore}%</div>
                                    <p className="text-xs text-gray-400 mt-1">Objectif: 80%</p>
                                </CardContent>
                            </Card>
                            <Card role="region" aria-label="Themes Mastered" className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Maîtrise</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-purple-500" aria-hidden="true" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stats.completedThemes} / 5</div>
                                    <p className="text-xs text-gray-400 mt-1">Thèmes débloqués</p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Certification Progress Section */}
                {!dataLoading && (
                    <Card className="mb-8 border-none shadow-md bg-white overflow-hidden">
                        <div
                            className="h-2 w-full flex bg-gray-100/50"
                            role="progressbar"
                            aria-valuenow={Math.round(certificateInfo.progress)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Progression vers le certificat : ${Math.round(certificateInfo.progress)}%`}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${certificateInfo.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 relative"
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </motion.div>
                        </div>
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${certificateInfo.eligible ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Trophy className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Certificat de Réussite</h3>
                                    <p className="text-sm text-gray-500">
                                        {certificateInfo.eligible
                                            ? "Félicitations ! Votre certificat est prêt."
                                            : `Progrès : ${Math.round(certificateInfo.progress)}%. Maîtrisez tous les thèmes pour le débloquer.`}
                                    </p>
                                </div>
                            </div>
                            {certificateInfo.eligible ? (
                                <Link href="/profile">
                                    <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 shadow-lg shadow-amber-200">
                                        Voir mon certificat
                                    </Button>
                                </Link>
                            ) : (
                                <div className="flex -space-x-2">
                                    {['histoire', 'institutions', 'societe', 'vals_principes', 'droits'].map((t, idx) => {
                                        const isMastered = !certificateInfo.missingThemes.includes(t);
                                        return (
                                            <div key={t} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-sm ${isMastered ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`} title={t}>
                                                {t.substring(0, 3).toUpperCase()}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Actions Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {dataLoading ? (
                            <Skeleton height="400px" className="rounded-2xl" />
                        ) : (
                            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative min-h-[350px]">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-3xl" />

                                <CardHeader className="relative z-10">
                                    <CardTitle className="text-2xl sm:text-4xl font-black mb-2">
                                        {userProfile?.track === 'naturalisation' ? 'Expertise Naturalisation' : 'Objectif Titre de Séjour'}
                                    </CardTitle>
                                    <p className="text-blue-100 max-w-md">Préparez-vous efficacement avec nos modules d'entraînement spécialisés.</p>
                                </CardHeader>

                                <CardContent className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link href="/training" className="group">
                                        <div className="bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all p-5 rounded-2xl border border-white/20 h-full flex flex-col justify-between">
                                            <div>
                                                <Target className="h-8 w-8 mb-4 text-blue-200" />
                                                <h3 className="text-xl font-bold mb-1">Entraînement</h3>
                                                <p className="text-sm text-blue-100/80 mb-6">Pratique par thématique avec corrections détaillées.</p>
                                            </div>
                                            <div className="inline-flex items-center text-sm font-bold bg-white text-blue-600 px-4 py-2 rounded-lg self-start">
                                                Démarrer
                                            </div>
                                        </div>
                                    </Link>

                                    {userProfile?.track === 'residence' ? (
                                        <Link href="/exam" className="group">
                                            <div className="bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all p-5 rounded-2xl border border-white/20 h-full flex flex-col justify-between">
                                                <div>
                                                    <Clock className="h-8 w-8 mb-4 text-red-200" />
                                                    <h3 className="text-xl font-bold mb-1">Examen Blanc</h3>
                                                    <p className="text-sm text-blue-100/80 mb-6">Conditions réelles : 40 questions, timer 45 min.</p>
                                                </div>
                                                <div className="inline-flex items-center text-sm font-bold bg-red-500 text-white px-4 py-2 rounded-lg self-start">
                                                    Lancer
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <Link href="/training/culture" className="group">
                                            <div className="bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all p-5 rounded-2xl border border-white/20 h-full flex flex-col justify-between">
                                                <div>
                                                    <Trophy className="h-8 w-8 mb-4 text-yellow-200" />
                                                    <h3 className="text-xl font-bold mb-1">Quiz Culture G</h3>
                                                    <p className="text-sm text-blue-100/80 mb-6">Maîtrisez les dates clés et les symboles républicains.</p>
                                                </div>
                                                <div className="inline-flex items-center text-sm font-bold bg-yellow-500 text-white px-4 py-2 rounded-lg self-start">
                                                    Explorer
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Secondary Navigation Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Review Card */}
                            <Link href="/training" className="group">
                                <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-orange-50/50">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                                            <AlertCircle className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-900">Réviser mes erreurs</h4>
                                            <p className="text-xs text-gray-500 truncate">Reprenez les questions manquées.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            {/* Stats Card */}
                            <Link href="/profile" className="group">
                                <Card className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-indigo-50/50">
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                                            <TrendingUp className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-900">Ma Progression</h4>
                                            <p className="text-xs text-gray-500 truncate">Voir mes scores détaillés.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-6">
                        <Card className="border-none shadow-sm overflow-hidden bg-white">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold" id="recent-activity-title">Activité Récente</CardTitle>
                                <TrendingUp className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </CardHeader>
                            <CardContent aria-labelledby="recent-activity-title">
                                {dataLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton height="60px" />
                                        <Skeleton height="60px" />
                                        <Skeleton height="60px" />
                                    </div>
                                ) : recentActivity.length > 0 ? (
                                    <ul className="space-y-3">
                                        {recentActivity.slice(0, 5).map((activity) => (
                                            <li key={activity.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate text-gray-800">{activity.theme}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{activity.date}</p>
                                                </div>
                                                <div className={`text-xs font-black px-2 py-1 rounded-lg ${activity.status === 'success' ? 'text-green-600 bg-green-100' :
                                                    activity.status === 'warning' ? 'text-orange-600 bg-orange-100' :
                                                        'text-red-600 bg-red-100'
                                                    }`}>
                                                    {activity.score}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-3">
                                            <AlertCircle className="h-6 w-6 text-gray-300" />
                                        </div>
                                        <p className="text-sm text-gray-400 italic">Aucune activité enregistrée.</p>
                                        <Link href="/training" className="text-blue-600 text-xs font-bold hover:underline mt-2 inline-block">
                                            Lancer un test
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tip Card */}
                        <Card className="border-none shadow-sm bg-[var(--color-primary)] text-white overflow-hidden p-6 relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                            <h4 className="font-black text-sm uppercase tracking-widest mb-2 text-blue-200">Conseil Pro</h4>
                            <p className="text-sm font-medium leading-relaxed">
                                Un score de 80% ou plus indique une bonne maîtrise du sujet. Concentrez-vous sur les thèmes en dessous de 50%.
                            </p>
                        </Card>
                    </aside>
                </div>
            </motion.main>
        </AnimatePresence>
    );
}

// Custom internal component for help icon
function Award(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
    );
}

// Standard Button import from your UI might be missing or different, using a simple styled div for now if needed or ensuring import.
