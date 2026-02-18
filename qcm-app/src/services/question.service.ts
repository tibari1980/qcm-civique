import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';

export interface Question {
    id: string;
    theme: string;
    level: string;
    question: string;
    choices: string[];
    correct_index: number;
    explanation: string;
}

// Helper to generate a random ID for Firestore cursor
const generateRandomId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    for (let i = 0; i < 20; i++) {
        autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return autoId;
};

export const QuestionService = {
    // Fetch questions by theme with TRUE randomization
    getQuestionsByTheme: async (theme: string, max: number = 20): Promise<Question[]> => {
        try {
            // 1. Try to get questions starting after a random ID
            const randomId = generateRandomId();
            const q = query(
                collection(db, 'questions'),
                where('theme', '==', theme),
                where('__name__', '>=', randomId),
                limit(max)
            );

            let snapshot = await getDocs(q);
            let questions = snapshot.docs.map(doc => doc.data() as Question);

            // 2. If we didn't get enough (e.g. randomId was near end of collection), wrap around
            if (questions.length < max) {
                const remaining = max - questions.length;
                const qWrap = query(
                    collection(db, 'questions'),
                    where('theme', '==', theme),
                    where('__name__', '>=', ' '), // Start from beginning
                    limit(remaining)
                );
                const snapshotWrap = await getDocs(qWrap);
                const questionsWrap = snapshotWrap.docs.map(doc => doc.data() as Question);
                questions = [...questions, ...questionsWrap];
            }

            // Shuffle results client-side for extra randomness
            return questions.sort(() => Math.random() - 0.5);
        } catch (error) {
            console.error("Error fetching questions by theme:", error);
            return [];
        }
    },

    // Fetch random questions for exam (mixed themes)
    getExamQuestions: async (max: number = 40): Promise<Question[]> => {
        try {
            // Fetch balanced mix from all themes
            const themes = ["vals_principes", "histoire", "geographie", "institutions", "societe"];
            const questionsPerTheme = Math.ceil(max / themes.length);

            let allQuestions: Question[] = [];

            // Execute in parallel for speed
            const promises = themes.map(theme => QuestionService.getQuestionsByTheme(theme, questionsPerTheme));
            const results = await Promise.all(promises);

            results.forEach(themeQuestions => {
                allQuestions = [...allQuestions, ...themeQuestions];
            });

            // Shuffle and slice to exact max
            return allQuestions.sort(() => Math.random() - 0.5).slice(0, max);
        } catch (error) {
            console.error("Error fetching exam questions:", error);
            return [];
        }
    },

    // Fetch specific questions by IDs (for Review Mode)
    getQuestionsByIds: async (ids: string[]): Promise<Question[]> => {
        if (ids.length === 0) return [];
        try {
            // Firestore 'in' query limit is 30. We'll take the first 30 for now.
            const slice = ids.slice(0, 30);
            const q = query(
                collection(db, 'questions'),
                where('id', 'in', slice)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as Question);
        } catch (error) {
            console.error("Error fetching questions by IDs:", error);
            // Fallback: try fetching individually if 'in' fails or for debugging? No, too expensive.
            return [];
        }
    }
};
