'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, GraduationCap, LayoutDashboard, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

/**
 * Header — Navigation principale
 * WCAG 2.1 AA améliorations :
 * - aria-label, aria-expanded, aria-controls sur le bouton hamburger
 * - Menu mobile avec role="dialog" + focus trap
 * - Bouton Déconnexion avec texte visible
 * - Toutes les icônes décoratives ont aria-hidden="true"
 * - Deux <nav> distinctes nommées différemment
 */
export function Header() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { user, signOut, isAdmin } = useAuth();
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const hamburgerRef = useRef<HTMLButtonElement>(null);

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
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-bold text-xl text-[var(--color-primary)]"
                            aria-label="Prépa Civique — Retour à l'accueil"
                        >
                            <GraduationCap className="h-8 w-8" aria-hidden="true" />
                            <span>Prépa Civique</span>
                        </Link>
                    </div>

                    {/* Navigation desktop */}
                    <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                            Accueil
                        </Link>
                        <Link href="/training" className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                            Entraînement
                        </Link>
                        <Link href="/exam" className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                            Examen Blanc
                        </Link>
                        <Link href="/ai-quiz" className="text-sm font-medium text-[var(--color-primary)] hover:text-blue-700 transition-colors flex items-center gap-1">
                            <span aria-hidden="true">✨</span> QCM IA
                        </Link>
                        <Link
                            href={isAdmin ? "/admin" : "/dashboard"}
                            className={`text-sm font-medium transition-colors ${isAdmin ? 'text-[#002394] font-bold' : 'text-gray-700 hover:text-[var(--color-primary)]'}`}
                        >
                            {isAdmin ? "Administration" : "Tableau de bord"}
                        </Link>
                    </nav>

                    {/* Actions desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/profile"
                                    className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors mr-2"
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
                                <Link href="/login">
                                    <Button variant="outline" size="sm">Connexion</Button>
                                </Link>
                                <Link href="/register">
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
                            ? <X className="h-6 w-6" aria-hidden="true" />
                            : <Menu className="h-6 w-6" aria-hidden="true" />
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
                        className="md:hidden fixed top-16 left-0 right-0 z-50 border-t border-gray-200 bg-white p-4 space-y-4 shadow-lg"
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
                                Examen Blanc
                            </Link>
                            <Link href="/ai-quiz" className="flex items-center gap-2 text-sm font-medium py-2 text-[var(--color-primary)]" onClick={closeMenu}>
                                <span aria-hidden="true" className="text-base">✨</span>
                                QCM IA
                            </Link>
                            <Link
                                href={isAdmin ? "/admin" : "/dashboard"}
                                className={`flex items-center gap-2 text-sm font-medium py-2 ${isAdmin ? 'text-[#002394] font-bold' : ''}`}
                                onClick={closeMenu}
                            >
                                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                                {isAdmin ? "Administration" : "Tableau de bord"}
                            </Link>
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
