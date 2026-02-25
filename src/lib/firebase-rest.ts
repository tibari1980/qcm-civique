// lib/firebase-rest.ts
import { importPKCS8, SignJWT } from 'jose';

/**
 * Génère un jeton d'accès Google OAuth2 en utilisant les identifiants du Service Account.
 * Compatible avec le runtime Edge de Cloudflare.
 */
export async function getAccessToken() {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/"/g, '').trim();
    let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/"/g, '').trim();

    if (!clientEmail || !privateKey) {
        throw new Error('Identifiants du Service Account manquants (FIREBASE_CLIENT_EMAIL ou FIREBASE_PRIVATE_KEY).');
    }

    // Gestion des sauts de ligne si encodés littéralement
    if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: clientEmail,
        sub: clientEmail,
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
        scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/cloud-platform',
    };

    const algorithm = 'RS256';

    try {
        // Importation de la clé privée pour jose
        const ecPrivateKey = await importPKCS8(privateKey, algorithm);

        // Signature du JWT
        const jwt = await new SignJWT(payload)
            .setProtectedHeader({ alg: algorithm })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(ecPrivateKey);

        // Échange du JWT contre un jeton d'accès
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt,
            }),
        });

        const text = await response.text();
        if (!response.ok) {
            console.error("[Firebase REST] OAuth Token Error Response:", text);
            throw new Error(`Erreur OAuth (${response.status}) : ${text.substring(0, 100)}...`);
        }

        try {
            const data = JSON.parse(text) as { access_token: string };
            return data.access_token;
        } catch (e) {
            console.error("[Firebase REST] OAuth Token Parse Error. Body:", text);
            throw new Error("Le serveur OAuth de Google a renvoyé une réponse invalide (non-JSON).");
        }
    } catch (err: any) {
        console.error("[Firebase REST] getAccessToken exception:", err.message);
        throw err;
    }
}
