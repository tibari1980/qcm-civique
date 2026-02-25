'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Flag, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserService } from '@/services/user.service';

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
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight px-2">
                        Bienvenue, {user.displayName || 'Candidat'} !
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                        Sélectionnez votre objectif pour personnaliser votre expérience.
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
                        onClick={() => setSelectedTrack('residence')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedTrack('residence');
                            }
                        }}
                        className={`cursor-pointer relative overflow-hidden rounded-2xl transition-all duration-300 border-2 ${selectedTrack === 'residence'
                            ? 'border-[var(--color-primary)] bg-white shadow-xl ring-2 ring-[var(--color-primary)] ring-opacity-20'
                            : 'border-transparent bg-white shadow-md hover:shadow-lg'
                            }`}
                    >
                        <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                            <div className={`mx-auto p-4 sm:p-5 rounded-full mb-4 sm:mb-6 transition-colors ${selectedTrack === 'residence' ? 'bg-blue-100' : 'bg-gray-100'}`} aria-hidden="true">
                                <FileText className={`h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 ${selectedTrack === 'residence' ? 'text-[var(--color-primary)]' : 'text-gray-400'}`} />
                            </div>
                            <h2 className={`text-xl sm:text-2xl font-bold text-center mb-3 ${selectedTrack === 'residence' ? 'text-[var(--color-primary)]' : 'text-gray-900'}`}>
                                Titre de Séjour
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8 flex-grow">
                                Pour le test écrit (QCM) de 40 questions requis pour la carte de séjour.
                            </p>
                            <div className="space-y-2 sm:space-y-3 bg-gray-50 p-4 rounded-xl" aria-label="Points clés">
                                <div className="flex items-center text-xs sm:text-sm text-gray-700">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>Format QCM 40 questions</span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm text-gray-700">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>Objectif 80% (32/40)</span>
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
                        onClick={() => setSelectedTrack('naturalisation')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setSelectedTrack('naturalisation');
                            }
                        }}
                        className={`cursor-pointer relative overflow-hidden rounded-2xl transition-all duration-300 border-2 ${selectedTrack === 'naturalisation'
                            ? 'border-red-500 bg-white shadow-xl ring-2 ring-red-500 ring-opacity-20'
                            : 'border-transparent bg-white shadow-md hover:shadow-lg'
                            }`}
                    >
                        <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                            <div className={`mx-auto p-4 sm:p-5 rounded-full mb-4 sm:mb-6 transition-colors ${selectedTrack === 'naturalisation' ? 'bg-red-100' : 'bg-gray-100'}`} aria-hidden="true">
                                <Flag className={`h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 ${selectedTrack === 'naturalisation' ? 'text-red-500' : 'text-gray-400'}`} />
                            </div>
                            <h2 className={`text-xl sm:text-2xl font-bold text-center mb-3 ${selectedTrack === 'naturalisation' ? 'text-red-600' : 'text-gray-900'}`}>
                                Naturalisation
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8 flex-grow">
                                Entretien d&apos;assimilation, culture générale et livret du citoyen.
                            </p>
                            <div className="space-y-2 sm:space-y-3 bg-gray-50 p-4 rounded-xl" aria-label="Points clés">
                                <div className="flex items-center text-xs sm:text-sm text-gray-700">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>Simulateur oral exclusif</span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm text-gray-700">
                                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>Histoire & Institutions</span>
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
                        className={`w-full max-w-sm sm:w-auto px-12 py-6 sm:py-7 text-lg font-bold rounded-full transition-all duration-300 shadow-lg ${!selectedTrack ? 'bg-gray-300 cursor-not-allowed' :
                            selectedTrack === 'naturalisation' ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200' :
                                'bg-[var(--color-primary)] hover:opacity-90 text-white shadow-blue-200'
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-5 w-5" />
                                <span>Initialisation...</span>
                            </div>
                        ) : (
                            <>
                                Confirmer mon choix <ArrowRight className="ml-2 h-6 w-6" />
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
