import { db } from '../lib/firebase';
import { collection, getDocs, query, where, limit, getCountFromServer } from 'firebase/firestore';
import { THEMES } from '../constants/app-constants';

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

/* ── Moteur d'héritage de parcours ── */
// Logique en cascade (Poupées Russes) :
// Naturalisation (240+) > inclut > CR (209+) > inclut > CSP (193+)
function getTargetExamTypesForTrack(track: string): string[] {
    if (track === 'csp') return ['titre_sejour', 'csp'];
    if (track === 'cr') return ['carte_resident', 'cr', 'titre_sejour', 'csp'];
    if (track === 'naturalisation') return ['naturalisation', 'carte_resident', 'titre_sejour', 'cr', 'csp'];
    return ['titre_sejour', 'csp']; // Fallback de sécurité
}

export const QuestionService = {
    /**
     * ZÉRO COÛT CACHE: Télécharge la DB en entier 1 seule fois et stocke 24h.
     */
    _hydrateCache: async (): Promise<Question[]> => {
        if (typeof window === 'undefined') return []; // Pas de SSR
        
        try {
            const cachedParams = localStorage.getItem('qcm_offline_cache');
            const cacheTimestamp = localStorage.getItem('qcm_offline_timestamp');
            
            // Expiration de 24 heures
            const EXPIRATION_MS = 24 * 60 * 60 * 1000;
            const now = Date.now();

            if (cachedParams && cacheTimestamp && (now - parseInt(cacheTimestamp)) < EXPIRATION_MS) {
                return JSON.parse(cachedParams) as Question[];
            }

            // Si expiré ou inexistant, on télécharge tout (240 questions = ~240 lectures MAX)
            const snapshot = await getDocs(collection(db, 'questions'));
            const allQuestions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Question));
            
            try {
                localStorage.setItem('qcm_offline_cache', JSON.stringify(allQuestions));
                localStorage.setItem('qcm_offline_timestamp', now.toString());
            } catch (e) {
                console.warn('LocalStorage constraint, cache bypassed.', e);
            }
            
            return allQuestions;
        } catch (err) {
            console.error("Cache Hydration Failed:", err);
            // Fallback en cas d'erreur de cache
            const snapshot = await getDocs(collection(db, 'questions'));
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Question));
        }
    },
    /**
     * Récupère `max` questions aléatoires pour un thème donné.
     */
    getQuestionsByTheme: async (theme: string, max: number = 20, examType?: string, ignoreIds: string[] = []): Promise<Question[]> => {
        try {
            const gigaDatabase = await QuestionService._hydrateCache();
            const targetThemes = theme === 'histoire' ? ['histoire', 'geographie'] : [theme];

            let all = gigaDatabase.filter(q => targetThemes.includes(q.theme));

            // Filtrage par parcours en cascade (Héritage)
            if (examType) {
                const targetTypes = getTargetExamTypesForTrack(examType);
                all = all.filter(q => {
                    const qTypes = q.exam_types || (q.exam_type ? [q.exam_type] : ['titre_sejour', 'csp']);
                    return qTypes.some(t => targetTypes.includes(t));
                });
            }

            const randomizedPool = shuffle(all);
            const deduped = dedupe(randomizedPool);
            
            // Poupée Russe : Anti-répétition 
            let finalPool = deduped.filter(q => !ignoreIds.includes(q.id));
            if (finalPool.length < max) {
                // Si l'utilisateur a répondu à toutes les questions possibles, on repioche dans tout.
                finalPool = deduped; 
            }

            return shuffle(finalPool).slice(0, max);
        } catch (error) {
            console.error('Error fetching questions by theme:', error);
            return [];
        }
    },

    /**
     * Récupère 40 questions mélangées, parfaitement équilibrées entre tous les thèmes.
     * Cette version assure une distribution équitable même si le nombre total n'est pas divisible par le nombre de thèmes.
     */
    getExamQuestions: async (max: number = 40, examType?: string, ignoreIds: string[] = []): Promise<Question[]> => {
        try {
            const gigaDatabase = await QuestionService._hydrateCache();
            const themesToDraw = THEMES.filter(t => t !== 'naturalisation' || examType === 'naturalisation');
            
            const questionsPerThemeBase = Math.floor(max / themesToDraw.length);
            let remainder = max % themesToDraw.length;

            const poolResults = themesToDraw.map((t, index) => {
                const countToFetch = questionsPerThemeBase + (index < remainder ? 1 : 0);
                let qs = gigaDatabase.filter(q => q.theme === t);
                    
                    if (examType) {
                        const targetTypes = getTargetExamTypesForTrack(examType);
                        qs = qs.filter(q => {
                            const qTypes = q.exam_types || (q.exam_type ? [q.exam_type] : ['titre_sejour', 'csp']);
                            return qTypes.some(t => targetTypes.includes(t));
                        });
                    }

                    // Déduplication puis exclusion
                    qs = dedupe(qs);
                    let qsFiltered = qs.filter(q => !ignoreIds.includes(q.id));
                    if (qsFiltered.length < countToFetch) {
                        qsFiltered = qs; // S'il a vu toutes les questions du thème, on reset sur le thème complet.
                    }

                    return shuffle(qsFiltered).slice(0, countToFetch);
            });

            let all = poolResults.flat();
            all = dedupe(all);

            // Si la déduplication a réduit le nombre sous 'max', on compense (rare mais possible)
            if (all.length < max) {
                console.warn(`Balanced draw returned only ${all.length}/${max} questions after deduplication.`);
                // On pourrait rajouter une logique de secours ici si besoin.
            }

            return shuffle(all);
        } catch (error) {
            console.error('Error fetching exam questions (perfect balance):', error);
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
                THEMES.map(t => getCountFromServer(query(collection(db, 'questions'), where('theme', '==', t))))
            );
            const rawCounts = Object.fromEntries(THEMES.map((t, i) => [t, snaps[i].data().count]));

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

