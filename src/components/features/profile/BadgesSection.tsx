'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Award, Star, Shield, Trophy, Zap, Target, Crown, Lock } from 'lucide-react';
import { UserProgress } from '../../../types';
import { motion } from 'framer-motion';

interface Badge {
    id: string;
    title: string;
    description: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    color: string;
    isUnlocked: (stats: UserProgress, certStatus?: { eligible: boolean }) => boolean;
}

const BADGES: Badge[] = [
    {
        id: 'premier_pas',
        title: 'Premier Pas',
        description: 'Vous avez complété votre premier test d\'entraînement.',
        icon: Star,
        color: 'text-amber-600 bg-amber-50 border-amber-100 shadow-amber-200',
        isUnlocked: (stats) => stats.total_attempts >= 1
    },
    {
        id: 'citoyen_modele',
        title: 'Citoyen Modèle',
        description: 'Vous avez complété au moins 5 examens.',
        icon: Shield,
        color: 'text-blue-600 bg-blue-50 border-blue-100 shadow-blue-200',
        isUnlocked: (stats) => stats.total_attempts >= 5
    },
    {
        id: 'marathonien',
        title: 'Marathonien',
        description: 'Persévérance démontrée avec plus de 20 examens.',
        icon: Zap,
        color: 'text-purple-600 bg-purple-50 border-purple-100 shadow-purple-200',
        isUnlocked: (stats) => stats.total_attempts >= 20
    },
    {
        id: 'mention_bien',
        title: 'Mention Bien',
        description: 'Score moyen supérieur à 80% sur au moins 3 tests.',
        icon: Target,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-200',
        isUnlocked: (stats) => stats.total_attempts >= 3 && stats.average_score >= 80
    },
    {
        id: 'excellence',
        title: 'Excellence Civique',
        description: 'Score moyen supérieur à 90% sur au moins 5 tests.',
        icon: Trophy,
        color: 'text-yellow-700 bg-yellow-50 border-yellow-100 shadow-yellow-200',
        isUnlocked: (stats) => stats.total_attempts >= 5 && stats.average_score >= 90
    },
    {
        id: 'legende',
        title: 'Légende',
        description: 'Vous avez débloqué votre certificat de réussite global.',
        icon: Crown,
        color: 'text-red-600 bg-red-50 border-red-100 shadow-red-200',
        isUnlocked: (stats, certStatus) => !!certStatus?.eligible
    }
];

export default function BadgesSection({
    stats,
    certStatus
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stats?: any | null,
    certStatus?: { eligible: boolean } | null
}) {
    const unlockedBadges = useMemo(() => {
        if (!stats) return [];
        return BADGES.map(badge => ({
            ...badge,
            unlocked: badge.isUnlocked(stats as UserProgress, certStatus || undefined)
        }));
    }, [stats, certStatus]);

    if (!stats) return null;

    const unlockedCount = unlockedBadges.filter(b => b.unlocked).length;

    return (
        <Card className="premium-card-3d border-none bg-white p-2">
            <CardHeader className="p-6">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-xl shadow-3d-sm" aria-hidden="true">
                        <Award className="h-6 w-6 text-amber-600" />
                    </div>
                    Mes Badges & Trophées
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collection</span>
                        <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-black shadow-3d-sm">
                            {unlockedCount} / {BADGES.length}
                        </div>
                    </div>
                </CardTitle>
                <p className="text-sm text-slate-500 font-medium ml-12">
                    Votre progression civique récompensée par des distinctions uniques.
                </p>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                {unlockedBadges.map((badge, idx) => {
                    const Icon = badge.icon;
                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={badge.unlocked ? { y: -8, scale: 1.05 } : {}}
                            className={`relative group p-5 rounded-[2.5rem] border-2 flex flex-col items-center text-center gap-4 transition-all duration-500 overflow-hidden ${badge.unlocked
                                ? `border-slate-50 bg-white shadow-3d-md hover:shadow-3d-lg`
                                : 'bg-slate-50/50 border-slate-100 text-slate-300'
                                }`}
                        >
                            {/* Decorative background for unlocked badges */}
                            {badge.unlocked && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-12 -mt-12 blur-2xl group-hover:animate-pulse" />
                            )}

                            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center transition-all duration-700 ${badge.unlocked 
                                ? `${badge.color} border-2 rotate-3 group-hover:rotate-12 group-hover:scale-110 shadow-3d-sm` 
                                : 'bg-slate-100 text-slate-200 border-2 border-slate-200/50'}`}>
                                <Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${badge.unlocked ? 'animate-float' : ''}`} />
                                {!badge.unlocked && <Lock className="absolute -bottom-2 -right-2 h-5 w-5 text-slate-300 bg-white rounded-full p-1 border shadow-sm" />}
                            </div>

                            <div className="space-y-1">
                                <h4 className={`font-black tracking-tight text-sm sm:text-base ${badge.unlocked ? 'text-slate-900' : 'text-slate-300'}`}>
                                    {badge.title}
                                </h4>
                                <p className={`text-[10px] leading-relaxed font-bold uppercase tracking-tight line-clamp-2 h-8 px-2 ${badge.unlocked ? 'text-slate-400' : 'text-slate-200'}`}>
                                    {badge.description}
                                </p>
                            </div>

                            {/* Unlocked glow effect */}
                            {badge.unlocked && (
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                            )}
                        </motion.div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
