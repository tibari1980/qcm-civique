import { NextResponse } from 'next/server';
import { decodeJwt } from 'jose';

/**
 * Utility to verify if a request is from a legitimate admin.
 * Since we are in the Edge runtime, we verify the ID token by calling
 * the Google Identity Toolkit API or by validating the Firestore user record.
 */
export async function verifyAdminRequest(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authorized: false, error: 'Authorization header missing' };
    }

    const idToken = authHeader.split('Bearer ')[1]?.trim();
    if (!idToken) {
        return { authorized: false, error: 'Token missing' };
    }
    const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/"/g, '').trim();
    
    // 0. Extract info locally for diagnostics and early check
    let decodedToken: any = null;
    try {
        decodedToken = decodeJwt(idToken);
    } catch (e) {
        console.error('[API Security] Token decoding failed:', e);
        return { authorized: false, error: 'Malformed token' };
    }

    const uid = decodedToken?.sub || decodedToken?.user_id;
    const email = decodedToken?.email;

    if (!uid) {
        return { authorized: false, error: 'User ID missing in token' };
    }

    // 0.5. Fallback: check for bootstrap admin email in JWT
    const bootstrapEmail = (process.env.NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL || process.env.BOOTSTRAP_ADMIN_EMAIL)?.trim();
    if (email && bootstrapEmail && email.toLowerCase() === bootstrapEmail.toLowerCase()) {
        console.log(`[API Security] Bootstrap admin authorized: ${email}`);
        return { authorized: true, uid, email };
    }

    try {
        // 1. Verify token with Google (Security Check)
        const authRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBgwmq_u5Z6rJS4z7Ndebo5dWzgP0MyHNE'}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            }
        );

        if (!authRes.ok) {
            const errBody = await authRes.text();
            console.error('[API Security] Token verification failed via Identity Toolkit:', errBody);
            return { authorized: false, error: 'Invalid ID Token' };
        }

        const authData = await authRes.json();
        const firebaseUser = authData.users?.[0];

        if (!firebaseUser) {
            return { authorized: false, error: 'User record not found' };
        }

        // 1.5. Performance shortcut: check for admin custom claim
        if (firebaseUser.customAttributes) {
            try {
                const attrs = JSON.parse(firebaseUser.customAttributes);
                if (attrs.admin === true) {
                    return { authorized: true, uid, email: firebaseUser.email };
                }
            } catch (e) {
                console.warn('[API Security] Failed to parse customAttributes:', e);
            }
        }

        // 2. Double check admin status in Firestore
        const { getAccessToken } = await import('./firebase-rest');
        const accessToken = await getAccessToken();

        const firestoreRes = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
            {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );

        if (!firestoreRes.ok) {
            console.warn(`[API Security] Firestore profile not found for ${uid}`);
            return { authorized: false, error: 'Profile not found' };
        }

        const profile = await firestoreRes.json();
        const role = profile.fields?.role?.stringValue;

        if (role !== 'admin') {
            console.warn(`[API Security] Forbidden: ${email || uid} is ${role}, not admin`);
            return { authorized: false, error: 'Forbidden: Admin access required' };
        }

        return { authorized: true, uid, email: email || firebaseUser.email };
    } catch (err: any) {
        console.error("[API Security] Exception during verification:", err.message);
        return { authorized: false, error: 'Internal verification error' };
    }
}

/**
 * Verifies if a request is from any authenticated user.
 */
export async function verifyUserRequest(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authorized: false, error: 'Authorization header missing' };
    }

    const idToken = authHeader.split('Bearer ')[1]?.trim();
    if (!idToken) {
        return { authorized: false, error: 'Token missing' };
    }

    try {
        const authRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBgwmq_u5Z6rJS4z7Ndebo5dWzgP0MyHNE'}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            }
        );

        if (!authRes.ok) {
            const errBody = await authRes.text();
            console.error('[API Security] Invalid ID Token (User):', errBody);
            return { authorized: false, error: 'Invalid ID Token' };
        }

        const authData = await authRes.json();
        const uid = authData.users?.[0]?.localId;

        if (!uid) {
            return { authorized: false, error: 'User not found in token' };
        }

        return { authorized: true, uid };
    } catch (err: any) {
        return { authorized: false, error: 'Verification failed' };
    }
}
