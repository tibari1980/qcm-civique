'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * useFocusManager — Gère le focus lors des changements de route.
 * Essentiel pour les lecteurs d'écran (NVDA, JAWS) qui ont besoin
 * d'être informés du changement de page.
 */
export function useFocusManager() {
    const pathname = usePathname();

    useEffect(() => {
        // On attend que la transition de page soit bien amorcée ou terminée
        const timer = setTimeout(() => {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                // Déplacer le focus sur le conteneur principal
                mainContent.focus();
                // Faire défiler vers le haut
                window.scrollTo(0, 0);
            }
        }, 150); // Léger délai synchronisé avec PageTransition

        return () => clearTimeout(timer);
    }, [pathname]);
}
