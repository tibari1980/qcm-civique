import { verifyAdminRequest } from '../../../../lib/api-security';
import { NextResponse } from 'next/server';
export const runtime = 'edge';
import { getAccessToken } from '../../../../lib/firebase-rest';

export async function POST(request: Request) {
    try {
        // 1. Authentification
        const authStatus = await verifyAdminRequest(request);
        if (!authStatus.authorized) {
            return NextResponse.json({ error: authStatus.error || 'Unauthorized' }, { status: 401 });
        }

        const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/"/g, '');
        if (!projectId) return NextResponse.json({ error: 'Project ID missing' }, { status: 500 });
        const accessToken = await getAccessToken();

        // 2. Récupération de toutes les questions via API REST Firestore
        const baseQueryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
        
        const payload = {
            structuredQuery: {
                from: [{ collectionId: 'questions' }]
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
            throw new Error(`Failed to fetch questions: ${res.status} - ${errText}`);
        }

        const results = await res.json();
        const documents = results
            .filter((r: any) => r.document)
            .map((r: any) => r.document);

        let updateCount = 0;
        let skipCount = 0;
        
        // 3. Algorithme de redéploiement et chunking
        const BATCH_SIZE = 500;
        const chunks = [];
        for (let i = 0; i < documents.length; i += BATCH_SIZE) {
            chunks.push(documents.slice(i, i + BATCH_SIZE));
        }

        for (const chunk of chunks) {
            // Création de Commit HTTP (écriture par lot) REST API Firestore
            const commitPayload = { writes: [] as any[] };

            for (const doc of chunk) {
                const name = doc.name; // par ex. projects/xxx/databases/(default)/documents/questions/id
                const fields = doc.fields || {};
                
                const theme = fields.theme?.stringValue || '';
                const level = fields.level?.stringValue || '';
                
                // --- LE CERVEAU ALGORITHMIQUE ---
                let newTargets: string[] = [];
                
                if (theme === 'naturalisation') {
                    newTargets = ['naturalisation'];
                } else if (level === 'Avancé' || level === 'Difficile') {
                    newTargets = ['naturalisation'];
                } else if (level === 'Intermédiaire') {
                    newTargets = ['carte_resident', 'naturalisation'];
                } else {
                    // Par défaut et Niveau Débutant
                    newTargets = ['titre_sejour', 'carte_resident', 'naturalisation'];
                }

                // Check si c'est déjà parfaitement le cas pour éviter d'écrire pour rien
                const currentTargets = fields.exam_types?.arrayValue?.values?.map((v:any) => v.stringValue) || [];
                const isIdentical = currentTargets.length === newTargets.length && currentTargets.every((v:string, i:number) => v === newTargets[i]);

                if (isIdentical) {
                    skipCount++;
                    continue;
                }

                updateCount++;
                
                // Préparer la modification
                commitPayload.writes.push({
                    update: {
                        name: name,
                        fields: {
                            ...fields,
                            exam_types: {
                                arrayValue: {
                                    values: newTargets.map(t => ({ stringValue: t }))
                                }
                            }
                        }
                    },
                    updateMask: {
                        fieldPaths: ['exam_types']
                    }
                });
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
                    console.error("Batch commit failed:", commitErr);
                    throw new Error(`Batch commit failed: ${commitRes.status}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Redistribution intelligente terminée. ${updateCount} questions réaffectées, ${skipCount} étaient déjà conformes.`
        });

    } catch (error: any) {
        console.error("[Redistribute Route] Error:", error);
        return NextResponse.json({
            error: 'Failed to redistribute questions',
            details: error.message
        }, { status: 500 });
    }
}
