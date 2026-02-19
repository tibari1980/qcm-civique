'use client';

import { useState, useCallback } from 'react';
import { QuestionService } from '@/services/question.service';

/* ---------------------------------------------
   Types
--------------------------------------------- */
export type NiveauCECRL = 'A1' | 'A2' | 'B1' | 'B2';
export type ThemeQCM = 'vie_quotidienne' | 'administration' | 'civique' | 'travail' | 'voyage' | 'famille';
export type ModuleQCM = 'general' | 'carte_sejour_A2' | 'carte_resident_B1' | 'nationalite_B2';

// Themes natifs de votre base Firestore
export type FirestoreTheme = 'vals_principes' | 'histoire' | 'geographie' | 'institutions' | 'societe';

export const FIRESTORE_THEME_LABELS: Record<FirestoreTheme, string> = {
    vals_principes: 'Valeurs & Principes',
    histoire: 'Histoire de France',
    geographie: 'Geographie',
    institutions: 'Institutions',
    societe: 'Societe',
};

// Correspondance CECRL -> niveau Firestore (champ 'level' dans la DB)
const CECRL_TO_DB_LEVEL: Record<NiveauCECRL, string | null> = {
    A1: null,
    A2: 'Debutant',
    B1: 'Intermediaire',
    B2: 'Avance',
};

export interface AIQCMParams {
    niveau: NiveauCECRL;
    theme: ThemeQCM;
    module: ModuleQCM;
}

export interface AIQCMMetadata {
    niveau: NiveauCECRL;
    theme: ThemeQCM;
    module: ModuleQCM;
    date_generation: string;
    nb_questions: number;
    duree_recommandee: string;
    seuil_reussite: number;
}

export interface AIQuestion {
    id: string;
    question: string;
    choices: string[];
    correct_index: number;
    explanation: string;
    theme: string;
    level: string;
    competence: string;
    difficulte: string;
    aiGenerated: true;
}

export interface AIQCMSession {
    questions: AIQuestion[];
    metadata: AIQCMMetadata;
    params: AIQCMParams;
}

const CACHE_KEY = 'ai_qcm_session';

/* ---------------------------------------------
   Helpers anti-doublons + melange
--------------------------------------------- */

/**
 * Normalise le texte d'une question pour comparaison :
 * 1. Retire les suffixes "(Variante X)" qui causent des faux-doublons dans Firestore
 * 2. Minuscules, sans ponctuation, sans espaces multiples
 */
function normalizeText(str: string): string {
    return str
        .replace(/\s*\(variante\s*\d+\)/gi, '')
        .toLowerCase()
        .replace(/[.,;:!?()\-'"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Supprime les doublons (meme texte normalise) - garde le premier exemplaire */
function deduplicateQuestions<T extends { question: string }>(questions: T[]): T[] {
    const seen = new Set<string>();
    return questions.filter(q => {
        const key = normalizeText(q.question);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/** Melange aleatoire (Fisher-Yates) */
function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/* ---------------------------------------------
   Hook
--------------------------------------------- */
export function useAIQCM() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateQCM = useCallback(async (params: AIQCMParams): Promise<AIQCMSession | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-qcm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    niveau: params.niveau,
                    theme: params.theme,
                    module: params.module,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Erreur HTTP ${response.status}`);
            }

            const data = await response.json();
            const session: AIQCMSession = {
                questions: data.questions,
                metadata: data.metadata,
                params,
            };

            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(session));
            } catch {
                // sessionStorage peut etre indisponible (mode prive)
            }

            return session;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getLastSession = useCallback((): AIQCMSession | null => {
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) return JSON.parse(cached) as AIQCMSession;
        } catch {
            // ignore
        }
        return null;
    }, []);

    const clearSession = useCallback(() => {
        try { sessionStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
    }, []);

    /**
     * Recupere des questions depuis Firestore (sans IA)
     * - Deduplique par texte normalise (retire les "(Variante X)")
     * - Melange aleatoirement pour varier l'ordre a chaque session
     */
    const fetchFromFirestore = useCallback(async (
        firestoreTheme: FirestoreTheme,
        niveau: NiveauCECRL,
        count: number = 10
    ): Promise<AIQCMSession | null> => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Recupere un large pool (x5) pour absorber les doublons et le filtre niveau
            let questions = await QuestionService.getQuestionsByTheme(firestoreTheme, count * 5);

            // 2. Supprime les doublons (meme question avec suffixes Variante differents)
            questions = deduplicateQuestions(questions);

            // 3. Filtre par niveau si disponible dans la DB
            const dbLevel = CECRL_TO_DB_LEVEL[niveau];
            if (dbLevel) {
                const filtered = questions.filter(q =>
                    q.level === dbLevel ||
                    q.level === dbLevel.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // sans accents
                );
                if (filtered.length >= Math.min(5, count)) {
                    questions = filtered;
                }
            }

            // 4. Melange aleatoire (ordre different a chaque session)
            questions = shuffleArray(questions);

            // 5. Limite au nombre demande
            questions = questions.slice(0, count);

            if (questions.length === 0) {
                throw new Error('Aucune question trouvee pour ce theme. Essayez un autre theme.');
            }

            // 6. Convertit au format AIQuestion
            const difficulte = dbLevel === 'Avance' ? 'difficile' : dbLevel === 'Intermediaire' ? 'moyen' : 'facile';

            const aiQuestions: AIQuestion[] = questions.map(q => ({
                id: q.id || `fs-${Math.random().toString(36).slice(2)}`,
                question: q.question,
                choices: q.choices,
                correct_index: q.correct_index,
                explanation: q.explanation || '',
                theme: firestoreTheme,
                level: niveau,
                competence: 'Civique',
                difficulte,
                aiGenerated: true,
            }));

            const session: AIQCMSession = {
                questions: aiQuestions,
                metadata: {
                    niveau,
                    theme: 'civique',
                    module: 'general',
                    date_generation: new Date().toISOString().slice(0, 10),
                    nb_questions: aiQuestions.length,
                    duree_recommandee: '15 minutes',
                    seuil_reussite: 70,
                },
                params: { niveau, theme: 'civique', module: 'general' },
            };

            try {
                sessionStorage.setItem(CACHE_KEY, JSON.stringify(session));
            } catch { /* ignore */ }

            return session;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { generateQCM, fetchFromFirestore, getLastSession, clearSession, isLoading, error };
}
