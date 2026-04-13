'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

/**
 * TrackGuard — Force le choix du parcours avant d'accéder au reste de l'app.
 */
export function TrackGuard({ children }: { children: React.ReactNode }) {
    const { user, userProfile, loading, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return;

        // Liste des pages autorisées sans parcours choisi
        const isPublicPath = [
            '/',
            '/login',
            '/register',
            '/onboarding',
            '/forgot-password',
            '/resetpassword',
            '/privacy',
            '/terms',
            '/about',
            '/contact'
        ].includes(pathname);

        // Si l'utilisateur est connecté mais n'a pas de parcours
        // On le force vers /onboarding (sauf s'il est admin ou sur une page publique)
        if (user && userProfile && !userProfile.track && !isAdmin && !isPublicPath) {
            console.log("[TrackGuard] Redirection vers /onboarding (pas de parcours)");
            router.replace('/onboarding');
        }
        
        // Inversement : si l'utilisateur a déjà un parcours et essaie d'aller sur onboarding
        if (user && userProfile?.track && pathname === '/onboarding') {
             router.replace(isAdmin ? '/admin' : '/dashboard');
        }

    }, [user, userProfile, loading, isAdmin, pathname, router]);

    return <>{children}</>;
}
