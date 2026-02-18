'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, GraduationCap, LayoutDashboard, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { user, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--color-primary)]">
                            <GraduationCap className="h-8 w-8" />
                            <span>Prépa Civique</span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                            Accueil
                        </Link>
                        <Link href="/training" className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                            Entraînement
                        </Link>
                        <Link href="/exam" className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                            Examen Blanc
                        </Link>
                        <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                            Tableau de bord
                        </Link>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/profile" className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors mr-2">
                                    {user.displayName || 'Mon Profil'}
                                </Link>
                                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                                    <LogOut className="h-4 w-4 mr-2" />
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

                    <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-4">
                    <nav className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                            <Home className="h-4 w-4" /> Accueil
                        </Link>
                        <Link href="/training" className="flex items-center gap-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                            <BookOpen className="h-4 w-4" /> Entraînement
                        </Link>
                        <Link href="/exam" className="flex items-center gap-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                            <GraduationCap className="h-4 w-4" /> Examen Blanc
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
                            <LayoutDashboard className="h-4 w-4" /> Tableau de bord
                        </Link>
                    </nav>
                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                        {user ? (
                            <Button variant="outline" className="w-full" onClick={() => { signOut(); setIsMenuOpen(false); }}>
                                <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                            </Button>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">Connexion</Button>
                                </Link>
                                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full">Inscription</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
