'use client';

import { useState } from 'react';
import { Mail, Clock, MapPin, CheckCircle, Send, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const contactInfo = [
    {
        icon: Mail,
        title: 'Support Email',
        description: 'Pour toute demande directe ou envoi de documents.',
        value: 'contact@prepa-civique.fr',
        href: 'mailto:contact@prepa-civique.fr',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        icon: Phone,
        title: "Ligne d'assistance",
        description: 'Du lundi au vendredi, de 9h à 18h.',
        value: '+33 (0)1 23 45 67 89',
        href: 'tel:+33123456789',
        color: 'text-green-600',
        bg: 'bg-green-50',
    },
    {
        icon: MapPin,
        title: 'Siège Social',
        description: 'Basé à Paris, France.',
        value: '75 Rue de Rivoli, 75001 Paris',
        href: 'https://maps.google.com',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
    },
];

const hours = [
    { day: 'Lundi – Vendredi', time: '9h00 – 18h00' },
    { day: 'Samedi', time: '10h00 – 14h00' },
    { day: 'Dimanche', time: 'Fermé' },
];

const faqs = [
    {
        q: 'Combien de temps dois-je me préparer ?',
        a: "En moyenne, 2 à 4 semaines de travail régulier suffisent. Notre plateforme s'adapte à votre rythme.",
    },
    {
        q: 'Quelle est la différence entre les deux parcours ?',
        a: "Le parcours Titre de Séjour prépare au QCM de 40 questions. Le parcours Naturalisation inclut en plus un simulateur d'entretien oral.",
    },
    {
        q: 'Comment contacter le support rapidement ?',
        a: 'Par email à contact@prepa-civique.fr. Nous répondons généralement en moins de 24h ouvrées.',
    },
];

export default function ContactForm() {
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <nav aria-label="Fil d'Ariane" className="flex justify-center gap-2 text-blue-300 text-sm mb-6">
                        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                        <span>/</span>
                        <span className="text-white">Contactez-nous</span>
                    </nav>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Une question ?</h1>
                    <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                        Notre équipe pédagogique est à votre disposition. Nous répondons généralement en moins de 24h ouvrées.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-6xl py-16">
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="h-5 w-5 text-[var(--color-primary)]" />
                                    Envoyez-nous un message
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {submitted ? (
                                    <div className="text-center py-12">
                                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                                        <p className="text-gray-600 mb-6">
                                            Merci pour votre message. Notre équipe vous répondra dans les 24h ouvrées.
                                        </p>
                                        <Button variant="outline" onClick={() => setSubmitted(false)}>
                                            Envoyer un autre message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Votre nom *
                                                </label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    required
                                                    value={formState.name}
                                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="Marie Dupont"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Adresse email *
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    value={formState.email}
                                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="marie@exemple.fr"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                                Sujet *
                                            </label>
                                            <select
                                                id="subject"
                                                required
                                                value={formState.subject}
                                                onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                            >
                                                <option value="">Sélectionnez un sujet</option>
                                                <option value="support">Support technique</option>
                                                <option value="pedagogique">Question pédagogique</option>
                                                <option value="compte">Mon compte</option>
                                                <option value="partenariat">Partenariat</option>
                                                <option value="autre">Autre</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                                Message *
                                            </label>
                                            <textarea
                                                id="message"
                                                rows={6}
                                                required
                                                value={formState.message}
                                                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                                placeholder="Décrivez votre demande en détail..."
                                            />
                                        </div>
                                        <Button type="submit" size="lg" disabled={loading} className="w-full gap-2">
                                            {loading ? (
                                                <>Envoi en cours...</>
                                            ) : (
                                                <><Send className="h-4 w-4" /> Envoyer le message</>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-6">
                        {contactInfo.map((info) => {
                            const Icon = info.icon;
                            return (
                                <Card key={info.title} className="shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2.5 rounded-lg ${info.bg}`}>
                                                <Icon className={`h-5 w-5 ${info.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-0.5">{info.title}</h3>
                                                <p className="text-xs text-gray-500 mb-2">{info.description}</p>
                                                <a href={info.href} className={`text-sm font-medium ${info.color} hover:underline`}>
                                                    {info.value}
                                                </a>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Hours */}
                        <Card className="shadow-sm">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <h3 className="font-semibold text-gray-900">Horaires d&apos;ouverture</h3>
                                </div>
                                <div className="space-y-2">
                                    {hours.map((h) => (
                                        <div key={h.day} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{h.day}</span>
                                            <span className={`font-medium ${h.time === 'Fermé' ? 'text-red-500' : 'text-gray-900'}`}>{h.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Success Rate Badge */}
                        <Card className="shadow-sm bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                            <CardContent className="p-5 text-center">
                                <CheckCircle className="h-10 w-10 mx-auto mb-3 text-blue-200" />
                                <p className="font-bold text-2xl mb-1">95% de réussite</p>
                                <p className="text-blue-200 text-sm">
                                    Plus de 95% de nos élèves réussissent leur examen de citoyenneté dès la première tentative.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* FAQ */}
                <section className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Questions fréquentes</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {faqs.map((faq) => (
                            <Card key={faq.q} className="shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">{faq.q}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
