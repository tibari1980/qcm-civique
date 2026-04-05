'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BookOpen, GraduationCap, CheckCircle, TrendingUp, ArrowRight, Shield, Landmark, Scale, Heart, Users, Award, Trophy, Target, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/user.service';
import { useSettings } from '../context/SettingsContext';
import { FrenchFlag } from '../components/layout/FrenchFlag';

import { FaqSection } from '../components/features/home/FaqSection';

export default function Home() {
  const { user, userProfile, isAdmin } = useAuth();
  const { settings } = useSettings();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [certInfo, setCertInfo] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (user && userProfile) {
        try {
          // Optimization: Use pre-calculated stats from profile if they match the track
          if (userProfile.stats && !userProfile.track) {
            setStats(userProfile.stats);
          } else {
            const data = await UserService.getUserStats(user.uid, userProfile?.track || undefined);
            setStats(data);
          }

          const cert = await UserService.getCertificateStatus(user.uid);
          setCertInfo(cert);
        } catch (error) {
          console.error("Error fetching stats for landing page", error);
        }
      }
    };
    fetchStats();
  }, [user, userProfile]);

  const dashboardLink = isAdmin ? "/admin/" : "/dashboard/";

  return (
    <div className="flex flex-col gap-0 overflow-x-hidden">
      {/* Immersive Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-mesh-republic pt-20 pb-12 overflow-hidden" aria-labelledby="hero-heading">
        {/* Subtle animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />

        {/* Floating patriotic flag element */}
        <div className="absolute top-40 right-[10%] hidden lg:block transform rotate-6 z-0 opacity-20" aria-hidden="true">
          <FrenchFlag className="w-64 h-40" />
        </div>
        <div className="absolute top-60 left-[5%] hidden lg:block transform -rotate-12 z-0 opacity-10" aria-hidden="true">
          <FrenchFlag className="w-48 h-32" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {user ? (
              <>
                <h1 id="hero-heading" className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
                  Ravi de vous revoir, <span className="text-gradient-republic">{userProfile?.displayName || user?.displayName || 'Candidat'}</span>
                </h1>
                <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed font-light">
                  Poursuivons ensemble votre préparation. Prêt à franchir une nouvelle étape vers votre réussite sur <span className="font-medium text-blue-600">{settings.appName}</span> ?
                </p>

                {/* Glassmorphism Stats Summary */}
                {stats ? (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                      }
                    }}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12"
                    aria-label="Résumé de vos statistiques"
                    role="list"
                  >
                    {[
                      { label: "Tests", value: stats.total_attempts, color: "text-blue-800 dark:text-blue-300" },
                      { label: "Moyenne", value: `${stats.average_score}%`, color: "text-emerald-800 dark:text-emerald-300" },
                      { label: "Thèmes", value: Object.keys(stats.theme_stats).length, color: "text-indigo-800 dark:text-indigo-300" },
                      { label: "Dashboard", value: null, isLink: true }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: { opacity: 1, y: 0 }
                        }}
                        className="glass-card p-6 rounded-2xl transition-transform hover:scale-105"
                        role="listitem"
                      >
                        {item.isLink ? (
                          <Link href={dashboardLink} className="h-full flex flex-col items-center justify-center text-blue-600 group" aria-label="Accéder à votre espace personnel">
                            <ArrowRight className="w-8 h-8 mb-2 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
                            <span className="text-sm font-bold uppercase tracking-widest">Espace Personnel</span>
                          </Link>
                        ) : (
                          <>
                            <div className={`text-4xl font-black ${item.color} mb-1`}>{item.value}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">{item.label}</div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="glass-card p-6 rounded-2xl animate-pulse aspect-square flex flex-col items-center justify-center">
                        <div className="h-8 w-16 bg-gray-200/50 rounded-lg mb-2" />
                        <div className="h-3 w-12 bg-gray-100/50 rounded" />
                      </div>
                    ))}
                  </div>
                )}

                {/* New Dynamic Progress Bar */}
                {certInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-2xl mx-auto mb-10 bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap className="h-3 w-3 text-blue-600" aria-hidden="true" /> Progression Certification
                      </span>
                      <span className="text-sm font-black text-blue-700">{Math.round(certInfo.progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200/50 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(certInfo.progress)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progression certification : ${Math.round(certInfo.progress)} pourcent`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${certInfo.progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                      />
                    </div>
                    {certInfo.eligible && (
                      <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center justify-center gap-1" role="status">
                        <CheckCircle className="h-3 w-3" aria-hidden="true" /> Certificat débloqué !
                      </p>
                    )}
                  </motion.div>
                )}


                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href={dashboardLink}>
                    <Button size="xl" className="px-10 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 animate-pulse-glow transition-all active:scale-95 text-lg font-bold">
                      {isAdmin ? "Administration" : "Reprendre l'entraînement"}
                    </Button>
                  </Link>
                  <Link href="/review">
                    <Button variant="outline" size="xl" className="px-10 rounded-full glass-card hover:bg-white/80 border-white/50 text-gray-800 text-lg font-medium">
                      Analyse de mes erreurs
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full"
                >
                  🇫🇷 Excellence Républicaine
                </motion.div>
                <h1 id="hero-heading" className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 mb-8 leading-tight">
                  Préparez sereinement votre <span className="text-gradient-republic">intégration</span>. <br />
                  Réussissez votre examen civique avec CiviqQuiz.
                </h1>
                <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-500 mb-10 font-light leading-relaxed">
                  Accédez à une préparation complète et conforme aux exigences officielles pour votre naturalisation, titre de séjour ou carte de résident.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/register">
                    <Button size="xl" className="px-12 rounded-full bg-black hover:bg-gray-800 text-white shadow-2xl transition-all active:scale-95 text-lg font-bold">
                      Je commence ma préparation gratuite
                    </Button>
                  </Link>
                  <Link href="#values">
                    <Button variant="ghost" size="xl" className="px-8 rounded-full text-gray-600 hover:bg-gray-100 font-medium">
                      Découvrir la méthode
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Premium Trust Banner (Outperforms Competitor) */}
      <section className="relative z-20 -mt-16 md:-mt-24 mb-16 px-4" aria-label="Statistiques d'utilisation">
        <div className="container mx-auto">
          <div className="bg-[#0b1121] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-14 relative overflow-hidden border border-white/10 group">
            {/* Animated background glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none transition-transform duration-1000 group-hover:scale-150" aria-hidden="true" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none transition-transform duration-1000 group-hover:scale-150" aria-hidden="true" />
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" aria-hidden="true" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 relative z-10">
              <StatBlock icon={BookOpen} number="1822+" label="Questions Officielles" delay={0.1} color="blue" />
              <StatBlock icon={Users} number="45 000+" label="Candidats Entraînés" delay={0.2} color="indigo" />
              <StatBlock icon={Target} number="110 000+" label="Quiz Réalisés" delay={0.3} color="red" />
              <StatBlock icon={Trophy} number="98%" label="Taux de Réussite" delay={0.4} color="amber" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (Surpassing the Competitor) */}
      <section className="py-20 md:py-32 bg-slate-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100/30 blur-[100px] pointer-events-none rounded-full transform translate-x-1/2 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-red-100/30 blur-[100px] pointer-events-none rounded-full transform -translate-x-1/2 translate-y-1/4" />
        
        <div className="container mx-auto px-4 relative z-10 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900 tracking-tight">
              Questions Fréquentes sur l'<span className="text-blue-600">Examen Civique</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Tout ce que vous devez savoir pour aborder sereinement votre test de naturalisation, de carte de résident ou de titre de séjour.
            </p>
          </div>

          <div className="space-y-4">
            <FAQAccordion 
              question="Qu'est-ce que l'examen civique pour la naturalisation ?" 
              answer="L'examen civique (décret 2025-1345) évalue votre connaissance et votre adhésion aux valeurs de la République, à l'histoire et aux institutions françaises. Il est obligatoire pour valider votre parcours d'intégration et obtenir la nationalité française."
            />
            <FAQAccordion 
              question="Combien y a-t-il de questions et quel est le score requis ?" 
              answer="L'examen officiel se compose d'un questionnaire à choix multiples (QCM) de 40 questions tirées de manière aléatoire. Pour réussir et valider le test, vous devez obtenir un score strict minimum de 80%, soit au moins 32 bonnes réponses."
            />
            <FAQAccordion 
              question="Quels sont les thèmes évalués lors de l'examen ?" 
              answer="Les questions sont réparties sur 5 grands piliers de la citoyenneté : Les valeurs de la République (Liberté, Égalité, Fraternité, Laïcité), les Droits et Devoirs des citoyens, l'Histoire et la Géographie de la France, les Institutions Françaises, et la société du « vivre-ensemble »."
            />
            <FAQAccordion 
              question="Combien de temps dure l'épreuve officielle ?" 
              answer="Le test dure généralement 45 minutes en conditions réelles d’examen, organisé sur borne numérique ou tablette tactile dans un centre de passage agréé (comme La Poste ou les préfectures partenaires)."
            />
            <FAQAccordion 
              question="Pourquoi m'entraîner avec CiviqQuiz ?" 
              answer="CiviqQuiz reproduit le strict format de l'examen de l'État : minuteur immersif, questions officielles actualisées, mode aveugle pour une évaluation sans aide extérieure, et statistiques pointues pour garantir votre succès dès le premier essai."
            />
          </div>
        </div>
      </section>

      {/* Values Section — The "Wow" factor */}
      <section id="values" className="py-16 md:py-24 bg-white" aria-labelledby="values-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 id="values-heading" className="text-3xl md:text-5xl font-extrabold mb-4 text-gray-900">Les thèmes fondamentaux</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-blue-600 via-white to-red-600 mx-auto rounded-full" />
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              { icon: Landmark, title: "Institutions & État", desc: "Comprenez le rôle des institutions, le fonctionnement de la démocratie et la séparation des pouvoirs.", color: "bg-blue-50 text-blue-600" },
              { icon: Shield, title: "Valeurs & Principes", desc: "Appropriez-vous les valeurs de la République : liberté, égalité, fraternité et laïcité.", color: "bg-gray-50 text-gray-900" },
              { icon: Scale, title: "Droits & Devoirs", desc: "Maîtrisez les notions essentielles de justice, de citoyenneté et de vivre-ensemble.", color: "bg-red-50 text-red-600" }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -10 }}
                className="p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
              >
                <div className={`w-16 h-16 ${value.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`} aria-hidden="true">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -z-10 opacity-50" aria-hidden="true" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 bg-slate-50 overflow-hidden" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">Outils d'excellence</span>
              <h2 id="features-heading" className="text-4xl md:text-5xl font-black text-gray-900 mt-2 italic uppercase">Une préparation sur mesure</h2>
            </div>
            <Link href="/register">
              <Button variant="link" className="text-blue-600 font-bold text-lg group">
                Voir toutes les options <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <FeatureCard
              href={user ? "/training" : "/register"}
              icon={BookOpen}
              title="Entraînement Thématique"
              desc="Accédez aux 5 thèmes officiels révisés pour 2026. Des quiz ciblés pour chaque module."
            />
            <FeatureCard
              href={user ? "/exam" : "/register"}
              icon={GraduationCap}
              title="Examens Blancs"
              desc="Simulations chronométrées en conditions réelles. 40 questions pour décrocher votre certificat."
            />
            <FeatureCard
              href={user ? dashboardLink : "/register"}
              icon={CheckCircle}
              title="Suivi de Progression"
              desc="Analyses graphiques détaillées et identification instantanée de vos thèmes à renforcer."
            />
          </div>

          {/* AI Banner - High End */}
          <Link href={user ? "/ai-quiz" : "/register"} className="block group">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative rounded-3xl overflow-hidden bg-black p-8 md:p-12 text-white shadow-2xl border-2 border-white/10"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                    ✨ Assistant Intelligent
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black mb-6 leading-tight">L&apos;IA au service de votre réussite.</h3>
                  <p className="text-gray-400 text-lg mb-8 leading-relaxed font-light italic">
                    Générez des tests personnalisés adaptés à votre niveau. Notre assistant intelligent cible vos points de progression pour un apprentissage plus rapide.
                  </p>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0 },
                      show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                      }
                    }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="flex flex-wrap gap-3"
                  >
                    {['Carte de séjour', 'Résident', 'Naturalisation', 'Niveaux A1-B2'].map(tag => (
                      <motion.span
                        key={tag}
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: { opacity: 1, scale: 1 }
                        }}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium backdrop-blur-sm"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm min-w-[280px]">
                  <p className="text-sm font-bold text-blue-400 mb-2">SCORE DE PRÉCISION</p>
                  <div className="text-6xl font-black mb-4 tracking-tighter">99.2%</div>
                  <Button className="w-full bg-white text-black hover:bg-gray-200 rounded-full font-black uppercase tracking-tighter">
                    Lancer l&apos;IA
                  </Button>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />

      {/* Signature & Closing */}
      <section className="py-24 bg-white relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mb-12"
          >
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-6 animate-pulse" aria-hidden="true" />
            <h2 id="cta-heading" className="text-4xl md:text-6xl font-black text-gray-900 mb-6 uppercase tracking-tighter">Bâtissons votre avenir.</h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-500 font-light mb-12">
              Rejoignez les milliers de candidats qui ont déjà réussi avec CiviqQuiz. <br />
              Commencez votre préparation dès aujourd&apos;hui avec les meilleurs outils.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href={user ? dashboardLink : "/register"}>
              <Button size="xl" className="px-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-2xl text-lg font-bold">
                {user ? "Accéder à mon espace" : "Créer un compte gratuit"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Patriotic watermark */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </section>
    </div>
  );
}

function FeatureCard({ href, icon: Icon, title, desc }: { href: string, icon: any, title: string, desc: string }) {
  return (
    <Link href={href} className="block h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-3xl" aria-label={`${title} — ${desc}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="h-full bg-white/70 backdrop-blur-md dark:bg-slate-900/40 p-8 rounded-3xl border border-white/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all cursor-pointer flex flex-col items-start gap-5 relative overflow-hidden"
      >
        {/* Subtle glow effect on hover */}
        <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 relative z-10" aria-hidden="true">
          <Icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
        </div>
        <div className="relative z-10 space-y-3">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
        </div>
        <div className="pt-6 mt-auto text-blue-600 dark:text-blue-400 font-black text-sm uppercase tracking-widest flex items-center gap-1 group-hover:gap-3 transition-all relative z-10" aria-hidden="true">
          Commencer <ArrowRight className="w-5 h-5" />
        </div>
      </motion.div>
    </Link>
  );
}

function StatBlock({ icon: Icon, number, label, delay, color }: { icon: any, number: string, label: string, delay: number, color: string }) {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-400/10",
    indigo: "text-indigo-400 bg-indigo-400/10",
    red: "text-red-400 bg-red-400/10",
    amber: "text-amber-400 bg-amber-400/10"
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.7, type: "spring" }}
      className="flex flex-col items-center text-center group"
    >
      <div className={`w-16 h-16 rounded-[1.25rem] border border-white/5 flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">
        {number}
      </div>
      <div className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
        {label}
      </div>
    </motion.div>
  );
}

function FAQAccordion({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.div 
      initial={false}
      className={`border transition-colors duration-300 rounded-2xl overflow-hidden ${isOpen ? 'bg-white border-blue-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)]' : 'bg-white/50 border-slate-200 hover:border-slate-300'}`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-expanded={isOpen}
      >
        <span className={`font-black text-lg md:text-xl transition-colors ${isOpen ? 'text-blue-600' : 'text-slate-800'}`}>
          {question}
        </span>
        <ChevronDown 
          className={`w-6 h-6 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} 
        />
      </button>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-6 pt-2 text-slate-600 md:text-lg leading-relaxed font-medium">
          {answer}
        </div>
      </motion.div>
    </motion.div>
  );
}
