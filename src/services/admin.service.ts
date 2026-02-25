import {
    collection, getDocs, doc, getDoc, updateDoc, query,
    orderBy, limit, where, Timestamp, deleteDoc, addDoc, setDoc,
    writeBatch, getCountFromServer
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Attempt } from '@/types';

// Helper to get auth token
const getAuthToken = async () => {
    return await auth.currentUser?.getIdToken();
};

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
    disabled?: boolean;
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
    question: string;
    choices: string[];
    correct_index: number;
    explanation: string;
    theme: string;
    level: string;
    is_active: boolean;
    exam_types: string[]; // Multi-selection
    tags: string[];
}

export interface AdminQuestion {
    id: string;
    question: string;
    choices: string[];
    correct_index: number;
    explanation: string;
    theme: string;
    level: string;
    is_active: boolean;
    tags: string[];         // Added back
    exam_type?: string;     // Legacy support
    exam_types?: string[];  // Multi-exam support
    created_at: string;
    updated_at?: string;
}

/* --------------------------------------------------
   AdminService
-------------------------------------------------- */
export class AdminService {

    /* ── Statistiques globales ── */
    static async getGlobalStats(): Promise<GlobalStats> {
        // Optimization: Use getCountFromServer to avoid fetching all documents
        const [usersCount, questionsCount, attemptsCount, activeQuestionsCount] = await Promise.all([
            getCountFromServer(collection(db, 'users')),
            getCountFromServer(collection(db, 'questions')),
            getCountFromServer(collection(db, 'attempts')),
            getCountFromServer(query(collection(db, 'questions'), where('is_active', '!=', false)))
        ]);

        // For the average score, we still need some data, but we can limit it to recent attempts
        // for better performance, or use a pre-calculated value if available.
        const recentAttemptsSnap = await getDocs(query(collection(db, 'attempts'), orderBy('timestamp', 'desc'), limit(100)));

        const scores = recentAttemptsSnap.docs
            .map(d => {
                const data = d.data();
                return data.total_questions > 0 ? (data.score / data.total_questions) * 100 : 0;
            })
            .filter(s => s > 0);

        const averageScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        return {
            totalUsers: usersCount.data().count,
            totalQuestions: questionsCount.data().count,
            activeQuestions: activeQuestionsCount.data().count,
            totalAttempts: attemptsCount.data().count,
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
    static async getAllUsers(maxResults: number = 200): Promise<AdminUserRow[]> {
        // On retire le orderBy côté Firebase car il exclut les documents où le champ est manquant.
        // On trie en mémoire pour être plus robuste.
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(maxResults)));

        return usersSnap.docs.map(d => {
            const data = d.data();
            const stats = data.stats;
            return {
                uid: d.id,
                email: data.email || '',
                displayName: data.displayName || data.email?.split('@')[0] || 'Anonyme',
                track: data.track || null,
                role: data.role || 'user',
                createdAt: data.createdAt || 0,
                totalAttempts: stats?.total_attempts || 0,
                averageScore: stats?.average_score || 0,
                disabled: data.disabled || false,
            };
        }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    /* ── Exportation ── */
    static async getQuestionsForExport(): Promise<AdminQuestion[]> {
        // Fetch all questions for export (no limit)
        const q = query(collection(db, 'questions'), orderBy('theme'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminQuestion));
    }

    static async getUsersForExport(): Promise<AdminUserRow[]> {
        // Fetch all users for export
        const snap = await getDocs(collection(db, 'users'));
        return snap.docs.map(d => {
            const data = d.data();
            const stats = data.stats;
            return {
                uid: d.id,
                email: data.email || '',
                displayName: data.displayName || data.email?.split('@')[0] || 'Anonyme',
                track: data.track || null,
                role: data.role || 'user',
                createdAt: data.createdAt || 0,
                totalAttempts: stats?.total_attempts || 0,
                averageScore: stats?.average_score || 0,
                disabled: data.disabled || false,
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

    /* ── Mettre à jour le rôle / statut ── */
    static async updateUserRole(uid: string, role: 'user' | 'admin'): Promise<void> {
        await updateDoc(doc(db, 'users', uid), { role });
    }

    static async setUserStatus(uid: string, disabled: boolean): Promise<void> {
        await updateDoc(doc(db, 'users', uid), { disabled });
    }

    static async deleteUser(uid: string): Promise<void> {
        const token = await getAuthToken();
        const response = await fetch('/api/admin/delete-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ uid }),
        });

        if (!response.ok) {
            let errorData;
            const text = await response.text();
            try {
                errorData = JSON.parse(text);
            } catch (e) {
                console.error("[AdminService] Non-JSON error response:", text);
                throw new Error(`Erreur serveur (${response.status}) : Identifiants ou configuration invalide. Voir console.`);
            }
            throw new Error(errorData.error || 'Failed to delete user');
        }
    }

    static async syncUsers(): Promise<{ success: boolean; message: string; syncedCount: number }> {
        const token = await getAuthToken();
        const response = await fetch('/api/admin/sync-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            let errorData;
            const text = await response.text();
            try {
                errorData = JSON.parse(text);
            } catch (e) {
                console.error("[AdminService] Non-JSON error response from sync:", text);
                throw new Error(`Erreur serveur (${response.status}) : Impossible de synchroniser. Voir console.`);
            }
            throw new Error(errorData.error || 'Failed to sync users');
        }

        return await response.json();
    }

    static async testWelcomeEmail(email: string): Promise<any> {
        const token = await getAuthToken();
        const response = await fetch('/api/admin/test-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email })
        });
        return await response.json();
    }

    /* ── Questions paginées ── */
    static async getQuestions(filters: {
        theme?: string; level?: string; is_active?: boolean; exam_type?: string
    } = {}, maxResults: number = 3000): Promise<AdminQuestion[]> {
        let q = query(collection(db, 'questions'), orderBy('theme'), limit(maxResults));

        if (filters.theme) {
            q = query(collection(db, 'questions'), where('theme', '==', filters.theme), limit(maxResults));
        }

        const snap = await getDocs(q);
        let docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminQuestion));

        // Filtering in memory for level and is_active (Firestore limitation on multiple where + order)
        if (filters.level) docs = docs.filter(d => d.level === filters.level);
        if (filters.is_active !== undefined) docs = docs.filter(d => d.is_active !== false === filters.is_active);

        // Multi-path filtering
        if (filters.exam_type) {
            docs = docs.filter(d => {
                const types = d.exam_types || (d.exam_type ? [d.exam_type] : ['titre_sejour']);
                return types.includes(filters.exam_type!);
            });
        }

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

    static async bulkUpdateQuestions(ids: string[], updates: Partial<QuestionFormData>): Promise<void> {
        const batch = writeBatch(db);
        ids.forEach(id => {
            const ref = doc(db, 'questions', id);
            batch.update(ref, {
                ...updates,
                updated_at: new Date().toISOString()
            });
        });
        await batch.commit();
    }

    static async getReviewsForExport() {
        const snap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    /* ── Stats par thème ── */
    static async getThemeStats(maxHistory: number = 500): Promise<{ theme: string; avgScore: number; count: number }[]> {
        // Optimization: Don't fetch all history, use most recent attempts
        const snap = await getDocs(query(collection(db, 'attempts'), orderBy('timestamp', 'desc'), limit(maxHistory)));
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
