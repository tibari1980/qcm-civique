import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Flag, Scale, Heart, BookOpen, Volume2 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';

export const metadata: Metadata = {
    title: "Symboles et Valeurs de la République | CiviQ",
    description: "Révisez les principes fondamentaux, les symboles et la devise de la République Française.",
};

export default function FicheValeursPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Back button */}
                <Link href="/fiches" className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Retour aux fiches mémo
                </Link>

                {/* Header Section */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="w-24 h-24 shrink-0 bg-gradient-to-br from-blue-100 via-white to-red-100 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100">
                            <Flag className="w-12 h-12 text-blue-800" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 mb-4">
                                Principes et Valeurs de la République
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                La France est une République indivisible, laïque, démocratique et sociale.
                                Découvrez les symboles qui unissent ses citoyens.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">

                    {/* Devise */}
                    <section aria-labelledby="devise-heading">
                        <h2 id="devise-heading" className="text-2xl font-bold flex items-center gap-3 mb-4 text-gray-900 dark:text-white">
                            <span className="bg-blue-100 text-blue-800 p-2 rounded-lg"><Heart className="w-6 h-6" aria-hidden="true" /></span>
                            La Devise de la République
                        </h2>
                        <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-gray-900 transition-transform hover:-translate-y-1">
                            <CardContent className="p-0">
                                <div className="bg-gradient-to-r from-blue-600 via-white to-red-600 h-2 w-full" />
                                <div className="p-6 md:p-8">
                                    <h3 className="text-3xl font-black text-center tracking-widest text-gray-800 dark:text-gray-100 mb-8">
                                        LIBERTÉ • ÉGALITÉ • FRATERNITÉ
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-blue-700 text-lg">Liberté</h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                Le droit de faire tout ce qui ne nuit pas aux autres. Elle inclut la liberté d'expression, de religion et de pensée.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-gray-800 dark:text-gray-300 text-lg">Égalité</h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                La loi est la même pour tous, que ce soit pour protéger ou pour punir. Tous les citoyens ont les mêmes droits.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-red-700 text-lg">Fraternité</h4>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                                La solidarité entre les citoyens. Nous nous entraidons face aux difficultés constituant une seule et même nation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Laïcité */}
                    <section aria-labelledby="laicite-heading">
                        <h2 id="laicite-heading" className="text-2xl font-bold flex items-center gap-3 mb-4 text-gray-900 dark:text-white">
                            <span className="bg-purple-100 text-purple-800 p-2 rounded-lg"><Scale className="w-6 h-6" aria-hidden="true" /></span>
                            La Laïcité, pilier français
                        </h2>
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-6 md:p-8">
                            <p className="text-gray-800 dark:text-gray-200 text-lg mb-6 leading-relaxed">
                                La laïcité garantit la <strong>liberté de conscience et de religion</strong>. L'État est neutre : il ne favorise, ni ne subventionne aucune religion. Les citoyens sont libres de croire ou de ne pas croire, dans le respect de l'ordre public.
                            </p>
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-purple-100 shadow-sm flex items-start gap-4">
                                <BookOpen className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Exemples Pratiques :</h4>
                                    <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2 text-sm">
                                        <li>Il est interdit d'afficher des signes religieux ostentatoires dans les <strong className="text-gray-800">écoles publiques</strong>.</li>
                                        <li>Les <strong className="text-gray-800">agents du service public</strong> (mairie, hôpital) doivent faire preuve d'une stricte neutralité.</li>
                                        <li>Le mariage civil à la mairie doit <strong className="text-gray-800">précéder</strong> tout mariage religieux.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Les Symboles */}
                    <section aria-labelledby="symboles-heading">
                        <h2 id="symboles-heading" className="text-2xl font-bold flex items-center gap-3 mb-4 text-gray-900 dark:text-white">
                            <span className="bg-emerald-100 text-emerald-800 p-2 rounded-lg"><Flag className="w-6 h-6" aria-hidden="true" /></span>
                            Les 5 Symboles de la République
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                { title: "Le Drapeau Tricolore", desc: "Bleu, blanc, rouge. Emblème national, né lors de la Révolution française en 1789." },
                                { title: "L'Hymne National", desc: "La Marseillaise, écrite par Rouget de Lisle en 1792 (Chant de guerre pour l'armée du Rhin)." },
                                { title: "Marianne", desc: "Incarnation de la République. Elle porte un bonnet phrygien, symbole de la liberté acquise. Son buste est dans toutes les mairies." },
                                { title: "Le Coq Gaulois", desc: "Il symbolise la fierté du peuple français, souvent utilisé dans le sport." },
                                { title: "Le Sceau de la République", desc: "Sceau représentant la Liberté, utilisé pour officialiser la Constitution et de grandes lois." },
                            ].map((sym, i) => (
                                <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-2">
                                    <h3 className="font-bold text-emerald-700 text-lg">{sym.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{sym.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

            </div>
        </main>
    )
}
