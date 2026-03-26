'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CheckCircle, Flag, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserService } from '../../../services/user.service';

export default function OnboardingFlow() {
    const { user, userProfile, refreshProfile, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<'residence' | 'naturalisation' | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (userProfile?.track) {
            router.push(isAdmin ? '/admin' : '/dashboard');
        }
    }, [user, userProfile, isAdmin, router]);

    if (!user) return null;

    const handleConfirmTrack = async () => {
        if (!user || !selectedTrack) return;
        setLoading(true);
        setError(null);

        try {
            // Clean values to avoid Firestore undefined issues and overwriting with empty strings
            const profileData: any = {
                uid: user.uid,
                track: selectedTrack
            };

            if (user.email) profileData.email = user.email;
            if (user.displayName) profileData.displayName = user.displayName;
            if (user.photoURL) profileData.photoURL = user.photoURL;

            await UserService.syncUserProfile(user.uid, profileData);

            // Refresh context and redirect
            if (refreshProfile) {
                await refreshProfile();
            }
            router.push('/dashboard');
        } catch (err) {
            console.error("Error saving track:", err);
            // More helpful error message
            const errorMessage = err instanceof Error ? err.message : "";
            if (errorMessage.includes("permission-denied")) {
                setError("Accès refusé. Veuillez vous reconnecter.");
            } else {
                setError("Oups ! Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 py-8 sm:p-6 lg:p-8">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-blue-100 shadow-3d-sm"
                    >
                        <Flag className="h-3 w-3" />
                        Parcours Officiel
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight px-2 antialiased">
                        Bienvenue, <span className="text-primary">{user.displayName?.split(' ')[0] || 'Candidat'}</span> !
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto px-4 font-medium">
                        Pour commencer votre préparation, choisissez l&apos;objectif qui correspond à votre situation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-12 max-w-4xl mx-auto">
                    {/* Track 1: Residence */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selectedTrack === 'residence'}
                        aria-label="Sélectionner le parcours Titre de Séjour : Test écrit de 40 questions."
                        className={`cursor-pointer focus:outline-none premium-card-3d bg-white rounded-[2rem] transition-all duration-500 border-4 relative overflow-hidden ${selectedTrack === 'residence'
                            ? 'border-primary ring-8 ring-primary/5'
                            : 'border-transparent'
                            }`}
                    >
                        <CardContent className="p-8 sm:p-10 flex flex-col h-full relative z-10">
                            <div className={`mx-auto p-6 rounded-[2rem] mb-8 transition-all duration-500 ${selectedTrack === 'residence' ? 'bg-primary text-white shadow-3d-md scale-110' : 'bg-slate-50 text-slate-400'}`} aria-hidden="true">
                                <FileText className={`h-12 w-12 ${selectedTrack === 'residence' ? 'animate-float' : ''}`} />
                            </div>
                            <h2 className={`text-2xl sm:text-3xl font-black text-center mb-4 antialiased ${selectedTrack === 'residence' ? 'text-primary' : 'text-slate-800'}`}>
                                Titre de Séjour
                            </h2>
                            <p className="text-base text-slate-500 text-center mb-8 flex-grow font-medium leading-relaxed">
                                Préparez l&apos;examen obligatoire de 40 questions pour valider votre demande de carte de résident.
                            </p>
                            <div className="space-y-4 bg-slate-50/80 p-6 rounded-[1.5rem]" aria-label="Points clés">
                                <div className="flex items-center text-sm font-bold text-slate-700">
                                    <CheckCircle className="h-5 w-5 mr-4 text-green-500 flex-shrink-0" />
                                    <span>QCM de 40 questions</span>
                                </div>
                                <div className="flex items-center text-sm font-bold text-slate-700">
                                    <CheckCircle className="h-5 w-5 mr-4 text-green-500 flex-shrink-0" />
                                    <span>Seuil de réussite : 32/40</span>
                                </div>
                            </div>
                        </CardContent>
                    </motion.div>

                    {/* Track 2: Naturalisation */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selectedTrack === 'naturalisation'}
                        aria-label="Sélectionner le parcours Naturalisation : Entretien d'assimilation et culture."
                        className={`cursor-pointer focus:outline-none premium-card-3d bg-white rounded-[2rem] transition-all duration-500 border-4 relative overflow-hidden ${selectedTrack === 'naturalisation'
                            ? 'border-red-500 ring-8 ring-red-500/5'
                            : 'border-transparent'
                            }`}
                    >
                        <CardContent className="p-8 sm:p-10 flex flex-col h-full relative z-10">
                            <div className={`mx-auto p-6 rounded-[2rem] mb-8 transition-all duration-500 ${selectedTrack === 'naturalisation' ? 'bg-red-500 text-white shadow-3d-md scale-110' : 'bg-slate-50 text-slate-400'}`} aria-hidden="true">
                                <Flag className={`h-12 w-12 ${selectedTrack === 'naturalisation' ? 'animate-float' : ''}`} />
                            </div>
                            <h2 className={`text-2xl sm:text-3xl font-black text-center mb-4 antialiased ${selectedTrack === 'naturalisation' ? 'text-red-600' : 'text-slate-800'}`}>
                                Naturalisation
                            </h2>
                            <p className="text-base text-slate-500 text-center mb-8 flex-grow font-medium leading-relaxed">
                                Un parcours complet pour l&apos;entretien d&apos;assimilation, la culture et l&apos;histoire de France.
                            </p>
                            <div className="space-y-4 bg-slate-50/80 p-6 rounded-[1.5rem]" aria-label="Points clés">
                                <div className="flex items-center text-sm font-bold text-slate-700">
                                    <CheckCircle className="h-5 w-5 mr-4 text-green-500 flex-shrink-0" />
                                    <span>Simulateur d&apos;entretien oral</span>
                                </div>
                                <div className="flex items-center text-sm font-bold text-slate-700">
                                    <CheckCircle className="h-5 w-5 mr-4 text-green-500 flex-shrink-0" />
                                    <span>Culture & Histoire complète</span>
                                </div>
                            </div>
                        </CardContent>
                    </motion.div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="text-red-600 font-medium bg-red-50 px-4 py-2 rounded-lg text-sm mb-2"
                                role="alert"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <Button
                        size="lg"
                        disabled={!selectedTrack || loading}
                        onClick={handleConfirmTrack}
                        className={`w-full max-w-sm sm:w-auto h-16 px-12 text-xl font-black rounded-full transition-all duration-500 shadow-3d-md hover:shadow-3d-lg active:scale-95 ${!selectedTrack ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
                            selectedTrack === 'naturalisation' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                'bg-primary hover:bg-blue-800 text-white'
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="animate-spin h-6 w-6" />
                                <span>Initialisation...</span>
                            </div>
                        ) : (
                            <>
                                Confirmer ma situation <ArrowRight className="ml-3 h-6 w-6" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Helper Loader2 icon
const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
