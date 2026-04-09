import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../lib/firebase-admin';
import { verifyAdminRequest } from '../../../../lib/api-security';

export async function POST(request: Request) {
    // 1. Verify that the requester is an admin
    const authResult = await verifyAdminRequest(request);
    if (!authResult.authorized) {
        return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 403 });
    }

    try {
        const { uid, role } = await request.json();
        console.log(`[API Set-Role] Request to set role ${role} for ${uid}`);

        if (!adminAuth || !adminDb) {
            console.error('[API Set-Role] Firebase Admin SDK not properly initialized. Check environment variables.');
            return NextResponse.json({ 
                error: 'Configuration error: Firebase Admin SDK not initialized on the server.' 
            }, { status: 500 });
        }

        if (!uid || !role || !['user', 'admin'].includes(role)) {
            console.error('[API Set-Role] Missing required parameters');
            return NextResponse.json({ error: 'Invalid parameters (uid and role required)' }, { status: 400 });
        }

        // --- Security Check: prevent bootstrap lockout ---
        const bootstrapEmail = process.env.NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL;
        if (role !== 'admin' && bootstrapEmail) {
            const userToUpdate = await adminAuth.getUser(uid);
            if (userToUpdate.email?.toLowerCase() === bootstrapEmail.toLowerCase()) {
                return NextResponse.json({ error: 'Cannot remove admin rights from the bootstrap administrator.' }, { status: 403 });
            }
        }

        // 2. Update Firestore
        console.log(`[API Set-Role] Updating Firestore for ${uid} to role ${role}...`);
        await adminDb.collection('users').doc(uid).update({ 
            role,
            updatedAt: Date.now()
        });
        console.log(`[API Set-Role] Firestore updated successfully.`);

        // 3. Update Firebase Auth Custom Claims
        const isAdmin = role === 'admin';
        console.log(`[API Set-Role] Setting Custom Claims for ${uid}: {admin: ${isAdmin}}...`);
        await adminAuth.setCustomUserClaims(uid, { admin: isAdmin });
        console.log(`[API Set-Role] Custom claims set successfully.`);

        return NextResponse.json({ 
            success: true, 
            message: `User role updated to ${role} effectively.` 
        });

    } catch (error: any) {
        console.error('[API Set-Role] Critical Error:', error);
        return NextResponse.json({ 
            error: error.message || 'Error occurred on the server' 
        }, { status: 500 });
    }
}
