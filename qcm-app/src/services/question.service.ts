import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export interface Question {
    id: string;
    theme: string;
    level: string;
    question: string;
    choices: string[];
    correct_index: number;
    explanation: string;
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
     * Stratégie : fetch jusqu'à 300 docs du thème → shuffle → dedupe → slice(max).
     * Beaucoup plus fiable que l'approche random-ID qui cassait avec les préfixes q_xxx.
     */
    getQuestionsByTheme: async (theme: string, max: number = 20): Promise<Question[]> => {
        try {
            const snap = await getDocs(
                query(collection(db, 'questions'), where('theme', '==', theme), limit(300))
            );
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
            return shuffle(dedupe(all)).slice(0, max);
        } catch (error) {
            console.error('Error fetching questions by theme:', error);
            return [];
        }
    },

    /**
     * Récupère `max` questions mélangées, équilibrées entre tous les thèmes.
     */
    getExamQuestions: async (max: number = 40): Promise<Question[]> => {
        try {
            const themes = ['vals_principes', 'histoire', 'geographie', 'institutions', 'societe', 'droits'];
            const perTheme = Math.ceil(max / themes.length);

            const results = await Promise.all(
                themes.map(t => QuestionService.getQuestionsByTheme(t, perTheme))
            );

            const all = results.flat();
            return shuffle(dedupe(all)).slice(0, max);
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
    /**
     * Retourne le nombre de questions disponibles pour chaque thème Firestore.
     * Exécuté en parallèle pour minimiser la latence.
     */
    getCountsByTheme: async (): Promise<Record<string, number>> => {
        const themes = ['vals_principes', 'histoire', 'geographie', 'institutions', 'societe', 'droits'];
        try {
            const counts = await Promise.all(
                themes.map(t =>
                    getDocs(query(collection(db, 'questions'), where('theme', '==', t), limit(9999)))
                        .then(s => ({ theme: t, count: s.size }))
                )
            );
            return Object.fromEntries(counts.map(c => [c.theme, c.count]));
        } catch (error) {
            console.error('Error fetching theme counts:', error);
            return {};
        }
    },
};

