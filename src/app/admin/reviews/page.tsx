'use client';

import React, { useEffect, useState } from 'react';
import {
    Star,
    Trash2,
    CheckCircle,
    XCircle,
    MessageSquare,
    Clock,
    ShieldCheck,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Review, ReviewService } from '@/services/review.service';
import { AdminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { StarRating } from '@/components/features/reviews/ReviewForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ExportUtils } from '@/lib/exportUtils';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchAllReviews = async () => {
        try {
            const data = await ReviewService.getAllReviews();
            setReviews(data);
        } catch (error) {
            console.error('Error fetching all reviews:', error);
            toast.error('Erreur lors du chargement des avis.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllReviews();
    }, []);

    const totalPages = Math.ceil(reviews.length / itemsPerPage);
    const paginatedReviews = React.useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return reviews.slice(start, start + itemsPerPage);
    }, [reviews, currentPage]);

    const handleToggleApproval = async (id: string, currentStatus: boolean) => {
        try {
            await ReviewService.setReviewApproval(id, !currentStatus);
            toast.success(currentStatus ? 'Avis masqué' : 'Avis approuvé et publié');
            fetchAllReviews();
        } catch (error) {
            toast.error('Erreur de mise à jour');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer définitivement cet avis ?')) return;
        try {
            await ReviewService.deleteReview(id);
            toast.success('Avis supprimé');
            fetchAllReviews();
        } catch (error) {
            toast.error('Erreur de suppression');
        }
    };

    const handleExport = async () => {
        try {
            const allReviews = await AdminService.getReviewsForExport();
            ExportUtils.jsonToExcel(allReviews, {
                userName: 'Utilisateur',
                rating: 'Note',
                comment: 'Commentaire',
                isApproved: 'Approuvé',
                createdAt: 'Date de création'
            }, `avis_utilisateurs_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.success('Export Excel réussi');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Erreur lors de l\'exportation.');
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <MessageSquare className="text-blue-600" size={32} />
                        Modération des Avis
                        <button
                            onClick={handleExport}
                            className="ml-2 p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100"
                            title="Exporter en CSV"
                        >
                            <Download size={20} />
                        </button>
                    </h1>
                    <p className="text-gray-500 font-medium">Gérez la réputation de votre plateforme</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="px-4 py-2 text-center border-r border-gray-100">
                        <div className="text-xl font-black text-blue-600">{reviews.length}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total</div>
                    </div>
                    <div className="px-4 py-2 text-center">
                        <div className="text-xl font-black text-green-600">
                            {reviews.filter(r => r.isApproved).length}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Approuvés</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-3xl" />
                    ))}
                </div>
            ) : paginatedReviews.length > 0 ? (
                <>
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {paginatedReviews.map((review) => (
                                <motion.div
                                    key={review.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <Card className={`border-none shadow-sm rounded-3xl transition-all ${review.isApproved ? 'bg-white opacity-100' : 'bg-gray-50/80 border-2 border-dashed border-gray-200'}`}>
                                        <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                        {review.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                            {review.userName}
                                                            {review.isApproved && <ShieldCheck size={16} className="text-green-500" />}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {review.createdAt instanceof Date ? review.createdAt.toLocaleDateString() : 'Date inconnue'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <StarRating rating={review.rating} />
                                                    <span className="text-sm font-black text-gray-400">{review.rating}/5</span>
                                                </div>

                                                <p className="text-gray-600 text-sm leading-relaxed bg-white/50 p-4 rounded-2xl border border-gray-50">
                                                    {review.comment}
                                                </p>
                                            </div>

                                            <div className="flex md:flex-col gap-2 w-full md:w-auto">
                                                <Button
                                                    variant={review.isApproved ? "outline" : "default"}
                                                    size="sm"
                                                    onClick={() => handleToggleApproval(review.id!, review.isApproved)}
                                                    className={`flex-1 rounded-xl h-10 font-bold ${review.isApproved ? 'text-orange-600' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                                >
                                                    {review.isApproved ? (
                                                        <><XCircle size={16} className="mr-2" /> Masquer</>
                                                    ) : (
                                                        <><CheckCircle size={16} className="mr-2" /> Approuver</>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(review.id!)}
                                                    className="flex-1 rounded-xl h-10 text-red-500 hover:bg-red-50 hover:text-red-700 font-bold"
                                                >
                                                    <Trash2 size={16} className="mr-2" />
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            ) : (
                <Card className="border-none shadow-premium rounded-[2.5rem] p-20 text-center">
                    <MessageSquare className="mx-auto text-gray-100 mb-6" size={80} />
                    <h2 className="text-2xl font-black text-gray-300">Aucun avis à modérer</h2>
                </Card>
            )}
        </div>
    );
}
