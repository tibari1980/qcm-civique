import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc,
    Timestamp,
    limit,
    startAfter,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Review {
    id?: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: Timestamp | Date | any;
    isApproved: boolean;
}

export class ReviewService {
    private static collectionName = 'reviews';

    /**
     * Ajoute un nouvel avis
     */
    static async addReview(userId: string, userName: string, rating: number, comment: string): Promise<string> {
        const reviewData: Omit<Review, 'id'> = {
            userId,
            userName,
            rating,
            comment,
            isApproved: false, // Nécessite une modération par défaut
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, this.collectionName), reviewData);
        return docRef.id;
    }

    /**
     * Récupère les avis approuvés pour l'affichage public avec pagination
     */
    static async getApprovedReviews(lastDoc?: QueryDocumentSnapshot | null): Promise<{ reviews: Review[], lastVisible: QueryDocumentSnapshot | null }> {
        let q = query(
            collection(db, this.collectionName),
            where('isApproved', '==', true),
            orderBy('createdAt', 'desc'),
            limit(6)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const querySnapshot = await getDocs(q);
        const reviews = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Review));

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

        return { reviews, lastVisible };
    }

    /**
     * Récupère tous les avis (pour l'admin)
     */
    static async getAllReviews(): Promise<Review[]> {
        const q = query(
            collection(db, this.collectionName),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Review));
    }

    /**
     * Met à jour un avis existant
     */
    static async updateReview(id: string, rating: number, comment: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, {
            rating,
            comment,
            updatedAt: serverTimestamp(),
            isApproved: false // Repasse en modération après modification
        });
    }

    /**
     * Approuve ou désapprouve un avis
     */
    static async setReviewApproval(id: string, isApproved: boolean): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, { isApproved });
    }

    /**
     * Supprime un avis
     */
    static async deleteReview(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }
}
