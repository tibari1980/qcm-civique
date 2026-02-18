import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

console.log("Script starting...");

const firebaseConfig = {
    apiKey: "AIzaSyBgwmq_u5Z6rJS4z7Ndebo5dWzgP0MyHNE",
    authDomain: "qcm-civique.firebaseapp.com",
    projectId: "qcm-civique",
    storageBucket: "qcm-civique.firebasestorage.app",
    messagingSenderId: "821949209591",
    appId: "1:821949209591:web:94e7e231696ce45b64ecf2"
};

try {
    const app = initializeApp(firebaseConfig);
    console.log("Firebase initialized.");
    const db = getFirestore(app);
    console.log("Firestore initialized.");
    const auth = getAuth(app);
    console.log("Auth initialized.");

    async function cleanQuestions() {
        try {
            console.log("Attempting sign in...");
            await signInAnonymously(auth);
            console.log("Signed in anonymous.");

            const questionsRef = collection(db, 'questions');
            console.log("Fetching documents...");
            const snapshot = await getDocs(questionsRef);
            console.log(`Found ${snapshot.size} questions.`);

            let batch = writeBatch(db);
            let count = 0;
            let totalUpdated = 0;

            for (const docSnapshot of snapshot.docs) {
                const data = docSnapshot.data();
                const originalQuestion = data.question;

                if (!originalQuestion) continue;

                // Regex/Logic to remove "Variante"
                // Handles:
                // "(Variante 1)" at end
                // "Variante 2 :" at start
                // "Variante :" anywhere
                let newQuestion = originalQuestion
                    .replace(/\(Variante\s*\d*\)/gi, '') // Remove (Variante X)
                    .replace(/^Variante\s*\d*\s*[:.-]?\s*/gi, '') // Remove Variante X : at start
                    .replace(/Variante\s*\d*/gi, '') // Remove remaining Variante X
                    .replace(/\s+/g, ' ') // Collapse multiple spaces
                    .trim();

                // Clean up any trailing colons if they were left behid
                // newQuestion = newQuestion.replace(/\s*:\s*$/, ''); 

                if (newQuestion !== originalQuestion) {
                    console.log(`Updating: "${originalQuestion}" -> "${newQuestion}"`);
                    const docRef = doc(db, "questions", docSnapshot.id);
                    batch.update(docRef, { question: newQuestion });
                    count++;

                    if (count >= 400) {
                        await batch.commit();
                        totalUpdated += count;
                        console.log(`Committed ${totalUpdated} updates...`);
                        batch = writeBatch(db);
                        count = 0;
                    }
                }
            }

            if (count > 0) {
                await batch.commit();
                totalUpdated += count;
            }

            console.log(`Finished. Updated ${totalUpdated} questions.`);
            process.exit(0);

        } catch (error) {
            console.error("Error during execution:", error);
            process.exit(1);
        }
    }

    cleanQuestions();
} catch (e) {
    console.error("Top level error:", e);
}
