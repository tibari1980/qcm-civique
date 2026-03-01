import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { THEMES, THEME_LABELS } from '@/constants/app-constants';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/services/user.service';
import { Loader2, User, Settings, LogOut, Check, Award, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';
import CertificateGenerator from './CertificateGenerator';
import BadgesSection from './BadgesSection';

export default function ProfilePage() {
    const { user, userProfile, loading, signOut, refreshProfile } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [certStatus, setCertStatus] = useState<{ eligible: boolean, progress: number, missingThemes: string[] } | null>(null);
    const [isLoadingCert, setIsLoadingCert] = useState(true);
    const [showExample, setShowExample] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [stats, setStats] = useState<any>(null);

    React.useEffect(() => {
        if (user) {
            UserService.getAllUserData(user.uid, { track: userProfile?.track as any }).then(data => {
                setStats(data.stats);
            });
            UserService.getCertificateStatus(user.uid).then(status => {
                setCertStatus(status);
                setIsLoadingCert(false);
            });
        }
    }, [user, userProfile]);

    /* Skeleton complet pendant l'auth */
    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
                <Skeleton width="60%" height="2.5rem" className="mb-4" />
                <Card className="border-none shadow-sm">
                    <CardHeader><Skeleton width="40%" height="1.5rem" /></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton height="3rem" />
                            <Skeleton height="3rem" />
                            <Skeleton height="3rem" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader><Skeleton width="30%" height="1.5rem" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton height="100px" />
                        <Skeleton height="100px" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentTrack = userProfile?.track || 'residence';

    const handleTrackSwitch = async (newTrack: 'residence' | 'naturalisation') => {
        if (newTrack === currentTrack) return;

        setIsUpdating(true);
        setUpdateMessage(null);
        try {
            await UserService.syncUserProfile(user.uid, { track: newTrack });
            // Update context without reload
            if (refreshProfile) {
                await refreshProfile();
            }
            setUpdateMessage({
                text: `Parcours mis à jour : ${newTrack === 'residence' ? 'Titre de Séjour' : 'Naturalisation'} activé.`,
                type: 'success'
            });
        } catch (error) {
            console.error("Error updating track:", error);
            setUpdateMessage({
                text: "Erreur lors de la modification du parcours.",
                type: 'error'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
            {/* Zone ARIA Live pour les notifications NVDA */}
            <div className="sr-only" aria-live="polite" role="status">
                {updateMessage?.text}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 flex items-center gap-2">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--color-primary)]" aria-hidden="true" />
                Mon Profil
            </h1>

            <div className="space-y-4 sm:space-y-6">
                {/* User Info Card */}
                <Card>
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                        <CardTitle className="text-lg sm:text-xl">Informations Personnelles</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-0.5 sm:gap-1">
                                <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Email</span>
                                <span className="text-sm sm:text-base truncate">{user.email}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:gap-1">
                                <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Nom d&apos;utilisateur</span>
                                <span className="text-sm sm:text-base">{user.displayName || 'Utilisateur'}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:gap-1">
                                <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">Membre depuis</span>
                                <span className="text-sm sm:text-base">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Track Selection Card */}
                <Card className="border-blue-100 bg-blue-50/50 shadow-sm overflow-hidden">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                            <Settings className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                            Choix du Parcours
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-gray-600">
                            L&apos;interface s&apos;adaptera automatiquement à vos objectifs.
                        </p>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {/* Radio Group Pattern for NVDA */}
                        <div
                            role="radiogroup"
                            aria-label="Sélectionnez votre parcours d'examen"
                            className="grid grid-cols-1 gap-3 sm:gap-4"
                        >
                            {/* Option Titre de Séjour */}
                            <div
                                role="radio"
                                tabIndex={0}
                                aria-checked={currentTrack === 'residence'}
                                aria-label="Titre de Séjour. Pour les résidents de 10 ans ou renouvellement."
                                onClick={() => handleTrackSwitch('residence')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleTrackSwitch('residence');
                                    }
                                }}
                                className={`group relative cursor-pointer p-4 sm:p-5 rounded-xl border-2 transition-all flex flex-col gap-1.5 sm:gap-2 focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:outline-none ${currentTrack === 'residence'
                                    ? 'border-[var(--color-primary)] bg-white shadow-lg ring-1 ring-[var(--color-primary)]'
                                    : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`font-bold text-base sm:text-lg ${currentTrack === 'residence' ? 'text-blue-700' : 'text-gray-700'}`}>
                                        Titre de Séjour
                                    </span>
                                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${currentTrack === 'residence' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                                        {currentTrack === 'residence' && <Check className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />}
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                    Pour les résidents de 10 ans ou renouvellement de carte.
                                </p>
                            </div>

                            {/* Option Naturalisation */}
                            <div
                                role="radio"
                                tabIndex={0}
                                aria-checked={currentTrack === 'naturalisation'}
                                aria-label="Naturalisation. Entretien d'assimilation et culture française."
                                onClick={() => handleTrackSwitch('naturalisation')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleTrackSwitch('naturalisation');
                                    }
                                }}
                                className={`group relative cursor-pointer p-4 sm:p-5 rounded-xl border-2 transition-all flex flex-col gap-1.5 sm:gap-2 focus-visible:ring-4 focus-visible:ring-purple-500 focus-visible:outline-none ${currentTrack === 'naturalisation'
                                    ? 'border-purple-600 bg-white shadow-lg ring-1 ring-purple-600'
                                    : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`font-bold text-base sm:text-lg ${currentTrack === 'naturalisation' ? 'text-purple-700' : 'text-gray-700'}`}>
                                        Naturalisation
                                    </span>
                                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors ${currentTrack === 'naturalisation' ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-300'}`}>
                                        {currentTrack === 'naturalisation' && <Check className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />}
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                    Entretien d&apos;assimilation, culture et histoire française.
                                </p>
                            </div>
                        </div>

                        {/* Animated Message Feedback */}
                        <AnimatePresence>
                            {updateMessage && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mt-4 p-3 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 ${updateMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                                >
                                    {updateMessage.type === 'success' ? <Check className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                                    {updateMessage.text}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="bg-white/50 border-t border-gray-100 flex justify-between py-2 sm:py-3 px-4 sm:px-6">
                        {isUpdating && <p className="text-[10px] sm:text-xs text-gray-500 flex items-center"><Loader2 className="mr-2 h-3 w-3 animate-spin" aria-hidden="true" /> Synchronisation...</p>}
                    </CardFooter>
                </Card>

                {/* Gamification: Badges & Trophées */}
                {stats && <BadgesSection stats={stats} certStatus={certStatus} />}

                {/* Certificate Section */}
                {certStatus?.eligible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                    >
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Award className="h-6 w-6 text-amber-500" />
                            Votre Certificat de Réussite
                        </h2>
                        <CertificateGenerator
                            userName={user.displayName || 'Candidat'}
                            date={new Date().toISOString()}
                            track={currentTrack as any}
                        />
                    </motion.div>
                )}

                {/* Tracking Progress Card */}
                {!certStatus?.eligible && certStatus && (
                    <Card className="border-none shadow-sm bg-gray-50/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Progression Certification</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-medium text-gray-500">Objectif 100% Maîtrise</span>
                                <span className="text-2xl font-black text-[var(--color-primary)]">{Math.round(certStatus.progress)}%</span>
                            </div>
                            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${certStatus.progress}%` }}
                                    className="h-full bg-blue-600"
                                />
                            </div>
                            <p className="text-xs text-gray-500 italic">
                                {certStatus.missingThemes.length > 0
                                    ? `Continuez à vous entraîner sur les thèmes restants (${certStatus.missingThemes.length}) pour débloquer votre certificat.`
                                    : "Presque terminé ! Atteignez 80% de bonnes réponses sur chaque thème."}
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => setShowExample(!showExample)}
                            >
                                {showExample ? "Masquer l'exemple" : "Voir un exemple de certificat"}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Certificate Example Preview */}
                {showExample && !certStatus?.eligible && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-4 border-t border-dashed border-gray-200"
                    >
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Eye className="h-4 w-4" /> Exemple de réussite
                            </h3>
                            <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold">APERÇU</span>
                        </div>
                        <div className="scale-[0.8] origin-top opacity-80 pointer-events-none grayscale-[0.3]">
                            <CertificateGenerator
                                userName={user.displayName || 'Candidat'}
                                date={new Date().toISOString()}
                                track={currentTrack as any}
                                preview={true}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Logout Area */}
                <div className="flex flex-col gap-4 mt-6 sm:mt-8">
                    <Button variant="outline" onClick={signOut} className="w-full h-11 sm:h-12 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" /> Se déconnecter
                    </Button>
                </div>
            </div>
        </div>
    );
}
