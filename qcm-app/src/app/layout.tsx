import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prépa Examen Civique FR",
  description: "Préparez votre examen civique français efficacement.",
};

import { AuthProvider } from "@/context/AuthContext";

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
          {/* Lien d'évitement — WCAG 2.4.1, essentiel pour NVDA et clavier */}
          <SkipLink />
          <Header />
          {/*
            id="main-content" permet au SkipLink de sauter la navigation.
            tabIndex={-1} permet le focus programmatique après la navigation.
          */}
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
