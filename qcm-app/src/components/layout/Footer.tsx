
import React from 'react';
import Link from 'next/link';

/**
 * Footer — Pied de page
 * WCAG 2.1 AA :
 * - <footer> avec aria-label pour différencier du header
 * - <nav> avec aria-label distinct de la nav principale
 * - Liens avec textes descriptifs
 */
export function Footer() {
    return (
        <footer aria-label="Pied de page" className="border-t border-gray-200 bg-white py-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Bloc marque */}
                    <div>
                        <p className="font-bold text-lg mb-4 text-[var(--color-primary)]">
                            Prépa Examen Civique FR
                        </p>
                        <p className="text-sm text-gray-500">
                            Préparez votre examen civique français avec des QCM officiels et des cours détaillés.
                        </p>
                    </div>

                    {/* Navigation liens utiles */}
                    <nav aria-label="Liens utiles">
                        <h2 className="font-semibold text-sm mb-4 text-gray-900">Liens utiles</h2>
                        <ul className="space-y-2 text-sm text-gray-500" role="list">
                            <li>
                                <Link href="/training" className="hover:text-[var(--color-primary)] transition-colors">
                                    Entraînement
                                </Link>
                            </li>
                            <li>
                                <Link href="/exam" className="hover:text-[var(--color-primary)] transition-colors">
                                    Examen Blanc
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-[var(--color-primary)] transition-colors">
                                    À propos
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-[var(--color-primary)] transition-colors">
                                    Contactez-nous
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Navigation légale */}
                    <nav aria-label="Mentions légales">
                        <h2 className="font-semibold text-sm mb-4 text-gray-900">Légal</h2>
                        <ul className="space-y-2 text-sm text-gray-500" role="list">
                            <li>
                                <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">
                                    Politique de confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">
                                    {"Conditions d'utilisation"}
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6">
                    <p className="text-center text-sm text-gray-400">
                        <span aria-label="Copyright">©</span>{' '}
                        {new Date().getFullYear()} Prépa Examen Civique FR. Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
}
