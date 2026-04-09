
'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { motion } from 'framer-motion';
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
            let message = "Échec de la connexion. Vérifiez vos identifiants et réessayez.";

            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                message = "Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.";
            } else if (err.code === 'auth/invalid-email') {
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
                    <div className="flex items-center gap-4 mb-12">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-28 shadow-3d-sm rounded-md overflow-hidden border-2 border-white">
                                    <div className="w-1/3 bg-[#002394]"></div>
                                    <div className="w-1/3 bg-white"></div>
                                    <div className="w-1/3 bg-[#ed2939]"></div>
                                </div>
                                <h2 className="text-[#002394] dark:text-white text-2xl font-black leading-tight tracking-tight antialiased" id="login-title">
                                    {settings.appName}
                                </h2>
                            </div>
                            <div id="login-feedback" className="sr-only" aria-live="polite">
                                {loading && "Tentative de connexion en cours..."}
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 mt-2 font-black antialiased" id={headingDescId}>
                                Liberté • Égalité • Fraternité
                            </p>
                        </div>
                    </div>

                    <div className="mb-10 space-y-2">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight antialiased">Ravi de vous revoir</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Poursuivez votre préparation vers la citoyenneté française.</p>
                    </div>

                    <div id={errorId} role="alert" aria-live="assertive" aria-atomic="true">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-50 border-2 border-red-100 text-red-700 p-4 rounded-2xl text-sm mb-8 font-bold flex items-center gap-3 shadow-3d-sm"
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                                {error}
                            </motion.div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="login-title" aria-describedby={`${headingDescId} login-feedback`} noValidate>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="login-email">
                                Adresse e-mail
                            </label>
                            <div className="relative">
                                <input
                                    id="login-email" type="email" name="email" placeholder="exemple@republique.fr"
                                    className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                                    required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                                    aria-required="true"
                                    aria-describedby={error ? errorId : undefined}
                                    aria-invalid={error ? "true" : "false"}
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
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
                                    required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} 
                                    aria-required="true"
                                    aria-describedby={error ? errorId : undefined}
                                    aria-invalid={error ? "true" : "false"}
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                                    {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
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
                            className="w-full bg-primary hover:bg-blue-800 text-white font-black py-4 rounded-2xl transition-all shadow-3d-md hover:shadow-3d-lg flex items-center justify-center gap-3 disabled:bg-blue-300 active:scale-95 antialiased"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> Connexion...
                                </>
                            ) : (
                                <>
                                    Entrer dans mon espace <LogIn className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Nouveau sur la plateforme ?{' '}
                            <Link className="text-primary dark:text-blue-400 font-black hover:underline" href="/register">
                                Créer un compte gratuit
                            </Link>
                        </p>
                    </div>

                    {/* Footer Motto */}
                    <div className="mt-16 text-center">
                        <p className="text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-6 antialiased">
                            <span>Liberté</span>
                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                            <span>Égalité</span>
                            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
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
