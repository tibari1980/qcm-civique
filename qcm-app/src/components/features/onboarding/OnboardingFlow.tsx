'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Flag, FileText, ArrowRight } from 'lucide-react';
import { UserProfile } from '@/types';
import { motion } from 'framer-motion';

export default function OnboardingFlow() {
    const { user, userProfile, refreshProfile, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<'residence' | 'naturalisation' | null>(null);

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

        try {
            const userRef = doc(db, 'users', user.uid);
            // Create or update user profile with track
            const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                photoURL: user.photoURL || undefined,
                track: selectedTrack,
                createdAt: Date.now(),
            };

            await setDoc(userRef, newProfile, { merge: true });

            // Refresh context and redirect
            await refreshProfile();
            router.push('/dashboard');
        } catch (error) {
            console.error("Error saving track:", error);
            alert("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Bienvenue, {user.displayName} !</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Pour commencer, sélectionnez votre objectif. Nous adapterons votre expérience d&apos;apprentissage pour maximiser vos chances de réussite.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Track 1: Residence */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTrack('residence')}
                        className={`cursor-pointer relative overflow-hidden rounded-2xl transition-all duration-300 ${selectedTrack === 'residence'
                            ? 'ring-4 ring-[var(--color-primary)] ring-offset-4 shadow-2xl'
                            : 'hover:shadow-xl bg-white shadow-md'
                            }`}
                    >
                        <div className={`absolute top-0 left-0 w-full h-2 ${selectedTrack === 'residence' ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
                        <CardContent className="p-8 flex flex-col h-full">
                            <div className={`mx-auto p-5 rounded-full mb-6 transition-colors ${selectedTrack === 'residence' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                <FileText className={`h-12 w-12 ${selectedTrack === 'residence' ? 'text-[var(--color-primary)]' : 'text-gray-400'}`} />
                            </div>
                            <h3 className={`text-2xl font-bold text-center mb-4 ${selectedTrack === 'residence' ? 'text-[var(--color-primary)]' : 'text-gray-900'}`}>
                                Titre de Séjour / Résident
                            </h3>
                            <p className="text-gray-600 text-center mb-8 flex-grow">
                                Préparez-vous efficacement pour le test écrit obligatoire (QCM) de 40 questions requis pour la carte de séjour ou de résident.
                            </p>
                            <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                                <div className="flex items-center text-sm text-gray-700">
                                    <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>QCM de 40 questions</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>Objectif 80% de réussite</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>Format officiel 2026</span>
                                </div>
                            </div>
                        </CardContent>
                    </motion.div>

                    {/* Track 2: Naturalisation */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTrack('naturalisation')}
                        className={`cursor-pointer relative overflow-hidden rounded-2xl transition-all duration-300 ${selectedTrack === 'naturalisation'
                            ? 'ring-4 ring-red-500 ring-offset-4 shadow-2xl'
                            : 'hover:shadow-xl bg-white shadow-md'
                            }`}
                    >
                        <div className={`absolute top-0 left-0 w-full h-2 ${selectedTrack === 'naturalisation' ? 'bg-red-500' : 'bg-gray-200'}`} />
                        <CardContent className="p-8 flex flex-col h-full">
                            <div className={`mx-auto p-5 rounded-full mb-6 transition-colors ${selectedTrack === 'naturalisation' ? 'bg-red-100' : 'bg-gray-100'}`}>
                                <Flag className={`h-12 w-12 ${selectedTrack === 'naturalisation' ? 'text-red-500' : 'text-gray-400'}`} />
                            </div>
                            <h3 className={`text-2xl font-bold text-center mb-4 ${selectedTrack === 'naturalisation' ? 'text-red-600' : 'text-gray-900'}`}>
                                Naturalisation Française
                            </h3>
                            <p className="text-gray-600 text-center mb-8 flex-grow">
                                Préparez tout le nécessaire pour devenir français : entretien d&apos;assimilation, culture générale et livret du citoyen.
                            </p>
                            <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                                <div className="flex items-center text-sm text-gray-700">
                                    <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>Simulateur d&apos;entretien oral</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>Histoire & Culture Générale</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                    <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                                    <span>Questions fréquentes</span>
                                </div>
                            </div>
                        </CardContent>
                    </motion.div>
                </div>

                <div className="flex justify-center">
                    <Button
                        size="lg"
                        disabled={!selectedTrack || loading}
                        onClick={handleConfirmTrack}
                        className={`px-12 py-6 text-lg font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${!selectedTrack ? 'bg-gray-300 cursor-not-allowed' :
                            selectedTrack === 'naturalisation' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                'bg-[var(--color-primary)] hover:opacity-90 text-white'
                            }`}
                    >
                        {loading ? 'Configuration...' : (
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
