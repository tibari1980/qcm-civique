'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { ChevronLeft, Mail, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ForgotPasswordPage — Réinitialisation du mot de passe
 * WCAG 2.1 AA Compliance
 */
export default function ForgotPasswordPage() {
    const { settings } = useSettings();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const headingDescId = useId();
    const statusId = useId();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await sendPasswordResetEmail(auth, email, {
                url: 'https://civiqquiz.com/resetpassword',
                handleCodeInApp: true,
            });
            setSuccess(true);
        } catch (err: any) {
            console.error("Reset password error:", err);
            let message = "Une erreur est survenue lors de l'envoi de l'email de réinitialisation.";

            if (err.code === 'auth/user-not-found') {
                message = "Aucun compte n'est associé à cette adresse email.";
            } else if (err.code === 'auth/invalid-email') {
                message = "L'adresse email n'est pas valide.";
            } else if (err.code === 'auth/too-many-requests') {
                message = "Trop de demandes. Veuillez réessayer plus tard.";
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg border-none bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <div className="mb-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> Retour à la connexion
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold" id="forgot-password-title">
                        Mot de passe oublié
                    </CardTitle>
                    <p className="text-sm font-medium text-gray-500" id={headingDescId}>
                        Ne vous inquiétez pas, cela arrive. Entrez votre adresse email pour recevoir un lien de réinitialisation.
                    </p>
                </CardHeader>
                <CardContent>
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6 space-y-4"
                                role="status"
                                aria-live="polite"
                            >
                                <div className="flex justify-center">
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-900">Lien envoyé avec succès !</h3>
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Nous venons d'envoyer les instructions de réinitialisation à l'adresse :<br />
                                            <span className="font-semibold text-gray-900">{email}</span>
                                        </p>
                                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
                                            <p className="text-xs text-blue-800 leading-relaxed italic">
                                                <strong>Note importante :</strong> Si vous ne recevez pas l'e-mail dans les prochaines minutes, pensez à vérifier votre dossier <strong>"Courrier indésirable" (Spam)</strong>. Il arrive parfois que les filtres de messagerie y dirigent ces messages automatisés par erreur.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-4">
                                    <Link href="/login" className="w-full text-center">Retourner à la connexion</Link>
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div
                                    id={statusId}
                                    role="alert"
                                    aria-live="assertive"
                                    aria-atomic="true"
                                >
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-4">
                                            {error}
                                        </div>
                                    )}
                                </div>
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                    aria-labelledby="forgot-password-title"
                                    aria-describedby={headingDescId}
                                    noValidate
                                >
                                    <div className="space-y-2">
                                        <label htmlFor="reset-email" className="text-sm font-medium leading-none">
                                            Adresse email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="reset-email"
                                                type="email"
                                                placeholder="exemple@email.com"
                                                required
                                                autoComplete="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10"
                                                aria-required="true"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-[0.98]"
                                        disabled={loading || !email}
                                        aria-busy={loading}
                                    >
                                        {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center pb-8">
                    <div className="text-xs text-gray-400">
                        Si vous ne recevez pas l'email, vérifiez vos messages indésirables ou réessayez avec une autre adresse.
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
