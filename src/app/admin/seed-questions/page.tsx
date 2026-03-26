'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { CheckCircle2, AlertTriangle, Loader2, Database, Search, Plus, Shield } from 'lucide-react';

/* ─────────────────────────────────────────────
   Normalisation pour la détection de doublons
   ───────────────────────────────────────────── */
function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function similarity(a: string, b: string): number {
    const na = normalize(a);
    const nb = normalize(b);
    if (na === nb) return 1;

    // Jaccard on word sets
    const setA = new Set(na.split(' '));
    const setB = new Set(nb.split(' '));
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
}

/* ─────────────────────────────────────────────
   Banque de 37 nouvelles questions officielles
   ───────────────────────────────────────────── */
interface NewQuestion {
    question: string;
    choices: string[];
    correct_index: number;
    explanation: string;
    theme: string;
    level: string;
    exam_types: string[];
    tags: string[];
    is_active: boolean;
    source: string;
}

const NEW_QUESTIONS: NewQuestion[] = [
    // ═══ THEME 1: Principes & Valeurs ═══
    {
        question: "Quelle est la devise de la République française ?",
        choices: ["Unité, Force, Progrès", "Liberté, Égalité, Fraternité", "Paix, Justice, Solidarité", "Honneur, Patrie, Devoir"],
        correct_index: 1,
        explanation: "Inscrite dans la Constitution de 1958, la devise « Liberté, Égalité, Fraternité » est le fondement des valeurs républicaines.",
        theme: "vals_principes", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["devise", "constitution", "valeurs"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Qu'est-ce que la laïcité en France ?",
        choices: ["L'interdiction de croire en Dieu", "La séparation des Églises et de l'État", "L'obligation de pratiquer une religion", "Le rejet de toute tradition culturelle"],
        correct_index: 1,
        explanation: "La loi de 1905 garantit la liberté de conscience et sépare les institutions religieuses de l'État.",
        theme: "vals_principes", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["laïcité", "loi 1905", "religion"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Quel document officiel porte l'image de Marianne ?",
        choices: ["Le permis de conduire", "Les timbres-poste", "Le passeport", "La carte Vitale"],
        correct_index: 1,
        explanation: "Marianne, allégorie de la République, figure sur les timbres-poste, les pièces de monnaie et dans les mairies.",
        theme: "vals_principes", level: "Débutant",
        exam_types: ["titre_sejour"],
        tags: ["Marianne", "symboles", "République"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "La liberté d'expression permet-elle de tenir des propos racistes en France ?",
        choices: ["Oui, car la parole est libre", "Oui, si c'est de l'humour", "Non, la loi interdit les propos haineux", "Non, sauf sur Internet"],
        correct_index: 2,
        explanation: "La liberté d'expression est encadrée par la loi. Les propos racistes, antisémites ou discriminatoires sont des délits.",
        theme: "vals_principes", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["liberté expression", "discrimination", "loi"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Que signifie « Égalité » dans la devise républicaine ?",
        choices: ["Tous les citoyens gagnent le même salaire", "Tous les citoyens ont les mêmes droits devant la loi", "Tous les citoyens ont la même religion", "Tous les citoyens votent pour le même parti"],
        correct_index: 1,
        explanation: "Le principe d'égalité garantit l'absence de discrimination devant la loi, indépendamment de l'origine, du sexe ou de la religion.",
        theme: "vals_principes", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["égalité", "devise", "droits"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Qu'est-ce que le contrat d'engagement républicain ?",
        choices: ["Un contrat de travail", "Un engagement à respecter les principes de la République", "Une assurance obligatoire", "Un contrat de location"],
        correct_index: 1,
        explanation: "Les associations et personnes bénéficiaires de subventions publiques doivent s'engager à respecter les principes républicains.",
        theme: "vals_principes", level: "Avancé",
        exam_types: ["naturalisation"],
        tags: ["contrat", "engagement", "République"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "La langue officielle de la République française est :",
        choices: ["L'anglais", "Le latin", "Le français", "L'occitan"],
        correct_index: 2,
        explanation: "L'article 2 de la Constitution de 1958 dispose que « La langue de la République est le français ».",
        theme: "vals_principes", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["langue", "Constitution", "français"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Peut-on brûler publiquement le drapeau français ?",
        choices: ["Oui, c'est une liberté", "Oui, si c'est une manifestation", "Non, c'est un délit", "Non, sauf le 14 juillet"],
        correct_index: 2,
        explanation: "Depuis 2010, l'outrage au drapeau national lors d'une manifestation publique est un délit puni d'une amende.",
        theme: "vals_principes", level: "Intermédiaire",
        exam_types: ["titre_sejour"],
        tags: ["drapeau", "symboles", "délit"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },

    // ═══ THEME 2: Institutions ═══
    {
        question: "Qui élit le Président de la République ?",
        choices: ["Les députés", "Les sénateurs", "Les citoyens au suffrage universel direct", "Le Premier ministre"],
        correct_index: 2,
        explanation: "Depuis 1962, le Président est élu au suffrage universel direct pour un mandat de 5 ans.",
        theme: "institutions", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["président", "élection", "suffrage"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Qui nomme le Premier ministre ?",
        choices: ["L'Assemblée nationale", "Le Président de la République", "Le Sénat", "Le Conseil constitutionnel"],
        correct_index: 1,
        explanation: "Le Président nomme le Premier ministre et, sur proposition de celui-ci, les autres membres du gouvernement.",
        theme: "institutions", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["Premier ministre", "gouvernement", "nomination"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Quel est le rôle du Conseil constitutionnel ?",
        choices: ["Juger les crimes", "Voter les lois", "Vérifier la conformité des lois à la Constitution", "Gérer les finances publiques"],
        correct_index: 2,
        explanation: "Le Conseil constitutionnel contrôle la constitutionnalité des lois et veille à la régularité des élections.",
        theme: "institutions", level: "Avancé",
        exam_types: ["naturalisation"],
        tags: ["Conseil constitutionnel", "lois", "Constitution"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Combien de députés siègent à l'Assemblée nationale ?",
        choices: ["348", "577", "300", "150"],
        correct_index: 1,
        explanation: "L'Assemblée nationale compte 577 députés élus au suffrage universel direct.",
        theme: "institutions", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["Assemblée nationale", "députés", "Parlement"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Quels sont les trois pouvoirs séparés en France ?",
        choices: ["Militaire, religieux, économique", "Exécutif, législatif, judiciaire", "Présidentiel, royal, parlementaire", "Médiatique, politique, financier"],
        correct_index: 1,
        explanation: "La séparation des pouvoirs est un principe fondamental de la démocratie française, hérité de Montesquieu.",
        theme: "institutions", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["séparation des pouvoirs", "Montesquieu", "démocratie"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Quelle institution vote les lois en France ?",
        choices: ["Le gouvernement", "Le Président", "Le Parlement (Assemblée nationale et Sénat)", "Le Conseil d'État"],
        correct_index: 2,
        explanation: "Le Parlement, composé de l'Assemblée nationale et du Sénat, examine et vote les lois.",
        theme: "institutions", level: "Débutant",
        exam_types: ["titre_sejour"],
        tags: ["Parlement", "lois", "législatif"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "En France, est-il permis de ne pas respecter une loi ?",
        choices: ["Oui, si on n'est pas d'accord", "Oui, pour les mineurs", "Non, la loi s'applique à tous", "Non, sauf pour les étrangers"],
        correct_index: 2,
        explanation: "Le respect de la loi est une obligation pour toutes les personnes résidant en France, quelle que soit leur nationalité.",
        theme: "institutions", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["loi", "obligation", "respect"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },

    // ═══ THEME 3: Droits & Devoirs ═══
    {
        question: "À quel âge l'instruction est-elle obligatoire en France ?",
        choices: ["De 6 à 16 ans", "De 3 à 16 ans", "De 5 à 18 ans", "De 3 à 16 ans puis formation obligatoire jusqu'à 18 ans"],
        correct_index: 3,
        explanation: "La loi impose l'instruction obligatoire de 3 à 16 ans, suivie d'une obligation de formation jusqu'à 18 ans.",
        theme: "droits", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["instruction", "école", "obligation"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Quelle liberté permet à chacun d'exprimer ses idées ?",
        choices: ["La liberté de circulation", "La liberté d'expression", "La liberté de commerce", "La liberté d'association"],
        correct_index: 1,
        explanation: "La liberté d'expression est un droit fondamental protégé par la Déclaration des droits de l'homme de 1789.",
        theme: "droits", level: "Débutant",
        exam_types: ["titre_sejour"],
        tags: ["liberté", "expression", "droits de l'homme"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Que fait l'État pour lutter contre la discrimination ?",
        choices: ["Il ne fait rien", "Il finance les discriminations", "Il interdit les discriminations par la loi et punit les auteurs", "Il autorise certaines discriminations"],
        correct_index: 2,
        explanation: "La loi pénale française interdit les discriminations fondées sur l'origine, le sexe, la religion, l'orientation sexuelle, etc.",
        theme: "droits", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["discrimination", "loi pénale", "égalité"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Un parent peut-il empêcher son enfant de participer aux cours de sport mixtes à l'école ?",
        choices: ["Oui, pour des raisons religieuses", "Oui, avec un mot du médecin", "Non, la mixité est la règle dans l'école publique", "Non, sauf avec une autorisation du préfet"],
        correct_index: 2,
        explanation: "L'école publique française est mixte. La participation à tous les enseignements, y compris le sport, est obligatoire.",
        theme: "droits", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["école", "mixité", "laïcité"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Qui doit payer des impôts en France ?",
        choices: ["Seulement les Français", "Seulement les salariés", "Toute personne résidant en France selon ses revenus", "Personne, c'est facultatif"],
        correct_index: 2,
        explanation: "Toute personne résidant fiscalement en France doit déclarer ses revenus et payer des impôts selon leur montant.",
        theme: "droits", level: "Débutant",
        exam_types: ["titre_sejour"],
        tags: ["impôts", "fiscalité", "devoir"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },

    // ═══ THEME 4: Histoire & Géographie ═══
    {
        question: "En quelle année a débuté la Révolution française ?",
        choices: ["1715", "1789", "1848", "1870"],
        correct_index: 1,
        explanation: "La Révolution française de 1789 a marqué la fin de la monarchie absolue et la naissance des droits de l'homme.",
        theme: "histoire", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["Révolution", "1789", "monarchie"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Quel fleuve traverse Paris ?",
        choices: ["Le Rhône", "La Garonne", "La Loire", "La Seine"],
        correct_index: 3,
        explanation: "La Seine, longue de 776 km, traverse Paris et se jette dans la Manche.",
        theme: "geographie", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["Seine", "Paris", "géographie"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Qui était Napoléon Ier ?",
        choices: ["Un poète", "Un empereur français", "Un roi de France", "Un philosophe"],
        correct_index: 1,
        explanation: "Napoléon Ier fut le premier empereur des Français (1804-1815). Il a profondément réformé l'administration française.",
        theme: "histoire", level: "Débutant",
        exam_types: ["titre_sejour"],
        tags: ["Napoléon", "Empire", "histoire"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Quand la Seconde Guerre mondiale a-t-elle eu lieu ?",
        choices: ["1914-1918", "1939-1945", "1870-1871", "1954-1962"],
        correct_index: 1,
        explanation: "La Seconde Guerre mondiale (1939-1945) a profondément marqué la France, avec l'occupation nazie et la Résistance.",
        theme: "histoire", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["Guerre mondiale", "1939", "Résistance"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Qu'est-ce que la Shoah ?",
        choices: ["Un mouvement artistique", "Le génocide des Juifs pendant la Seconde Guerre mondiale", "Une fête nationale", "Un traité de paix"],
        correct_index: 1,
        explanation: "La Shoah désigne l'extermination de 6 millions de Juifs par le régime nazi entre 1941 et 1945.",
        theme: "histoire", level: "Avancé",
        exam_types: ["naturalisation"],
        tags: ["Shoah", "génocide", "mémoire"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Quand a eu lieu l'appel du général de Gaulle à la Résistance ?",
        choices: ["Le 14 juillet 1940", "Le 18 juin 1940", "Le 8 mai 1945", "Le 6 juin 1944"],
        correct_index: 1,
        explanation: "Le 18 juin 1940, le général de Gaulle a lancé depuis Londres un appel à poursuivre le combat contre l'Allemagne nazie.",
        theme: "histoire", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["de Gaulle", "Résistance", "18 juin"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Que symbolise le 1er mai en France ?",
        choices: ["La fête de la musique", "La fête du travail", "La fête nationale", "La fête des mères"],
        correct_index: 1,
        explanation: "Le 1er mai est la Journée internationale des travailleurs, jour férié en France depuis 1947.",
        theme: "histoire", level: "Débutant",
        exam_types: ["titre_sejour"],
        tags: ["1er mai", "travail", "jour férié"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Combien de régions compte la France métropolitaine ?",
        choices: ["13", "18", "22", "27"],
        correct_index: 0,
        explanation: "Depuis la réforme territoriale de 2016, la France métropolitaine compte 13 régions (18 avec les outre-mer).",
        theme: "geographie", level: "Avancé",
        exam_types: ["naturalisation"],
        tags: ["régions", "géographie", "réforme territoriale"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },

    // ═══ THEME 5: Vivre dans la Société ═══
    {
        question: "À quoi sert un titre de séjour ?",
        choices: ["À obtenir la nationalité française", "À attester du droit de résider en France", "À avoir le droit de vote", "À obtenir un passeport français"],
        correct_index: 1,
        explanation: "Le titre de séjour est un document officiel qui autorise un étranger à résider légalement en France pour une durée déterminée.",
        theme: "societe", level: "Débutant",
        exam_types: ["titre_sejour"],
        tags: ["titre de séjour", "résidence", "document"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Quand la Sécurité sociale a-t-elle été créée en France ?",
        choices: ["1789", "1905", "1945", "1968"],
        correct_index: 2,
        explanation: "La Sécurité sociale a été créée en 1945 pour protéger les citoyens contre les risques sociaux (maladie, vieillesse, etc.).",
        theme: "societe", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["Sécurité sociale", "1945", "protection sociale"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "Quel numéro appeler en cas d'urgence médicale ?",
        choices: ["17", "18", "15", "112"],
        correct_index: 2,
        explanation: "Le 15 (SAMU) est le numéro d'urgence médicale. Le 112 est le numéro d'urgence européen.",
        theme: "societe", level: "Débutant",
        exam_types: ["titre_sejour"],
        tags: ["urgence", "SAMU", "15"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },
    {
        question: "L'école publique en France est-elle gratuite ?",
        choices: ["Non, elle est payante", "Oui, l'enseignement public est gratuit et obligatoire", "Oui, mais seulement pour les Français", "Non, il faut payer une inscription"],
        correct_index: 1,
        explanation: "En France, l'école publique est gratuite, laïque et obligatoire (instruction de 3 à 16 ans).",
        theme: "societe", level: "Débutant",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["école", "gratuit", "laïque"],
        is_active: true, source: "formation-civique.interieur.gouv.fr"
    },

    // ═══ MISES EN SITUATION ═══
    {
        question: "Votre voisin fait du bruit tous les soirs après 22h. Que faites-vous ?",
        choices: ["Vous cassez sa porte", "Vous appelez la police chaque soir", "Vous essayez d'abord de lui en parler calmement", "Vous déménagez"],
        correct_index: 2,
        explanation: "La médiation et le dialogue sont privilégiés en France. En cas d'échec, un recours auprès de la mairie ou de la police est possible.",
        theme: "societe", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["mise en situation", "voisinage", "médiation"],
        is_active: true, source: "Mise en situation officielle"
    },
    {
        question: "Un collègue tient des propos discriminatoires au travail. Que faites-vous ?",
        choices: ["Vous ne dites rien", "Vous alertez votre supérieur ou les ressources humaines", "Vous tenez les mêmes propos", "Vous quittez votre emploi"],
        correct_index: 1,
        explanation: "La loi française interdit les discriminations. Les victimes ou témoins peuvent signaler à leur hiérarchie ou au Défenseur des droits.",
        theme: "droits", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["mise en situation", "discrimination", "travail"],
        is_active: true, source: "Mise en situation officielle"
    },
    {
        question: "Vous trouvez un portefeuille dans la rue. Que faites-vous ?",
        choices: ["Vous gardez l'argent", "Vous le rapportez au commissariat ou à la mairie", "Vous le jetez", "Vous prenez les papiers d'identité"],
        correct_index: 1,
        explanation: "En France, la loi impose de restituer un objet trouvé. Le rapporter aux autorités est un acte civique.",
        theme: "societe", level: "Débutant",
        exam_types: ["titre_sejour"],
        tags: ["mise en situation", "civisme", "objet trouvé"],
        is_active: true, source: "Mise en situation officielle"
    },
    {
        question: "Votre enfant refuse d'aller à l'école. Que risquez-vous ?",
        choices: ["Rien, c'est le choix de l'enfant", "Une amende et des poursuites judiciaires", "Un avertissement de la mairie uniquement", "L'absentéisme est autorisé jusqu'à 16 ans"],
        correct_index: 1,
        explanation: "L'instruction est obligatoire de 3 à 16 ans. Les parents qui ne la respectent pas s'exposent à des sanctions.",
        theme: "droits", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["mise en situation", "instruction", "obligation"],
        is_active: true, source: "Mise en situation officielle"
    },
    {
        question: "Vous êtes témoin de violences conjugales chez vos voisins. Que faites-vous ?",
        choices: ["Vous appelez le 17 ou le 3919", "Rien, c'est une affaire privée", "Vous allez frapper à leur porte", "Vous filmez la scène"],
        correct_index: 0,
        explanation: "Les violences conjugales sont un délit en France. Le 17 (police) ou le 3919 sont les numéros à contacter.",
        theme: "droits", level: "Intermédiaire",
        exam_types: ["titre_sejour", "naturalisation"],
        tags: ["mise en situation", "violences conjugales", "urgence"],
        is_active: true, source: "Mise en situation officielle"
    },
];

/* ─────────────────────────────────────────────
   Interface de l'outil d'audit & import
   ───────────────────────────────────────────── */
interface AuditResult {
    total_existing: number;
    total_new: number;
    duplicates_found: number;
    to_insert: number;
    details: { question: string; status: 'duplicate' | 'new'; match?: string; similarity?: number }[];
}

export default function SeedQuestionsPage() {
    const { isAdmin } = useAuth();
    const [phase, setPhase] = useState<'idle' | 'auditing' | 'audit_done' | 'inserting' | 'done'>('idle');
    const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
    const [insertCount, setInsertCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Accès refusé</h1>
                <p className="text-gray-500 mt-2">Cette page est réservée aux administrateurs.</p>
            </div>
        );
    }

    const runAudit = async () => {
        setPhase('auditing');
        setError(null);

        try {
            // Step 1: Fetch all existing questions from Firestore
            const existingSnap = await getDocs(collection(db, 'questions'));
            const existingQuestions = existingSnap.docs.map(d => ({
                id: d.id,
                question: (d.data().question || '') as string,
            }));

            // Step 2: Compare each new question with existing ones
            const SIMILARITY_THRESHOLD = 0.65;
            const details: AuditResult['details'] = [];
            let duplicatesFound = 0;

            for (const newQ of NEW_QUESTIONS) {
                let bestMatch = '';
                let bestScore = 0;

                for (const existing of existingQuestions) {
                    const score = similarity(newQ.question, existing.question);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = existing.question;
                    }
                }

                if (bestScore >= SIMILARITY_THRESHOLD) {
                    duplicatesFound++;
                    details.push({
                        question: newQ.question,
                        status: 'duplicate',
                        match: bestMatch,
                        similarity: Math.round(bestScore * 100),
                    });
                } else {
                    details.push({
                        question: newQ.question,
                        status: 'new',
                        similarity: Math.round(bestScore * 100),
                    });
                }
            }

            setAuditResult({
                total_existing: existingQuestions.length,
                total_new: NEW_QUESTIONS.length,
                duplicates_found: duplicatesFound,
                to_insert: NEW_QUESTIONS.length - duplicatesFound,
                details,
            });
            setPhase('audit_done');
        } catch (err: any) {
            setError(`Erreur pendant l'audit : ${err.message}`);
            setPhase('idle');
        }
    };

    const runInsert = async () => {
        if (!auditResult) return;
        setPhase('inserting');
        setError(null);

        try {
            const toInsert = auditResult.details
                .filter(d => d.status === 'new')
                .map(d => NEW_QUESTIONS.find(q => q.question === d.question)!)
                .filter(Boolean);

            let count = 0;
            for (const q of toInsert) {
                await addDoc(collection(db, 'questions'), {
                    ...q,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
                count++;
                setInsertCount(count);
            }

            setPhase('done');
        } catch (err: any) {
            setError(`Erreur pendant l'insertion : ${err.message}`);
            setPhase('audit_done');
        }
    };

    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                    🛠️ Audit & Import de Questions
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Pipeline d'enrichissement de la banque de questions — Sources officielles (formation-civique.interieur.gouv.fr)
                </p>
            </div>

            {/* Step 1: Audit */}
            <Card className="mb-6 border-none shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-blue-600" />
                        Phase 1 — Audit de la base existante
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 mb-4">
                        Compare les {NEW_QUESTIONS.length} nouvelles questions avec la base de données existante par similarité textuelle (seuil : 65%).
                    </p>
                    {phase === 'idle' && (
                        <Button onClick={runAudit} className="gap-2">
                            <Database className="h-4 w-4" />
                            Lancer l'audit
                        </Button>
                    )}
                    {phase === 'auditing' && (
                        <div className="flex items-center gap-3 text-blue-600">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="font-medium">Analyse en cours…</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Audit Results */}
            {auditResult && (phase === 'audit_done' || phase === 'inserting' || phase === 'done') && (
                <Card className="mb-6 border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Résultats de l'audit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{auditResult.total_existing}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase">Existantes</div>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-center">
                                <div className="text-2xl font-black text-blue-600">{auditResult.total_new}</div>
                                <div className="text-xs font-bold text-blue-400 uppercase">Collectées</div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl text-center">
                                <div className="text-2xl font-black text-amber-600">{auditResult.duplicates_found}</div>
                                <div className="text-xs font-bold text-amber-400 uppercase">Doublons</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl text-center">
                                <div className="text-2xl font-black text-green-600">{auditResult.to_insert}</div>
                                <div className="text-xs font-bold text-green-400 uppercase">À insérer</div>
                            </div>
                        </div>

                        {/* Detail list */}
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {auditResult.details.map((d, i) => (
                                <div key={i} className={`p-3 rounded-xl text-sm flex items-start gap-3 ${d.status === 'duplicate' ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800' : 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800'}`}>
                                    {d.status === 'duplicate' ? (
                                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <Plus className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <div className="font-medium text-slate-700 dark:text-slate-200 truncate">{d.question}</div>
                                        {d.status === 'duplicate' && (
                                            <div className="text-xs text-amber-600 mt-1">
                                                Doublon ({d.similarity}%) → {d.match?.substring(0, 80)}…
                                            </div>
                                        )}
                                        {d.status === 'new' && (
                                            <div className="text-xs text-green-600 mt-1">
                                                Nouvelle question (meilleur match : {d.similarity}%)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                        {phase === 'audit_done' && auditResult.to_insert > 0 && (
                            <Button onClick={runInsert} className="gap-2 bg-green-600 hover:bg-green-700">
                                <Plus className="h-4 w-4" />
                                Insérer les {auditResult.to_insert} nouvelles questions
                            </Button>
                        )}
                        {phase === 'audit_done' && auditResult.to_insert === 0 && (
                            <p className="text-green-600 font-bold">✅ La base de données est déjà complète. Aucune insertion nécessaire.</p>
                        )}
                        {phase === 'inserting' && (
                            <div className="flex items-center gap-3 text-blue-600">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="font-medium">Insertion en cours… {insertCount}/{auditResult.to_insert}</span>
                            </div>
                        )}
                        {phase === 'done' && (
                            <p className="text-green-600 font-black text-lg">✅ {insertCount} questions insérées avec succès !</p>
                        )}
                    </CardFooter>
                </Card>
            )}

            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                    <CardContent className="p-4 flex items-center gap-3 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">{error}</span>
                    </CardContent>
                </Card>
            )}
        </main>
    );
}
