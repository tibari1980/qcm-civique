'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Star, Quote, ChevronLeft, Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { ReviewForm, StarRating } from '../../components/features/reviews/ReviewForm';
import { Review, ReviewService } from '../../services/review.service';
import { Card, CardContent } from '../../components/ui/card';
import { useAuth } from '../../context/AuthContext';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { toast } from 'sonner';

export default function ReviewsPage() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
    const [hasMore, setHasMore] = useState(false);

    const fetchReviews = async (isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const { reviews: newReviews, lastVisible: nextVisible } = await ReviewService.getApprovedReviews(isLoadMore ? lastVisible : null);

            if (isLoadMore) {
                setReviews(prev => [...prev, ...newReviews]);
            } else {
                setReviews(newReviews);
            }

            setLastVisible(nextVisible);
            setHasMore(newReviews.length === 6);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Erreur lors du chargement des avis.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer votre avis ?')) return;
        try {
            await ReviewService.deleteReview(id);
            toast.success('Votre avis a été supprimé.');
            fetchReviews();
        } catch (error) {
            toast.error('Erreur lors de la suppression.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header Decoration */}
            <div className="h-1 bg-gradient-to-r from-blue-600 via-white to-red-600" />

            <div className="max-w-4xl mx-auto px-4 pt-12">
                <Link href="/dashboard">
                    <Button variant="ghost" className="mb-8 hover:bg-white text-gray-500 rounded-xl">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Retour au tableau de bord
                    </Button>
                </Link>

                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-2xl mb-6"
                    >
                        <Star className="fill-blue-600" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-gray-900 mb-4"
                    >
                        Votre avis compte
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600 max-w-xl mx-auto"
                    >
                        Aidez-nous à améliorer la plateforme en partageant votre expérience de préparation à l'examen civique.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                    {/* Action Call */}
                    <div className="flex justify-center mb-12">
                        {!showForm && !editingReview ? (
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20"
                                >
                                    <MessageSquare className="mr-3 h-5 w-5" />
                                    Laisser un avis
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-lg"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingReview ? 'Modifier mon avis' : 'Nouvel avis'}
                                    </h2>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setShowForm(false);
                                        setEditingReview(null);
                                    }} className="text-gray-400">
                                        Annuler
                                    </Button>
                                </div>
                                <ReviewForm
                                    initialReview={editingReview || undefined}
                                    onReviewSubmitted={() => {
                                        setShowForm(false);
                                        setEditingReview(null);
                                        fetchReviews();
                                    }}
                                />
                            </motion.div>
                        )}
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center">
                                Derniers témoignages
                                <span className="ml-4 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-bold" aria-label={`${reviews.length} avis affichés`}>
                                    {reviews.length}
                                </span>
                            </h2>
                        </div>

                        {loading && reviews.length === 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-3xl" />
                                ))}
                            </div>
                        ) : reviews.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {reviews.map((review, index) => (
                                            <motion.div
                                                key={review.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index % 6 * 0.1 }}
                                            >
                                                <Card className="border-none shadow-premium bg-white rounded-[2rem] h-full transition-transform hover:-translate-y-1 group relative" role="article">
                                                    <CardContent className="p-8">
                                                        {user?.uid === review.userId && (
                                                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                                    onClick={() => {
                                                                        setEditingReview(review);
                                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                    }}
                                                                    title="Modifier"
                                                                    aria-label="Modifier votre avis"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                                                                    onClick={() => handleDelete(review.id!)}
                                                                    title="Supprimer"
                                                                    aria-label="Supprimer votre avis"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-inner" aria-hidden="true">
                                                                    {review.userName.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-900 leading-none mb-1">
                                                                        {review.userName}
                                                                    </h3>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-2 py-0.5 rounded-full" aria-label="Compte vérifié">
                                                                        Vérifié
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Quote size={24} className="text-blue-100" aria-hidden="true" />
                                                        </div>

                                                        <div className="mb-4">
                                                            <StarRating rating={review.rating} />
                                                        </div>

                                                        <p className="text-gray-600 italic leading-relaxed text-sm">
                                                            <span className="sr-only">Commentaire : </span>
                                                            "{review.comment}"
                                                        </p>

                                                        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            <span className="sr-only">Posté le : </span>
                                                            {review.createdAt instanceof Date
                                                                ? review.createdAt.toLocaleDateString()
                                                                : review.createdAt?.seconds
                                                                    ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
                                                                    : 'Avis récent'}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {hasMore && (
                                    <div className="flex justify-center mt-12">
                                        <Button
                                            onClick={() => fetchReviews(true)}
                                            disabled={loadingMore}
                                            variant="outline"
                                            className="h-12 px-8 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-white hover:border-blue-600 hover:text-blue-600 transition-all"
                                        >
                                            {loadingMore ? 'Chargement...' : 'Voir plus d\'avis'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                                <p className="text-gray-400 font-medium">Aucun avis pour le moment. Soyez le premier !</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
