'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';
import { ADMIN_EMAILS } from '@/constants/app-constants';

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
    isAdmin: false,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let unsubscribeProfile: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            // Clean up previous profile listener
            if (unsubscribeProfile) {
                unsubscribeProfile();
                unsubscribeProfile = null;
            }

            if (firebaseUser) {
                // Real-time sync for the user profile (including stats)
                const docRef = doc(db, "users", firebaseUser.uid);
                unsubscribeProfile = onSnapshot(docRef, async (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data() as UserProfile;

                        if (data.disabled) {
                            await firebaseSignOut(auth);
                            setUserProfile(null);
                            setUser(null);
                        } else {
                            // Auto-sync admin role for whitelisted emails
                            if (firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email) && data.role !== 'admin') {
                                await updateDoc(docRef, { role: 'admin' });
                                setUserProfile({ ...data, role: 'admin' });
                            } else {
                                setUserProfile(data);
                            }

                            // Système de Garantie d'Email de Bienvenue
                            if (data.welcomeEmailSent !== true && data.email) {
                                (async () => {
                                    try {
                                        console.log("[AuthContext] Welcome email missing or unsent. Sending...");
                                        const res = await fetch('/api/welcome', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                email: data.email,
                                                name: data.displayName || 'Utilisateur'
                                            })
                                        });

                                        if (res.ok) {
                                            console.log("[AuthContext] Welcome email backup success. Updating flag...");
                                            const { updateDoc } = await import('firebase/firestore');
                                            await updateDoc(docRef, { welcomeEmailSent: true });
                                        }
                                    } catch (err) {
                                        console.error("[AuthContext] Welcome email trigger failed:", err);
                                    }
                                })();
                            }
                        }
                    } else {
                        // AUTO-REPAIR: If user exists in Auth but not in Firestore, create it
                        console.log("[AuthContext] Firestore profile missing. Auto-repairing...");
                        const defaultProfile: UserProfile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
                            role: 'user',
                            track: null,
                            createdAt: Date.now(),
                            welcomeEmailSent: false,
                            stats: {
                                total_attempts: 0,
                                average_score: 0,
                                last_activity: new Date().toISOString(),
                                theme_stats: {}
                            }
                        };
                        try {
                            const { setDoc } = await import('firebase/firestore');
                            await setDoc(docRef, defaultProfile);
                            setUserProfile(defaultProfile);
                        } catch (err) {
                            console.error("[AuthContext] Failed to auto-repair profile:", err);
                        }
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Profile sync error:", error);
                    setLoading(false);
                });
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeProfile) unsubscribeProfile();
        };
    }, []);

    // Fail-safe: If auth takes too long (e.g. mobile network issues), force loading false after 6s
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.warn("[AuthContext] Auth took too long. Forcing load...");
                setLoading(false);
            }
        }, 6000);
        return () => clearTimeout(timer);
    }, [loading]);

    const signOut = async () => {
        await firebaseSignOut(auth);
        router.push('/');
    };

    const refreshProfile = async () => {
        // No longer strictly needed but kept for backward compatibility if used anywhere
    };

    const isAdmin = userProfile?.role === 'admin' || (user?.email ? ADMIN_EMAILS.includes(user.email) : false);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, isAdmin, signOut, refreshProfile }}>
            {loading ? (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--color-background)] z-[9999]">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">CiviQ Quiz</h2>
                        <div className="flex gap-1">
                            <div className="w-4 h-1 bg-blue-600 rounded-full" />
                            <div className="w-4 h-1 bg-gray-200 rounded-full" />
                            <div className="w-4 h-1 bg-red-600 rounded-full" />
                        </div>
                    </div>
                    <p className="mt-8 text-sm text-gray-400 animate-pulse font-medium uppercase tracking-widest">Initialisation sécurisée...</p>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};
