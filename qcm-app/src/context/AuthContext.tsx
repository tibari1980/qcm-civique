'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Added db import
import { doc, getDoc } from 'firebase/firestore'; // Added Firestore imports
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';

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

    const fetchUserProfile = async (uid: string) => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
            } else {
                console.log("No user profile found!");
                setUserProfile(null);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                await fetchUserProfile(user.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        await firebaseSignOut(auth);
        router.push('/');
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchUserProfile(user.uid);
        }
    }

    const isAdmin = userProfile?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, userProfile, loading, isAdmin, signOut, refreshProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
