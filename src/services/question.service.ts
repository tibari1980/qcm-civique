import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { THEMES } from '@/constants/app-constants';

export interface Question {
    id: string;
    theme: string;
    level: string;
    question: string;
    choices: string[];
    correct_index: number;
    explanation: string;
    source?: string;
    reference?: string;
    original_id?: string;
    exam_type?: string;   // Legacy
    exam_types?: string[]; // New
}

/* ── Shuffle Fisher-Yates ── */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/* ── Déduplication par texte de question ── */
function dedupe(questions: Question[]): Question[] {
    const seen = new Set<string>();
    return questions.filter(q => {
        const key = q.question.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export const QuestionService = {
    /**
     * Récupère `max` questions aléatoires pour un thème donné.
     */
    getQuestionsByTheme: async (theme: string, max: number = 20, examType?: string): Promise<Question[]> => {
        try {
            const targetThemes = theme === 'histoire' ? ['histoire', 'geographie'] : [theme];

            const results = await Promise.all(
                targetThemes.map(t =>
                    getDocs(query(collection(db, 'questions'), where('theme', '==', t), limit(500)))
                )
            );

            let all = results.flatMap(snap => snap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));

            // Filtrage par parcours si spécifié
            if (examType) {
                all = all.filter(q => {
                    const types = q.exam_types || (q.exam_type ? [q.exam_type] : ['titre_sejour']);
                    return types.includes(examType);
                });
            }

            const randomizedPool = shuffle(all);
            const deduped = dedupe(randomizedPool);

            return shuffle(deduped).slice(0, max);
        } catch (error) {
            console.error('Error fetching questions by theme:', error);
            return [];
        }
    },

    /**
     * Récupère 40 questions mélangées, équilibrées entre tous les thèmes.
     */
    getExamQuestions: async (max: number = 40, examType?: string): Promise<Question[]> => {
        try {
            const poolResults = await Promise.all(
                THEMES.map(t =>
                    getDocs(query(collection(db, 'questions'), where('theme', '==', t), limit(100)))
                        .then(s => s.docs.map(d => ({ id: d.id, ...d.data() } as Question)))
                )
            );

            let all = poolResults.flat();

            // Filtrage par parcours
            if (examType) {
                all = all.filter(q => {
                    const types = q.exam_types || (q.exam_type ? [q.exam_type] : ['titre_sejour']);
                    return types.includes(examType);
                });
            }

            all = dedupe(all);
            const randomized = shuffle(all);
            return randomized.slice(0, max);
        } catch (error) {
            console.error('Error fetching exam questions:', error);
            return [];
        }
    },

    /**
     * Récupère des questions spécifiques par leurs IDs Firestore (document ID).
     */
    getQuestionsByIds: async (ids: string[]): Promise<Question[]> => {
        if (ids.length === 0) return [];
        try {
            // Firestore 'in' limit = 30 — chunker en plusieurs requêtes si besoin
            const chunks: string[][] = [];
            for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));

            const results = await Promise.all(
                chunks.map(chunk =>
                    getDocs(query(collection(db, 'questions'), where('__name__', 'in', chunk)))
                        .then(s => s.docs.map(d => ({ id: d.id, ...d.data() } as Question)))
                )
            );
            return results.flat();
        } catch (error) {
            console.error('Error fetching questions by IDs:', error);
            return [];
        }
    },
    // Local cache for theme counts to speed up navigation
    _countsCache: null as Record<string, number> | null,
    _countsTimestamp: 0,

    /**
     * Retourne le nombre de questions disponibles pour chaque thème Firestore.
     * Avec mise en cache locale (5 minutes).
     */
    getCountsByTheme: async (): Promise<Record<string, number>> => {
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();

        if (QuestionService._countsCache && (now - QuestionService._countsTimestamp < CACHE_DURATION)) {
            return QuestionService._countsCache;
        }

        try {
            const snaps = await Promise.all(
                THEMES.map(t => getDocs(query(collection(db, 'questions'), where('theme', '==', t))))
            );
            const rawCounts = Object.fromEntries(THEMES.map((t, i) => [t, snaps[i].size]));

            // Post-process logic for aggregated themes in UI
            const finalCounts = { ...rawCounts };
            finalCounts['histoire'] = (rawCounts['histoire'] || 0) + (rawCounts['geographie'] || 0);

            // Update cache
            QuestionService._countsCache = finalCounts;
            QuestionService._countsTimestamp = now;

            return finalCounts;
        } catch (error) {
            console.error('Error fetching theme counts:', error);
            return {};
        }
    },
};

