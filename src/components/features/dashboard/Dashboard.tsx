'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Trophy, Target, TrendingUp, AlertCircle, FileText, CheckCircle2, BookOpen, GraduationCap, Flame, Star, Activity, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton, StatsCardSkeleton } from '../../ui/Skeleton';
import { Button } from '../../ui/button';
import { QuickActions } from './QuickActions';
import dynamic from 'next/dynamic';

const DashboardAnalytics = dynamic(() => import('./DashboardAnalytics'), {
    ssr: false,
    loading: () => <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"><Skeleton height="300px" /><Skeleton height="300px" /></div>
});

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
    
    // Nouveaux états analytiques
    const [scoreHistory, setScoreHistory] = useState<{name: string, score: number, theme: string}[]>([]);
    const [themeStats, setThemeStats] = useState<{name: string, score: number, color: string}[]>([]);
    const [streakDays, setStreakDays] = useState(0);
    const [xpAmount, setXpAmount] = useState(0);
    const [playSimulation, setPlaySimulation] = useState(false);

    const THEME_COLORS: Record<string, string> = {
        'histoire': '#3b82f6', // blue
        'institutions': '#8b5cf6', // purple
        'societe': '#f59e0b', // amber
        'vals_principes': '#ef4444', // red
        'droits': '#10b981', // green
    };

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

                    // Calcul de l'XP
                    setXpAmount(statsData.total_attempts * 150 + Math.round(statsData.average_score) * 10);

                    // Calcul des stats thématiques pour le graphique Barycentrique
                    const parsedThemeStats = Object.keys(statsData.theme_stats).map(key => {
                        return {
                            name: key.length > 8 ? key.substring(0, 8) + '...' : key,
                            score: statsData.theme_stats[key].last_score,
                            color: THEME_COLORS[key] || '#cbd5e1'
                        }
                    });
                    setThemeStats(parsedThemeStats);

                    const activity = await UserService.getRecentActivity(user.uid, 15);
                    const formattedActivity = activity.map(a => {
                        const date = new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                        const percentage = a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0;
                        let status = 'neutral';
                        if (percentage >= 80) status = 'success';
                        else if (percentage < 50) status = 'fail';
                        else status = 'warning';

                        return {
                            id: a.id,
                            theme: a.theme ? a.theme : (a.exam_type === 'naturalisation' ? 'Entretien' : 'Examen Blanc'),
                            date: date,
                            score: `${a.score}/${a.total_questions}`,
                            percent: Math.round(percentage),
                            status: status,
                            createdAt: a.created_at
                        };
                    });
                    setRecentActivity(formattedActivity.slice(0, 5)); // Keep bottom list short

                    // Chart Data (History)
                    const historyChartData = [...formattedActivity].reverse().map(a => ({
                        name: a.date,
                        score: a.percent,
                        theme: a.theme
                    }));
                    setScoreHistory(historyChartData);

                    // Streak Calculation (Jours consécutifs)
                    const dates = [...new Set(activity.map(a => new Date(a.created_at).setHours(0,0,0,0)))].sort((a,b)=>b-a);
                    let streak = 0;
                    let todayMidnight = new Date().setHours(0,0,0,0);
                    let yesterdayMidnight = todayMidnight - 86400000;
                    let currentCheckDate = todayMidnight;

                    if (dates.includes(todayMidnight) || dates.includes(yesterdayMidnight)) {
                        if (dates.includes(yesterdayMidnight) && !dates.includes(todayMidnight)) {
                            currentCheckDate = yesterdayMidnight;
                        }
                        for (const d of dates) {
                            if (d === currentCheckDate) {
                                streak++;
                                currentCheckDate -= 86400000;
                            } else if (d < currentCheckDate) {
                                break;
                            }
                        }
                    }
                    setStreakDays(streak);

                    const cert = await UserService.getCertificateStatus(user.uid, userProfile.track || 'csp');
                    setCertificateInfo(cert);

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
            }
        }
    }, [user, userProfile, authLoading, router]);

    // Extracted Analytics logic into dynamic component

    if (authLoading || (!user && !authLoading)) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-8" role="status" aria-busy="true" aria-live="polite">
                <Skeleton width="40%" height="2.5rem" className="mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
                    <StatsCardSkeleton />
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
                className="container mx-auto px-4 py-8 lg:px-8"
                id="main-content"
            >
                {/* Header Premium */}
                <header className="mb-10 relative bg-mesh-republic p-6 md:p-10 rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20" aria-hidden="true" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white shadow-sm mb-4" aria-hidden="true">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">En Ligne</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                Bonjour, <span className="text-gradient-republic">{user.displayName || 'Candidat'}</span>
                            </h1>
                            <p className="text-slate-500 text-lg font-medium mt-2 max-w-xl">
                                Un grand pas de plus vers votre {userProfile?.track === 'naturalisation' ? 'Nationalité Française' : 'Titre de Séjour'} ! On y va ?
                            </p>
                        </div>
                        
                        {/* Badges de Gamification */}
                        <div className="flex gap-4 items-center">
                            <div className="glass-premium bg-white px-5 py-3 rounded-2xl flex flex-col items-center shadow-3d-sm border-orange-100">
                                <div className="flex items-center gap-2 text-orange-500">
                                    <Flame className="h-6 w-6 fill-current"/>
                                    <span className="text-2xl font-black">{streakDays}</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Jours de suite</span>
                            </div>
                            <div className="glass-premium bg-white px-5 py-3 rounded-2xl flex flex-col items-center shadow-3d-sm border-blue-100">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <Star className="h-6 w-6 fill-current"/>
                                    <span className="text-2xl font-black">{xpAmount}</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Total XP</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    {dataLoading ? (
                        <><StatsCardSkeleton/><StatsCardSkeleton/><StatsCardSkeleton/></>
                    ) : (
                        <>
                            <Card className="premium-card-3d border-none bg-white hover-rotate-3d transition-all duration-500">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entraînements</CardTitle>
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm" aria-hidden="true">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-slate-900">{stats.totalTests}</div>
                                    <p className="text-xs font-bold text-slate-400 mt-2">Sessions complétées</p>
                                </CardContent>
                            </Card>
                            <Card className="premium-card-3d border-none bg-white hover-rotate-3d transition-all duration-500 delay-75">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Moyen</CardTitle>
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shadow-sm" aria-hidden="true">
                                        <Target className="h-5 w-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-green-600">{stats.averageScore}%</div>
                                    <p className={`text-xs font-bold mt-2 ${stats.averageScore >= 80 ? 'text-green-500' : 'text-orange-500'}`}>
                                        {stats.averageScore >= 80 ? 'Excellent niveau !' : 'Objectif cible : 80%'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="premium-card-3d border-none bg-white hover-rotate-3d transition-all duration-500 delay-150">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maîtrise Thématique</CardTitle>
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-sm" aria-hidden="true">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-slate-900">{stats.completedThemes} <span className="text-slate-300 text-2xl">/ 5</span></div>
                                    <div className="flex items-center gap-1.5 mt-3">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= stats.completedThemes ? 'bg-purple-500' : 'bg-slate-100'}`} />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* VISUAL ANALYTICS (Recharts Dynamically Loaded) */}
                {!dataLoading && (scoreHistory.length > 0 || themeStats.length > 0) && (
                    <DashboardAnalytics scoreHistory={scoreHistory} themeStats={themeStats} />
                )}

                {/* Certification Progress Section */}
                {!dataLoading && (
                    <Card className="mb-8 premium-card-3d border-none shadow-3d-sm bg-white overflow-hidden">
                        <div
                            className="h-2 w-full flex bg-slate-100"
                            role="progressbar"
                            aria-valuenow={Math.round(certificateInfo.progress)}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${certificateInfo.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 relative"
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </motion.div>
                        </div>
                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-2xl shadow-inner ${certificateInfo.eligible ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-amber-200/50' : 'bg-slate-100 text-slate-400'}`}>
                                    <Trophy className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Certificat de Réussite</h3>
                                    <p className="text-sm text-slate-500 font-medium mt-1">
                                        {certificateInfo.eligible
                                            ? "Incroyable ! 🎉 Vous êtes officiellement prêt(e) à affronter l'examen réel les yeux fermés."
                                            : `Vous y êtes presque (${Math.round(certificateInfo.progress)}%) ! 💪 Ciblez les zones rouges pour décrocher ce précieux sésame.`}
                                    </p>
                                </div>
                            </div>
                            {certificateInfo.eligible && (
                                <Button onClick={() => router.push('/profile')} className="bg-amber-500 hover:bg-amber-600 text-white font-black text-lg h-14 px-8 rounded-2xl shadow-lg shadow-amber-200">
                                    Voir mon certificat
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Roadmap */}
                        {!dataLoading && !certificateInfo.eligible && (
                            <motion.section 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-1">Votre Route vers le Succès</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { step: 1, label: "Pratiquer", desc: "Séries thématiques ciblées.", icon: BookOpen, color: "blue" },
                                        { step: 2, label: "Maîtriser", desc: "Objectif 80% de réussite locale.", icon: Target, color: "indigo" },
                                        { step: 3, label: "Valider", desc: "Examen blanc officiel 30 questions.", icon: CheckCircle2, color: "green" },
                                        { step: 4, label: "Certifier", desc: "Avis favorable de l'algorithme.", icon: Trophy, color: "amber" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="glass-card bg-white p-6 relative group overflow-hidden rounded-2xl">
                                            <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform`} />
                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center font-black shadow-inner`}>
                                                    {item.step}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-lg">{item.label}</h4>
                                                    <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                        
                        {/* Simulation Video Section (Exclusive to Naturalisation) */}
                        {userProfile?.track === 'naturalisation' && (
                            <motion.section 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                aria-labelledby="video-simulation-title"
                            >
                                <h2 id="video-simulation-title" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-1">Préparation à l&apos;Entretien</h2>
                                <Card className="premium-card-3d border-none shadow-3d-md bg-white overflow-hidden p-0 relative group">
                                     <div className="aspect-video w-full border-b border-slate-100 bg-slate-900 overflow-hidden relative">
                                           {!playSimulation ? (
                                             <div 
                                               className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors group/sim"
                                               onClick={() => setPlaySimulation(true)}
                                             >
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900/80 z-0" />
                                                <div className="relative z-10 flex flex-col items-center gap-4 text-white">
                                                   <div className="w-16 h-16 rounded-full bg-blue-600/20 backdrop-blur-md flex items-center justify-center border border-blue-400/30 group-hover/sim:scale-110 transition-transform">
                                                      <PlayCircle className="w-8 h-8 fill-blue-500" />
                                                   </div>
                                                   <span className="text-xs font-black uppercase tracking-widest opacity-80">Lancer la Simulation Vidéo</span>
                                                </div>
                                             </div>
                                           ) : (
                                             <iframe 
                                                  src="https://docs.google.com/file/d/18dK1eG_IeISQe01hBi_m0cCmgqV8gP80/preview" 
                                                  allow="autoplay" 
                                                  className="absolute top-0 left-0 w-full h-full border-none" 
                                                  title="Vidéo de simulation de l'entretien de naturalisation"
                                                  loading="lazy"
                                                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups-to-escape-sandbox"
                                             />
                                           )}
                                     </div>
                                     <CardContent className="p-6">
                                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                               <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner flex-shrink-0">
                                                    <PlayCircle className="w-6 h-6" />
                                               </div>
                                               <div className="flex-1">
                                                    <h3 className="text-xl font-black text-slate-900">Simulation Complète</h3>
                                                    <p className="text-sm text-slate-500 font-medium mt-1">Visionnez cette vidéo interactive pour comprendre les attentes de l&apos;agent de préfecture et vous familiariser avec le déroulement de l&apos;entretien.</p>
                                               </div>
                                          </div>
                                     </CardContent>
                                </Card>
                            </motion.section>
                        )}

                        <section aria-labelledby="quick-actions-title">
                            <h2 id="quick-actions-title" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-1">Lancez-vous</h2>
                            <QuickActions />
                        </section>
                    </div>
                    
                    {/* Activity Feed Sidebar */}
                    <aside className="space-y-6">
                        <Card className="premium-card-3d bg-white border-none shadow-3d-sm p-6 overflow-visible">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center justify-between">
                                Historique
                                <TrendingUp className="h-4 w-4 text-slate-300" />
                            </h3>
                            {dataLoading ? (
                                <div className="space-y-4"><Skeleton height="60px" /><Skeleton height="60px" /></div>
                            ) : recentActivity.length > 0 ? (
                                <ul className="space-y-3 relative">
                                    <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>
                                    {recentActivity.map((activity, idx) => (
                                        <li key={activity.id} className="relative z-10 flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors group">
                                            <div className={`w-3 h-3 rounded-full flex-shrink-0 border-2 border-white shadow-sm ring-2 ${activity.status === 'success' ? 'bg-green-500 ring-green-100' :
                                                activity.status === 'warning' ? 'bg-orange-500 ring-orange-100' : 'bg-red-500 ring-red-100'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black truncate text-slate-800">{activity.theme}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{activity.date}</p>
                                            </div>
                                            <div className={`text-sm font-black px-3 py-1 rounded-lg ${activity.status === 'success' ? 'text-green-700 bg-green-50' :
                                                activity.status === 'warning' ? 'text-orange-700 bg-orange-50' : 'text-red-700 bg-red-50'}`}>
                                                {activity.score}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-10 bg-slate-50 rounded-2xl">
                                    <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm text-slate-400 font-medium">L'entraînement commence ici.</p>
                                </div>
                            )}
                        </Card>

                        {/* Tip Card */}
                        <Card className="premium-card-3d border-none shadow-3d-md bg-gradient-to-br from-primary to-blue-800 text-white p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-3 text-blue-200">Recommandation IA</h4>
                            <p className="text-sm font-medium leading-relaxed">
                                💡 <strong>Le conseil de notre IA</strong> : La régularité, c'est la clé ! Entraînez-vous 3 jours de suite et vos chances de réussite exploseront de 85% le jour J.
                            </p>
                        </Card>
                    </aside>
                </div>
            </motion.main>
        </AnimatePresence>
    );
}
