/**
 * Nettoie le texte d'une question pour l'affichage (suppression espaces inutiles, etc.)
 */
export const cleanQuestionText = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ')           // Compresse les espaces multiples
        .replace(/^\s+|\s+$/g, '')      // Trim
        .replace(/[""]/g, '"')          // Normalise les guillemets
        .trim();
};

/**
 * Normalise le texte pour la détection de doublons (robuste)
 */
export const normalizeQuestionText = (text: string): string => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize("NFD")               // Décompose les accents
        .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .replace(/[^a-z0-9]/g, '')      // Garde uniquement les caractères alphanumériques
        .trim();
};
