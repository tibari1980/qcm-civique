// lib/firebase-admin.ts
// Approche hybride : charge firebase-admin uniquement dans un vrai environnement Node.js (Localhost)
let adminAuth: any = null;
let adminDb: any = null;

// Détection robuste de l'environnement Node.js (non-Edge)
const isNode = typeof process !== 'undefined' && !!process.versions?.node;
const isDev = process.env.NODE_ENV === 'development';

if (isNode && typeof window === 'undefined') {
    try {
        const admin = eval('require')('firebase-admin');

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }

        adminAuth = admin.auth();
        adminDb = admin.firestore();
    } catch (e) {
        // Silencieux sur l'Edge
    }
}

export { adminAuth, adminDb };
