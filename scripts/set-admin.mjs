/**
 * set-admin.mjs
 * 
 * Script one-shot pour attribuer le rôle "admin" à un compte Firebase.
 * Usage : node scripts/set-admin.mjs
 * 
 * Nécessite : npm install firebase (déjà installé dans le projet)
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    setDoc,
} from 'firebase/firestore';

/* ─── Config Firebase (copiée depuis .env.local) ─── */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const TARGET_EMAIL = 'tibarinewdzign@gmail.com';

async function main() {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log(`\n🔍 Recherche du compte : ${TARGET_EMAIL}`);

    const q = query(collection(db, 'users'), where('email', '==', TARGET_EMAIL));
    const snap = await getDocs(q);

    if (snap.empty) {
        console.log('⚠️  Aucun document users/ trouvé pour cet email.');
        console.log('   → L\'utilisateur doit d\'abord se connecter une fois pour créer son profil.');
        console.log('   → Une fois connecté, relancez ce script.');
        process.exit(1);
    }

    for (const d of snap.docs) {
        await updateDoc(doc(db, 'users', d.id), { role: 'admin' });
        console.log(`✅ Rôle "admin" attribué à uid=${d.id} (${TARGET_EMAIL})`);
    }

    console.log('\n🎉 Terminé ! Reconnectez-vous sur l\'application pour activer les droits admin.\n');
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
});
