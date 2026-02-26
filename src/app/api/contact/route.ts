import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        // Basic validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Tous les champs sont obligatoires.' },
                { status: 400 }
            );
        }

        const apiKey = process.env.BREVO_API_KEY;

        if (!apiKey) {
            console.error('BREVO_API_KEY is not defined in environment variables');
            return NextResponse.json(
                { error: 'Config error' },
                { status: 500 }
            );
        }

        // Brevo API call to send transactional email
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: "CiviQ Quiz Contact",
                    email: "contact@civiqquiz.com"
                },
                to: [
                    {
                        email: "tibarinewdzign@gmail.com",
                        name: "Support CiviQ Quiz"
                    }
                ],
                replyTo: {
                    email: email,
                    name: name
                },
                subject: `Nouveau message: ${subject}`,
                htmlContent: `
                    <h2>Nouveau message de contact</h2>
                    <p><strong>Nom:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Sujet:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                `
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Brevo API error:', error);
            return NextResponse.json(
                { error: 'Erreur lors de l\'envoi de l\'email.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur.' },
            { status: 500 }
        );
    }
}
