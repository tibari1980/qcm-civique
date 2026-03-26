import { verifyAdminRequest } from '../../../../lib/api-security';
import { NextResponse } from 'next/server';
export const runtime = 'edge';
import { getAccessToken } from '../../../../lib/firebase-rest';

export async function POST(request: Request) {
    try {
        // 0. Security Check
        const authStatus = await verifyAdminRequest(request);
        if (!authStatus.authorized) {
            return NextResponse.json({ error: authStatus.error || 'Unauthorized' }, { status: 401 });
        }

        const { uid: docId } = await request.json();
        const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/"/g, '');

        if (!docId || !projectId) {
            return NextResponse.json({ error: 'Config ou ID manquant' }, { status: 400 });
        }


        // 1. Obtenir le token d'accès
        const token = await getAccessToken();

        // 2. Extraire les infos Firestore (si encore présentes)
        const getFirestoreDoc = async () => {
            const res = await fetch(
                `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            return res.ok ? await res.json() : null;
        };

        const docData = await getFirestoreDoc();
        const firestoreEmail = docData?.fields?.email?.stringValue;
        const firestoreInternalUid = docData?.fields?.uid?.stringValue;


        // 3. Identification CERTIFIÉE dans Firebase Auth
        const findAuthUids = async () => {
            const identifiers: any = { localId: [] };

            // On accumule tout ce qui ressemble à un email ou un UID
            const emailsToLookup = [];
            if (firestoreEmail) emailsToLookup.push(firestoreEmail);
            if (docId.includes('@')) emailsToLookup.push(docId);

            if (emailsToLookup.length > 0) identifiers.email = emailsToLookup;

            // On ajoute les IDs connus à la recherche
            identifiers.localId.push(docId);
            if (firestoreInternalUid) identifiers.localId.push(firestoreInternalUid);

            const res = await fetch(
                `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(identifiers)
                }
            );

            if (!res.ok) {
                console.error(`[ULTRA-DELETE] Auth lookup failed with status: ${res.status}`);
                return [];
            }
            const data = await res.json();
            return data.users?.map((u: any) => u.localId) || [];
        };

        const uidsToPurge = await findAuthUids();

        // On s'assure d'avoir au moins le docId s'il ressemble à un UID
        if (!docId.includes('@')) uidsToPurge.push(docId);

        const finalUids = Array.from(new Set(uidsToPurge.filter(Boolean))) as string[];

        // 4. Exécution de la destruction (Individuelle pour la fiabilité maximale)
        const deleteFromAuth = async (uid: string) => {
            const res = await fetch(
                `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:delete`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ localId: uid })
                }
            );
            const status = res.status;
            // 200 = succès, 400 = utilisateur introuvable (déjà supprimé ?)
            return status === 200 || status === 400;
        };

        const deleteFromFirestore = async () => {
            const res = await fetch(
                `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${docId}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            return res.ok;
        };

        // On lance tout en parallèle
        const authResults = await Promise.all(finalUids.map(uid => deleteFromAuth(uid)));
        const firestoreResult = await deleteFromFirestore();


        return NextResponse.json({
            success: true,
            message: 'Nettoyage atomique effectué (Auth + Firestore)',
            uidsSuppressed: finalUids,
            docDeleted: firestoreResult
        });

    } catch (error: any) {
        console.error("[ULTRA-DELETE] Fatal Server Error:", error);
        return NextResponse.json({ error: 'Erreur lors de la suppression nucléaire', details: error.message }, { status: 500 });
    }
}
