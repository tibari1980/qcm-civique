
'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useSettings } from '../../context/SettingsContext';
import Image from 'next/image';

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
        
        // Anti-spam honeypot check
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        if (formData.get('website_url')) {
            console.warn('Bot detected via honeypot');
            return;
        }

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
            const token = await userCredential.user.getIdToken();
            fetch('/api/welcome', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Accompagnement Officiel</span>
                    </div>
                </div>
            </div>

            {/* Left Side: Hero Decorative */}
            <div className="relative hidden lg:flex flex-1 flex-col justify-center px-20 py-12 overflow-hidden bg-[#002394] text-white">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="h-full w-full flex">
                        <div className="h-full w-1/3 bg-blue-500"></div>
                        <div className="h-full w-1/3 bg-white"></div>
                        <div className="h-full w-1/3 bg-red-500"></div>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <div className="mb-8 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm border border-white/20">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/90">Accompagnement Officiel</span>
                    </div>
                    <h2 className="text-5xl font-black leading-[1.1] tracking-tight mb-6">Liberté, Égalité, Fraternité</h2>
                    <p className="text-xl text-white/80 leading-relaxed mb-10">
                        Préparez votre intégration en France avec un programme structuré, complet et conforme aux exigences du ministère de l'Intérieur.
                    </p>

                    <div className="grid gap-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold">Contenu Certifié</h3>
                                <p className="text-sm text-white/70">Questions-réponses basées sur le livret citoyen officiel.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold">Simulations Réelles</h3>
                                <p className="text-sm text-white/70">Entraînez-vous dans les conditions de l'examen.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom decorative bar */}
                <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                    <div className="flex-1 bg-blue-600"></div>
                    <div className="flex-1 bg-white"></div>
                    <div className="flex-1 bg-red-600"></div>
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-[480px] w-full mx-auto space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <div className="flex h-8 w-20 shadow-3d-sm rounded-md overflow-hidden border border-white mb-6 lg:ml-0 mx-auto" aria-hidden="true">
                            <div className="w-1/3 bg-[#002394]"></div>
                            <div className="w-1/3 bg-white"></div>
                            <div className="w-1/3 bg-[#ed2939]"></div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight antialiased" id="register-title">
                            Créer mon espace
                        </h2>
                        <div id="register-feedback" className="sr-only" aria-live="polite">
                            {loading && "Création de votre compte en cours..."}
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium" id={headingDescId}>Commencez votre parcours vers la citoyenneté.</p>
                    </div>

                    <div id={errorId} role="alert" aria-live="assertive" aria-atomic="true">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-50 border-2 border-red-100 text-red-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-3d-sm"
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                                {error}
                            </motion.div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="register-title" aria-describedby={`${headingDescId} register-feedback`} noValidate>
                        <div className="grid gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="reg-name">Nom complet</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
                                    <input
                                        id="reg-name" type="text" placeholder="Jean Dupont"
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#002394] focus:border-transparent outline-none transition-all dark:text-white"
                                        required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} 
                                        aria-required="true"
                                        aria-invalid={error && error.includes('nom') ? "true" : "false"}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="reg-email">Adresse e-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
                                    <input
                                        id="reg-email" type="email" placeholder="jean.dupont@exemple.fr"
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#002394] focus:border-transparent outline-none transition-all dark:text-white"
                                        required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                                        aria-required="true"
                                        aria-invalid={error && error.includes('email') ? "true" : "false"}
                                        aria-describedby={error && error.includes('email') ? errorId : undefined}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="reg-password">Mot de passe</label>
                                <p id={passwordHintId} className="text-xs text-gray-500">Minimum 6 caractères.</p>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
                                    <input
                                        id="reg-password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#002394] focus:border-transparent outline-none transition-all dark:text-white"
                                        required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        aria-required="true" aria-describedby={passwordHintId} minLength={6}
                                        aria-invalid={error && error.includes('faible') ? "true" : "false"}
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                                        {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="reg-confirm-password">Confirmer le mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
                                    <input
                                        id="reg-confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#002394] focus:border-transparent outline-none transition-all dark:text-white"
                                        required autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        aria-required="true"
                                        aria-invalid={error && error.includes('correspondent') ? "true" : "false"}
                                        aria-describedby={error && error.includes('correspondent') ? errorId : undefined}
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? "Masquer le mot de passe de confirmation" : "Afficher le mot de passe de confirmation"}>
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                                    </button>
                                </div>
                            </div>

                            {/* Honeypot field for anti-spam (invisible to humans and screen readers) */}
                            <div className="hidden" aria-hidden="true">
                                <label htmlFor="website_url">Website URL (ne pas remplir)</label>
                                <input id="website_url" type="text" name="website_url" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 py-2">
                            <div className="flex h-5 items-center">
                                <input id="terms" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#002394] focus:ring-[#002394]" required />
                            </div>
                            <label htmlFor="terms" className="text-sm text-gray-500 dark:text-gray-400">
                                J'accepte les <a href="#" className="text-[#002394] dark:text-blue-400 font-semibold hover:underline">Conditions Générales d'Utilisation</a> et la <a href="#" className="text-[#002394] dark:text-blue-400 font-semibold hover:underline">Politique de Confidentialité</a>.
                            </label>
                        </div>

                        <button
                            type="submit" disabled={loading} aria-busy={loading}
                            className="w-full py-4 bg-primary hover:bg-blue-800 text-white font-black rounded-2xl shadow-3d-md hover:shadow-3d-lg transition-all flex items-center justify-center gap-2 group disabled:bg-blue-300 active:scale-95 antialiased"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> Inscription...
                                </>
                            ) : (
                                <>
                                    Finaliser l&apos;inscription <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Déjà inscrit ? <Link href="/login" className="text-primary dark:text-blue-400 font-black hover:underline">Se connecter</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
