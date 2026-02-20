/**
 * Utilitaires de nettoyage de texte pour les questions.
 */

/**
 * Nettoie le texte d'une question en supprimant les mentions de "Variante".
 * Handles:
 * - "(Variante 1)" at end
 * - "Variante 2 :" at start
 * - "Variante :" anywhere
 */
export function cleanQuestionText(text: string): string {
    if (!text) return '';

    return text
        .replace(/\(Variante\s*\d*\)/gi, '') // Supprime (Variante X)
        .replace(/^Variante\s*\d*\s*[:.-]?\s*/gi, '') // Supprime Variante X : au début
        .replace(/Variante\s*\d*/gi, '') // Supprime les autres occurrences de Variante X
        .replace(/\s+/g, ' ') // Réduit les espaces multiples
        .trim();
}
