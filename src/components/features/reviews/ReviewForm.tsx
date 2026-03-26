'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { ReviewService, Review } from '../../../services/review.service';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function StarRating({ rating, setRating, interactive = false }: {
    rating: number;
    setRating?: (r: number) => void;
    interactive?: boolean;
}) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1" role="radiogroup" aria-label="Note sur 5 étoiles">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    role={interactive ? "radio" : "presentation"}
                    aria-checked={interactive ? star === rating : undefined}
                    aria-label={`${star} étoile${star > 1 ? 's' : ''} sur 5`}
                    className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-sm' : 'cursor-default'}`}
                    onClick={() => setRating?.(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                >
                    <Star
                        size={24}
                        className={`${star <= (hover || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            } transition-colors`}
                        aria-hidden="true"
                    />
                </button>
            ))}
        </div>
    );
}

export function ReviewForm({ onReviewSubmitted, initialReview }: {
    onReviewSubmitted: () => void;
    initialReview?: Review;
}) {
    const { user, userProfile } = useAuth();
    const [rating, setRating] = useState(initialReview?.rating || 0);
    const [comment, setComment] = useState(initialReview?.comment || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Vous devez être connecté pour laisser un avis.');
            return;
        }
        if (rating === 0) {
            toast.error('Veuillez sélectionner une note.');
            return;
        }
        if (comment.trim().length < 10) {
            toast.error('Votre commentaire doit faire au moins 10 caractères.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (initialReview?.id) {
                await ReviewService.updateReview(initialReview.id, rating, comment);
                toast.success('Votre avis a été mis à jour et est en attente de modération.');
            } else {
                await ReviewService.addReview(
                    user.uid,
                    userProfile?.displayName || user.email?.split('@')[0] || 'Anonyme',
                    rating,
                    comment
                );
                toast.success('Merci ! Votre avis a été envoyé et est en attente de modération.');
            }
            setRating(0);
            setComment('');
            onReviewSubmitted();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error("Une erreur est survenue lors de l'envoi de votre avis.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Votre note</label>
                <StarRating rating={rating} setRating={setRating} interactive />
            </div>

            <div className="space-y-2">
                <label htmlFor="review-comment" className="text-sm font-bold text-gray-700">Votre commentaire</label>
                <Textarea
                    id="review-comment"
                    placeholder="Partagez votre expérience avec la plateforme..."
                    value={comment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                    className="min-h-[120px] rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    aria-required="true"
                />
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
                {isSubmitting ? 'Envoi en cours...' : initialReview ? 'Modifier mon avis' : 'Publier mon avis'}
            </Button>
        </form>
    );
}
