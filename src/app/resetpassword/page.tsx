'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldCheck, ShieldAlert, Lock, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function PasswordStrengthIndicator({ password }: { password: string }) {
    const strength = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const getStrengthColor = () => {
        switch (strength) {
            case 0: return 'bg-gray-200';
            case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-blue-500';
            case 5: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    const getStrengthText = () => {
        switch (strength) {
            case 0: return '';
            case 1:
            case 2: return 'Faible';
            case 3: return 'Moyen';
            case 4: return 'Fort';
            case 5: return 'Très Fort';
            default: return '';
        }
    };

    return (
        <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Force du mot de passe</span>
                <span className={`text-[10px] font-bold ${strength >= 4 ? 'text-green-600' : 'text-gray-500'}`}>
                    {getStrengthText()}
                </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={`h-full flex-1 transition-all duration-300 ${level <= strength ? getStrengthColor() : 'bg-gray-200'}`}
                    />
                ))}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                <PasswordRequirement met={password.length >= 8} text="8+ caractères" />
                <PasswordRequirement met={/[A-Z]/.test(password)} text="Majuscule" />
                <PasswordRequirement met={/[0-9]/.test(password)} text="Chiffre" />
                <PasswordRequirement met={/[^A-Za-z0-9]/.test(password)} text="Caractère spécial" />
            </div>
        </div>
    );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
    return (
        <div className="flex items-center gap-1.5">
            {met ? (
                <Check className="h-3 w-3 text-green-500" strokeWidth={3} />
            ) : (
                <X className="h-3 w-3 text-gray-300" strokeWidth={3} />
            )}
            <span className={`text-[10px] ${met ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{text}</span>
        </div>
    );
}

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [countdown, setCountdown] = useState(3);

    const oobCode = searchParams.get('oobCode');

    const isPasswordValid = useMemo(() => {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        );
    }, [password]);

    const doPasswordsMatch = useMemo(() => {
        return password !== '' && password === confirmPassword;
    }, [password, confirmPassword]);

    useEffect(() => {
        if (!oobCode) {
            setError("Le code de réinitialisation est manquant ou invalide.");
            setVerifying(false);
            return;
        }

        const verifyCode = async () => {
            try {
                const userEmail = await verifyPasswordResetCode(auth, oobCode);
                setEmail(userEmail);
            } catch (err: any) {
                console.error("Verification error:", err);
                setError("Ce lien de réinitialisation est expiré ou a déjà été utilisé.");
            } finally {
                setVerifying(false);
            }
        };

        verifyCode();
    }, [oobCode]);

    useEffect(() => {
        if (success && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (success && countdown === 0) {
            router.push('/login');
        }
    }, [success, countdown, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode || !isPasswordValid || !doPasswordsMatch) return;

        setLoading(true);
        setError('');

        try {
            await confirmPasswordReset(auth, oobCode, password);
            setSuccess(true);
        } catch (err: any) {
            console.error("Reset error:", err);
            setError("Une erreur est survenue lors de la mise à jour du mot de passe.");
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <p className="text-sm text-gray-500">Vérification du code...</p>
            </div>
        );
    }

    if (error && !success) {
        return (
            <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                    <div className="bg-red-100 p-3 rounded-full">
                        <AlertCircle className="h-10 w-10 text-red-600" />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Lien invalide</h3>
                <p className="text-sm text-gray-500">{error}</p>
                <Button className="w-full mt-4" variant="outline" onClick={() => router.push('/forgot-password')}>
                    Demander un nouveau lien
                </Button>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {success ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-4"
                >
                    <div className="flex justify-center">
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">Mot de passe modifié !</h3>
                        <p className="text-sm text-gray-600">
                            Votre mot de passe a été mis à jour avec succès.<br />
                            Redirection vers la connexion dans <span className="font-bold text-blue-600">{countdown}s</span>...
                        </p>
                    </div>
                    <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/login')}>
                        Se connecter maintenant
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="mb-6 flex items-start gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                        <Lock className="h-5 w-5 text-blue-500 mt-0.5" />
                        <p className="text-xs text-gray-600">
                            Bonjour <span className="font-bold text-gray-900">{email}</span>,<br />
                            Veuillez choisir un mot de passe robuste pour votre sécurité.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="new-password" title="Nouveau mot de passe" className="text-sm font-medium flex items-center gap-2">
                                Nouveau mot de passe
                                {isPasswordValid && <ShieldCheck className="h-4 w-4 text-green-500" />}
                            </label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`pr-10 h-11 ${isPasswordValid ? 'border-green-200' : ''}`}
                                    aria-required="true"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            <PasswordStrengthIndicator password={password} />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirm-password" title="Confirmer le mot de passe" className="text-sm font-medium flex items-center gap-2">
                                Confirmer le mot de passe
                                {doPasswordsMatch && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            </label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`pr-10 h-11 ${doPasswordsMatch ? 'border-green-200' : ''}`}
                                    aria-required="true"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {!doPasswordsMatch && confirmPassword !== '' && (
                                <p className="text-[10px] text-red-500 flex items-center gap-1">
                                    <ShieldAlert className="h-3 w-3" /> Les mots de passe ne correspondent pas
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2 border border-red-100">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className={`w-full h-11 shadow-lg transition-all active:scale-[0.98] ${isPasswordValid && doPasswordsMatch
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                            disabled={loading || !isPasswordValid || !doPasswordsMatch}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2 text-white">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Mise à jour en cours...
                                </span>
                            ) : 'Mettre à jour mon mot de passe'}
                        </Button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/30">
            <Card className="w-full max-w-md shadow-2xl border-none bg-white/90 backdrop-blur-md overflow-hidden">
                <div className="h-1.5 w-full flex">
                    <div className="flex-1 bg-[#002654]"></div>
                    <div className="flex-1 bg-white"></div>
                    <div className="flex-1 bg-[#E1000F]"></div>
                </div>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#002654]">Sécurisation de l'accès</CardTitle>
                    <p className="text-xs text-gray-400">Étape finale : Mise à jour de vos identifiants</p>
                </CardHeader>
                <CardContent className="pt-0">
                    <Suspense fallback={
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
