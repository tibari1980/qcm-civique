import { NextResponse } from 'next/server';

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

    try {
        // 1. Get user info from ID Token using Google Auth API
        const authRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
            }
        );

        if (!authRes.ok) {
            const errBody = await authRes.text();
            console.error('[API Security] Invalid ID Token (Admin):', errBody);
            return { authorized: false, error: 'Invalid ID Token' };
        }

        const authData = await authRes.json();
        const uid = authData.users?.[0]?.localId;

        if (!uid) {
            return { authorized: false, error: 'User not found in token' };
        }

        // 2. Double check admin status in Firestore
        // We need an access token for Firestore REST API
        const { getAccessToken } = await import('./firebase-rest');
        const accessToken = await getAccessToken();

        const firestoreRes = await fetch(
            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
            {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );

        if (!firestoreRes.ok) {
            return { authorized: false, error: 'Profile not found' };
        }

        const profile = await firestoreRes.json();
        const role = profile.fields?.role?.stringValue;

        if (role !== 'admin') {
            return { authorized: false, error: 'Forbidden: Admin access required' };
        }

        return { authorized: true, uid };
    } catch (err: any) {
        console.error("[API Security] Verification failed:", err.message);
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
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
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
