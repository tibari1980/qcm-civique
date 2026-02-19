'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Users, FileQuestion, TrendingUp, Target,
    ChevronRight, Activity
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { AdminService, type GlobalStats, type DailyActivity } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';

/* KPI Card */
function KpiCard({ label, value, icon: Icon, color, sub }: {
    label: string; value: string | number; icon: React.ElementType;
    color: string; sub?: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

const THEME_COLORS = ['#002394', '#3b5bdb', '#4c6ef5', '#748ffc', '#a5b4fc'];

export default function AdminDashboardPage() {
    useAdminGuard();

    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [activity, setActivity] = useState<DailyActivity[]>([]);
    const [themeStats, setThemeStats] = useState<{ theme: string; avgScore: number; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            AdminService.getGlobalStats(),
            AdminService.getDailyActivity(7),
            AdminService.getThemeStats(),
        ]).then(([s, a, t]) => {
            setStats(s);
            setActivity(a);
            setThemeStats(t.slice(0, 5));
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="w-8 h-8 border-4 border-[#002394] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-500 text-sm mt-1">Vue globale de l&apos;application</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <KpiCard
                    label="Utilisateurs inscrits"
                    value={stats?.totalUsers ?? 0}
                    icon={Users}
                    color="bg-[#002394]"
                />
                <KpiCard
                    label="Questions actives"
                    value={stats?.activeQuestions ?? 0}
                    icon={FileQuestion}
                    color="bg-indigo-500"
                    sub={`sur ${stats?.totalQuestions ?? 0} total`}
                />
                <KpiCard
                    label="Tentatives totales"
                    value={stats?.totalAttempts ?? 0}
                    icon={Activity}
                    color="bg-violet-500"
                />
                <KpiCard
                    label="Score moyen global"
                    value={`${stats?.averageScore ?? 0}%`}
                    icon={Target}
                    color={
                        (stats?.averageScore ?? 0) >= 70
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                    }
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Activité 7 jours */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="h-5 w-5 text-[#002394]" aria-hidden="true" />
                        <h2 className="font-semibold text-gray-900">Tentatives — 7 derniers jours</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={activity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#002394" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#002394" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="attempts"
                                name="Tentatives"
                                stroke="#002394"
                                fill="url(#colorAttempts)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Score moyen par thème */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <Target className="h-5 w-5 text-[#002394]" aria-hidden="true" />
                        <h2 className="font-semibold text-gray-900">Score moyen par thème</h2>
                    </div>
                    {themeStats.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-12">Pas encore de données</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={themeStats} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="theme" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip formatter={(v) => `${v}%`} />
                                <Bar dataKey="avgScore" name="Score moyen" radius={[4, 4, 0, 0]}>
                                    {themeStats.map((_, i) => (
                                        <Cell key={i} fill={THEME_COLORS[i % THEME_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { href: '/admin/users', label: 'Gérer les utilisateurs', desc: 'Voir la liste, attribuer les rôles', icon: Users },
                    { href: '/admin/questions', label: 'Gérer les questions', desc: 'Créer, modifier, désactiver', icon: FileQuestion },
                    { href: '/admin/stats', label: 'Statistiques détaillées', desc: 'Analyse complète des performances', icon: TrendingUp },
                ].map(({ href, label, desc, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:border-[#002394]/30 hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#002394] transition-colors">
                            <Icon className="h-5 w-5 text-[#002394] group-hover:text-white transition-colors" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm">{label}</p>
                            <p className="text-xs text-gray-400 truncate">{desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#002394] transition-colors flex-shrink-0" aria-hidden="true" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
