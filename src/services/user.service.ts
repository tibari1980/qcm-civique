import { db } from '../lib/firebase';
import {
    collection,
    doc,
    setDoc,
    addDoc,
    getDocs,
    getDoc,
    query,
    where,
    Timestamp,
} from 'firebase/firestore';
import { Attempt, UserProfile, UserProgress } from '../types';

// Simple in-memory cache to reduce Firestore reads during a session
const cache: {
    profiles: Record<string, UserProfile>;
    activity: Record<string, Attempt[]>;
    stats: Record<string, UserProgress>;
    fullData: Record<string, any>;
    timestamp: Record<string, number>;
} = {
    profiles: {},
    activity: {},
    stats: {},
    fullData: {},
    timestamp: {}
};

const CACHE_TTL = 300000; // 5 minutes (reduced reads, faster sessions)

function isCacheValid(key: string) {
    return !!(cache.timestamp[key] && (Date.now() - cache.timestamp[key] < CACHE_TTL));
}

function clearUserCache(uid: string) {
    delete cache.profiles[uid];
    delete cache.activity[uid];

    // Clear wildcard keys
    Object.keys(cache.stats).forEach(k => { if (k.includes(uid)) delete cache.stats[k]; });
    Object.keys(cache.fullData).forEach(k => { if (k.includes(uid)) delete cache.fullData[k]; });
    Object.keys(cache.timestamp).forEach(k => { if (k.includes(uid)) delete cache.timestamp[k]; });
}

export const UserService = {
    // initialize or update user profile with robustness
    syncUserProfile: async (uid: string, data: Partial<UserProfile>) => {
        try {
            if (!uid) throw new Error("UID is required for syncUserProfile");

            const userRef = doc(db, 'users', uid);
            const cleanData = { ...data };
            if (cleanData.photoURL === undefined) delete cleanData.photoURL;

            await setDoc(userRef, {
                uid,
                ...cleanData
            }, { merge: true });

            clearUserCache(uid);
        } catch (error) {
            console.error("Error in syncUserProfile:", error);
            throw error;
        }
    },

    // Get user profile
    getUserProfile: async (uid: string): Promise<UserProfile | null> => {
        const cacheKey = `profile_${uid}`;
        if (isCacheValid(cacheKey)) return cache.profiles[uid];

        const userRef = doc(db, 'users', uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
            const data = snapshot.data() as UserProfile;
            cache.profiles[uid] = data;
            cache.timestamp[cacheKey] = Date.now();
            return data;
        }
        return null;
    },

    // Save a training or exam attempt
    saveAttempt: async (attempt: Omit<Attempt, 'id' | 'created_at'>) => {
        try {
            const attemptData = {
                ...attempt,
                created_at: new Date().toISOString(),
                timestamp: Timestamp.now()
            };

            const attemptRef = await addDoc(collection(db, 'attempts'), attemptData);

            // OPTIMIZED: Incremental update of stats in user profile
            // This avoids fetching all historical attempts every time
            if (attempt.user_id) {
                const userRef = doc(db, 'users', attempt.user_id);
                const userSnap = await getDoc(userRef);
                const profile = userSnap.data() as UserProfile | undefined;

                let oldStats: UserProgress = profile?.stats || {
                    total_attempts: 0,
                    average_score: 0,
                    last_activity: '',
                    theme_stats: {}
                };

                const newTotalAttempts = (oldStats.total_attempts || 0) + 1;
                const attemptScorePct = (attempt.score / attempt.total_questions) * 100;

                const newAvgScore = Math.round(
                    ((oldStats.average_score || 0) * (oldStats.total_attempts || 0) + attemptScorePct) / newTotalAttempts
                );

                const newThemeStats = { ...(oldStats.theme_stats || {}) };
                if (attempt.theme) {
                    const targetTheme = attempt.theme;
                    const oldTheme = newThemeStats[targetTheme] || { attempts: 0, success_rate: 0, last_score: 0 };

                    const newThemeAttempts = oldTheme.attempts + 1;
                    newThemeStats[targetTheme] = {
                        attempts: newThemeAttempts,
                        success_rate: ((oldTheme.success_rate * oldTheme.attempts) + attemptScorePct) / newThemeAttempts,
                        last_score: attemptScorePct
                    };
                }

                const updatedStats: UserProgress = {
                    total_attempts: newTotalAttempts,
                    average_score: newAvgScore,
                    last_activity: attemptData.created_at,
                    theme_stats: newThemeStats
                };

                await setDoc(userRef, { stats: updatedStats }, { merge: true });
                clearUserCache(attempt.user_id);
            }

            return attemptRef.id;
        } catch (error) {
            console.error("Error saving attempt:", error);
            throw error;
        }
    },

    // Get recent activity for dashboard
    getRecentActivity: async (uid: string, max: number = 5): Promise<Attempt[]> => {
        const cacheKey = `activity_${uid}_${max}`;
        if (isCacheValid(cacheKey)) return cache.activity[uid] || [];

        try {
            const q = query(
                collection(db, 'attempts'),
                where('user_id', '==', uid)
            );

            const snapshot = await getDocs(q);
            const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attempt));

            attempts.sort((a, b) => {
                const dateA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.created_at).getTime();
                const dateB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.created_at).getTime();
                return dateB - dateA;
            });

            const result = attempts.slice(0, max);
            cache.activity[uid] = result;
            cache.timestamp[cacheKey] = Date.now();
            return result;
        } catch (error) {
            console.error("Error fetching recent activity:", error);
            return [];
        }
    },

    // Get global stats for dashboard
    getUserStats: async (uid: string, track?: 'residence' | 'naturalisation', forceRecalc: boolean = false): Promise<UserProgress> => {
        const cacheKey = `stats_${uid}_${track || 'none'}`;
        if (!forceRecalc && isCacheValid(cacheKey)) return cache.stats[cacheKey];

        try {
            // Priority 1: Check if profile already has pre-calculated stats (and no track filter requested)
            if (!forceRecalc && !track) {
                const profile = await UserService.getUserProfile(uid);
                if (profile?.stats) {
                    cache.stats[cacheKey] = profile.stats;
                    return profile.stats;
                }
            }

            // Fallback: Manual calculation (also used for filtered tracks or first time)
            const q = query(
                collection(db, 'attempts'),
                where('user_id', '==', uid)
            );

            const snapshot = await getDocs(q);
            let attempts = snapshot.docs.map(doc => doc.data() as Attempt);

            if (track) {
                const targetTypes = track === 'residence' ? ['titre_sejour', 'carte_resident'] : ['naturalisation'];
                attempts = attempts.filter(a => targetTypes.includes(a.exam_type));
            }

            const total_attempts = attempts.length;
            if (total_attempts === 0) {
                return { total_attempts: 0, average_score: 0, last_activity: '', theme_stats: {} };
            }

            let totalScorePercent = 0;
            attempts.forEach(a => {
                if (a.total_questions > 0) totalScorePercent += (a.score / a.total_questions) * 100;
            });

            const average_score = Math.round(totalScorePercent / total_attempts);
            const sorted = attempts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const last_activity = sorted[0]?.created_at || '';

            const theme_stats: Record<string, { attempts: number, success_rate: number, last_score: number }> = {};
            attempts.forEach(a => {
                if (a.theme) {
                    const targetTheme = a.theme === 'geographie' ? 'histoire' : a.theme;
                    if (!theme_stats[targetTheme]) theme_stats[targetTheme] = { attempts: 0, success_rate: 0, last_score: 0 };
                    const s = theme_stats[targetTheme];
                    const pct = a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0;
                    s.attempts += 1;
                    s.success_rate = ((s.success_rate * (s.attempts - 1)) + pct) / s.attempts;
                    s.last_score = pct;
                }
            });

            const result = { total_attempts, average_score, last_activity, theme_stats };
            cache.stats[cacheKey] = result;
            cache.timestamp[cacheKey] = Date.now();
            return result;

        } catch (error) {
            console.error("Error calculating user stats:", error);
            return { total_attempts: 0, average_score: 0, last_activity: '', theme_stats: {} };
        }
    },

    // Unified method: 1 Firestore call
    getAllUserData: async (uid: string, options: { track?: 'residence' | 'naturalisation'; maxRecent?: number } = {}): Promise<{
        stats: UserProgress;
        recentActivity: Attempt[];
        incorrectIds: string[];
        seenIds: string[];
    }> => {
        const { track, maxRecent = 5 } = options;
        const cacheKey = `full_${uid}_${track || 'none'}_${maxRecent}`;

        if (isCacheValid(cacheKey)) return cache.fullData[cacheKey];

        try {
            const snap = await getDocs(query(collection(db, 'attempts'), where('user_id', '==', uid)));
            let attempts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Attempt));

            const sortedDesc = [...attempts].sort((a, b) => {
                const tA = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : new Date(a.created_at).getTime();
                const tB = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : new Date(b.created_at).getTime();
                return tB - tA;
            });
            const recentActivity = sortedDesc.slice(0, maxRecent);

            const latestStatus = new Map<string, boolean>();
            [...attempts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).forEach(at => {
                (at.answers || []).forEach(ans => latestStatus.set(ans.question_id, ans.correct));
            });
            const incorrectIds = Array.from(latestStatus.entries()).filter(([, ok]) => !ok).map(([id]) => id);
            const seenIds = Array.from(latestStatus.keys());

            if (track) {
                const targetTypes = track === 'residence' ? ['titre_sejour', 'carte_resident'] : ['naturalisation'];
                attempts = attempts.filter(a => targetTypes.includes(a.exam_type));
            }

            let totalScorePercent = 0;
            const theme_stats: Record<string, { attempts: number; success_rate: number; last_score: number }> = {};

            attempts.forEach(a => {
                const pct = a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0;
                totalScorePercent += pct;
                if (a.theme) {
                    const targetTheme = a.theme === 'geographie' ? 'histoire' : a.theme;
                    if (!theme_stats[targetTheme]) theme_stats[targetTheme] = { attempts: 0, success_rate: 0, last_score: 0 };
                    const t = theme_stats[targetTheme];
                    t.attempts += 1;
                    t.success_rate = ((t.success_rate * (t.attempts - 1)) + pct) / t.attempts;
                    t.last_score = pct;
                }
            });

            const result = {
                stats: {
                    total_attempts: attempts.length,
                    average_score: attempts.length ? Math.round(totalScorePercent / attempts.length) : 0,
                    last_activity: sortedDesc[0]?.created_at || '',
                    theme_stats,
                },
                recentActivity,
                incorrectIds,
                seenIds,
            };

            cache.fullData[cacheKey] = result;
            cache.timestamp[cacheKey] = Date.now();
            return result;
        } catch (error) {
            console.error('Error in getAllUserData:', error);
            return {
                stats: { total_attempts: 0, average_score: 0, last_activity: '', theme_stats: {} },
                recentActivity: [],
                incorrectIds: [],
                seenIds: [],
            };
        }
    },

    getCertificateStatus: async (uid: string): Promise<{ eligible: boolean; progress: number; missingThemes: string[] }> => {
        try {
            const { stats } = await UserService.getAllUserData(uid);
            const themes = ['histoire', 'institutions', 'societe', 'vals_principes', 'droits'];
            const missingThemes: string[] = [];
            let masteredCount = 0;

            themes.forEach(theme => {
                const s = stats.theme_stats[theme];
                if (s && s.last_score >= 80) masteredCount++;
                else missingThemes.push(theme);
            });

            return { eligible: masteredCount === themes.length, progress: (masteredCount / themes.length) * 100, missingThemes };
        } catch (error) {
            console.error("Error checking certificate status:", error);
            return { eligible: false, progress: 0, missingThemes: [] };
        }
    },

    getIncorrectQuestionIds: async (uid: string): Promise<string[]> => {
        const { incorrectIds } = await UserService.getAllUserData(uid);
        return incorrectIds;
    }
};
