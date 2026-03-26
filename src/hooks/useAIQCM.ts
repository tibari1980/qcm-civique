'use client';

import { useState, useCallback } from 'react';
import { QuestionService } from '../services/question.service';
import { UserService } from '../services/user.service';

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

    /**
     * Récupère des questions depuis Firestore (Expert Mode)
     * - Suivi intelligent : filtre les questions déjà réussies par l'utilisateur
     * - Anti-doublons et mélange aléatoire haute performance
     */
    const fetchFromFirestore = useCallback(async (
        firestoreTheme: FirestoreTheme,
        niveau: NiveauCECRL,
        userId: string,
        count: number = 10
    ): Promise<AIQCMSession | null> => {
        setIsLoading(true);
        setError(null);
        try {
            // 1. Récupérer l'historique de l'utilisateur pour l'anti-répétition totale
            const profile = await UserService.getUserProfile(userId);
            const track = profile?.track === 'naturalisation' ? 'naturalisation' : 'titre_sejour';
            const { incorrectIds, seenIds } = await UserService.getAllUserData(userId);
            const seenSet = new Set(seenIds);
            const failedSet = new Set(incorrectIds);

            // 2. Récupère un pool massif pour avoir du choix après filtrage
            let questions = await QuestionService.getQuestionsByTheme(firestoreTheme, Math.max(100, count * 10), track);

            // 3. Déduplication par texte (Variantes)
            questions = deduplicateQuestions(questions);

            // 4. Filtre par niveau si disponible
            const dbLevel = CECRL_TO_DB_LEVEL[niveau];
            if (dbLevel) {
                const filteredByLevel = questions.filter(q =>
                    q.level === dbLevel ||
                    q.level === dbLevel.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                );
                // On garde le filtre niveau seulement si on a assez de questions
                if (filteredByLevel.length >= count) {
                    questions = filteredByLevel;
                }
            }

            // 5. FILTRAGE EXPERT : Anti-répétition stricte
            const neverSeen = shuffleArray(questions.filter(q => !seenSet.has(q.id)));
            const failed = shuffleArray(questions.filter(q => failedSet.has(q.id)));
            const alreadyPassed = shuffleArray(questions.filter(q => seenSet.has(q.id) && !failedSet.has(q.id)));

            let finalPool = [...neverSeen, ...failed];

            if (finalPool.length < count) {
                finalPool = [...finalPool, ...alreadyPassed];
            }

            if (finalPool.length === 0) {
                finalPool = shuffleArray(questions);
            }

            // 6. Sélection finale et conversion
            const selection = finalPool.slice(0, count);
            const difficulte = dbLevel === 'Avance' ? 'difficile' : dbLevel === 'Intermediaire' ? 'moyen' : 'facile';

            const aiQuestions: AIQuestion[] = selection.map(q => ({
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

            if (aiQuestions.length === 0) {
                throw new Error('Aucune question trouvée. Pool de données insuffisant.');
            }

            const session: AIQCMSession = {
                questions: aiQuestions,
                metadata: {
                    niveau,
                    theme: 'civique', // Valeur temporaire, sera écrasée par generateQCM si besoin
                    module: 'general',
                    date_generation: new Date().toISOString().slice(0, 10),
                    nb_questions: aiQuestions.length,
                    duree_recommandee: '15 minutes',
                    seuil_reussite: 70,
                },
                params: { niveau, theme: 'civique', module: 'general' },
            };

            sessionStorage.setItem(CACHE_KEY, JSON.stringify(session));
            return session;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Simulation Experte de Génération IA (Hybride Firestore)
     * Utilise le pool intelligent local tout en simulant un délai de réflexion IA.
     */
    const generateQCM = useCallback(async (params: AIQCMParams, userId: string): Promise<AIQCMSession | null> => {
        setIsLoading(true);
        setError(null);

        // Mapping des thèmes IA -> Firestore
        const themeMap: Record<ThemeQCM, FirestoreTheme> = {
            civique: 'vals_principes',
            administration: 'institutions',
            vie_quotidienne: 'societe',
            famille: 'societe',
            travail: 'societe',
            voyage: 'geographie'
        };

        const targetFS = themeMap[params.theme] || 'vals_principes';

        try {
            // Effet "Thinking/Gen" pour l'utilisateur (2.5s)
            await new Promise(resolve => setTimeout(resolve, 2500));

            // On utilise la même logique que fetchFromFirestore mais "sous le capot"
            const session = await fetchFromFirestore(targetFS, params.niveau, userId, 10);

            if (session) {
                // On préserve les paramètres originaux pour l'UI (thème IA etc)
                session.params = params;
                session.metadata.theme = params.theme;
                session.metadata.module = params.module;

                try {
                    sessionStorage.setItem(CACHE_KEY, JSON.stringify(session));
                } catch { /* ignore */ }
            }

            return session;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erreur inconnue';
            setError(message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [fetchFromFirestore]);

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

    return { generateQCM, fetchFromFirestore, getLastSession, clearSession, isLoading, error };
}
