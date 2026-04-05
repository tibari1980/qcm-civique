import { Metadata } from "next";
import { EligibilityChecker } from "@/components/features/eligibility/EligibilityChecker";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vérifier mon Éligibilité",
  description: "Découvrez si vous êtes concerné(e) par l'examen civique obligatoire en répondant à quelques questions simples.",
  openGraph: {
    title: "Vérifier mon Éligibilité | CiviqQuiz",
    description: "Vérifiez rapidement en ligne si l'examen civique est obligatoire pour votre demande (titre de séjour, naturalisation).",
  },
};

export default function EligibilityPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative relative z-10 space-y-8">
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors mb-6 group bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-[var(--color-border)]"
          >
            <MoveLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Retour à l'accueil
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-4">
              Suis-je <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-blue-600">éligible</span> à l'examen civique ?
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              La loi de l'immigration de janvier 2024 introduit de nouvelles règles. Utilisez notre simulateur pour savoir instantanément si votre démarche nécessite la réussite du nouvel examen civique.
            </p>
          </div>
        </div>

        <EligibilityChecker />
        
        <div className="mt-16 text-center text-sm text-[var(--color-text-tertiary)] max-w-2xl mx-auto pb-8">
          <p>
            Mentions légales: Ce simulateur est fourni à titre indicatif et se base sur le décret d'application 2025-1345. Seule l'administration française est habilitée à décider formellement de l'obligation de passer l'examen civique dans le cadre de votre démarche personnelle.
          </p>
        </div>
      </div>
    </div>
  );
}
