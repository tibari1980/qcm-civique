import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Users, Award, Target, CheckCircle, ArrowRight, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'À Propos - Prépa Examen Civique FR',
    description: 'Découvrez notre mission : accompagner votre intégration républicaine et vous aider à réussir votre examen civique français.',
};

const stats = [
    { value: '95%', label: 'Taux de réussite', icon: Award },
    { value: '10 000+', label: 'Candidats accompagnés', icon: Users },
    { value: '500+', label: 'Questions disponibles', icon: BookOpen },
    { value: '4.9/5', label: 'Note moyenne', icon: Heart },
];

const values = [
    {
        icon: Target,
        title: 'Excellence Pédagogique',
        description: 'Nos contenus sont rédigés par des experts en droit français et en didactique, pour garantir une préparation optimale.',
        color: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-100',
    },
    {
        icon: Users,
        title: 'Accompagnement Humain',
        description: "Chaque candidat est unique. Nous adaptons nos ressources à votre parcours, qu'il s'agisse d'un titre de séjour ou d'une naturalisation.",
        color: 'text-green-600',
        bg: 'bg-green-50 border-green-100',
    },
    {
        icon: CheckCircle,
        title: 'Conformité Administrative',
        description: 'Nos examens blancs respectent scrupuleusement le format officiel 2025/2026 validé par les préfectures françaises.',
        color: 'text-purple-600',
        bg: 'bg-purple-50 border-purple-100',
    },
];

const teamMembers = [
    {
        name: 'Dr. Marion Lefèvre',
        role: 'Responsable Pédagogique',
        initials: 'ML',
        description: "Docteure en Histoire, spécialiste de la citoyenneté française et de l'intégration républicaine.",
    },
    {
        name: 'Karim Benali',
        role: 'Expert Juridique',
        initials: 'KB',
        description: 'Juriste spécialisé en droit des étrangers, ancien conseiller en préfecture.',
    },
    {
        name: 'Sophie Martine',
        role: 'Directrice Technique',
        initials: 'SM',
        description: "Ingénieure logicielle avec 10 ans d'expérience dans l'EdTech.",
    },
];

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-300 blur-3xl" />
                </div>
                <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <Heart className="h-4 w-4" />
                        Depuis 2020, à vos côtés
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                        Accompagner votre<br />
                        <span className="text-blue-200">Intégration Républicaine</span>
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Nous croyons que la connaissance de l&apos;histoire, de la culture et des valeurs de la France
                        est la clé d&apos;une intégration réussie.
                    </p>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-[var(--color-primary)] py-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="flex flex-col items-center gap-2">
                                    <Icon className="h-6 w-6 opacity-80" />
                                    <span className="text-3xl font-extrabold">{stat.value}</span>
                                    <span className="text-blue-200 text-sm">{stat.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 container mx-auto px-4 max-w-5xl">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-[var(--color-primary)] font-semibold uppercase tracking-widest text-sm">Notre Mission</span>
                        <h2 className="text-3xl font-bold mt-2 mb-6 text-gray-900">
                            Rendre l&apos;examen civique accessible à tous
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Prépa Examen Civique FR est née d&apos;un constat simple : trop de candidats échouent à l&apos;examen
                            civique faute d&apos;une préparation adaptée. Nous avons construit une plateforme pédagogique
                            complète, structurée autour du programme officiel.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-8">
                            Notre approche combine des examens blancs fidèles au format officiel, des fiches de révision
                            synthétiques, et un simulateur d&apos;entretien pour les candidats à la naturalisation.
                        </p>
                        <Link href="/register">
                            <Button size="lg" className="gap-2">
                                Commencer gratuitement <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {values.map((v) => {
                            const Icon = v.icon;
                            return (
                                <Card key={v.title} className={`border ${v.bg}`}>
                                    <CardContent className="p-5 flex gap-4 items-start">
                                        <div className={`p-2 rounded-lg bg-white ${v.color}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                                            <p className="text-sm text-gray-600">{v.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Methodology Section */}
            <section className="bg-gray-50 py-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-12">
                        <span className="text-[var(--color-primary)] font-semibold uppercase tracking-widest text-sm">Notre Méthodologie</span>
                        <h2 className="text-3xl font-bold mt-2 text-gray-900">Une préparation en 3 étapes</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Maîtrise du Livret',
                                description: 'Apprenez les 48 pages du livret du citoyen grâce à nos fiches interactives et résumés structurés.',
                                color: 'text-blue-600',
                            },
                            {
                                step: '02',
                                title: 'Valeurs de la République',
                                description: 'Comprenez en profondeur les principes fondateurs : laïcité, égalité, liberté, fraternité.',
                                color: 'text-green-600',
                            },
                            {
                                step: '03',
                                title: 'Soutien Académique',
                                description: 'Entraînez-vous avec des QCM officiels, des examens blancs, et simulez votre entretien oral.',
                                color: 'text-purple-600',
                            },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className={`text-6xl font-black mb-4 opacity-20 ${item.color}`}>{item.step}</div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 container mx-auto px-4 max-w-5xl">
                <div className="text-center mb-12">
                    <span className="text-[var(--color-primary)] font-semibold uppercase tracking-widest text-sm">Notre Équipe</span>
                    <h2 className="text-3xl font-bold mt-2 text-gray-900">Des experts à votre service</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {teamMembers.map((member) => (
                        <Card key={member.name} className="text-center overflow-hidden hover:shadow-lg transition-shadow">
                            <CardContent className="p-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                    {member.initials}
                                </div>
                                <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                                <p className="text-[var(--color-primary)] text-sm font-medium mb-3">{member.role}</p>
                                <p className="text-gray-600 text-sm">{member.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-[var(--color-primary)] py-16 text-white text-center">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">Prêt à réussir votre entretien ?</h2>
                    <p className="text-blue-200 mb-8">
                        Rejoignez plus de 10 000 candidats qui nous font confiance pour leur préparation à l&apos;examen civique français.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg" variant="secondary" className="gap-2">
                                Créer un compte gratuit <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="gap-2 bg-transparent text-white border-white hover:bg-white/10">
                                Nous contacter
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
