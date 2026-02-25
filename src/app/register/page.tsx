
'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useSettings } from '@/context/SettingsContext';

/**
 * RegisterPage — Création de compte
 * WCAG 2.1 AA :
 * - Messages d'erreur annoncés immédiatement (role="alert" + aria-live="assertive")
 * - Exigences de mot de passe décrites via aria-describedby
 * - aria-busy sur le bouton pendant la soumission
 * - autocomplete sur tous les champs (aide aux utilisateurs mobilité réduite)
 * - Confirmation de mot de passe avec description de correspondance
 */
export default function RegisterPage() {
    const { settings } = useSettings();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const headingDescId = useId();
    const errorId = useId();
    const passwordHintId = useId();

    React.useEffect(() => {
        // Only redirect out if a user arrives already logged in
        // and IS NOT currently in the middle of creating a new account.
        if (!authLoading && user && !isRegistering) {
            router.push(isAdmin ? '/admin' : '/dashboard');
        }
    }, [user, authLoading, isAdmin, router, isRegistering]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas. Veuillez vérifier et réessayer.");
            return;
        }
        setLoading(true);
        setError('');
        setIsRegistering(true); // Bloquer la redirection auto

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(userCredential.user, { displayName: name });
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: email,
                displayName: name,
                role: 'user',
                track: null,
                createdAt: Date.now(),
                welcomeEmailSent: true  // Marqué immédiatement pour éviter les doublons
            });

            // Envoi de l'email de bienvenue (en arrière-plan, non bloquant)
            fetch('/api/welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            }).catch(() => {
                console.warn('[Register] Welcome email failed');
            });

            // On redirige vers onboarding avec replace pour écraser l'historique
            router.replace('/onboarding');
        } catch (err: unknown) {
            setIsRegistering(false);
            const firebaseErr = err as { code?: string };
            if (firebaseErr.code === 'auth/email-already-in-use') {
                setError("Cet email est déjà associé à un compte. Essayez de vous connecter.");
            } else if (firebaseErr.code === 'auth/weak-password') {
                setError("Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.");
            } else {
                setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center" id="register-title">
                        Créer un compte
                    </CardTitle>
                    <p className="text-center text-sm font-medium text-gray-500">
                        Rejoindre {settings.appName}
                    </p>
                    <p className="text-center text-xs text-gray-400 mt-1" id={headingDescId}>
                        Commencez votre préparation dès aujourd&apos;hui.
                    </p>
                </CardHeader>
                <CardContent>
                    {/*
                      La zone d'erreur est toujours présente dans le DOM (même vide)
                      pour que le aria-live soit prêt à annoncer.
                      role="alert" + aria-live="assertive" = annonce immédiate par NVDA.
                    */}
                    <div
                        id={errorId}
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="true"
                    >
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-4">
                                <span className="sr-only">Erreur : </span>
                                {error}
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                        aria-labelledby="register-title"
                        aria-describedby={headingDescId}
                        noValidate
                    >
                        <div className="space-y-2">
                            <label htmlFor="reg-name" className="text-sm font-medium leading-none">
                                Nom complet
                            </label>
                            <Input
                                id="reg-name"
                                type="text"
                                placeholder="Marie Dupont"
                                required
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                aria-required="true"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="reg-email" className="text-sm font-medium leading-none">
                                Adresse email
                            </label>
                            <Input
                                id="reg-email"
                                type="email"
                                placeholder="marie@exemple.fr"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-required="true"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="reg-password" className="text-sm font-medium leading-none">
                                Mot de passe
                            </label>
                            {/* Description des exigences, lue par NVDA quand le champ est focalisé */}
                            <p id={passwordHintId} className="text-xs text-gray-500">
                                Minimum 6 caractères.
                            </p>
                            <div className="relative">
                                <Input
                                    id="reg-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10"
                                    aria-required="true"
                                    aria-describedby={passwordHintId}
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="reg-confirm-password" className="text-sm font-medium leading-none">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <Input
                                    id="reg-confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pr-10"
                                    aria-required="true"
                                    aria-describedby={passwordHintId}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher la confirmation du mot de passe"}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="h-4 w-4" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                            aria-busy={loading}
                            aria-label={loading ? "Inscription en cours, veuillez patienter" : "Créer mon compte"}
                        >
                            {loading ? (
                                <>
                                    <span aria-hidden="true">⏳</span>
                                    {' '}Inscription en cours...
                                </>
                            ) : "S'inscrire"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center">
                    <div className="text-sm text-gray-500">
                        Déjà un compte ?{' '}
                        <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
