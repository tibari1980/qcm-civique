'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, BookOpen, Target, GraduationCap, AlertCircle, ChevronRight, MessageCircleQuestion } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * QuickActions — Navigation 4 quadrants avec esthétique 3D
 * WCAG 2.2 AA :
 * - Zones tactiles >= 48dp
 * - Labels sémantiques clairs
 * - Contrastes élevés
 * - Support TalkBack/VoiceOver
 */

interface ActionCardProps {
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
    colorClass: string;
    iconBgClass: string;
    badge?: string;
}

function ActionCard({ href, title, description, icon: Icon, colorClass, iconBgClass, badge }: ActionCardProps) {
    return (
        <Link href={href} className="group block h-full">
            <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`premium-card-3d h-full p-6 flex flex-col justify-between ${colorClass} transition-shadow duration-300 hover:shadow-2xl`}
            >
                <div>
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-12 ${iconBgClass}`}>
                            <Icon className="h-7 w-7 text-white" />
                        </div>
                        {badge && (
                            <span className="bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm text-gray-800 border border-gray-100">
                                {badge}
                            </span>
                        )}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                        {description}
                    </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                    <span>C&apos;est parti</span>
                    <ChevronRight className="h-4 w-4" />
                </div>
            </motion.div>
        </Link>
    );
}

export function QuickActions() {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12" aria-label="Actions rapides">
            <ActionCard
                href="/fiches"
                title="Réviser"
                description="L'essentiel du programme résumé en fiches mémo visuelles."
                icon={BookOpen}
                colorClass="bg-blue-50/50"
                iconBgClass="bg-blue-600 shadow-blue-200"
                badge="Méthode"
            />
            <ActionCard
                href="/training"
                title="S'entraîner"
                description="Entraînez-vous par thème avec des corrections instantanées."
                icon={Target}
                colorClass="bg-emerald-50/50"
                iconBgClass="bg-emerald-600 shadow-emerald-200"
                badge="Pratique"
            />
            <ActionCard
                href="/exam"
                title="Examen Blanc"
                description="Testez-vous en conditions réelles avec le timer officiel."
                icon={GraduationCap}
                colorClass="bg-indigo-50/50"
                iconBgClass="bg-indigo-600 shadow-indigo-200"
                badge="Officiel"
            />
            <ActionCard
                href="/review"
                title="Mes Erreurs"
                description="Analysez et reprenez uniquement les questions échouées."
                icon={AlertCircle}
                colorClass="bg-orange-50/50"
                iconBgClass="bg-orange-600 shadow-orange-200"
                badge="Focus"
            />
            <ActionCard
                href="/contact"
                title="Aide & Feedback"
                description="Un problème ou une suggestion ? Notre équipe vous écoute."
                icon={MessageCircleQuestion}
                colorClass="bg-rose-50/50"
                iconBgClass="bg-rose-600 shadow-rose-200"
                badge="Support"
            />
        </section>
    );
}
