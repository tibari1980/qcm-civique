'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, GraduationCap, LayoutDashboard, Home, LogOut, Instagram } from 'lucide-react';
import { Music2 } from 'lucide-react'; // Si TikTok n'est pas dispo, on utilise Music2 ou un SVG
import { Button } from '../ui/button';
import { TricolorLogo } from './TricolorLogo';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { NotificationBell } from './NotificationBell';

/**
 * Header — Navigation principale
 */
export function Header() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { user, signOut, isAdmin } = useAuth();
    const { settings } = useSettings();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const hamburgerRef = useRef<HTMLButtonElement>(null);

    // ... (rest of effects stay same)
    // Fermer le menu avec Échap
    useEffect(() => {
        if (!isMenuOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMenuOpen(false);
                hamburgerRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen]);

    // Focus trap dans le menu mobile
    useEffect(() => {
        if (!isMenuOpen || !mobileMenuRef.current) return;
        const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusable = Array.from(
            mobileMenuRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
        );
        if (focusable.length > 0) focusable[0].focus();

        const trapFocus = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener('keydown', trapFocus);
        return () => document.removeEventListener('keydown', trapFocus);
    }, [isMenuOpen]);

    // Bloquer le scroll du body quand menu ouvert sur mobile
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const closeMenu = () => {
        setIsMenuOpen(false);
        hamburgerRef.current?.focus();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md glass-card !rounded-none !shadow-none !border-x-0 !border-t-0">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="flex items-center gap-3 font-black text-xl text-gray-900 dark:text-white group"
                            aria-label={`${settings.appName} — Accueil`}
                        >
                            <div className="relative group-hover:scale-110 transition-transform duration-300">
                                <TricolorLogo className="h-10 w-10 rounded-xl overflow-hidden shadow-lg animate-float" />
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                            </div>
                            <span className="hidden lg:inline bg-gradient-to-r from-blue-600 via-indigo-600 to-red-600 bg-clip-text text-transparent tracking-tighter">
                                {settings.appName}
                            </span>
                        </Link>
                    </div>

                    {/* Navigation desktop */}
                    <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors">
                            Accueil
                        </Link>
                        <Link href="/training" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors">
                            Entraînement
                        </Link>
                        <Link href="/exam" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors">
                            Examen
                        </Link>
                        <Link href="/guide" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors">
                            Guide
                        </Link>
                        <Link href="/eligibilite" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors">
                            Éligibilité
                        </Link>
                        <Link href="/centers" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors">
                            Centres
                        </Link>
                        <Link href="/fiches" className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-all flex items-center gap-1 font-bold">
                            <span aria-hidden="true">💡</span> Fiches
                        </Link>
                        {settings.enableInterview && (
                            <Link href="/interview" className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                                Entretien
                            </Link>
                        )}
                        {settings.enableAIQCM && (
                            <Link href="/ai-quiz" className="text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-all flex items-center gap-1">
                                <span aria-hidden="true">✨</span> QCM IA
                            </Link>
                        )}
                        <Link
                            href={isAdmin ? "/admin" : "/dashboard"}
                            className={`text-sm font-medium transition-colors ${isAdmin ? 'text-[var(--color-primary)] font-bold' : 'text-gray-700 hover:text-[var(--color-primary)]'}`}
                        >
                            {isAdmin ? "Administration" : "Dashboard"}
                        </Link>
                    </nav>

                    {/* Actions desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle />
                        <div className="flex items-center gap-1 border-x border-gray-100 dark:border-gray-800 px-2 mx-1">
                            <a
                                href={`https://www.instagram.com/${settings.socialInstagram.replace('@', '')}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-[#E4405F]"
                                aria-label={`Suivre ${settings.appName} sur Instagram (nouvel onglet)`}
                            >
                                <Instagram className="h-5 w-5" aria-hidden="true" />
                            </a>
                            <a
                                href={`https://www.tiktok.com/@${settings.socialTikTok.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-[#ff0050]"
                                aria-label={`Suivre ${settings.appName} sur TikTok (nouvel onglet)`}
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47V18.5c0 1.51-.43 3.03-1.38 4.21-1.28 1.61-3.37 2.5-5.4 2.29-2.58-.2-4.73-2.12-5.32-4.63-.61-2.43.34-5.18 2.29-6.84 1.05-.88 2.4-1.38 3.77-1.41.32-.01.62.01.93.04v4.06c-.3-.06-.61-.1-.92-.1-.85-.05-1.74.15-2.46.61-.75.46-1.32 1.25-1.43 2.11-.15 1 0 2.05.61 2.87s1.61 1.27 2.62 1.25c.87.01 1.72-.34 2.31-1 .61-.76.73-1.8.73-2.73V.02z" />
                                </svg>
                            </a>
                        </div>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <NotificationBell />
                                <Link
                                    href="/profile"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] transition-colors mr-2"
                                    aria-label={`Mon profil : ${user.displayName || 'Utilisateur'}`}
                                >
                                    {user.displayName || 'Mon Profil'}
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut()}
                                    aria-label="Se déconnecter de votre compte"
                                    className="gap-2"
                                >
                                    <LogOut className="h-4 w-4" aria-hidden="true" />
                                    Déconnexion
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login" aria-label="Se connecter à votre compte">
                                    <Button variant="outline" size="sm">Connexion</Button>
                                </Link>
                                <Link href="/register" aria-label="Créer un nouveau compte">
                                    <Button size="sm">Inscription</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Bouton hamburger — mobile */}
                    <button
                        ref={hamburgerRef}
                        className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu"
                        aria-haspopup="true"
                    >
                        {isMenuOpen
                            ? (
                                <>
                                    <X className="h-6 w-6" aria-hidden="true" />
                                    <span className="sr-only">Fermer le menu</span>
                                </>
                            )
                            : (
                                <>
                                    <Menu className="h-6 w-6" aria-hidden="true" />
                                    <span className="sr-only">Ouvrir le menu</span>
                                </>
                            )
                        }
                    </button>
                </div>
            </div>

            {/* Menu mobile — dialog avec focus trap */}
            {isMenuOpen && (
                <>
                    {/* Overlay sombre (cliquable pour fermer) */}
                    <div
                        className="fixed inset-0 bg-black/30 z-40 md:hidden"
                        aria-hidden="true"
                        onClick={closeMenu}
                    />
                    <div
                        id="mobile-menu"
                        ref={mobileMenuRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu de navigation"
                        className="md:hidden fixed top-16 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-4 shadow-lg"
                    >
                        <nav aria-label="Navigation mobile" className="flex flex-col gap-4">
                            <Link href="/" className="flex items-center gap-2 text-sm font-medium py-2" onClick={closeMenu}>
                                <Home className="h-4 w-4" aria-hidden="true" />
                                Accueil
                            </Link>
                            <Link href="/training" className="flex items-center gap-2 text-sm font-medium py-2" onClick={closeMenu}>
                                <BookOpen className="h-4 w-4" aria-hidden="true" />
                                Entraînement
                            </Link>
                            <Link href="/exam" className="flex items-center gap-2 text-sm font-medium py-2" onClick={closeMenu}>
                                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                                Examen
                            </Link>
                            <Link href="/guide" className="flex items-center gap-2 text-sm font-medium py-2" onClick={closeMenu}>
                                <BookOpen className="h-4 w-4" aria-hidden="true" />
                                Guide
                            </Link>
                            <Link href="/eligibilite" className="flex items-center gap-2 text-sm font-medium py-2" onClick={closeMenu}>
                                <BookOpen className="h-4 w-4" aria-hidden="true" />
                                Éligibilité
                            </Link>
                            <Link href="/centers" className="flex items-center gap-2 text-sm font-medium py-2" onClick={closeMenu}>
                                <Home className="h-4 w-4" aria-hidden="true" />
                                Centres d&apos;examen
                            </Link>
                            <Link href="/fiches" className="flex items-center gap-2 text-sm font-bold py-2 text-[var(--color-primary)]" onClick={closeMenu}>
                                <span aria-hidden="true" className="text-base">💡</span>
                                Fiches
                            </Link>
                            {settings.enableInterview && (
                                <Link href="/interview" className="flex items-center gap-2 text-sm font-medium py-2" onClick={closeMenu}>
                                    <GraduationCap className="h-4 w-4" aria-hidden="true" />
                                    Entretien
                                </Link>
                            )}
                            {settings.enableAIQCM && (
                                <Link href="/ai-quiz" className="flex items-center gap-2 text-sm font-medium py-2 text-[var(--color-primary)]" onClick={closeMenu}>
                                    <span aria-hidden="true" className="text-base">✨</span>
                                    QCM IA
                                </Link>
                            )}
                            <Link
                                href={isAdmin ? "/admin" : "/dashboard"}
                                className={`flex items-center gap-2 text-sm font-medium py-2 ${isAdmin ? 'text-[var(--color-primary)] font-bold' : ''}`}
                                onClick={closeMenu}
                            >
                                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                                {isAdmin ? "Administration" : "Tableau de bord"}
                            </Link>

                            {/* Social Mobile Links */}
                            <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 px-1">Communauté</p>
                                <a
                                    href={`https://www.instagram.com/${settings.socialInstagram.replace('@', '')}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-medium py-2 text-gray-700 dark:text-gray-300 hover:text-[#E4405F]"
                                    aria-label={`Rejoindre ${settings.appName} sur Instagram (nouvel onglet)`}
                                    onClick={closeMenu}
                                >
                                    <Instagram className="h-4 w-4" aria-hidden="true" />
                                    Suivez-nous sur Instagram
                                </a>
                                <a
                                    href={`https://www.tiktok.com/@${settings.socialTikTok.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-medium py-2 text-gray-700 dark:text-gray-300 hover:text-[#ff0050]"
                                    aria-label={`Rejoindre ${settings.appName} sur TikTok (nouvel onglet)`}
                                    onClick={closeMenu}
                                >
                                    <Music2 className="h-4 w-4" aria-hidden="true" />
                                    Suivez-nous sur TikTok
                                </a>
                            </div>
                        </nav>
                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                            {user ? (
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => { signOut(); closeMenu(); }}
                                    aria-label="Se déconnecter de votre compte"
                                >
                                    <LogOut className="h-4 w-4" aria-hidden="true" />
                                    Déconnexion
                                </Button>
                            ) : (
                                <>
                                    <Link href="/login" onClick={closeMenu}>
                                        <Button variant="outline" className="w-full">Connexion</Button>
                                    </Link>
                                    <Link href="/register" onClick={closeMenu}>
                                        <Button className="w-full">Inscription</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
