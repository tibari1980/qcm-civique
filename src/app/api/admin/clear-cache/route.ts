import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminRequest } from '@/lib/api-security';

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const authStatus = await verifyAdminRequest(request);
        if (!authStatus.authorized) {
            return NextResponse.json({ error: authStatus.error || 'Unauthorized' }, { status: 401 });
        }

        // Purgation du cache complet du routeur Next.js
        revalidatePath('/', 'layout');

        return NextResponse.json({ success: true, message: 'Le cache du serveur a été purgé avec succès.' });
    } catch (error: any) {
        console.error("Cache clear failed:", error);
        return NextResponse.json({ error: 'Erreur lors de la purge du cache', details: error.message }, { status: 500 });
    }
}
