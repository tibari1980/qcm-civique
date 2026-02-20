
'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

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
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    const headingDescId = useId();
    const errorId = useId();
    const passwordHintId = useId();

    React.useEffect(() => {
        if (!authLoading && user) {
            router.push(isAdmin ? '/admin' : '/dashboard');
        }
    }, [user, authLoading, isAdmin, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas. Veuillez vérifier et réessayer.");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: email,
                displayName: name,
                track: null,
                createdAt: Date.now()
            });
            router.push('/onboarding');
        } catch (err: unknown) {
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
                    <p className="text-center text-sm text-gray-500" id={headingDescId}>
                        Commencez votre préparation dès aujourd&apos;hui. Inscription gratuite.
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
                            <Input
                                id="reg-password"
                                type="password"
                                required
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-required="true"
                                aria-describedby={passwordHintId}
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="reg-confirm-password" className="text-sm font-medium leading-none">
                                Confirmer le mot de passe
                            </label>
                            <Input
                                id="reg-confirm-password"
                                type="password"
                                required
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                aria-required="true"
                                aria-describedby={passwordHintId}
                            />
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
                            ) : "S&apos;inscrire"}
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
