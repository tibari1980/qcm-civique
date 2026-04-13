import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBgwmq_u5Z6rJS4z7Ndebo5dWzgP0MyHNE",
    authDomain: "qcm-civique.firebaseapp.com",
    projectId: "qcm-civique",
    storageBucket: "qcm-civique.firebasestorage.app",
    messagingSenderId: "821949209591",
    appId: "1:821949209591:web:94e7e231696ce45b64ecf2"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Enable offline persistence only on client side (browsers)
// On server-side (Next.js SSR/Edge), we must use memory cache to avoid hangs
let db: ReturnType<typeof getFirestore>;

const isBrowser = typeof window !== 'undefined';

try {
    db = initializeFirestore(app, {
        localCache: isBrowser 
            ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
            : memoryLocalCache()
    });
} catch (e) {
    // Fallback if already initialized
    db = getFirestore(app);
}

export { app, auth, db };
