
import React from 'react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white py-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-[var(--color-primary)]">Prépa Examen Civique FR</h3>
                        <p className="text-sm text-gray-500">
                            La plateforme de référence pour réussir votre examen civique obligatoire.
                            Entraînez-vous, progressez et réussissez.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Liens Utiles</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><Link href="/about" className="hover:text-[var(--color-primary)]">À propos</Link></li>
                            <li><Link href="/contact" className="hover:text-[var(--color-primary)]">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-[var(--color-primary)]">Confidentialité</Link></li>
                            <li><Link href="/terms" className="hover:text-[var(--color-primary)]">Conditions d&apos;utilisation</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <p className="text-sm text-gray-500 mb-2">Besoin d&apos;aide ? Contactez-nous.</p>
                        <a href="mailto:contact@prepacivique.fr" className="text-sm text-[var(--color-primary)] hover:underline">
                            contact@prepacivique.fr
                        </a>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
                    © {new Date().getFullYear()} Prépa Examen Civique FR. Tous droits réservés.
                </div>
            </div>
        </footer>
    );
}
