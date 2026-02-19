import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Gavel, Database, Eye, UserCheck, Clock, Lock, Mail } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Politique de Confidentialité - Prépa Examen Civique FR',
    description: 'Notre engagement RGPD : découvrez comment nous collectons, utilisons et protégeons vos données personnelles.',
};

const sections = [
    {
        id: 'introduction',
        icon: Gavel,
        num: '1',
        title: 'Introduction et Responsable du traitement',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        content: `Prépa Examen Civique FR (ci-après "nous", "notre service") s'engage à protéger la vie privée des citoyens et futurs citoyens utilisant nos services. Cette politique détaille comment nous traitons vos données personnelles dans le respect du Règlement Général sur la Protection des Données (RGPD – Règlement UE 2016/679) et de la loi Informatique et Libertés.

Responsable du traitement :
• Raison sociale : SAS Prépa Examen Civique FR
• Siège : 75 Rue de Rivoli, 75001 Paris, France
• Email : dpo@prepa-civique.fr
• Délégué à la Protection des Données (DPO) : Me. Jean-Paul Moreau

Dernière mise à jour : 1er janvier 2026.`,
    },
    {
        id: 'donnees',
        icon: Database,
        num: '2',
        title: 'Données collectées',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        content: `Nous collectons uniquement les données nécessaires à la fourniture de nos services :

Données d'identité : Prénom, nom, adresse email, mot de passe (hashé).
Données académiques : Scores aux examens blancs, thèmes révisés, progression, historique des sessions.
Données techniques : Adresse IP, type de navigateur, système d'exploitation, pages visitées (via cookies de performance).

Ces données sont collectées lors de la création de compte, de l'utilisation de la plateforme, et par le biais de cookies (voir notre politique cookies).`,
    },
    {
        id: 'utilisation',
        icon: Eye,
        num: '3',
        title: 'Utilisation des données',
        color: 'text-green-600',
        bg: 'bg-green-50',
        content: `Vos données sont utilisées pour les finalités suivantes :
        
• Fournir et améliorer nos services pédagogiques
• Personnaliser votre parcours d'apprentissage
• Vous envoyer des notifications de progression (si activées)
• Analyser l'utilisation de la plateforme pour l'amélioration des contenus
• Répondre à vos demandes de support
• Respecter nos obligations légales

Nous ne vendons jamais vos données à des tiers. Nous ne les partageons qu'avec nos prestataires techniques (hébergement Firebase, analyse) dans le cadre strict de l'exécution de nos services.`,
    },
    {
        id: 'droits',
        icon: UserCheck,
        num: '4',
        title: 'Vos droits (RGPD)',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        content: `Conformément au RGPD, vous disposez des droits suivants :

• Droit d'accès : Obtenir une copie de toutes les données vous concernant.
• Droit de rectification : Corriger des données inexactes ou incomplètes.
• Droit à l'effacement ("droit à l'oubli") : Demander la suppression de vos données.
• Droit à la portabilité : Recevoir vos données dans un format structuré.
• Droit d'opposition : Vous opposer au traitement de vos données.
• Droit à la limitation : Suspendre temporairement le traitement.

Pour exercer ces droits, contactez notre DPO à dpo@prepa-civique.fr. Nous traitons toute demande dans un délai maximum de 30 jours.`,
    },
    {
        id: 'conservation',
        icon: Clock,
        num: '5',
        title: 'Durée de conservation',
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        content: `Vos données sont conservées pour les durées suivantes :

• Données de compte actif : Pendant toute la durée d'utilisation du service + 3 ans après la dernière connexion.
• Données académiques : 5 ans à compter de leur collecte.
• Logs de connexion : 12 mois.
• Données de facturation (si applicable) : 10 ans conformément aux obligations comptables.

Après ces délais, vos données sont supprimées de manière sécurisée et irréversible.`,
    },
    {
        id: 'securite',
        icon: Lock,
        num: '6',
        title: 'Mesures de Sécurité',
        color: 'text-red-600',
        bg: 'bg-red-50',
        content: `Nous mettons en œuvre des mesures techniques et organisationnelles rigoureuses pour protéger vos données :

• Chiffrement TLS 1.3 pour toutes les communications.
• Mots de passe hachés avec bcrypt (coût 12).
• Authentification via Firebase Authentication (infrastructure Google).
• Accès aux données limité aux personnels habilités uniquement.
• Audits de sécurité réguliers.
• Données hébergées sur des serveurs localisés dans l'Union Européenne (Frankfurt, Germany).

En cas de violation de données susceptible d'engendrer un risque pour vos droits et libertés, nous vous notifierons dans les 72 heures conformément à l'article 33 du RGPD.`,
    },
    {
        id: 'contact',
        icon: Mail,
        num: '7',
        title: 'Contact',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        content: `Pour toute question relative à cette politique ou pour exercer vos droits :

• Email DPO : dpo@prepa-civique.fr
• Email support : contact@prepa-civique.fr
• Adresse postale : DPO – SAS Prépa Examen Civique FR, 75 Rue de Rivoli, 75001 Paris

Vous avez également le droit d'introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : www.cnil.fr – Tél. 01 53 73 22 22.`,
    },
];

export default function PrivacyPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <nav aria-label="Fil d'Ariane" className="flex justify-center gap-2 text-blue-300 text-sm mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                        <span>/</span>
                        <span className="text-white">Confidentialité</span>
                    </nav>
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/20 p-4 rounded-full">
                            <Shield className="h-10 w-10" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Politique de Confidentialité</h1>
                    <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                        Prépa Examen Civique FR s&apos;engage à protéger vos données personnelles dans le respect du RGPD.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
                        <span className="bg-white/20 px-3 py-1 rounded-full">✓ Conforme RGPD</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">✓ Hébergement UE</span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">✓ DPO désigné</span>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-5xl py-16">
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
                                        <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-full text-xs font-bold text-gray-500 flex-shrink-0">
                                            {s.num}
                                        </span>
                                        {s.title}
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
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className={`p-2 rounded-lg ${section.bg}`}>
                                            <Icon className={`h-5 w-5 ${section.color}`} />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {section.num}. {section.title}
                                        </h2>
                                    </div>
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                                        {section.content}
                                    </div>
                                </article>
                            );
                        })}

                        {/* Last Updated */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center text-sm text-blue-700">
                            <p>
                                Cette politique de confidentialité est entrée en vigueur le <strong>1er janvier 2026</strong>.
                                Pour toute question, contactez-nous à{' '}
                                <a href="mailto:dpo@prepa-civique.fr" className="underline hover:text-blue-900">
                                    dpo@prepa-civique.fr
                                </a>
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
