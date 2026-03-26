import React from 'react';
import { notFound } from 'next/navigation';

export const dynamicParams = false;
import Link from 'next/link';
import { ChevronLeft, Info, FileText } from 'lucide-react';

const FICHES_CONTENT: Record<string, {
    title: string;
    description: string;
    sections: { title: string; content: React.ReactNode }[];
}> = {
    'histoire': {
        title: "Dates clés de l'histoire de France",
        description: "Repères chronologiques incontournables pour l'examen de naturalisation.",
        sections: [
            {
                title: "La Révolution Française",
                content: (
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>1789 :</strong> Prise de la Bastille (14 juillet) et Déclaration des Droits de l'Homme et du Citoyen (26 août).</li>
                        <li><strong>1792 :</strong> Proclamation de la Première République (abolition de la royauté).</li>
                    </ul>
                )
            },
            {
                title: "L'Empire et la République",
                content: (
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>1804 :</strong> Napoléon Bonaparte devient Empereur des Français et mise en place du Code Civil.</li>
                        <li><strong>1848 :</strong> Abolition définitive de l'esclavage sous la Deuxième République (Victor Schoelcher) et mise en place du suffrage universel masculin.</li>
                        <li><strong>1870 :</strong> Début de la Troisième République.</li>
                    </ul>
                )
            },
            {
                title: "Le XXe siècle et les Guerres",
                content: (
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>1905 :</strong> Loi de séparation des Églises et de l'État (principe de Laïcité).</li>
                        <li><strong>1914 - 1918 :</strong> Première Guerre Mondiale.</li>
                        <li><strong>1939 - 1945 :</strong> Seconde Guerre Mondiale. Appel du Général de Gaulle le 18 juin 1940. Libération en 1944.</li>
                        <li><strong>1944 :</strong> Droit de vote accordé aux femmes.</li>
                        <li><strong>1958 :</strong> Création de la Ve République (actuelle constitution) sous l'impulsion de Charles de Gaulle.</li>
                        <li><strong>1981 :</strong> Abolition de la peine de mort en France.</li>
                    </ul>
                )
            }
        ]
    },
    'valeurs': {
        title: "Symboles et valeurs de la République",
        description: "Ce qui nous unit : les fondamentaux de la nation française.",
        sections: [
            {
                title: "La Devise de la République",
                content: (
                    <div className="space-y-3">
                        <p><strong>« Liberté, Égalité, Fraternité »</strong></p>
                        <p>Issue de la Révolution française de 1789, elle figure sur les édifices publics (mairies, écoles) et sur les pièces de monnaie.</p>
                    </div>
                )
            },
            {
                title: "Le Drapeau Tricolore",
                content: (
                    <p>
                        Bleu, Blanc, Rouge. Le blanc représente la couleur du roi (monarchie) et le bleu et le rouge sont les couleurs de la ville de Paris. Il est l'emblème national (article 2 de la Constitution).
                    </p>
                )
            },
            {
                title: "L'Hymne National",
                content: (
                    <p>
                        <strong>La Marseillaise</strong>. Écrite par Rouget de Lisle en 1792 à Strasbourg suite à la déclaration de guerre de la France à l'Autriche. Elle est devenue l'hymne national sous la IIIe République.
                    </p>
                )
            },
            {
                title: "Les Autres Symboles",
                content: (
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Marianne :</strong> Figure allégorique de la République. Elle porte un bonnet phrygien (symbole de liberté). Son buste est présent dans toutes les mairies.</li>
                        <li><strong>Le 14 Juillet :</strong> Fête Nationale française. Elle commémore la prise de la Bastille (1789) et la Fête de la Fédération (1790).</li>
                        <li><strong>Le Coq :</strong> Bien que non officiel dans la constitution, le coq gaulois est un symbole populaire représentant la France, notamment dans le domaine sportif.</li>
                        <li><strong>Le Sceau de la République :</strong> Représente la Liberté trônant, utilisé pour sceller les lois constitutionnelles.</li>
                    </ul>
                )
            },
            {
                title: "La Laïcité",
                content: (
                    <p>
                        La France est une République indivisible, laïque, démocratique et sociale. La laïcité assure la liberté de conscience et garantit le libre exercice des cultes. L'État est neutre face aux religions (séparation depuis 1905).
                    </p>
                )
            }
        ]
    },
    'droits': {
        title: "Droits et devoirs du résident",
        description: "Vivre en France implique des garanties fondamentales mais aussi des responsabilités.",
        sections: [
            {
                title: "Les Droits Fondamentaux",
                content: (
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Liberté :</strong> Liberté de pensée, d'expression, d'aller et de venir, de manifestation.</li>
                        <li><strong>Égalité :</strong> Tous les citoyens sont égaux devant la loi, sans distinction d'origine, de race ou de religion. Les hommes et les femmes sont égaux.</li>
                        <li><strong>Droits Sociaux :</strong> Droit à l'éducation (école gratuite, laïque et obligatoire de 3 à 16 ans), droit de grève, droit d'appartenir à un syndicat, droit à la sécurité sociale.</li>
                    </ul>
                )
            },
            {
                title: "Les Devoirs du Citoyen",
                content: (
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Le respect de la loi :</strong> Nul n'est censé ignorer la loi. C'est la base du vivre-ensemble.</li>
                        <li><strong>La Fraternité :</strong> Solidarité nationale et entraide.</li>
                        <li><strong>Le devoir fiscal :</strong> Payer ses impôts selon ses revenus pour financer les services publics (hôpitaux, routes, sécurité).</li>
                        <li><strong>La participation civique :</strong> Le droit de vote est un devoir moral. Participer aux jurys d'assises si on est tiré au sort.</li>
                        <li><strong>La défense :</strong> Le service national militaire obligatoire a été suspendu, mais la Journée Défense et Citoyenneté (JDC) est obligatoire pour les jeunes.</li>
                    </ul>
                )
            }
        ]
    },
    'institutions': {
        title: "Institutions et vie politique",
        description: "Comprendre comment la France est gouvernée sous la Ve République.",
        sections: [
            {
                title: "La Ve République (depuis 1958)",
                content: (
                    <p>
                        C'est un régime semi-présidentiel basé sur la séparation des pouvoirs (exécutif, législatif, judiciaire).
                    </p>
                )
            },
            {
                title: "Le Pouvoir Exécutif",
                content: (
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Le Président de la République :</strong> Élu pour 5 ans au suffrage universel direct. Il réside au Palais de l'Élysée. Il est le chef des armées et nomme le Premier Ministre.</li>
                        <li><strong>Le Gouvernement (Premier Ministre et les Ministres) :</strong> Réside à l'Hôtel Matignon (pour le 1er Ministre). Il "détermine et conduit la politique de la Nation".</li>
                    </ul>
                )
            },
            {
                title: "Le Pouvoir Législatif (Le Parlement)",
                content: (
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>L'Assemblée Nationale :</strong> 577 Députés élus au suffrage universel direct pour 5 ans. Ils siègent au Palais Bourbon. En cas de désaccord, l'Assemblée Nationale a le dernier mot (sauf lois constitutionnelles).</li>
                        <li><strong>Le Sénat :</strong> 348 Sénateurs élus au suffrage indirect pour 6 ans. Ils siègent au Palais du Luxembourg.</li>
                        <li>Le Parlement vote les lois, contrôle l'action du gouvernement et évalue les politiques publiques.</li>
                    </ul>
                )
            },
            {
                title: "Le Pouvoir Judiciaire",
                content: (
                    <p>
                        Il fait respecter les lois et punit les infractions. Il est indépendant des pouvoirs exécutif et législatif.
                    </p>
                )
            },
            {
                title: "Le Conseil Constitutionnel",
                content: (
                    <p>
                        Composé de 9 membres ("les sages"). Il veille à la régularité des élections et contrôle que les lois votées sont conformes à la Constitution française.
                    </p>
                )
            }
        ]
    }
};

// Generates static paths at build time for optimal performance
export function generateStaticParams() {
    return Object.keys(FICHES_CONTENT).map((id) => ({
        id: id,
    }));
}

export default async function FichePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    // Safety check if dynamic param isn't in our predefined data
    if (!FICHES_CONTENT[id]) {
        notFound();
    }

    const fiche = FICHES_CONTENT[id];

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/fiches"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[var(--color-primary)] transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Retour aux fiches
                </Link>

                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 sm:p-12 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 p-3 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                            {fiche.title}
                        </h1>
                    </div>

                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 pb-8 border-b border-gray-100 dark:border-gray-800">
                        {fiche.description}
                    </p>

                    <div className="space-y-12">
                        {fiche.sections.map((section, idx) => (
                            <section key={idx} className="group">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <span className="w-2 h-8 bg-[var(--color-primary)] rounded-full mr-4 opacity-50 group-hover:opacity-100 transition-opacity"></span>
                                    {section.title}
                                </h2>
                                <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg pl-6 border-l-2 border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-800 transition-all">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            <span>Informations issues des ressources officielles de préparation à la citoyenneté.</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
