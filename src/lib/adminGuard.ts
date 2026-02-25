'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook qui redirige vers / si l'utilisateur n'est pas admin.
 * A appeler en premiere ligne de chaque page /admin/*.
 */
export function useAdminGuard(): { isAdmin: boolean; loading: boolean } {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace('/');
        }
    }, [isAdmin, loading, router]);

    return { isAdmin, loading };
}
