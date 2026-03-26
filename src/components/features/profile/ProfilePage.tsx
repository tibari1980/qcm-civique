'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../context/AuthContext';
import { UserService } from '../../../services/user.service';
import { Loader2, User, Settings, LogOut, Check, Award, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../../../components/ui/Skeleton';
import BadgesSection from './BadgesSection';
import dynamic from 'next/dynamic';

const CertificateGenerator = dynamic(() => import('./CertificateGenerator'), {
    ssr: false,
    loading: () => <div className="p-8 text-center text-gray-500 font-medium">Chargement du module spécialisé...</div>
});

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

    if (loading || !user) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl space-y-10" role="status" aria-busy="true" aria-live="polite">
                <Skeleton width="60%" height="3rem" className="rounded-2xl" />
                <Card className="premium-card-3d border-none bg-white p-6 space-y-6">
                    <Skeleton width="40%" height="1.5rem" className="rounded-full" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Skeleton height="4rem" className="rounded-2xl" />
                        <Skeleton height="4rem" className="rounded-2xl" />
                        <Skeleton height="4rem" className="rounded-2xl" />
                    </div>
                </Card>
                <Card className="premium-card-3d border-none bg-white p-6 space-y-10">
                    <Skeleton width="30%" height="1.5rem" className="rounded-full" />
                    <div className="space-y-6">
                        <Skeleton height="120px" className="rounded-3xl" />
                        <Skeleton height="120px" className="rounded-3xl" />
                    </div>
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
            if (refreshProfile) await refreshProfile();
            setUpdateMessage({
                text: `Parcours mis à jour : ${newTrack === 'residence' ? 'Titre de Séjour' : 'Naturalisation'} activé.`,
                type: 'success'
            });
        } catch (error) {
            console.error("Error updating track:", error);
            setUpdateMessage({ text: "Erreur lors de la modification du parcours.", type: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
            <div className="sr-only" aria-live="polite" role="status">
                {updateMessage?.text}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black mb-8 sm:mb-12 flex items-center gap-4 tracking-tight">
                <div className="bg-primary/10 p-3 rounded-2xl shadow-3d-sm" aria-hidden="true">
                    <User className="h-8 w-8 text-primary shadow-sm" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 antialiased">Mon Profil</span>
            </h1>

            <div className="space-y-6 sm:space-y-10">
                <Card className="premium-card-3d border-none bg-white p-2">
                    <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full" aria-hidden="true" />
                            Informations Personnelles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 shadow-sm">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Email</span>
                                <span className="text-base font-black text-slate-900 truncate">{user.email}</span>
                            </div>
                            <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 shadow-sm">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Nom d&apos;utilisateur</span>
                                <span className="text-base font-black text-slate-900">{user.displayName || 'Utilisateur'}</span>
                            </div>
                            <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 shadow-sm">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Membre depuis</span>
                                <span className="text-base font-black text-slate-900">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card-3d border-primary/20 bg-blue-50/30 overflow-hidden">
                    <CardHeader className="p-6">
                        <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight">
                            <div className="bg-primary p-2 rounded-xl shadow-3d-sm" aria-hidden="true">
                                <Settings className="h-5 w-5 text-white" />
                            </div>
                            Choix du Parcours
                        </CardTitle>
                        <p className="text-sm text-slate-500 font-medium ml-12">
                            L&apos;interface s&apos;adaptera automatiquement à vos objectifs.
                        </p>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <div
                            role="radiogroup"
                            aria-label="Sélectionnez votre parcours d'examen"
                            className="grid grid-cols-1 gap-4"
                        >
                            <motion.div
                                whileHover={{ y: -4, scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                role="radio"
                                tabIndex={0}
                                aria-checked={currentTrack === 'residence'}
                                onClick={() => handleTrackSwitch('residence')}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTrackSwitch('residence'); } }}
                                className={`group relative cursor-pointer p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-3 focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:outline-none ${currentTrack === 'residence'
                                    ? 'border-primary bg-white shadow-3d-lg ring-1 ring-primary'
                                    : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`font-black text-xl tracking-tight ${currentTrack === 'residence' ? 'text-blue-700' : 'text-slate-700'}`}>
                                        Titre de Séjour
                                    </span>
                                    <div className={`w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${currentTrack === 'residence' ? 'border-blue-600 bg-blue-600 text-white shadow-3d-sm scale-110 rotate-6' : 'border-slate-200'}`}>
                                        {currentTrack === 'residence' ? <Check className="h-5 w-5 font-black" aria-hidden="true" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                                    </div>
                                </div>
                                <p className={`text-sm leading-relaxed font-medium ${currentTrack === 'residence' ? 'text-blue-600/80' : 'text-slate-500'}`}>
                                    Pour les résidents de 10 ans ou renouvellement de carte.
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ y: -4, scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                role="radio"
                                tabIndex={0}
                                aria-checked={currentTrack === 'naturalisation'}
                                onClick={() => handleTrackSwitch('naturalisation')}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTrackSwitch('naturalisation'); } }}
                                className={`group relative cursor-pointer p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-3 focus-visible:ring-4 focus-visible:ring-purple-500 focus-visible:outline-none ${currentTrack === 'naturalisation'
                                    ? 'border-purple-600 bg-white shadow-3d-lg ring-1 ring-purple-600'
                                    : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`font-black text-xl tracking-tight ${currentTrack === 'naturalisation' ? 'text-purple-700' : 'text-slate-700'}`}>
                                        Naturalisation
                                    </span>
                                    <div className={`w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${currentTrack === 'naturalisation' ? 'border-purple-600 bg-purple-600 text-white shadow-3d-sm scale-110 rotate-6' : 'border-slate-200'}`}>
                                        {currentTrack === 'naturalisation' ? <Check className="h-5 w-5 font-black" aria-hidden="true" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                                    </div>
                                </div>
                                <p className={`text-sm leading-relaxed font-medium ${currentTrack === 'naturalisation' ? 'text-purple-600/80' : 'text-slate-500'}`}>
                                    Entretien d&apos;assimilation, culture et histoire française.
                                </p>
                            </motion.div>
                        </div>

                        <AnimatePresence>
                            {updateMessage && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mt-4 p-4 rounded-2xl text-sm font-black flex items-center gap-3 ${updateMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100 shadow-3d-sm' : 'bg-red-50 text-red-700 border border-red-100'}`}
                                >
                                    {updateMessage.type === 'success' ? <Check className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
                                    {updateMessage.text}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="bg-white/50 border-t border-slate-100 flex justify-between py-4 px-6">
                        {isUpdating && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Synchronisation...</p>}
                    </CardFooter>
                </Card>

                {stats && <BadgesSection stats={stats} certStatus={certStatus} />}

                {certStatus?.eligible && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <h2 className="text-2xl font-black flex items-center gap-3 tracking-tight">
                            <Award className="h-8 w-8 text-amber-500" />
                            Votre Certificat de Réussite
                        </h2>
                        <CertificateGenerator
                            userName={user.displayName || 'Candidat'}
                            date={new Date().toISOString()}
                            track={currentTrack as any}
                        />
                    </motion.div>
                )}

                {!certStatus?.eligible && certStatus && (
                    <Card className="premium-card-3d border-none bg-white p-2">
                        <CardHeader className="p-6">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full" aria-hidden="true" />
                                Progression Certification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-6">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Objectif 100% Maîtrise</span>
                                <span className="text-4xl font-black text-primary tracking-tighter">{Math.round(certStatus.progress)}%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-1">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${certStatus.progress}%` }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-primary rounded-full shadow-3d-sm"
                                />
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    {certStatus.missingThemes.length > 0
                                        ? `Défiez-vous ! Continuez à vous entraîner sur les thèmes restants (${certStatus.missingThemes.length}) pour débloquer votre certificat officiel.`
                                        : "Presque là ! Atteignez 80% de bonnes réponses sur chaque thème pour finaliser votre maîtrise."}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 h-12 rounded-2xl transition-all"
                                onClick={() => setShowExample(!showExample)}
                            >
                                {showExample ? "Masquer l'exemple" : "Voir un exemple de certificat"}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {showExample && !certStatus?.eligible && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-6 border-t-2 border-dashed border-slate-100">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Eye className="h-5 w-5" /> Exemple de réussite
                            </h3>
                            <span className="text-[10px] bg-amber-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-3d-sm">APERÇU</span>
                        </div>
                        <div className="scale-[0.85] origin-top opacity-90 grayscale-[0.2] transition-all hover:grayscale-0">
                            <CertificateGenerator
                                userName={user.displayName || 'Candidat'}
                                date={new Date().toISOString()}
                                track={currentTrack as any}
                                preview={true}
                            />
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-col gap-4 mt-12">
                    <Button variant="outline" onClick={signOut} className="w-full h-14 rounded-2xl border-2 border-red-50 text-red-500 font-bold hover:bg-red-50 hover:text-red-600 transition-all shadow-sm">
                        <LogOut className="mr-2 h-5 w-5" aria-hidden="true" /> Se déconnecter
                    </Button>
                </div>
            </div>
        </div>
    );
}
