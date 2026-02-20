import {
    collection, getDocs, doc, getDoc, updateDoc, query,
    orderBy, limit, where, Timestamp, deleteDoc, addDoc, setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Attempt } from '@/types';

/* --------------------------------------------------
   Types
-------------------------------------------------- */
export interface AdminUserRow {
    uid: string;
    email: string;
    displayName: string;
    track: string | null;
    role: string;
    createdAt: number;
    totalAttempts: number;
    averageScore: number;
}

export interface AdminQuestion {
    id: string;
    theme: string;
    level: string;
    exam_type: string;
    question: string;
    choices: string[];
    correct_index: number;
    explanation: string;
    tags: string[];
    source?: string;
    reference?: string;
    original_id?: string;
    is_active: boolean;
    created_at: string;
}

export interface GlobalStats {
    totalUsers: number;
    totalQuestions: number;
    totalAttempts: number;
    averageScore: number;
    activeQuestions: number;
}

export interface DailyActivity {
    date: string;
    attempts: number;
}

export interface QuestionFormData {
    theme: string;
    level: string;
    exam_type: string;
    question: string;
    choices: string[];
    correct_index: number;
    explanation: string;
    tags: string[];
    is_active: boolean;
}

/* --------------------------------------------------
   AdminService
-------------------------------------------------- */
export class AdminService {

    /* ── Statistiques globales ── */
    static async getGlobalStats(): Promise<GlobalStats> {
        const [usersSnap, questionsSnap, attemptsSnap] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'questions')),
            getDocs(collection(db, 'attempts')),
        ]);

        const activeQuestions = questionsSnap.docs.filter(d => d.data().is_active !== false).length;

        const scores = attemptsSnap.docs
            .map(d => {
                const data = d.data();
                return data.total_questions > 0 ? (data.score / data.total_questions) * 100 : 0;
            })
            .filter(s => s > 0);

        const averageScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        return {
            totalUsers: usersSnap.size,
            totalQuestions: questionsSnap.size,
            activeQuestions,
            totalAttempts: attemptsSnap.size,
            averageScore,
        };
    }

    /* ── Activité quotidienne (7 derniers jours) ── */
    static async getDailyActivity(days: number = 7): Promise<DailyActivity[]> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const q = query(
            collection(db, 'attempts'),
            where('timestamp', '>=', Timestamp.fromDate(since)),
            orderBy('timestamp', 'asc')
        );
        const snap = await getDocs(q);

        const counts: Record<string, number> = {};
        snap.docs.forEach(d => {
            const ts = d.data().timestamp?.toDate?.() ?? new Date(d.data().created_at || Date.now());
            const dateKey = ts.toISOString().slice(0, 10);
            counts[dateKey] = (counts[dateKey] || 0) + 1;
        });

        // Remplir les jours sans activité
        const result: DailyActivity[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            result.push({ date: key.slice(5), attempts: counts[key] || 0 });
        }
        return result;
    }

    /* ── Utilisateurs paginés ── */
    static async getAllUsers(maxResults: number = 50): Promise<AdminUserRow[]> {
        const [usersSnap, attemptsSnap] = await Promise.all([
            getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(maxResults))),
            getDocs(collection(db, 'attempts')),
        ]);

        // Agréger tentatives par user
        const attemptsByUser: Record<string, { count: number; totalScore: number; totalQ: number }> = {};
        attemptsSnap.docs.forEach(d => {
            const data = d.data();
            const uid = data.user_id;
            if (!uid) return;
            if (!attemptsByUser[uid]) attemptsByUser[uid] = { count: 0, totalScore: 0, totalQ: 0 };
            attemptsByUser[uid].count += 1;
            attemptsByUser[uid].totalScore += data.score || 0;
            attemptsByUser[uid].totalQ += data.total_questions || 0;
        });

        return usersSnap.docs.map(d => {
            const data = d.data();
            const uid = d.id;
            const ua = attemptsByUser[uid];
            const avg = ua && ua.totalQ > 0 ? Math.round((ua.totalScore / ua.totalQ) * 100) : 0;
            return {
                uid,
                email: data.email || '',
                displayName: data.displayName || 'Anonyme',
                track: data.track || null,
                role: data.role || 'user',
                createdAt: data.createdAt || 0,
                totalAttempts: ua?.count || 0,
                averageScore: avg,
            };
        });
    }

    /* ── Détail utilisateur ── */
    /* ── Détail utilisateur ── */
    static async getUserDetail(uid: string) {
        // Fetch user profile
        const userSnapPromise = getDoc(doc(db, 'users', uid));

        // Fetch attempts for this user (without orderBy to avoid index requirement)
        // We fetch ALL attempts for this user and sort client-side.
        const attemptsQuery = query(
            collection(db, 'attempts'),
            where('user_id', '==', uid)
        );

        const [userSnap, attemptsSnap] = await Promise.all([
            userSnapPromise,
            getDocs(attemptsQuery)
        ]);

        const attempts = attemptsSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Attempt))
            .sort((a, b) => { // Sort descending
                const dateA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.created_at || 0).getTime();
                const dateB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            })
            .slice(0, 20);

        return {
            profile: userSnap.exists() ? { uid, ...userSnap.data() } : null,
            attempts,
        };
    }

    /* ── Mettre à jour le rôle ── */
    static async updateUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
        await updateDoc(doc(db, 'users', uid), { role });
    }

    /* ── Questions paginées ── */
    static async getQuestions(filters: {
        theme?: string; level?: string; is_active?: boolean
    } = {}, maxResults: number = 100): Promise<AdminQuestion[]> {
        let q = query(collection(db, 'questions'), orderBy('theme'), limit(maxResults));

        if (filters.theme) {
            q = query(collection(db, 'questions'), where('theme', '==', filters.theme), limit(maxResults));
        }

        const snap = await getDocs(q);
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminQuestion));

        if (filters.level) docs = docs.filter(d => d.level === filters.level);
        if (filters.is_active !== undefined) docs = docs.filter(d => d.is_active !== false === filters.is_active);

        return docs;
    }

    /* ── Créer une question ── */
    static async createQuestion(data: QuestionFormData): Promise<string> {
        const ref = await addDoc(collection(db, 'questions'), {
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        return ref.id;
    }

    /* ── Modifier une question ── */
    static async updateQuestion(id: string, data: Partial<QuestionFormData>): Promise<void> {
        await updateDoc(doc(db, 'questions', id), {
            ...data,
            updated_at: new Date().toISOString(),
        });
    }

    /* ── Supprimer (soft delete) ── */
    static async toggleQuestionActive(id: string, is_active: boolean): Promise<void> {
        await updateDoc(doc(db, 'questions', id), { is_active, updated_at: new Date().toISOString() });
    }

    static async deleteQuestion(id: string): Promise<void> {
        await deleteDoc(doc(db, 'questions', id));
    }

    /* ── Stats par thème ── */
    static async getThemeStats(): Promise<{ theme: string; avgScore: number; count: number }[]> {
        const snap = await getDocs(collection(db, 'attempts'));
        const themeData: Record<string, { total: number; count: number }> = {};

        snap.docs.forEach(d => {
            const data = d.data();
            const theme = data.theme || 'general';
            if (!themeData[theme]) themeData[theme] = { total: 0, count: 0 };
            const pct = data.total_questions > 0 ? (data.score / data.total_questions) * 100 : 0;
            themeData[theme].total += pct;
            themeData[theme].count += 1;
        });

        return Object.entries(themeData).map(([theme, d]) => ({
            theme,
            avgScore: Math.round(d.total / d.count),
            count: d.count,
        })).sort((a, b) => b.count - a.count);
    }

    /* ── Paramètres de l'app ── */
    static async getAppSettings(): Promise<Record<string, unknown>> {
        const snap = await getDoc(doc(db, 'config', 'app_settings'));
        return snap.exists() ? snap.data() : {};
    }

    static async saveAppSettings(settings: Record<string, unknown>): Promise<void> {
        await setDoc(doc(db, 'config', 'app_settings'), settings, { merge: true });
    }
}
