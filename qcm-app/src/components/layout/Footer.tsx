'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Footer — Pied de page
 * WCAG 2.1 AA :
 * - <footer> avec aria-label pour différencier du header
 * - <nav> avec aria-label distinct de la nav principale
 * - Liens avec textes descriptifs
 */
import { useSettings } from '@/context/SettingsContext';
import { Instagram, Linkedin, Mail } from 'lucide-react';

/**
 * Footer — Pied de page
 */
export function Footer() {
    const { settings } = useSettings();

    return (
        <footer aria-label="Pied de page" className="border-t border-gray-200 bg-white py-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Bloc marque */}
                    <div>
                        <p className="font-bold text-lg mb-4 text-[var(--color-primary)]">
                            {settings.appName}
                        </p>
                        <p className="text-sm text-gray-500">
                            Préparez votre examen civique français efficacement avec des outils personnalisés et des contenus de qualité.
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            {settings.contactEmail && (
                                <a href={`mailto:${settings.contactEmail}`} className="text-gray-400 hover:text-[var(--color-primary)] transition-colors" aria-label="Nous envoyer un email">
                                    <Mail className="h-5 w-5" />
                                </a>
                            )}
                            {settings.socialInstagram && (
                                <a href={`https://instagram.com/${settings.socialInstagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors" aria-label="Suivre sur Instagram">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {settings.socialLinkedIn && (
                                <a href={`https://linkedin.com/in/${settings.socialLinkedIn}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors" aria-label="Suivre sur LinkedIn">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Navigation liens utiles */}
                    <nav aria-label="Liens utiles">
                        <h2 className="font-semibold text-sm mb-4 text-gray-900">Navigation</h2>
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
                            {settings.enableInterview && (
                                <li>
                                    <Link href="/interview" className="hover:text-[var(--color-primary)] transition-colors">
                                        Entretien
                                    </Link>
                                </li>
                            )}
                            <li>
                                <Link href="/contact" className="hover:text-[var(--color-primary)] transition-colors">
                                    Contact
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
                                    Confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">
                                    {"Conditions"}
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-400">
                        <span aria-label="Copyright">©</span>{' '}
                        {new Date().getFullYear()} {settings.appName}. Tous droits réservés.
                    </p>
                    <p className="text-xs text-gray-300">
                        Propulsé par JL Cloud
                    </p>
                </div>
            </div>
        </footer>
    );
}
