import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '../../../../lib/api-security';
import { getAccessToken } from '../../../../lib/firebase-rest';

export const runtime = 'edge';

export async function POST(request: Request) {
    // 1. Verify that the requester is an admin (Edge-compatible via jose)
    const authResult = await verifyAdminRequest(request);
    if (!authResult.authorized) {
        return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 403 });
    }

    try {
        const { uid, role } = await request.json();
        const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/"/g, '').trim();

        if (!projectId) {
            return NextResponse.json({ error: 'Configuration error: Missing FIREBASE_PROJECT_ID' }, { status: 500 });
        }

        if (!uid || !role || !['user', 'admin'].includes(role)) {
            return NextResponse.json({ error: 'Invalid parameters (uid and role required)' }, { status: 400 });
        }

        // 2. Get Google Access Token for REST API calls
        const accessToken = await getAccessToken();

        // 3. Security: Prevent bootstrap admin lockout
        const bootstrapEmail = process.env.NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL;
        if (role !== 'admin' && bootstrapEmail) {
            // Check user email via Identity Toolkit REST
            const getUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`;
            const getRes = await fetch(getUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ localId: [uid] })
            });
            
            if (getRes.ok) {
                const data = await getRes.json();
                const userEmail = data.users?.[0]?.email;
                if (userEmail?.toLowerCase() === bootstrapEmail.toLowerCase()) {
                    return NextResponse.json({ error: 'Cannot remove admin rights from the bootstrap administrator.' }, { status: 403 });
                }
            }
        }

        // 4. Update Firestore via REST
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=role&updateMask.fieldPaths=updatedAt`;
        const firestorePayload = {
            fields: {
                role: { stringValue: role },
                updatedAt: { integerValue: Date.now().toString() }
            }
        };

        const firestoreRes = await fetch(firestoreUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(firestorePayload)
        });

        if (!firestoreRes.ok) {
            const err = await firestoreRes.text();
            throw new Error(`Firestore update failed: ${err}`);
        }

        // 5. Update Custom Claims via Identity Toolkit REST
        const authUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:setAccountInfo`;
        const isAdmin = role === 'admin';
        const authPayload = {
            localId: uid,
            customAttributes: JSON.stringify({ admin: isAdmin })
        };

        const authRes = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(authPayload)
        });

        if (!authRes.ok) {
            const err = await authRes.text();
            throw new Error(`Auth claims update failed: ${err}`);
        }

        return NextResponse.json({ 
            success: true, 
            message: `User role updated to ${role} via Cloudflare Edge.` 
        });

    } catch (error: any) {
        console.error('[API Set-Role Edge] Error:', error);
        return NextResponse.json({ 
            error: error.message || 'Error occurred on the edge server' 
        }, { status: 500 });
    }
}

