import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Landmark, Users, Vote, Scale, Shield, LandmarkIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: "Institutions et Vie Politique | CiviQ",
    description: "Comprendre le fonctionnement démocratique de la France : Président, Parlement, Gouvernement et Union Européenne.",
};

export default function FicheInstitutionsPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/fiches" className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Retour aux fiches mémo
                </Link>

                {/* Header */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="w-24 h-24 shrink-0 bg-gradient-to-br from-indigo-100 via-white to-purple-100 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100">
                            <Landmark className="w-12 h-12 text-indigo-800" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 mb-4">
                                Système Institutionnel
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                La Ve (5ème) République fonctionne sur le principe de la <strong>séparation des pouvoirs</strong> pour garantir la Démocratie et l'État de droit.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">

                    {/* Les 3 Pouvoirs */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 text-gray-900 dark:text-white">
                            <span className="bg-indigo-100 text-indigo-800 p-2 rounded-lg"><Scale className="w-6 h-6" aria-hidden="true" /></span>
                            La Séparation des Pouvoirs
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Pouvoir Exécutif",
                                    icon: <Shield className="w-8 h-8 text-blue-600 mb-4" />,
                                    role: "Exécute les lois et dirige l'État.",
                                    who: "Président de la République & Gouvernement (Premier Ministre, Ministres)."
                                },
                                {
                                    title: "Pouvoir Législatif",
                                    icon: <LandmarkIcon className="w-8 h-8 text-purple-600 mb-4" />,
                                    role: "Vote et rédige les lois. Contrôle le gouvernement.",
                                    who: "Le Parlement (Assemblée Nationale et Sénat)."
                                },
                                {
                                    title: "Pouvoir Judiciaire",
                                    icon: <Scale className="w-8 h-8 text-emerald-600 mb-4" />,
                                    role: "Sanctionne le non-respect des lois.",
                                    who: "Les Juges, les tribunaux et les cours de justice."
                                },
                            ].map((pouvoir, idx) => (
                                <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        {pouvoir.icon}
                                        <h3 className="font-bold text-lg mb-2">{pouvoir.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{pouvoir.role}</p>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm border border-gray-100 dark:border-gray-700">
                                            <span className="font-semibold block text-gray-800 dark:text-gray-200 text-xs mb-1 uppercase tracking-wider">Qui ?</span>
                                            {pouvoir.who}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Démocratie & Vote */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center gap-3 mb-4 text-gray-900 dark:text-white">
                            <span className="bg-blue-100 text-blue-800 p-2 rounded-lg"><Vote className="w-6 h-6" aria-hidden="true" /></span>
                            Démocratie et Élections
                        </h2>
                        <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                                La France est une démocratie. Le pouvoir appartient au peuple qui l'exerce par l'intermédiaire de ses représentants élus. <strong>Le vote est secret et universel</strong> (ouvert à tous).
                            </p>

                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" /> Qui est élu, et pour combien de temps ?
                            </h3>

                            <ul className="space-y-4">
                                <li className="flex gap-4 p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center shrink-0 font-black text-xl">5</div>
                                    <div>
                                        <strong className="block text-gray-900 dark:text-gray-100 text-lg">Président de la République</strong>
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">Élu au suffrage universel direct pour 5 ans (Quinquennat). Il réside au Palais de l'Élysée.</span>
                                    </div>
                                </li>
                                <li className="flex gap-4 p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center shrink-0 font-black text-xl">5</div>
                                    <div>
                                        <strong className="block text-gray-900 dark:text-gray-100 text-lg">Députés (Assemblée Nationale)</strong>
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">Élus pour 5 ans par les citoyens. Siègent au Palais Bourbon.</span>
                                    </div>
                                </li>
                                <li className="flex gap-4 p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center shrink-0 font-black text-xl">6</div>
                                    <div>
                                        <strong className="block text-gray-900 dark:text-gray-100 text-lg">Maire (Conseil Municipal)</strong>
                                        <span className="text-gray-600 dark:text-gray-400 text-sm">Élu pour 6 ans. Gère les affaires au niveau de la commune (ville / village).</span>
                                    </div>
                                </li>
                            </ul>

                            <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 p-4 border-l-4 border-amber-500 rounded-r-lg">
                                <p className="text-amber-800 dark:text-amber-200 font-medium text-sm">
                                    À savoir : Le Premier Ministre n'est pas élu par le peuple. Il est <strong>nommé par le Président de la République</strong>. Il réside à l'Hôtel Matignon et dirige l'action du gouvernement.
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </main>
    )
}
