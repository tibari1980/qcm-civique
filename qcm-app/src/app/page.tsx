'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, GraduationCap, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserService } from '@/services/user.service';

export default function Home() {
  const { user, userProfile, isAdmin } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        try {
          const data = await UserService.getUserStats(user.uid, userProfile?.track || undefined);
          setStats(data);
        } catch (error) {
          console.error("Error fetching stats for landing page", error);
        }
      }
    };
    fetchStats();
  }, [user, userProfile]);

  const dashboardLink = isAdmin ? "/admin" : "/dashboard";

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-24 pb-32" aria-labelledby="hero-heading">
        <div className="container mx-auto px-4 text-center">
          {user ? (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
              <h1 id="hero-heading" className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                Bonjour <span className="text-[var(--color-primary)]">{user.displayName || 'Candidat'}</span> !
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
                Heureux de vous revoir. Prêt à continuer votre progression vers la réussite ?
              </p>

              {/* Mini Stats Summary */}
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8" aria-label="Résumé de vos statistiques">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-3xl font-bold text-[var(--color-primary)]">{stats.total_attempts}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tests</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-3xl font-bold text-green-600">{stats.average_score}%</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Moyenne</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-3xl font-bold text-purple-600">{Object.keys(stats.theme_stats).length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Thèmes</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <Link href={dashboardLink} className="text-[var(--color-primary)] font-bold flex items-center hover:underline focus:ring-2 focus:ring-blue-300 rounded px-2 py-1" aria-label="Aller au tableau de bord">
                      {isAdmin ? "Admin Dashboard" : "Go Dashboard"} <ArrowRight className="ml-1 w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Skeleton mini-stats pendant le fetch */
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8" aria-hidden="true">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-pulse">
                      <div className="h-8 w-12 rounded bg-gray-100 mb-2" />
                      <div className="h-3 w-16 rounded bg-gray-100" />
                    </div>
                  ))}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <Link href={dashboardLink} className="text-[var(--color-primary)] font-bold flex items-center hover:underline focus:ring-2 focus:ring-blue-300 rounded px-2 py-1" aria-label="Aller au tableau de bord">
                      {isAdmin ? "Admin" : "Dashboard"} <ArrowRight className="ml-1 w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={dashboardLink}>
                  <Button size="lg" className="px-8 shadow-lg shadow-blue-500/20 gap-2 focus:ring-4 focus:ring-blue-300">
                    <TrendingUp className="w-5 h-5" aria-hidden="true" /> {isAdmin ? "Administration" : "Reprendre l'entraînement"}
                  </Button>
                </Link>
                <Link href="/review">
                  <Button variant="outline" size="lg" className="px-8 bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-gray-300">
                    Revoir mes erreurs
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 id="hero-heading" className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
                Réussissez votre <span className="text-[var(--color-primary)]">Examen Civique</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
                La plateforme complète pour préparer votre demande de titre de séjour, carte de résident ou naturalisation française.
                Entraînement officiel, suivi de progression et examens blancs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="px-8 shadow-lg shadow-blue-500/20 focus:ring-4 focus:ring-blue-300">
                    Commencer gratuitement
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="px-8 bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-gray-300">
                    En savoir plus
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 pt-16" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-3xl font-bold text-center mb-12">Nos Fonctionnalités Clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href={user ? "/training" : "/register"} className="block h-full group focus:outline-none">
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-blue-100 hover:border-blue-300 group-focus:ring-4 group-focus:ring-blue-300">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-[var(--color-primary)] mb-4" aria-hidden="true" />
                <CardTitle>Entraînement Thématique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Travaillez spécifiquement sur les 5 thèmes officiels : Valeurs, Institutions, Histoire, Géographie, Société.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={user ? "/exam" : "/register"} className="block h-full group focus:outline-none">
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-blue-100 hover:border-blue-300 group-focus:ring-4 group-focus:ring-blue-300">
              <CardHeader>
                <GraduationCap className="h-10 w-10 text-[var(--color-primary)] mb-4" aria-hidden="true" />
                <CardTitle>Examens Blancs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simulez l&apos;examen réel : 40 questions, 45 minutes. Entraînez-vous dans les conditions exactes du jour J.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={user ? dashboardLink : "/register"} className="block h-full group focus:outline-none">
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-blue-100 hover:border-blue-300 group-focus:ring-4 group-focus:ring-blue-300">
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-[var(--color-primary)] mb-4" aria-hidden="true" />
                <CardTitle>Suivi de Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Visualisez vos progrès, identifiez vos points faibles et maximisez vos chances de réussite (Objectif 80%).
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Nouvelle fonctionnalité : QCM IA */}
          <Link href={user ? "/ai-quiz" : "/register"} className="block h-full group focus:outline-none md:col-span-3">
            <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-r from-blue-50 to-violet-50 border-2 border-blue-200 hover:border-[var(--color-primary)] group-focus:ring-4 group-focus:ring-blue-300">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:gap-6">
                <div className="text-4xl mb-2 md:mb-0" aria-hidden="true">✨</div>
                <div>
                  <div className="inline-flex items-center gap-1 bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-0.5 rounded-full mb-2">
                    NOUVEAU · Propulsé par Gemini AI
                  </div>
                  <CardTitle className="text-xl">QCM Personnalisé IA — PROFESSEUR_FLE_CIVIQUE</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Générez des QCM sur mesure selon votre niveau CECRL (A1 à B2) et votre objectif administratif.
                  10 questions pédagogiques avec explications détaillées, calibrées pour la carte de séjour, la carte résident ou la naturalisation.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['✅ Carte de séjour A2', '✅ Carte résident B1', '✅ Naturalisation B2', '🌍 6 thèmes', '📚 Explications pédagogiques'].map(tag => (
                    <span key={tag} className="bg-white border border-blue-200 text-gray-700 px-2 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 my-16" aria-labelledby="cta-heading">
        <div className="rounded-2xl bg-[var(--color-primary)] p-8 md:p-12 text-center text-white shadow-xl">
          <h2 id="cta-heading" className="text-3xl font-bold mb-4">Prêt à réussir ?</h2>
          <p className="mb-8 text-blue-100 max-w-xl mx-auto">
            Rejoignez des milliers de candidats qui ont préparé leur examen avec succès grâce à notre méthode.
          </p>
          {user ? (
            <Link href={dashboardLink}>
              <Button size="lg" className="bg-white text-[var(--color-primary)] hover:bg-gray-100 border-none focus:ring-4 focus:ring-white/50">
                Accéder à mon espace
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" className="bg-white text-[var(--color-primary)] hover:bg-gray-100 border-none focus:ring-4 focus:ring-white/50">
                Créer un compte gratuit
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
