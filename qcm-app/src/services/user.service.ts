import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    setDoc,
    addDoc,
    updateDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    increment
} from 'firebase/firestore';
import { Attempt, UserProfile, UserProgress } from '@/types';

export const UserService = {
    // initialize or update user profile
    syncUserProfile: async (uid: string, data: Partial<UserProfile>) => {
        const userRef = doc(db, 'users', uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            await setDoc(userRef, {
                uid,
                createdAt: Date.now(),
                ...data
            });
        } else {
            await updateDoc(userRef, data);
        }
    },

    // Get user profile
    getUserProfile: async (uid: string): Promise<UserProfile | null> => {
        const userRef = doc(db, 'users', uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) return snapshot.data() as UserProfile;
        return null;
    },

    // Save a training or exam attempt
    saveAttempt: async (attempt: Omit<Attempt, 'id' | 'created_at'>) => {
        try {
            // 1. Save the attempt document
            const attemptData = {
                ...attempt,
                created_at: new Date().toISOString(),
                timestamp: Timestamp.now() // Helper for sorting
            };

            const attemptRef = await addDoc(collection(db, 'attempts'), attemptData);

            // 2. Update User Statistics Aggregates (Atomic increment is better but simple read-write for now)
            // We can also use a Cloud Function for this to be safer/cleaner, but client-side is fine for MVP.
            // Let's at least try to update a 'stats' document for the user.

            // Note: We are strictly not doing real-time aggregation here to save complexity, 
            // the Dashboard will calculate stats from the last X attempts or we can do a simple counter.

            return attemptRef.id;
        } catch (error) {
            console.error("Error saving attempt:", error);
            throw error;
        }
    },

    // Get recent activity for dashboard
    getRecentActivity: async (uid: string, max: number = 5): Promise<Attempt[]> => {
        try {
            // Optimization: To avoid creating a composite index (user_id + timestamp) manually in Console,
            // we fetch all user attempts and sort client-side. 
            // This is perfectly fine for < 1000 attempts per user.
            const q = query(
                collection(db, 'attempts'),
                where('user_id', '==', uid)
            );

            const snapshot = await getDocs(q);
            const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attempt));

            // Sort by timestamp desc
            attempts.sort((a, b) => {
                const dateA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.created_at).getTime();
                const dateB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.created_at).getTime();
                return dateB - dateA;
            });

            return attempts.slice(0, max);
        } catch (error) {
            console.error("Error fetching recent activity:", error);
            return [];
        }
    },

    // Get global stats for dashboard
    getUserStats: async (uid: string, track?: 'residence' | 'naturalisation'): Promise<UserProgress> => {
        try {
            const q = query(
                collection(db, 'attempts'),
                where('user_id', '==', uid)
            );

            const snapshot = await getDocs(q);
            let attempts = snapshot.docs.map(doc => doc.data() as Attempt);

            // Client-side filtering for MVP (since we didn't index everything for complex queries)
            if (track) {
                // Map track to exam_type(s)
                // residence -> 'titre_sejour'
                // naturalisation -> 'naturalisation'
                const targetType = track === 'residence' ? 'titre_sejour' : 'naturalisation';
                attempts = attempts.filter(a => a.exam_type === targetType);
            }

            const total_attempts = attempts.length;
            if (total_attempts === 0) {
                return {
                    total_attempts: 0,
                    average_score: 0,
                    last_activity: '',
                    theme_stats: {}
                };
            }

            // Calculate Average Score (normalized to %)
            // Store score is x/40 or x/20. We need to normalize.
            // Assuming Attempt has 'score' and 'total_questions'.
            let totalScorePercent = 0;

            attempts.forEach(a => {
                if (a.total_questions > 0) {
                    totalScorePercent += (a.score / a.total_questions) * 100;
                }
            });

            const average_score = Math.round(totalScorePercent / total_attempts);

            // Sort by date to get last activity
            // (Note: if we already fetched sorted, we could take [0])
            // Since we didn't sort the main query to avoid composite index requirement issues on 'theme' + 'ts',
            // we do it here or assume the recentActivity handles the "Last Activity" display.
            // Let's just grab the most recent timestamp string.
            const sorted = attempts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const last_activity = sorted[0]?.created_at || '';

            // Calculate Theme Stats (completed themes)
            const theme_stats: Record<string, { attempts: number, success_rate: number, last_score: number }> = {};

            attempts.forEach(a => {
                // Only consider training attempts with a theme
                if (a.theme) {
                    if (!theme_stats[a.theme]) {
                        theme_stats[a.theme] = { attempts: 0, success_rate: 0, last_score: 0 };
                    }

                    const stats = theme_stats[a.theme];
                    stats.attempts += 1;

                    // Keep track of the latest score (assuming attempts are not sorted, we might need a better way if we strictly want 'best' or 'latest')
                    // But typically 'Maîtrisé' implies > 80% success rate recently or on average.
                    // Let's aggregate total score percentage to find average success rate for that theme.
                    const percentage = a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0;
                    stats.success_rate = ((stats.success_rate * (stats.attempts - 1)) + percentage) / stats.attempts;
                    stats.last_score = percentage;
                }
            });

            // Note: For Dashboard "Mastered Themes", we might want to filter, but for "Training Page" progress, we want EVERYTHING.
            // Current strategy: Return ALL stats here, and let the UI decide what to show as "Mastered" vs just "In Progress".
            // Previous implementation filtered here, which hid progress from Training Page.

            return {
                total_attempts,
                average_score,
                last_activity,
                theme_stats: theme_stats // Return all themes so we can show progress bar
            };

        } catch (error) {
            console.error("Error calculating user stats:", error);
            return {
                total_attempts: 0,
                average_score: 0,
                last_activity: '',
                theme_stats: {}
            };
        }
    },

    // Get IDs of questions answered incorrectly
    getIncorrectQuestionIds: async (uid: string): Promise<string[]> => {
        try {
            const q = query(
                collection(db, 'attempts'),
                where('user_id', '==', uid)
            );

            const snapshot = await getDocs(q);
            const attempts = snapshot.docs.map(doc => doc.data() as Attempt);

            const incorrectIds = new Set<string>();
            attempts.forEach(attempt => {
                attempt.answers.forEach(ans => {
                    if (!ans.correct) {
                        incorrectIds.add(ans.question_id);
                    }
                });
            });

            // Optional: Remove IDs that were subsequently answered correctly? 
            // For now, let's keep it simple: "Questions you have struggled with".
            // A more advanced logic would be: check if the *latest* attempt for this ID was correct.
            // Let's implement that optimization for a better UX.

            const finalIncorrectIds = new Set<string>();
            const latestStatusMap = new Map<string, boolean>(); // id -> isCorrect

            // We need to process attempts in chronological order
            const sortedAttempts = attempts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            sortedAttempts.forEach(attempt => {
                attempt.answers.forEach(ans => {
                    latestStatusMap.set(ans.question_id, ans.correct);
                });
            });

            latestStatusMap.forEach((isCorrect, id) => {
                if (!isCorrect) {
                    finalIncorrectIds.add(id);
                }
            });

            return Array.from(finalIncorrectIds);
        } catch (error) {
            console.error("Error fetching incorrect questions:", error);
            return [];
        }
    }
};
