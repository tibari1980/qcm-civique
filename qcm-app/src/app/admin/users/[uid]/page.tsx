'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, Target, CheckCircle, XCircle } from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { useAdminGuard } from '@/lib/adminGuard';

const TRACK_LABEL: Record<string, string> = {
    residence: '🏠 Résidence',
    naturalisation: '🇫🇷 Naturalisation',
};

export default function AdminUserDetailPage() {
    useAdminGuard();
    const { uid } = useParams<{ uid: string }>();
    const router = useRouter();
    const [data, setData] = useState<{
        profile: Record<string, unknown> | null;
        attempts: Record<string, unknown>[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;
        AdminService.getUserDetail(uid).then(d => {
            setData(d as typeof data);
            setLoading(false);
        });
    }, [uid]);

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#002394] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data?.profile) return (
        <div className="p-6 text-center text-gray-500">Utilisateur introuvable.</div>
    );

    const p = data.profile as Record<string, unknown>;
    const attempts = data.attempts as Array<{
        id: string; score: number; total_questions: number;
        theme?: string; created_at?: string; exam_type?: string;
    }>;

    const avgScore = attempts.length > 0
        ? Math.round(attempts.reduce((acc, a) => acc + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) / attempts.length)
        : 0;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#002394] mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Retour
            </button>

            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-[#002394] flex items-center justify-center text-white font-bold text-xl">
                        {String(p.displayName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{String(p.displayName || 'Anonyme')}</h1>
                        <span className={[
                            'text-xs px-2 py-0.5 rounded-full font-semibold',
                            p.role === 'admin' ? 'bg-blue-100 text-[#002394]' : 'bg-gray-100 text-gray-500',
                        ].join(' ')}>
                            {p.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        {String(p.email || '—')}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        {p.createdAt ? new Date(Number(p.createdAt)).toLocaleDateString('fr-FR') : '—'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Target className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        {p.track ? TRACK_LABEL[String(p.track)] || String(p.track) : 'Parcours non défini'}
                    </div>
                </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Tentatives', value: attempts.length },
                    { label: 'Score moyen', value: `${avgScore}%` },
                    { label: 'Réussites', value: attempts.filter(a => a.total_questions > 0 && (a.score / a.total_questions) >= 0.7).length },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-400 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Attempts list */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Historique des tentatives</h2>
                </div>
                {attempts.length === 0 ? (
                    <p className="text-center py-12 text-gray-400 text-sm">Aucune tentative enregistrée</p>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {attempts.map(a => {
                            const pct = a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0;
                            const pass = pct >= 70;
                            return (
                                <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                                    {pass
                                        ? <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                                        : <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" aria-hidden="true" />
                                    }
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 capitalize">
                                            {a.theme || a.exam_type || 'Examen'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : '—'}
                                        </p>
                                    </div>
                                    <span className={[
                                        'text-sm font-bold',
                                        pass ? 'text-emerald-600' : 'text-red-500',
                                    ].join(' ')}>
                                        {a.score}/{a.total_questions} · {pct}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
