import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Guide d'utilisation — Préparation Examen Civique 2026",
    description: "Guide complet A à Z de CiviqQuiz. Apprenez comment préparer votre examen civique français obligatoire depuis janvier 2026 : 40 questions QCM, 5 thématiques, score min 80%. Inscription gratuite.",
    keywords: [
        "guide examen civique", "comment préparer examen civique",
        "naturalisation France guide", "titre de séjour préparation",
        "QCM civique 2026", "test civique mode d'emploi"
    ],
    openGraph: {
        title: "Guide d'utilisation CiviqQuiz — Examen Civique 2026",
        description: "Tout ce que vous devez savoir pour réussir l'examen civique français. Guide gratuit, étape par étape, avec FAQ et conseils.",
    },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "L'examen civique est-il obligatoire ?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Oui. Depuis le 1er janvier 2026, l'examen civique est obligatoire pour toute première demande de carte de séjour pluriannuelle (CSP), de carte de résident (CR) et pour les demandes de naturalisation par décret."
            }
        },
        {
            "@type": "Question",
            "name": "Combien de questions comporte l'examen civique ?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "L'examen civique se compose de 40 questions à choix multiples (QCM) à réaliser sur ordinateur en 45 minutes maximum. Il faut obtenir au minimum 32 bonnes réponses (80%) pour réussir."
            }
        },
        {
            "@type": "Question",
            "name": "Quels sont les thèmes abordés dans l'examen civique ?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "5 thématiques officielles : Principes et valeurs de la République (11 questions), Système institutionnel (6 questions), Droits et devoirs (11 questions), Histoire, géographie et culture (8 questions), et Vivre en France (4 questions)."
            }
        },
        {
            "@type": "Question",
            "name": "CiviqQuiz est-il gratuit ?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Oui, CiviqQuiz est entièrement gratuit. Vous pouvez vous entraîner autant de fois que nécessaire, sans limite, sur toutes les thématiques et en conditions d'examen."
            }
        },
        {
            "@type": "Question",
            "name": "Puis-je m'entraîner sans créer de compte ?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Oui ! Vous pouvez accéder au mode invité pour essayer l'entraînement. Créer un compte gratuit vous permet de sauvegarder votre progression et d'obtenir un certificat de réussite."
            }
        }
    ]
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            {children}
        </>
    );
}
