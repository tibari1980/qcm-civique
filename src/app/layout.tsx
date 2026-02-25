import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CiviqQuiz - Prépa Examen Civique FR",
  description: "La plateforme de référence pour réussir votre examen civique français efficacement sur civiqquiz.com.",
};

import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { TricolorBar } from "@/components/layout/TricolorBar";

// Lazy-loaded components for better performance
const Footer = dynamic(() => import("@/components/layout/Footer").then(mod => mod.Footer));
const AnnouncementBanner = dynamic(() => import("@/components/layout/AnnouncementBanner").then(mod => mod.AnnouncementBanner));
const PageTransition = dynamic(() => import("@/components/layout/PageTransition").then(mod => mod.PageTransition));
const SkipLink = dynamic(() => import("@/components/layout/SkipLink").then(mod => mod.SkipLink));

import { GlobalA11yRoot } from "@/components/layout/GlobalA11yRoot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} antialiased min-h-screen flex flex-col bg-[var(--color-background)]`}
      >
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
      </body>
    </html>
  );
}
