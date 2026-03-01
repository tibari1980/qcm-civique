import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Calendar, Sword, Crown, Map, Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: "Histoire et Géographie de la France | CiviQ",
    description: "Les dates clés de l'histoire, la Révolution française, les guerres mondiales et la géographie de la France.",
};

export default function FicheHistoirePage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/fiches" className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors mb-8">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Retour aux fiches mémo
                </Link>

                {/* Header */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="w-24 h-24 shrink-0 bg-gradient-to-br from-blue-100 via-white to-sky-100 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100">
                            <Calendar className="w-12 h-12 text-blue-800" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 mb-4">
                                L'Histoire de France
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Des rois fondateurs à la Ve République, découvrez la grande <strong>frise chronologique</strong> des événements ayant façonné la nation française.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative border-l-4 border-blue-200 dark:border-blue-800 ml-4 md:ml-12 pl-6 md:pl-10 space-y-12 pb-10">

                    {/* Event 1 */}
                    <div className="relative">
                        <div className="absolute -left-[35px] md:-left-[58px] bg-white p-2 md:p-3 rounded-full border-4 border-blue-200 dark:border-blue-800 shrink-0">
                            <Crown className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                        </div>
                        <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <span className="inline-block bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full text-sm mb-4">
                                    Temps Anciens & Royauté
                                </span>
                                <h3 className="text-xl font-bold mb-2">Les Mérovingiens, Carolingiens et Capétiens</h3>
                                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2 mt-4 text-sm leading-relaxed">
                                    <li><strong>496 :</strong> Baptême de Clovis (1er roi des Francs).</li>
                                    <li><strong>800 :</strong> Charlemagne est couronné Empereur d'Occident.</li>
                                    <li><strong>1412-1431 :</strong> Jeanne d'Arc, figure héroïque, libère Orléans pendant la guerre de Cent Ans.</li>
                                    <li><strong>1638-1715 :</strong> Louis XIV, le "Roi Soleil" (Monarchie absolue, construction du château de Versailles).</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Event 2 */}
                    <div className="relative">
                        <div className="absolute -left-[35px] md:-left-[58px] bg-white p-2 md:p-3 rounded-full border-4 border-red-200 shrink-0">
                            <Sword className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                        </div>
                        <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <span className="inline-block bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full text-sm mb-4">
                                    1789
                                </span>
                                <h3 className="text-xl font-bold mb-2 text-red-700">La Révolution Française</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">Le peuple se soulève contre le roi Louis XVI et met fin à la monarchie absolue.</p>
                                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2 text-sm leading-relaxed">
                                    <li><strong>14 Juillet 1789 :</strong> Prise de la prison de la Bastille (Fête Nationale actuelle).</li>
                                    <li><strong>26 Août 1789 :</strong> Déclaration des Droits de l'Homme et du Citoyen ("Les hommes naissent et demeurent libres et égaux en droits").</li>
                                    <li><strong>1792 :</strong> Proclamation de la <strong>Première République</strong>.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Event 3 */}
                    <div className="relative">
                        <div className="absolute -left-[35px] md:-left-[58px] bg-white p-2 md:p-3 rounded-full border-4 border-emerald-200 shrink-0">
                            <Crown className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                        </div>
                        <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-sm mb-4">
                                    XIXe Siècle
                                </span>
                                <h3 className="text-xl font-bold mb-2 text-emerald-700">L'Empire et l'instabilité</h3>
                                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2 text-sm leading-relaxed mt-3">
                                    <li><strong>1804 :</strong> Napoléon Bonaparte est proclamé Empereur (Napoléon 1er). Il crée le Code Civil, les préfectures et le lycée.</li>
                                    <li><strong>1848 :</strong> Abolition (fin) définitive de l'esclavage sur le territoire (sous l'impulsion de Victor Schœlcher). Proclamation de la IIe République et naissance du suffrage universel masculin.</li>
                                    <li><strong>1881-1882 :</strong> Les lois Jules Ferry rendent l’école publique gratuite, laïque et obligatoire (IIIe République).</li>
                                    <li><strong>1905 :</strong> Loi de séparation de l'Église et de l'État (la Laïcité légale).</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Event 4 */}
                    <div className="relative">
                        <div className="absolute -left-[35px] md:-left-[58px] bg-white p-2 md:p-3 rounded-full border-4 border-gray-400 shrink-0">
                            <Compass className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                        </div>
                        <Card className="shadow-sm border-gray-200 hover:shadow-md bg-gray-50 border-gray-300">
                            <CardContent className="p-6">
                                <span className="inline-block bg-gray-200 text-gray-800 font-bold px-3 py-1 rounded-full text-sm mb-4">
                                    XXe Siècle
                                </span>
                                <h3 className="text-xl font-bold mb-3 text-gray-800">Les Guerres Mondiales</h3>

                                <h4 className="font-bold text-gray-700 mt-4 underline decoration-gray-300">Première Guerre Mondiale (1914 - 1918)</h4>
                                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2 mt-2 text-sm">
                                    <li>Le célèbre affrontement des "Poilus" dans les tranchées, comme la "Bataille de Verdun" (1916).</li>
                                    <li>L'Armistice est signé le <strong>11 novembre 1918</strong>. C'est le jour férié du souvenir.</li>
                                </ul>

                                <h4 className="font-bold text-gray-700 mt-6 underline decoration-gray-300">Seconde Guerre Mondiale (1939 - 1945)</h4>
                                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2 mt-2 text-sm">
                                    <li><strong>18 Juin 1940 :</strong> L'Appel du <strong>Général de Gaulle</strong> depuis Londres à l'aide de Jean Moulin pour résister aux Nazis.</li>
                                    <li>Durant cette guerre, le maréchal Pétain (Régime de Vichy) collabore avec l'Allemagne.</li>
                                    <li>La victoire totale est célébrée le <strong>8 mai 1945</strong> (fin de la guerre en Europe).</li>
                                </ul>

                                <div className="mt-6 p-4 bg-purple-100 rounded-lg text-purple-900 text-sm border-l-4 border-purple-500">
                                    <strong className="block mb-1">Droit de vote des Femmes : 1944.</strong>
                                    Accordé par le chef du gouvernement provisoire de la République, le Général de Gaulle.
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Event 5 */}
                    <div className="relative">
                        <div className="absolute -left-[35px] md:-left-[58px] bg-white p-2 md:p-3 rounded-full border-4 border-blue-500 shrink-0">
                            <Map className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                        </div>
                        <Card className="shadow-sm border-blue-100 hover:shadow-md border-2 border-[var(--color-primary)]">
                            <CardContent className="p-6">
                                <span className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm mb-4">
                                    L'Époque Contemporaine
                                </span>
                                <h3 className="text-xl font-bold mb-3 text-blue-900">La Ve République (De 1958 à Aujourd'hui)</h3>
                                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-3 mt-3 text-sm leading-relaxed">
                                    <li><strong>1958 :</strong> Création de la Ve (Cinquième) République sous l'égide de Charles de Gaulle. Elle réduit les pouvoirs du Parlement pour renforcer ceux du Président.</li>
                                    <li>La France est divisée géographiquement (l'Hexagone) avec la Corse au sud, et les territoires d'outre-mer (Guadeloupe, Martinique, Réunion, etc.) autour du monde. Elle possède des frontières avec la Suisse, l'Allemagne, la Belgique, le Luxembourg, l'Espagne, Andorre et l'Italie.</li>
                                    <li><strong>1981 :</strong> Élection de François Mitterrand, qui abolit la peine de mort la même année, portée par Robert Badinter.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </main>
    )
}
