'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * useFocusManager — Gère le focus lors des changements de route.
 * Essentiel pour les lecteurs d'écran (NVDA, JAWS) qui ont besoin
 * d'être informés du changement de page.
 * 
 * - Déplace le focus sur le conteneur principal (#main-content)
 * - Annonce le changement de page via le live region global
 * - Défile vers le haut pour un contexte cohérent
 */

const ROUTE_LABELS: Record<string, string> = {
    '/': "Page d'accueil",
    '/login': 'Connexion',
    '/register': 'Création de compte',
    '/dashboard': 'Tableau de bord',
    '/training': 'Entraînement thématique',
    '/exam': 'Examen blanc',
    '/profile': 'Mon profil',
    '/onboarding': 'Choix du parcours',
    '/review': 'Analyse des erreurs',
    '/reviews': 'Avis des utilisateurs',
    '/contact': 'Contact',
    '/ai-quiz': 'Quiz IA',
    '/interview': 'Préparation entretien',
    '/guide': "Guide d'utilisation",
};

function getPageLabel(pathname: string): string {
    // Exact match
    if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
    // Partial match for dynamic routes like /training/[themeId]
    for (const [route, label] of Object.entries(ROUTE_LABELS)) {
        if (pathname.startsWith(route + '/')) return label;
    }
    return 'Page chargée';
}

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

            // Annoncer le changement de page aux lecteurs d'écran
            const announcement = document.getElementById('global-announcement');
            if (announcement) {
                const label = getPageLabel(pathname);
                announcement.textContent = `Navigation : ${label}`;
            }
        }, 150); // Léger délai synchronisé avec PageTransition

        return () => clearTimeout(timer);
    }, [pathname]);
}
