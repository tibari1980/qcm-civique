import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
    title: 'Contact - Prépa Examen Civique FR',
    description: "Contactez notre équipe pédagogique. Nous répondons en moins de 24h ouvrées.",
};

export default function ContactPage() {
    return <ContactForm />;
}
