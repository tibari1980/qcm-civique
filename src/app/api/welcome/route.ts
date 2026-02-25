import { NextResponse } from 'next/server';
export const runtime = 'edge';
import { welcomeTemplate } from '@/constants/emailTemplates';

import { verifyUserRequest } from '@/lib/api-security';

export async function POST(request: Request) {
    try {
        // Security Check
        const authStatus = await verifyUserRequest(request);
        if (!authStatus.authorized) {
            return NextResponse.json({ error: authStatus.error || 'Unauthorized' }, { status: 401 });
        }

        const { email, name } = await request.json();

        if (!email || !name) {
            return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
        }

        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'contact@civiqquiz.com';

        if (!apiKey) {
            console.error('[Welcome API] CRITICAL ERROR: BREVO_API_KEY is missing from environment.');
            return NextResponse.json({
                error: 'Configuration Error',
                message: 'La clé BREVO_API_KEY n\'est pas définie sur le serveur Cloudflare.'
            }, { status: 500 });
        }

        console.log(`[Welcome API] Diagnostics - Sender: ${senderEmail}, KeyPresent: ${!!apiKey}, KeyFormat: ${apiKey.substring(0, 5)}...`);

        // Utiliser le template importé
        const htmlContent = welcomeTemplate(name);

        const brevoPayload = {
            sender: {
                name: 'CiviQ Quiz',
                email: senderEmail
            },
            to: [{ email, name }],
            subject: '🇫🇷 Bienvenue sur CiviQ Quiz !',
            htmlContent: htmlContent
        };

        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify(brevoPayload)
        });

        const status = brevoResponse.status;
        const data = await brevoResponse.json();

        console.log(`[Welcome API] Brevo Response (${status}):`, JSON.stringify(data));

        if (!brevoResponse.ok) {
            return NextResponse.json({
                error: 'Brevo API Error',
                status: status,
                details: data,
                suggestion: status === 401 ? 'Vérifiez votre BREVO_API_KEY' : 'Vérifiez que votre SENDER_EMAIL est valide dans Brevo'
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, messageId: data.messageId });
    } catch (error: any) {
        console.error('[Welcome API] UNEXPECTED SYSTEM ERROR:', error);
        return NextResponse.json({ error: error.message || 'System crash' }, { status: 500 });
    }
}
