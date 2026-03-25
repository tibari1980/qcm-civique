import { verifyAdminRequest } from '@/lib/api-security';
import { NextResponse } from 'next/server';
export const runtime = 'edge';
import { getAccessToken } from '@/lib/firebase-rest';

export async function POST(request: Request) {
    try {
        // 0. Security Check
        const authStatus = await verifyAdminRequest(request);
        if (!authStatus.authorized) {
            return NextResponse.json({ error: authStatus.error || 'Unauthorized' }, { status: 401 });
        }

        const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/"/g, '');
        if (!projectId) return NextResponse.json({ error: 'Project ID missing (FIREBASE_PROJECT_ID)' }, { status: 500 });


        const accessToken = await getAccessToken();

        // 1. Lister les utilisateurs de Firebase Auth via REST API (Admin Query)
        // La méthode POST accounts:query est la plus robuste pour l'énumération admin.
        const listRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:query`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    returnUserInfo: true,
                    pageSize: 1000
                })
            }
        );

        const text = await listRes.text();
        if (!listRes.ok) {
            console.error(`[Sync Users REST] Auth API error (${listRes.status}):`, text);
            return NextResponse.json({
                error: 'Google Auth API Error',
                details: text.substring(0, 200)
            }, { status: listRes.status });
        }

        let data: any;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("[Sync Users REST] Invalid JSON response:", text);
            return NextResponse.json({ error: 'Invalid JSON from Google Auth' }, { status: 500 });
        }

        // On accepte 'users' ou 'userInfo' car le nom peut varier selon la version ou la config
        const authUsers = data.users || data.userInfo || [];


        let createdCount = 0;
        let skipCount = 0;

        // 2. Vérifier et créer les profils manquants dans Firestore
        for (const user of authUsers) {
            try {
                const uid = user.localId || user.uid;
                if (!uid) continue;

                // Vérifier existence
                const checkRes = await fetch(
                    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
                    {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    }
                );

                if (checkRes.status === 404) {
                    // ... (Code de création identique) ...
                    const defaultProfile = {
                        fields: {
                            uid: { stringValue: uid },
                            email: { stringValue: user.email || '' },
                            displayName: { stringValue: user.displayName || user.email?.split('@')[0] || 'Utilisateur' },
                            role: { stringValue: 'user' },
                            track: { nullValue: null },
                            createdAt: { integerValue: (user.createdAt || Date.now()).toString() },
                            welcomeEmailSent: { booleanValue: true },
                            stats: {
                                mapValue: {
                                    fields: {
                                        total_attempts: { integerValue: "0" },
                                        average_score: { integerValue: "0" },
                                        last_activity: { stringValue: new Date().toISOString() },
                                        theme_stats: { mapValue: { fields: {} } }
                                    }
                                }
                            }
                        }
                    };

                    const createRes = await fetch(
                        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?documentId=${uid}`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(defaultProfile)
                        }
                    );

                    if (createRes.ok) createdCount++;
                    else console.warn(`[Sync Users REST] Failed to create profile for ${uid}:`, createRes.status);
                } else {
                    // Le document existe, vérifions et réparons tous les champs de base manquants
                    const existingData = await checkRes.json();
                    const fields = existingData.fields || {};
                    const updates: any = { fields: {} };
                    const updateMasks: string[] = [];

                    if (!fields.createdAt) {
                        updates.fields.createdAt = { integerValue: (user.createdAt || Date.now()).toString() };
                        updateMasks.push('createdAt');
                    }
                    if (!fields.email || !fields.email.stringValue) {
                        updates.fields.email = { stringValue: user.email || '' };
                        updateMasks.push('email');
                    }
                    if (!fields.displayName || !fields.displayName.stringValue) {
                        const fallBackName = user.displayName || user.email?.split('@')[0] || 'Utilisateur';
                        updates.fields.displayName = { stringValue: fallBackName };
                        updateMasks.push('displayName');
                    }
                    if (!fields.uid || !fields.uid.stringValue) {
                        updates.fields.uid = { stringValue: uid };
                        updateMasks.push('uid');
                    }

                    if (updateMasks.length > 0) {
                        const maskParam = updateMasks.map(m => `updateMask.fieldPaths=${m}`).join('&');
                        await fetch(
                            `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?${maskParam}`,
                            {
                                method: 'PATCH',
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(updates)
                            }
                        );
                    }
                    skipCount++;
                }
            } catch (userError) {
                console.error(`[Sync Users REST] Error processing user:`, userError);
                // On continue pour les autres utilisateurs
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synchronisation terminée. ${createdCount} nouveaux profils, ${skipCount} déjà présents.`,
            totalAuthUsers: authUsers.length
        });

    } catch (error: any) {
        console.error("[Sync Users REST] Error:", error);
        return NextResponse.json({
            error: 'Failed to sync users',
            details: error.message
        }, { status: 500 });
    }
}
