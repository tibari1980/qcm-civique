'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, FileQuestion, BarChart2,
    Settings, ChevronRight, LogOut, ShieldCheck, Menu, X, Upload
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminGuard } from '@/lib/adminGuard';

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/questions', label: 'Questions', icon: FileQuestion },
    { href: '/admin/import', label: 'Import', icon: Upload },
    { href: '/admin/stats', label: 'Statistiques', icon: BarChart2 },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

interface SidebarContentProps {
    setMobileOpen: (open: boolean) => void;
    isActive: (href: string, exact?: boolean) => boolean;
    userProfile: any;
    user: any;
    handleSignOut: () => void;
}

const SidebarContent = ({ setMobileOpen, isActive, userProfile, user, handleSignOut }: SidebarContentProps) => (
    <div className="flex flex-col h-full">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
            <ShieldCheck className="h-7 w-7 text-white" aria-hidden="true" />
            <div>
                <p className="text-white font-bold text-base leading-none">Admin</p>
                <p className="text-blue-200 text-xs mt-0.5">Prépa Civique</p>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigation administration">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
                <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                        isActive(href, exact)
                            ? 'bg-white/20 text-white'
                            : 'text-blue-100 hover:bg-white/10 hover:text-white',
                    ].join(' ')}
                    aria-current={isActive(href, exact) ? 'page' : undefined}
                >
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {label}
                    {isActive(href, exact) && (
                        <ChevronRight className="h-4 w-4 ml-auto" aria-hidden="true" />
                    )}
                </Link>
            ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(userProfile?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-white text-xs font-medium truncate">
                        {userProfile?.displayName || 'Administrateur'}
                    </p>
                    <p className="text-blue-200 text-xs truncate">{user?.email}</p>
                </div>
            </div>
            <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-white/10 hover:text-white transition-all"
            >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Déconnexion
            </button>
        </div>
    </div>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { loading, isAdmin } = useAdminGuard();
    const { user, userProfile, signOut } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <div className="w-8 h-8 border-4 border-[#002394] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Vérification des droits…</span>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar desktop */}
            <aside
                className="hidden md:flex flex-col w-60 bg-[#002394] flex-shrink-0"
                aria-label="Panneau d'administration"
            >
                <SidebarContent
                    setMobileOpen={setMobileOpen}
                    isActive={isActive}
                    userProfile={userProfile}
                    user={user}
                    handleSignOut={handleSignOut}
                />
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar mobile */}
            <aside
                className={[
                    'fixed top-0 left-0 h-full w-60 bg-[#002394] z-50 transition-transform duration-300 md:hidden',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
            >
                <SidebarContent
                    setMobileOpen={setMobileOpen}
                    isActive={isActive}
                    userProfile={userProfile}
                    user={user}
                    handleSignOut={handleSignOut}
                />
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile topbar */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#002394] text-white">
                    <button
                        onClick={() => setMobileOpen(v => !v)}
                        aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    <span className="font-semibold">Admin</span>
                </div>

                <main
                    id="admin-main"
                    className="flex-1 overflow-y-auto"
                    tabIndex={-1}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
