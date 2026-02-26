import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://civiqquiz.com'),
  title: {
    default: "CiviqQuiz — Préparation Examen Civique Français 2026 | QCM Gratuit",
    template: "%s | CiviqQuiz"
  },
  description: "Préparez l'examen civique français obligatoire depuis janvier 2026 pour votre titre de séjour ou naturalisation. QCM gratuit, 40 questions, 5 thématiques officielles. Entraînez-vous en conditions réelles.",
  keywords: [
    "examen civique français", "QCM civique", "naturalisation France",
    "titre de séjour", "test civique 2026", "préparation examen civique",
    "carte de séjour pluriannuelle", "citoyenneté française",
    "valeurs république", "droits devoirs citoyen",
    "CiviqQuiz", "quiz civique gratuit"
  ],
  authors: [{ name: "CiviqQuiz", url: "https://civiqquiz.com" }],
  creator: "CiviqQuiz Engineering",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://civiqquiz.com",
    siteName: "CiviqQuiz",
    title: "CiviqQuiz — Préparation Examen Civique Français 2026",
    description: "La plateforme gratuite de référence pour réussir votre examen civique français. QCM, examens blancs, 5 thématiques officielles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CiviqQuiz — Préparation Examen Civique 2026",
    description: "Préparez l'examen civique obligatoire avec des QCM gratuits et illimités. 40 questions, 45 minutes, score min 80%.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://civiqquiz.com',
  },
};

import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { TricolorBar } from "@/components/layout/TricolorBar";

// Lazy-loaded components for better performance
const Footer = dynamic(() => import("@/components/layout/Footer").then(mod => mod.Footer));
const AnnouncementBanner = dynamic(() => import("@/components/layout/AnnouncementBanner").then(mod => mod.AnnouncementBanner));
const PageTransition = dynamic(() => import("@/components/layout/PageTransition").then(mod => mod.PageTransition));
const SkipLink = dynamic(() => import("@/components/layout/SkipLink").then(mod => mod.SkipLink));

import { GlobalA11yRoot } from "@/components/layout/GlobalA11yRoot";

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: Apply theme before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('civiqquiz-theme') || 'system';
                  var resolved = theme;
                  if (theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (resolved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  document.documentElement.style.colorScheme = resolved;
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} antialiased min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)] transition-colors duration-300`}
      >
        <ThemeProvider>
          <Toaster position="top-center" richColors />
          <AuthProvider>
            <SettingsProvider>
              <GlobalA11yRoot>
                <TricolorBar />
                <AnnouncementBanner />
                <SkipLink />
                <Header />
                <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </main>
                <Footer />
              </GlobalA11yRoot>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
