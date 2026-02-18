
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBgwmq_u5Z6rJS4z7Ndebo5dWzgP0MyHNE",
    authDomain: "qcm-civique.firebaseapp.com",
    projectId: "qcm-civique",
    storageBucket: "qcm-civique.firebasestorage.app",
    messagingSenderId: "821949209591",
    appId: "1:821949209591:web:94e7e231696ce45b64ecf2"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
