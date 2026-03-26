'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Clock, Trophy, Target, TrendingUp, AlertCircle, FileText, CheckCircle2, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton, StatsCardSkeleton } from '../../ui/Skeleton';
import { Button } from '../../ui/button';
import { QuickActions } from './QuickActions';

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
                    router.push('/onboarding');
                } else {
                    loadDashboardData();
                }
            } else {
                // User is authenticated but profile is not yet in context — show skeleton while waiting
            }
        }
    }, [user, userProfile, authLoading, router]);

    // Shell rendering while auth is loading or user is being redirected
    if (authLoading || (!user && !authLoading)) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-8" role="status" aria-busy="true" aria-live="polite">
                <p className="sr-only">Chargement du tableau de bord, veuillez patienter…</p>
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
                <header className="mb-12 relative">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 backdrop-blur-sm border border-gray-100 shadow-sm mb-4" aria-hidden="true">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Plateforme Active</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                                Bonjour, <span className="text-primary">{user.displayName || 'Candidat'}</span>
                            </h1>
                            <p className="text-gray-500 text-lg font-medium mt-2">
                                Prêt à passer une nouvelle étape vers votre citoyenneté ?
                            </p>
                        </div>
                        {userProfile?.track && (
                            <div className="premium-card-3d bg-white px-6 py-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600" aria-hidden="true">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Parcours Actuel</p>
                                    <p className="font-bold text-gray-900">{userProfile.track === 'residence' ? 'Titre de Séjour' : 'Naturalisation'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12" aria-label="Statistiques Globales">
                    {dataLoading ? (
                        <>
                            <StatsCardSkeleton />
                            <StatsCardSkeleton />
                            <StatsCardSkeleton />
                        </>
                    ) : (
                        <>
                            <Card role="region" aria-label="Nombre total de tests" className="premium-card-3d border-none bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tests Total</CardTitle>
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500" aria-hidden="true">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-gray-900">{stats.totalTests}</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">En hausse</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card role="region" aria-label="Score moyen" className="premium-card-3d border-none bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score Moyen</CardTitle>
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500" aria-hidden="true">
                                        <Award className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-green-600">{stats.averageScore}%</div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Objectif : 80%</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card role="region" aria-label="Thèmes maîtrisés" className="premium-card-3d border-none bg-white">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Maîtrise</CardTitle>
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500" aria-hidden="true">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-gray-900">{stats.completedThemes} <span className="text-gray-300 text-2xl">/ 5</span></div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex -space-x-1.5">
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className={`w-3 h-3 rounded-full border border-white ${i <= stats.completedThemes ? 'bg-purple-500' : 'bg-gray-200'}`} />
                                            ))}
                                        </div>
                                    </div>
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
                                <div className={`p-4 rounded-2xl ${certificateInfo.eligible ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`} aria-hidden="true">
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
                                            <div key={t} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-sm ${isMastered ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`} title={t} role="img" aria-label={`${t}: ${isMastered ? 'maîtrisé' : 'non maîtrisé'}`}>
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
                    <div className="lg:col-span-2">
                        <section className="mt-4" aria-labelledby="quick-actions-title">
                            <h2 id="quick-actions-title" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 pl-1">Actions Prioritaires</h2>
                            <QuickActions />
                        </section>
                    </div>
                    {/* Sidebar Area */}
                    <aside className="space-y-6" aria-label="Informations complémentaires">
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
                                        <div className="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-3" aria-hidden="true">
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
                        <Card className="border-none shadow-sm bg-[var(--color-primary)] text-white overflow-hidden p-6 relative" role="complementary" aria-label="Conseil pratique">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" aria-hidden="true" />
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
