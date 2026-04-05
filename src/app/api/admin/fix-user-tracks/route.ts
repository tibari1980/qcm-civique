import { verifyAdminRequest } from '../../../../lib/api-security';
import { NextResponse } from 'next/server';
export const runtime = 'edge';
import { getAccessToken } from '../../../../lib/firebase-rest';

export async function POST(request: Request) {
    try {
        const authStatus = await verifyAdminRequest(request);
        if (!authStatus.authorized) {
            return NextResponse.json({ error: authStatus.error || 'Unauthorized' }, { status: 401 });
        }

        const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/"/g, '');
        if (!projectId) return NextResponse.json({ error: 'Project ID missing' }, { status: 500 });
        const accessToken = await getAccessToken();

        const baseQueryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
        const payload = {
            structuredQuery: {
                from: [{ collectionId: 'users' }]
            }
        };

        const res = await fetch(baseQueryUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Failed to fetch users: ${res.status} - ${errText}`);
        }

        const results = await res.json();
        const documents = results.filter((r: any) => r.document).map((r: any) => r.document);

        let updateCount = 0;
        const commitPayload = { writes: [] as any[] };

        for (const doc of documents) {
            const name = doc.name;
            const fields = doc.fields || {};
            
            const trackVal = fields.track?.stringValue;
            const isNullValue = fields.track?.nullValue !== undefined;
            const hasNoTrack = !fields.track;
            
            if (hasNoTrack || isNullValue || trackVal === 'residence' || trackVal === 'titre_sejour' || trackVal === '') {
                updateCount++;
                commitPayload.writes.push({
                    update: {
                        name: name,
                        fields: {
                            ...fields,
                            track: { stringValue: 'csp' }
                        }
                    },
                    updateMask: {
                        fieldPaths: ['track']
                    }
                });
            }
        }

        if (commitPayload.writes.length > 0) {
            const commitUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;
            const commitRes = await fetch(commitUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commitPayload)
            });
            
            if (!commitRes.ok) {
                const commitErr = await commitRes.text();
                throw new Error(`Batch commit failed: ${commitRes.status} ${commitErr}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${updateCount} utilisateurs réparés avec succès et placés sur Titre de Séjour (CSP).`
        });

    } catch (error: any) {
        console.error("[Fix User Tracks Route] Error:", error);
        return NextResponse.json({
            error: 'Failed to fix user tracks',
            details: error.message
        }, { status: 500 });
    }
}
