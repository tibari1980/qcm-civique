import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Scale, ShieldCheck, HeartPulse, GraduationCap, Gavel, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: "Droits et Devoirs en France | CiviQ",
    description: "Connaître les droits fondamentaux et les devoirs de tout citoyen résidant en France.",
};

export default function FicheDroitsPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/fiches" className="inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Retour aux fiches mémo
                </Link>

                {/* Header */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="w-24 h-24 shrink-0 bg-gradient-to-br from-emerald-100 via-white to-green-100 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100">
                            <Scale className="w-12 h-12 text-emerald-800" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 mb-4">
                                Droits & Devoirs du Citoyen
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                La vie en République implique un équilibre fondamental : la loi garantit des <strong>droits</strong> inaliénables, mais exige en retour des <strong>devoirs</strong> envers la société.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Les Droits */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-emerald-800 dark:text-emerald-400">
                            <ShieldCheck className="w-8 h-8" />
                            Mes Droits
                        </h2>

                        <div className="space-y-4">
                            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                                            <HeartPulse className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">Droit à l'intégrité</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                Droit à la vie, sécurité de la personne, et interdiction absolue de l'esclavage, des tortures ou des traitements inhumains.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                                            <Gavel className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">Droits d'expression</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                Liberté d'opinion, liberté d'expression (presse), liberté de conscience, de religion et liberté de réunion.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                                            <Scale className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">Droits sociaux, syndicaux & politiques</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                Le droit de grève, d'adhérer à un syndicat. Le droit de vote et le droit à l'éducation, ouverts à tous. Droit à la protection sociale et de santé.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Les Devoirs */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-red-800 dark:text-red-400">
                            <FileText className="w-8 h-8" />
                            Mes Devoirs
                        </h2>

                        <div className="space-y-4">
                            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-red-50 p-3 rounded-full text-red-600">
                                            <Gavel className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">Respect de la Loi</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                "Nul n'est censé ignorer la loi." Respecter les règles établies, les forces de l'ordre, et les décisions de justice.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-red-50 p-3 rounded-full text-red-600">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">Scolarité Obligatoire</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                En France, l'instruction des enfants est <strong>obligatoire entre 3 et 16 ans</strong>. L'école publique est gratuite et laïque.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-red-50 p-3 rounded-full text-red-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">Solidarité nationale</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                Le devoir de payer <strong>ses impôts</strong> selon ses moyens pour financer les services publics (hôpitaux, écoles, routes). Cotisations sociales.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all bg-amber-50 dark:bg-amber-900/10">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-amber-100 p-3 rounded-full text-amber-700">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-amber-900 text-lg mb-1 border-b border-amber-200 pb-1">Journée Défense et Citoyenneté</h3>
                                            <p className="text-sm text-amber-800 leading-relaxed mt-2 font-medium">
                                                Tout Français doit se faire recenser dès ses <strong>16 ans</strong> et participer à la JDC, moment de rencontre entre la jeunesse et les armées.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}
