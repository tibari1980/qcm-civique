import { db } from './src/lib/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function checkThemes() {
    const snap = await getDocs(collection(db, 'questions'));
    const themes = {};
    snap.docs.forEach(d => {
        const t = d.data().theme || 'undefined';
        themes[t] = (themes[t] || 0) + 1;
    });
    console.log('Detected themes in DB:', themes);
}

checkThemes();
