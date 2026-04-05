
export interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
}

export type ExamType = 'titre_sejour' | 'carte_resident' | 'naturalisation' | 'ai_qcm' | 'csp' | 'cr';
export type Level = 'Débutant' | 'Intermédiaire' | 'Avancé';

export interface Question {
    id: string;
    exam_type: ExamType;
    theme: string;
    level: Level;
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
    updated_at: string;
}

export interface UserProgress {
    total_attempts: number;
    average_score: number;
    last_activity: string;
    theme_stats: Record<string, { attempts: number; success_rate: number; last_score: number }>;
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
    track: 'csp' | 'cr' | 'naturalisation' | null;
    createdAt: number;
    role?: 'user' | 'admin';
    disabled?: boolean;
    stats?: UserProgress;
    stats_csp?: UserProgress;
    stats_cr?: UserProgress;
    stats_naturalisation?: UserProgress;
    lastReminderAt?: number;
    welcomeEmailSent?: boolean;
}

export interface Attempt {
    id: string;
    user_id: string;
    exam_type: ExamType;
    score: number; // x/40
    total_questions: number;
    time_spent: number; // in seconds
    answers: Array<{ question_id: string; choice_index: number; correct: boolean }>;
    theme?: string; // specific theme if training
    created_at: string;
    timestamp?: FirestoreTimestamp;
}

export interface AppNotification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    status: 'unread' | 'read';
    link?: string;
    createdAt: string;
    timestamp: FirestoreTimestamp;
}
