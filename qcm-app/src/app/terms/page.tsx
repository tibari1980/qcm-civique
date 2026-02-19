import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Info, LogIn, Copyright, Gavel, ShieldAlert, Database, XCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: "Conditions Générales d'Utilisation - Prépa Examen Civique FR",
    description: "Lisez nos conditions générales d'utilisation régissant l'accès à la plateforme Prépa Examen Civique FR.",
};

const sections = [
    {
        id: 'intro',
        icon: Info,
        num: '01',
        title: "Introduction et Acceptation",
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Prépa Examen Civique FR, accessible à l'adresse prepa-civique.fr, éditée par la SAS Prépa Examen Civique FR, immatriculée au RCS de Paris.

En accédant à notre service, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser notre service.

Ces CGU peuvent être modifiées à tout moment. Nous vous informerons des modifications substantielles par email ou notification sur le site. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles CGU.

Date d'entrée en vigueur : 1er janvier 2026.`,
    },
    {
        id: 'access',
        icon: LogIn,
        num: '02',
        title: "Accès au Service et Création de Compte",
        color: 'text-green-600',
        bg: 'bg-green-50',
        content: `L'accès à notre service nécessite la création d'un compte utilisateur. Pour créer un compte, vous devez :

• Avoir au moins 16 ans (ou le consentement de votre représentant légal)
• Fournir une adresse email valide et un mot de passe sécurisé
• Fournir des informations exactes et à jour

Vous êtes responsable de la confidentialité de vos identifiants et de toute activité réalisée depuis votre compte. En cas d'utilisation non autorisée, signalez-le immédiatement à contact@prepa-civique.fr.

Nous nous réservons le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, d'activités frauduleuses, ou d'inactivité prolongée supérieure à 24 mois.`,
    },
    {
        id: 'propriete',
        icon: Copyright,
        num: '03',
        title: "Propriété Intellectuelle",
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        content: `L'ensemble des contenus présents sur la plateforme (textes, questions, formatage, logos, graphiques, code source) est la propriété exclusive de SAS Prépa Examen Civique FR ou de ses concédants de licence, et est protégé par le droit français et international de la propriété intellectuelle.

Il vous est accordé un droit d'accès personnel, non exclusif, non transférable et révocable aux contenus, uniquement pour votre usage personnel et pédagogique.

Sont strictement interdits :
• La reproduction ou diffusion des contenus sans autorisation écrite préalable
• L'extraction automatisée de données (scraping)
• La revente ou utilisation commerciale des contenus
• La création d'œuvres dérivées

Toute utilisation en dehors de ce cadre pourra être poursuivie devant les juridictions compétentes.`,
    },
    {
        id: 'responsabilites',
        icon: Gavel,
        num: '04',
        title: "Responsabilités de l'Utilisateur",
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        content: `En utilisant notre service, vous vous engagez à :

• Ne pas partager votre compte avec des tiers
• Ne pas tenter de contourner les mesures de sécurité
• Ne pas soumettre de contenus illicites, offensants ou diffamatoires
• Ne pas perturber le bon fonctionnement de la plateforme
• Respecter les droits de propriété intellectuelle

Vous êtes seul responsable des conséquences de l'utilisation du service, notamment en ce qui concerne vos démarches administratives. Notre plateforme est un outil pédagogique et ne remplace pas un conseil juridique ou administratif professionnel.`,
    },
    {
        id: 'limitations',
        icon: ShieldAlert,
        num: '05',
        title: "Limitation de Responsabilité",
        color: 'text-red-600',
        bg: 'bg-red-50',
        content: `La plateforme est fournie "en l'état". Nous ne garantissons pas :

• Que le service sera disponible 24h/24, 7j/7, sans interruption ni erreur
• Que les contenus correspondent exactement au programme officiel en vigueur à la date de votre examen
• Les résultats obtenus lors de votre examen officiel

Notre responsabilité est limitée aux dommages directs et ne peut excéder le montant payé pour notre service au cours des 12 derniers mois.

Nous déclinons toute responsabilité pour les dommages indirects, pertes de données, ou conséquences d'une indisponibilité du service.`,
    },
    {
        id: 'donnees',
        icon: Database,
        num: '06',
        title: "Protection des Données (RGPD)",
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        content: `Le traitement de vos données personnelles est régi par notre Politique de Confidentialité, accessible à /privacy, qui fait partie intégrante des présentes CGU.

En résumé :
• Nous collectons uniquement les données nécessaires au service
• Nous ne revendons jamais vos données
• Vous pouvez exercer vos droits RGPD à tout moment en contactant dpo@prepa-civique.fr
• Vos données sont hébergées dans l'Union Européenne (servers Google Firebase – region EU)

L'utilisation de notre service implique votre accord avec notre politique de traitement des données.`,
    },
    {
        id: 'resiliation',
        icon: XCircle,
        num: '07',
        title: "Résiliation et Modification",
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        content: `Résiliation par l'utilisateur : Vous pouvez supprimer votre compte à tout moment depuis votre espace profil. Cette action entraîne la suppression de vos données dans les délais prévus par notre politique de confidentialité.

Résiliation par nous : Nous nous réservons le droit de suspendre ou résilier votre accès en cas de violation des présentes CGU, sans préavis ni remboursement.

Modification des CGU : Nous pouvons modifier ces CGU à tout moment. Vous serez informé par email au moins 15 jours avant l'entrée en vigueur de toute modification substantielle.

Droit applicable : Les présentes CGU sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents de Paris.

Pour toute question légale : legal@prepa-civique.fr`,
    },
];

export default function TermsPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <nav aria-label="Fil d'Ariane" className="flex justify-center gap-2 text-blue-300 text-sm mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                        <span>/</span>
                        <span className="text-white">Conditions d&apos;utilisation</span>
                    </nav>
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/20 p-4 rounded-full">
                            <FileText className="h-10 w-10" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Conditions Générales d&apos;Utilisation</h1>
                    <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                        En utilisant notre plateforme, vous acceptez les conditions ci-dessous. Lisez-les attentivement.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm">
                        <Info className="h-4 w-4" />
                        Dernière mise à jour : 1er janvier 2026
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-5xl py-16">
                {/* Legal Aid Box */}
                <div className="mb-10 bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
                    <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                        <Info className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-amber-900 mb-1">Besoin d&apos;aide ?</h3>
                        <p className="text-sm text-amber-800">
                            Pour toute question relative à nos mentions légales, contactez notre équipe juridique à{' '}
                            <a href="mailto:legal@prepa-civique.fr" className="underline font-medium">legal@prepa-civique.fr</a>
                        </p>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-4 lg:gap-10">
                    {/* Sticky Sidebar ToC */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Sommaire</h3>
                            <nav className="space-y-2">
                                {sections.map((s) => (
                                    <a
                                        key={s.id}
                                        href={`#${s.id}`}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors py-1"
                                    >
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black flex-shrink-0 ${s.bg} ${s.color}`}>
                                            {s.num}
                                        </span>
                                        <span className="line-clamp-1">{s.title}</span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-8">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <article
                                    key={section.id}
                                    id={section.id}
                                    className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm scroll-mt-24"
                                >
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className={`text-4xl font-black opacity-20 ${section.color} w-12 flex-shrink-0`}>
                                            {section.num}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${section.bg}`}>
                                                <Icon className={`h-5 w-5 ${section.color}`} />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                                        </div>
                                    </div>
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm pl-12">
                                        {section.content}
                                    </div>
                                </article>
                            );
                        })}

                        {/* Footer Note */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center text-sm text-blue-700">
                            <p>
                                Ces conditions générales d&apos;utilisation sont entrées en vigueur le <strong>1er janvier 2026</strong>.{' '}
                                En cas de litige, les tribunaux compétents de Paris seront saisis.{' '}
                                <a href="mailto:legal@prepa-civique.fr" className="underline font-medium">legal@prepa-civique.fr</a>
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
