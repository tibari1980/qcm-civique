
'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

/**
 * LoginPage — Connexion
 * WCAG 2.1 AA :
 * - Messages d'erreur annoncés immédiatement (role="alert" + aria-live="assertive")
 * - État de chargement visible et annoncé (aria-busy)
 * - Champs associés à leurs labels via htmlFor/id
 * - Description de formulaire avec aria-describedby
 * - Lien "Mot de passe oublié ?" avec texte descriptif
 */
export default function LoginPage() {
    const { settings } = useSettings();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();

    // IDs uniques pour aria-describedby (évite collisions si plusieurs instances)
    const headingDescId = useId();
    const errorId = useId();

    React.useEffect(() => {
        if (!authLoading && user) {
            if (isAdmin) {
                router.push('/admin/');
            } else {
                router.push('/dashboard');
            }
        }
    }, [user, authLoading, isAdmin, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // La redirection est gérée par le useEffect qui attend le profil utilisateur
        } catch (err: any) {
            console.error("Login error:", err);
            let message = "Échec de la connexion. Vérifiez vos identifiants et réessayez.";

            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                message = "Identifiants invalides ou aucun compte trouvé avec cette adresse email.";
            } else if (err.code === 'auth/wrong-password') {
                message = "Le mot de passe est incorrect.";
            } else if (err.code === 'auth/invalid-email') {
                message = "L'adresse email n'est pas valide.";
            } else if (err.code === 'auth/user-disabled') {
                message = "Ce compte a été désactivé.";
            } else if (err.code === 'auth/too-many-requests') {
                message = "Trop de tentatives échouées. Veuillez réessayer plus tard.";
            }

            setError(message);
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center" id="login-title">
                        Connexion
                    </CardTitle>
                    <p className="text-center text-sm font-medium text-gray-500">
                        {settings.appName}
                    </p>
                    <p className="text-center text-xs text-gray-400 mt-1" id={headingDescId}>
                        Entrez votre email et mot de passe pour accéder à votre compte.
                    </p>
                </CardHeader>
                <CardContent>
                    {/*
                      role="alert" + aria-live="assertive" :
                      NVDA / lecteurs d'écran annoncent l'erreur immédiatement
                      sans que l'utilisateur ait besoin de naviguer jusqu'à elle.
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
                        aria-labelledby="login-title"
                        aria-describedby={headingDescId}
                        noValidate
                    >
                        <div className="space-y-2">
                            <label htmlFor="login-email" className="text-sm font-medium leading-none">
                                Adresse email
                            </label>
                            <Input
                                id="login-email"
                                type="email"
                                placeholder="exemple@email.com"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-required="true"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="login-password" className="text-sm font-medium leading-none">
                                    Mot de passe
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                                    aria-label="Réinitialiser mon mot de passe oublié"
                                >
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10"
                                    aria-required="true"
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
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                            aria-busy={loading}
                            aria-label={loading ? 'Connexion en cours, veuillez patienter' : 'Se connecter'}
                        >
                            {loading ? (
                                <>
                                    <span aria-hidden="true">⏳</span>
                                    {' '}Connexion en cours...
                                </>
                            ) : 'Se connecter'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center">
                    <div className="text-sm text-gray-500">
                        Pas encore de compte ?{' '}
                        <Link href="/register" className="font-medium text-[var(--color-primary)] hover:underline">
                            Créer un compte
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
