'use client';

import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { AdminService } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';
import { useSettings } from '@/context/SettingsContext';

const TRACK_LABELS: Record<string, string> = {
    residence: 'Résidence',
    naturalisation: 'Naturalisation',
};

export default function AdminStatsPage() {
    useAdminGuard();
    const { settings } = useSettings();
    const [themeStats, setThemeStats] = useState<{ theme: string; avgScore: number; count: number }[]>([]);
    const [trackDist, setTrackDist] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const brandColor = settings.brandColor || '#002394';
    const PIE_COLORS = [brandColor, '#3b5bdb', '#4c6ef5', '#748ffc', '#a5b4fc'];

    useEffect(() => {
        Promise.all([
            AdminService.getThemeStats(),
            AdminService.getAllUsers(200),
        ]).then(([ts, users]) => {
            setThemeStats(ts);
            // Distribution des parcours
            const dist: Record<string, number> = {};
            users.forEach(u => {
                const key = u.track || 'non défini';
                dist[key] = (dist[key] || 0) + 1;
            });
            setTrackDist(Object.entries(dist).map(([k, v]) => ({
                name: TRACK_LABELS[k] || k,
                value: v,
            })));
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center py-20">
            <div
                className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: brandColor, borderTopColor: 'transparent' }}
            />
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Statistiques — {settings.appName}</h1>
                <p className="text-gray-500 text-sm mt-1">Analyse des performances globales</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Score moyen par thème */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-900 mb-5 text-[var(--color-primary)]">Score moyen par thème</h2>
                    {themeStats.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-12">Pas de données disponibles</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={themeStats} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                                <YAxis type="category" dataKey="theme" tick={{ fontSize: 11 }} width={100} />
                                <Tooltip formatter={(v) => `${v}%`} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="avgScore" name="Score moyen" fill={brandColor} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Distribution parcours */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <h2 className="font-semibold text-gray-900 mb-5">Distribution des parcours</h2>
                    {trackDist.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-12">Pas de données disponibles</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={trackDist} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                                    dataKey="value" nameKey="name" paddingAngle={3} label={({ name, percent }) =>
                                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                >
                                    {trackDist.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Table résumé thèmes */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden xl:col-span-2">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Détail par thème</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" aria-label="Statistiques par thème">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                    <th className="px-4 py-3 font-semibold text-gray-600">Thème</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Nb tentatives</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">Score moyen</th>
                                    <th className="px-4 py-3 font-semibold text-gray-600">Difficulté</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {themeStats.map(t => (
                                    <tr key={t.theme} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-[var(--color-primary-soft)] text-[var(--color-primary)] rounded-full text-xs font-medium">{t.theme}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700">{t.count}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={[
                                                'px-2 py-0.5 rounded-full text-xs font-semibold',
                                                t.avgScore >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            ].join(' ')}>
                                                {t.avgScore}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {t.avgScore < 50 ? '🔴 Difficile' : t.avgScore < 70 ? '🟡 Moyen' : '🟢 Bien maîtrisé'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
