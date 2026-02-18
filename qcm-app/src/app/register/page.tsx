
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Added db
import { doc, setDoc } from 'firebase/firestore'; // Added Firestore

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(); // Renaming loading to avoid conflict

    // Redirect if already logged in
    React.useEffect(() => {
        if (!authLoading && user) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update display name
            await updateProfile(userCredential.user, {
                displayName: name
            });

            // Create user document in Firestore (without track initially)
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: email,
                displayName: name,
                track: null,
                createdAt: Date.now()
            });

            console.log('Registration successful');
            router.push('/onboarding'); // Redirect to Onboarding
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("Cet email est déjà utilisé.");
            } else {
                setError("Une erreur est survenue lors de l'inscription.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Créer un compte</CardTitle>
                    <p className="text-center text-sm text-gray-500">
                        Commencez votre préparation dès aujourd'hui.
                    </p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none">Nom complet</label>
                            <Input
                                id="name"
                                placeholder="Jean Dupont"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="exemple@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none">Mot de passe</label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">Confirmer le mot de passe</label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Inscription en cours...' : "S'inscrire"}
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
