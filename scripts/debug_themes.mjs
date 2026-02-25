
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBgwmq_u5Z6rJS4z7Ndebo5dWzgP0MyHNE",
    authDomain: "qcm-civique.firebaseapp.com",
    projectId: "qcm-civique",
    storageBucket: "qcm-civique.firebasestorage.app",
    messagingSenderId: "821949209591",
    appId: "1:821949209591:web:94e7e231696ce45b64ecf2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkThemes() {
    console.log("Fetching questions...");
    const snap = await getDocs(collection(db, 'questions'));
    const themes = {};
    snap.docs.forEach(d => {
        const t = d.data().theme || 'undefined';
        themes[t] = (themes[t] || 0) + 1;
    });
    console.log('Detected themes in DB:', JSON.stringify(themes, null, 2));
    process.exit(0);
}

checkThemes().catch(err => {
    console.error(err);
    process.exit(1);
});
