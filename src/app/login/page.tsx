
'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import Image from 'next/image';

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
    const [rememberMe, setRememberMe] = useState(true);
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
            // Set persistence based on rememberMe checkbox
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
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
        <div className="flex min-h-[calc(100vh-64px)] w-full flex-col lg:flex-row">
            {/* Mobile Header Image (Hidden on lg) */}
            <div className="lg:hidden relative h-48 w-full overflow-hidden bg-[#002394]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#002394]/80 to-[#002394]/40 z-10"></div>
                <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuByWW3GM_dKy-v4QHSVMNUzu9wl3fl935-YRBaP3UXz6ARPDkD4HNIXIRUBQuPeuZnWJwjF4uHfnwQKXuK-LeKLWA3kgw-lS0xuoewnQq2kY-P0LfCNZPLnAcMvqTT4rvhCneY_2WaZpizqhnmW005693MaWpylB0zaBdYM7FnDklGCgIBG_XptxFCHwr2ihPz8Y5n62bPVU2ZqNAgJ2D5z7KT4BgxVfRMqkH68O3dipZTUT3nepffdvarQZxREnXNXCZ0XwSD9EmA"
                    alt="National symbols of France"
                    fill
                    className="object-cover opacity-60 mix-blend-overlay"
                    priority
                    unoptimized
                />
                <div className="relative z-20 flex h-full flex-col justify-end p-6 text-white pb-6 shadow-b">
                    <div className="mb-2 inline-flex self-start items-center rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm border border-white/20">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Promotion de la Citoyenneté</span>
                    </div>
                </div>
            </div>

            {/* Left Side: Login Form */}
            <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32 bg-gray-50 dark:bg-gray-900 pb-12 pt-8 lg:pt-12">
                <div className="max-w-md w-full mx-auto">
                    {/* Header/Logo Section */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-6 flex overflow-hidden rounded-sm border border-gray-200 shadow-sm">
                                    <div className="w-1/3 bg-[#002394]"></div>
                                    <div className="w-1/3 bg-white"></div>
                                    <div className="w-1/3 bg-[#ed2939]"></div>
                                </div>
                                <h2 className="text-[#002394] dark:text-white text-xl font-bold leading-tight tracking-tight" id="login-title">
                                    {settings.appName}
                                </h2>
                            </div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#002394]/60 dark:text-blue-400 mt-1 font-semibold" id={headingDescId}>
                                Ministère de l'Intérieur
                            </p>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue</h1>
                        <p className="text-gray-600 dark:text-gray-400">Connectez-vous à votre espace républicain pour poursuivre votre préparation.</p>
                    </div>

                    <div id={errorId} role="alert" aria-live="assertive" aria-atomic="true">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-6">
                                <span className="sr-only">Erreur : </span>
                                {error}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="login-title" aria-describedby={headingDescId} noValidate>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="login-email">
                                Adresse e-mail
                            </label>
                            <div className="relative">
                                <input
                                    id="login-email" type="email" name="email" placeholder="exemple@republique.fr"
                                    className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                                    required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-required="true"
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1.5">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="login-password">
                                    Mot de passe
                                </label>
                                <Link className="text-sm font-semibold text-[#002394] dark:text-blue-400 hover:text-blue-800 hover:underline" href="/forgot-password" aria-label="Réinitialiser mon mot de passe oublié">
                                    Oublié ?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="login-password" type={showPassword ? "text" : "password"} name="password" placeholder="••••••••"
                                    className="w-full px-4 py-3 pl-11 pr-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                                    required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-required="true"
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input 
                                className="w-4 h-4 text-[#002394] border-gray-300 rounded focus:ring-blue-600 cursor-pointer accent-[#ed2939]" 
                                id="remember" 
                                type="checkbox" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none" htmlFor="remember">
                                Se souvenir de moi sur cet appareil
                            </label>
                        </div>

                        <button
                            type="submit" disabled={loading} aria-busy={loading}
                            className="w-full bg-[#002394] hover:bg-blue-900 text-white font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:bg-blue-400"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin text-lg">⏳</span> Connexion en cours...
                                </>
                            ) : (
                                <>
                                    Accéder à mon espace <LogIn className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Pas encore de compte ?{' '}
                            <Link className="text-[#002394] dark:text-blue-400 font-bold hover:underline" href="/register">
                                S'inscrire à la formation
                            </Link>
                        </p>
                    </div>

                    {/* Footer Motto */}
                    <div className="mt-12 text-center">
                        <p className="text-[#002394]/40 dark:text-gray-500 text-xs font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-4">
                            <span>Liberté</span>
                            <span className="w-1 h-1 bg-[#002394]/40 rounded-full dark:bg-gray-500"></span>
                            <span>Égalité</span>
                            <span className="w-1 h-1 bg-[#002394]/40 rounded-full dark:bg-gray-500"></span>
                            <span>Fraternité</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Decorative Image Section */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#002394]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#002394]/80 to-[#002394]/40 z-10"></div>
                <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuByWW3GM_dKy-v4QHSVMNUzu9wl3fl935-YRBaP3UXz6ARPDkD4HNIXIRUBQuPeuZnWJwjF4uHfnwQKXuK-LeKLWA3kgw-lS0xuoewnQq2kY-P0LfCNZPLnAcMvqTT4rvhCneY_2WaZpizqhnmW005693MaWpylB0zaBdYM7FnDklGCgIBG_XptxFCHwr2ihPz8Y5n62bPVU2ZqNAgJ2D5z7KT4BgxVfRMqkH68O3dipZTUT3nepffdvarQZxREnXNXCZ0XwSD9EmA"
                    alt="National symbols of France"
                    fill
                    className="object-cover opacity-60 mix-blend-overlay"
                    priority
                    unoptimized
                />

                <div className="relative z-20 flex flex-col justify-end p-20 text-white w-full">
                    <div className="max-w-lg">
                        <div className="inline-block px-4 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-md mb-6 text-sm font-medium">
                            Promotion de la Citoyenneté
                        </div>
                        <h2 className="text-4xl font-bold leading-tight mb-6">
                            Devenez un citoyen éclairé, préparez votre avenir en France.
                        </h2>

                        <div className="flex gap-12">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold">100%</span>
                                <span className="text-white/70 text-sm">Contenu Officiel</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold">250+</span>
                                <span className="text-white/70 text-sm">Questions d'Examen</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 p-12 z-20 opacity-20">
                    <svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                        <path d="M50 10V90M10 50H90" stroke="white" strokeWidth="0.5" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
