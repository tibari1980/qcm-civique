import { db } from '../lib/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    doc,
    updateDoc,
    addDoc,
    Timestamp,
    getDocs
} from 'firebase/firestore';
import { AppNotification } from '../types';

export const NotificationService = {
    /**
     * Écoute les notifications en temps réel pour un utilisateur spécifique.
     */
    listenNotifications: (userId: string, callback: (notifications: AppNotification[]) => void) => {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            limit(100)
        );

        return onSnapshot(q, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AppNotification));

            // Tri manuel pour éviter de requérir un index composite Firestore
            const sorted = notifications.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            });

            callback(sorted.slice(0, 20));
        });
    },

    /**
     * Marque une notification comme lue.
     */
    markAsRead: async (notificationId: string) => {
        const ref = doc(db, 'notifications', notificationId);
        await updateDoc(ref, { status: 'read' });
    },

    /**
     * Marque toutes les notifications d'un utilisateur comme lues.
     */
    markAllAsRead: async (userId: string) => {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('status', '==', 'unread')
        );
        const snapshot = await getDocs(q);
        const promises = snapshot.docs.map(d => updateDoc(d.ref, { status: 'read' }));
        await Promise.all(promises);
    },

    /**
     * Crée une nouvelle notification (Usage interne/système).
     */
    sendNotification: async (data: Omit<AppNotification, 'id' | 'createdAt' | 'timestamp' | 'status'>) => {
        await addDoc(collection(db, 'notifications'), {
            ...data,
            status: 'unread',
            createdAt: new Date().toISOString(),
            timestamp: Timestamp.now()
        });
    },
    /**
     * Vérifie si l'utilisateur a été inactif pendant plus de 3 jours 
     * et envoie un rappel si nécessaire.
     */
    checkInactivity: async (user: any, profile: any) => {
        if (!user || !profile || !profile.stats?.last_activity) return;

        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const lastActivityDate = new Date(profile.stats.last_activity).getTime();
        const lastReminder = profile.lastReminderAt || 0;

        // Si inactif depuis > 3 jours ET pas de rappel envoyé depuis 3 jours
        if (now - lastActivityDate > threeDaysMs && now - lastReminder > threeDaysMs) {
            await NotificationService.sendNotification({
                userId: user.uid,
                title: 'Vous nous avez manqué ! 🇫🇷',
                message: "C'est l'heure d'une petite session de QCM pour rester au top de votre forme civique. On s'y remet ?",
                type: 'info',
                link: '/dashboard'
            });

            // Mettre à jour la date du dernier rappel dans le profil
            const { db } = await import('../lib/firebase');
            const { doc, updateDoc } = await import('firebase/firestore');
            await updateDoc(doc(db, 'users', user.uid), {
                lastReminderAt: now
            });
        }
    }
};
