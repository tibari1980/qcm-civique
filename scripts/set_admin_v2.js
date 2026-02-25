
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyBgwmq_u5Z6rJS4z7Ndebo5dWzgP0MyHNE",
    authDomain: "qcm-civique.firebaseapp.com",
    projectId: "qcm-civique",
    storageBucket: "qcm-civique.firebasestorage.app",
    messagingSenderId: "821949209591",
    appId: "1:821949209591:web:94e7e231696ce45b64ecf2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const TARGET_EMAIL = 'tibarinewdzign@gmail.com';
const TARGET_PASSWORD = 'Boudarga1980@';

async function main() {
    console.log(`Authenticating as: ${TARGET_EMAIL}...`);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, TARGET_EMAIL, TARGET_PASSWORD);
        const user = userCredential.user;
        console.log(`✅ Signed in as ${user.email} (uid: ${user.uid})`);

        console.log(`Searching for user document...`);
        // We can just use the user.uid directly if the document ID matches the UID (which is standard practice)
        // But the previous script queried by email, implying we might not be sure if doc ID == UID.
        // Let's try to update the document with ID = user.uid first.

        const userDocRef = doc(db, 'users', user.uid);

        try {
            await updateDoc(userDocRef, { role: 'admin' });
            console.log(`🎉 Direct update success! Role updated to 'admin' for user ${user.uid}`);
        } catch (updateError) {
            console.log(`⚠️ Direct update failed (${updateError.code}). Trying query...`);

            // Fallback: Query by email if doc ID != UID
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', TARGET_EMAIL));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log('❌ NO USER DOCUMENT FOUND via query.');
            } else {
                querySnapshot.forEach(async (document) => {
                    console.log(`✅ User document found: ${document.id}`);
                    const docRef = doc(db, 'users', document.id);
                    await updateDoc(docRef, { role: 'admin' });
                    console.log(`🎉 Role updated to 'admin' for user ${document.id}`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main().then(() => {
    // Give it a moment to finish async operations
    setTimeout(() => {
        console.log('Script finished.');
        process.exit(0);
    }, 3000);
});
