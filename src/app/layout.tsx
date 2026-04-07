import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Header } from "../components/layout/Header";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://civiqquiz.com'),
  title: {
    default: "CiviQ Quiz — Votre succès à l'examen civique français 2026",
    template: "%s | CiviQ Quiz"
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
  description: "La plateforme d'accompagnement pour réussir votre examen civique obligatoire. Préparez-vous sereinement à votre naturalisation ou votre titre de séjour avec nos QCM officiels et examens blancs.",
  keywords: [
    "examen civique français", "réussir examen civique", "préparation naturalisation",
    "titre de séjour France", "test civique 2026", "QCM civique gratuit",
    "carte de résident", "intégration républicaine", "valeurs république",
    "CiviqQuiz", "devenir français"
  ],
  authors: [{ name: "CiviqQuiz", url: "https://civiqquiz.com" }],
  creator: "CiviqQuiz Team",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://civiqquiz.com",
    siteName: "CiviqQuiz",
    title: "CiviqQuiz — Le guide complet pour votre examen civique",
    description: "Réussissez votre examen civique français en toute confiance. Entraînements thématiques, examens blancs et suivi de progression gratuit.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CiviqQuiz — Préparez votre avenir en France",
    description: "Tout pour réussir l'examen civique obligatoire : QCM gratuits, 40 questions, conditions réelles d'examen.",
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
import { AuthProvider } from "../context/AuthContext";
import { SettingsProvider } from "../context/SettingsContext";
import { ThemeProvider } from "../context/ThemeContext";
import { TricolorBar } from "../components/layout/TricolorBar";

// Lazy-loaded components for better performance
const Footer = dynamic(() => import("../components/layout/Footer").then(mod => mod.Footer));
const AnnouncementBanner = dynamic(() => import("../components/layout/AnnouncementBanner").then(mod => mod.AnnouncementBanner));
const SkipLink = dynamic(() => import("../components/layout/SkipLink").then(mod => mod.SkipLink));
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';

import { GlobalA11yRoot } from "../components/layout/GlobalA11yRoot";

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
                  var theme = localStorage.getItem('civiqquiz-theme') || 'light';
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
        className={`${outfit.variable} font-sans antialiased text-[16px] leading-relaxed md:text-[17px] min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)] transition-colors duration-300`}
      >
        <ThemeProvider>
          <NextTopLoader
            color="var(--color-primary)"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px var(--color-primary),0 0 5px var(--color-primary)"
          />
          <Toaster position="top-center" richColors />
          <AuthProvider>
            <SettingsProvider>
              <GlobalA11yRoot>
                <TricolorBar />
                <AnnouncementBanner />
                <SkipLink />
                <Header />
                <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                  {children}
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
