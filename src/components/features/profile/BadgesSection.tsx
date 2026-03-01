import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Award, Star, Shield, Trophy, Zap, Target, Crown } from 'lucide-react';
import { UserProgress } from '@/types';
import { motion } from 'framer-motion';

// Définir les badges possibles
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
        color: 'text-amber-500 bg-amber-50 border-amber-200',
        isUnlocked: (stats) => stats.total_attempts >= 1
    },
    {
        id: 'citoyen_modele',
        title: 'Citoyen Modèle',
        description: 'Vous avez complété au moins 5 examens.',
        icon: Shield,
        color: 'text-blue-500 bg-blue-50 border-blue-200',
        isUnlocked: (stats) => stats.total_attempts >= 5
    },
    {
        id: 'marathonien',
        title: 'Marathonien',
        description: 'Démontrez votre persévérance avec plus de 20 examens passés.',
        icon: Zap,
        color: 'text-purple-500 bg-purple-50 border-purple-200',
        isUnlocked: (stats) => stats.total_attempts >= 20
    },
    {
        id: 'mention_bien',
        title: 'Mention Bien',
        description: 'Score moyen supérieur à 80% sur au moins 3 tests.',
        icon: Target,
        color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
        isUnlocked: (stats) => stats.total_attempts >= 3 && stats.average_score >= 80
    },
    {
        id: 'excellence',
        title: 'Excellence Civique',
        description: 'Score moyen supérieur à 90% sur au moins 5 tests.',
        icon: Trophy,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        isUnlocked: (stats) => stats.total_attempts >= 5 && stats.average_score >= 90
    },
    {
        id: 'legende',
        title: 'Légende',
        description: 'Vous avez débloqué votre certificat de réussite global.',
        icon: Crown,
        color: 'text-red-500 bg-red-50 border-red-200',
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
        <Card className="border-none shadow-sm bg-gray-50/50">
            <CardHeader className="p-4 sm:p-6 pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-[var(--color-primary)]" />
                    Mes Badges & Trophées
                    <span className="ml-auto text-xs sm:text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm border border-gray-100">
                        {unlockedCount} / {BADGES.length}
                    </span>
                </CardTitle>
                <p className="text-xs text-gray-500">
                    Gagnez des trophées en vous entraînant régulièrement et en atteignant d'excellents scores.
                </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {unlockedBadges.map(badge => {
                    const Icon = badge.icon;
                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`relative p-3 sm:p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${badge.unlocked
                                    ? `${badge.color} shadow-sm bg-white`
                                    : 'bg-gray-100 border-gray-200 text-gray-400 grayscale'
                                }`}
                            title={badge.description}
                        >
                            {!badge.unlocked && (
                                <div className="absolute inset-0 bg-white/40 rounded-xl z-10" />
                            )}
                            <div className={`p-2 rounded-full z-20 ${badge.unlocked ? badge.color : 'bg-white text-gray-400 shadow-sm'}`}>
                                <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                            <div className="z-20">
                                <h4 className="font-bold text-xs sm:text-sm line-clamp-1">{badge.title}</h4>
                                <p className="text-[10px] sm:text-xs mt-1 leading-tight opacity-80 h-8 flex items-center justify-center">
                                    {badge.description}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
