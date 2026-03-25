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
                        }
                    } else {
                        // AUTO-REPAIR: If user exists in Auth but not in Firestore, create it
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
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-950 z-[9999]">
                    <div className="relative mb-12 animate-in fade-in zoom-in duration-700">
                        {/* Elegant layered rings */}
                        <div className="absolute inset-[-12px] border-2 border-blue-500/10 rounded-full animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-[-24px] border border-red-500/5 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
                        
                        <div className="w-24 h-24 relative flex items-center justify-center">
                            <div className="w-full h-full border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin" />
                            <div className="absolute flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest italic">
                            Civiq<span className="text-blue-600">Quiz</span>
                        </h2>
                        <div className="flex items-center justify-center gap-2">
                             <div className="h-0.5 w-8 bg-gradient-to-r from-blue-600 to-transparent rounded-full" />
                             <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Excellence Civique</p>
                             <div className="h-0.5 w-8 bg-gradient-to-l from-red-600 to-transparent rounded-full" />
                        </div>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};
