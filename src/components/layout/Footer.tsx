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
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { Instagram, Linkedin, Mail } from 'lucide-react';

/**
 * Footer — Pied de page
 */
export function Footer() {
    const { user, userProfile, isAdmin } = useAuth();
    const { settings } = useSettings();
    const isRestricted = !!(user && userProfile && !userProfile.track && !isAdmin);

    return (
        <footer aria-label="Pied de page" className="relative bg-gray-900 pt-20 pb-10 overflow-hidden">
            {/* Décoration Tricolore subtile en haut */}
            <div className="absolute top-0 left-0 w-full h-1.5 flex">
                <div className="h-full flex-1 bg-blue-600" />
                <div className="h-full flex-1 bg-white" />
                <div className="h-full flex-1 bg-red-600" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Bloc marque */}
                    <div className="space-y-6">
                        <div>
                            <p className="font-black text-2xl tracking-tight text-white mb-2">
                                {settings.appName}
                            </p>
                            <div className="h-1 w-12 bg-blue-600 rounded-full" />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Votre partenaire de confiance pour réussir l&apos;examen civique. Une approche simple, efficace et humaine pour votre intégration.
                        </p>
                        <div className="flex items-center gap-4">
                            {settings.contactEmail && (
                                <a href={`mailto:${settings.contactEmail}`} className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all" aria-label="Nous envoyer un email">
                                    <Mail className="h-5 w-5" />
                                </a>
                            )}
                            {settings.socialInstagram && (
                                <a href={`https://www.instagram.com/${settings.socialInstagram.replace('@', '')}/`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-600 transition-all" aria-label={`Suivre ${settings.appName} sur Instagram (nouvel onglet)`}>
                                    <Instagram className="h-5 w-5" aria-hidden="true" />
                                </a>
                            )}
                            {settings.socialLinkedIn && (
                                <a href={`https://linkedin.com/in/${settings.socialLinkedIn}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-700 transition-all" aria-label={`Suivre ${settings.appName} sur LinkedIn (nouvel onglet)`}>
                                    <Linkedin className="h-5 w-5" aria-hidden="true" />
                                </a>
                            )}
                            {settings.socialTikTok && (
                                <a href={`https://www.tiktok.com/@${settings.socialTikTok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#ff0050] transition-all" aria-label={`Suivre ${settings.appName} sur TikTok (nouvel onglet)`}>
                                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5c0 1.51-.43 3.03-1.38 4.21-1.28 1.61-3.37 2.5-5.4 2.29-2.58-.2-4.73-2.12-5.32-4.63-.61-2.43.34-5.18 2.29-6.84 1.05-.88 2.4-1.38 3.77-1.41.32-.01.62.01.93.04v4.06c-.3-.06-.61-.1-.92-.1-.85-.05-1.74.15-2.46.61-.75.46-1.32 1.25-1.43 2.11-.15 1 0 2.05.61 2.87s1.61 1.27 2.62 1.25c.87.01 1.72-.34 2.31-1 .61-.76.73-1.8.73-2.73V.02z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    {!isRestricted && (
                        <>
                            <nav aria-label="Liens de navigation" className="space-y-6">
                                <h2 className="text-white font-bold text-lg uppercase tracking-wider text-sm">Modules</h2>
                                <ul className="space-y-3 text-gray-400 text-sm">
                                    <li>
                                        <Link href="/training" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                                            <span>•</span> Entraînement thématique
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/exam" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                                            <span>•</span> Examen Blanc officiel
                                        </Link>
                                    </li>
                                    {settings.enableInterview && userProfile?.track === 'naturalisation' && (
                                        <li>
                                            <Link href="/interview" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                                                <span>•</span> Préparation Entretien
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </nav>

                            {/* Communauté */}
                            <nav aria-label="Liens communauté" className="space-y-6">
                                <h2 className="text-white font-bold text-lg uppercase tracking-wider text-sm">Communauté</h2>
                                <ul className="space-y-3 text-gray-400 text-sm">
                                    <li>
                                        <Link href="/blog" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors flex items-center gap-2">
                                            <span>📰</span> Blog / Actualités
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/reviews" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors flex items-center gap-2">
                                            <span>⭐</span> Avis Utilisateurs
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                                            <span>•</span> Support & Contact
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/guide" className="hover:text-blue-400 transition-colors flex items-center gap-2">
                                            <span>•</span> Guide d'utilisation
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        </>
                    )}

                    {/* Restricted Footer View */}
                    {isRestricted && (
                        <div className="md:col-span-2 flex flex-col justify-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                </div>
                                <h3 className="text-white font-bold">Parcours en attente</h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Vous êtes presque arrivé ! Finalisez la configuration de votre compte en choisissant votre parcours d'apprentissage pour débloquer l'accès à tous nos modules d'entraînement.
                            </p>
                            <Link href="/onboarding" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all w-fit">
                                Choisir mon parcours
                            </Link>
                        </div>
                    )}

                    {/* Légal */}
                    <nav aria-label="Liens légaux" className="space-y-6">
                        <h2 className="text-white font-bold text-lg uppercase tracking-wider text-sm">Informations</h2>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li>
                                <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                                    Confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                                    Conditions d&apos;utilisation
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Bottom bar */}
                <div className="pt-10 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="space-y-1">
                        <p className="text-gray-500 text-sm font-medium">
                            © {new Date().getFullYear()} {settings.appName}. Tous droits réservés.
                        </p>
                        <p className="text-xs text-gray-600">
                            Développé avec passion par <span className="text-blue-500 font-bold">Mr Zeroual Tibari</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        Propulsé par l&apos;expertise CiviqQuiz
                    </div>
                </div>
            </div>
        </footer>
    );
}
