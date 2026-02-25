import { NextResponse } from 'next/server';
export const runtime = 'edge';
import { welcomeTemplate } from '@/constants/emailTemplates';

export async function POST(request: Request) {
    try {
        const { email, senderEmail } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const apiKey = process.env.BREVO_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                error: 'API Key missing',
                message: 'BREVO_API_KEY is not defined in environment variables'
            }, { status: 500 });
        }

        // Log key format for dev debugging (STAY SECURE: only show ends)
        console.log(`[Test Email API] Key loaded. Format: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

        const name = "Test Admin";
        // Use provided sender or default
        const sender = {
            name: 'CiviQ Quiz',
            email: senderEmail || 'contact@civiqquiz.com'
        };

        const htmlContent = welcomeTemplate(name);

        console.log(`[Test Email API] Sending test to ${email} from ${sender.email}...`);

        const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify({
                sender: sender,
                to: [{ email, name }],
                subject: '🧪 Test d\'envoi CiviQ Quiz',
                htmlContent: htmlContent
            })
        });

        const data = await brevoResponse.json();
        console.log(`[Test Email API] Brevo response status: ${brevoResponse.status}`);

        return NextResponse.json({
            success: brevoResponse.ok,
            status: brevoResponse.status,
            senderUsed: sender.email,
            brevoResponse: data
        });

    } catch (error: any) {
        console.error("[Test Email API] Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
