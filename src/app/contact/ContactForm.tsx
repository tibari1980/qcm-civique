'use client';

import { useState } from 'react';
import { Mail, Clock, MapPin, CheckCircle, Send, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

const contactInfo = [
    {
        icon: Mail,
        title: 'Support Email',
        description: 'Pour toute demande directe ou envoi de documents.',
        value: 'support@civiqquiz.com',
        href: 'mailto:support@civiqquiz.com',
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
        a: 'Par email à support@civiqquiz.com. Nous répondons généralement en moins de 24h ouvrées.',
    },
];

export default function ContactForm() {
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formState),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Erreur lors de l'envoi");
            }

            setSubmitted(true);
            setFormState({ name: '', email: '', subject: '', message: '' });
            toast.success('Message envoyé avec succès !');
        } catch (error: any) {
            console.error('Submit error:', error);
            toast.error(error.message || "Une erreur est survenue lors de l'envoi du message.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Hero */}
            <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" aria-hidden="true">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
                    <div className="absolute top-1/2 -right-20 w-96 h-96 bg-red-600 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000" />
                </div>
                <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                    <nav aria-label="Fil d'Ariane" className="flex justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                        <span>/</span>
                        <span className="text-white">Contact & Feedback</span>
                    </nav>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Une question ou une <span className="text-blue-400">idée ?</span></h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                        Notre équipe est à votre écoute pour toute demande d&apos;assistance ou suggestion d&apos;amélioration.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 max-w-6xl -mt-10 relative z-20">
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Contact Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="premium-card-3d border-none bg-white p-2 md:p-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-4 text-2xl font-black text-slate-900">
                                    <div className="p-3 bg-blue-50 rounded-2xl">
                                        <Send className="h-6 w-6 text-blue-600" aria-hidden="true" />
                                    </div>
                                    Message direct
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div id="form-feedback" className="sr-only" aria-live="polite">
                                    {submitted ? "Votre message a été envoyé avec succès. Nous vous contacterons bientôt." : ""}
                                    {loading ? "Envoi du message en cours..." : ""}
                                </div>

                                {submitted ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }} 
                                        animate={{ opacity: 1, scale: 1 }} 
                                        className="text-center py-12"
                                        role="status"
                                    >
                                        <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="h-10 w-10 text-green-500" aria-hidden="true" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">Message envoyé !</h3>
                                        <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
                                            Merci. Notre équipe traitera votre demande (support ou proposition d&apos;amélioration) dans les plus brefs délais.
                                        </p>
                                        <Button 
                                            variant="outline" 
                                            className="h-12 px-8 rounded-2xl border-2 border-slate-100 font-bold hover:bg-slate-50 transition-all text-slate-900"
                                            onClick={() => setSubmitted(false)}
                                            aria-label="Retourner au formulaire de contact"
                                        >
                                            Envoyer un autre message
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6" aria-describedby="form-feedback">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                                    Votre nom
                                                </label>
                                                <input
                                                    id="name"
                                                    type="text"
                                                    required
                                                    value={formState.name}
                                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                                    placeholder="Marie Dupont"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                                    Adresse email
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    value={formState.email}
                                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                                    placeholder="marie@exemple.fr"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="subject" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                                Objet de votre demande
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="subject"
                                                    required
                                                    value={formState.subject}
                                                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                                                >
                                                    <option value="">Sélectionnez un sujet</option>
                                                    <option value="proposition">💡 Proposition d&apos;amélioration</option>
                                                    <option value="bug">⚠️ Signalement de dysfonctionnement</option>
                                                    <option value="support">🛠️ Support technique</option>
                                                    <option value="pedagogique">📚 Question pédagogique</option>
                                                    <option value="autre">Etc.</option>
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="message" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                rows={6}
                                                required
                                                value={formState.message}
                                                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 resize-none"
                                                placeholder="Décrivez votre idée ou le problème rencontré..."
                                            />
                                        </div>
                                        <Button 
                                            type="submit" 
                                            size="lg" 
                                            disabled={loading} 
                                            className="w-full h-16 rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 shadow-3d-md font-black text-lg transition-all active:scale-[0.98] text-white"
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Envoi en cours...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <Send className="h-5 w-5" /> Envoyer le message
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-8">
                        {contactInfo.map((info) => {
                            const Icon = info.icon;
                            return (
                                <Card key={info.title} className="premium-card-3d border-none bg-white p-1 transform transition-transform hover:scale-[1.02]">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-2xl ${info.bg}`} aria-hidden="true">
                                                <Icon className={`h-6 w-6 ${info.color}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 tracking-tight">{info.title}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{info.description}</p>
                                                <a href={info.href} className={`text-sm font-black transition-colors ${info.color} hover:text-slate-900`}>
                                                    {info.value}
                                                </a>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {/* Hours */}
                        <Card className="premium-card-3d border-none bg-white p-1">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-orange-50 rounded-xl">
                                        <Clock className="h-5 w-5 text-orange-500" aria-hidden="true" />
                                    </div>
                                    <h3 className="font-black text-slate-900">Disponibilité</h3>
                                </div>
                                <div className="space-y-4">
                                    {hours.map((h) => (
                                        <div key={h.day} className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-slate-400">{h.day}</span>
                                            <span className={`px-3 py-1 rounded-lg ${h.time === 'Fermé' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-900'}`}>{h.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Success Rate Badge */}
                        <Card className="premium-card-3d border-none bg-gradient-to-br from-blue-600 to-blue-800 text-white p-1">
                            <CardContent className="p-8 text-center">
                                <div className="h-14 w-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-blue-200" aria-hidden="true" />
                                </div>
                                <p className="font-black text-2xl mb-2 tracking-tight">95% de réussite</p>
                                <p className="text-blue-100 text-sm font-medium leading-relaxed">
                                    Rejoignez les milliers d&apos;élèves qui ont réussi leur intégration grâce à notre méthode.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* FAQ */}
                <section className="mt-24">
                    <div className="flex flex-col items-center mb-12">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Questions fréquentes</h2>
                        <div className="h-1.5 w-20 bg-blue-600 rounded-full" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {faqs.map((faq) => (
                            <Card key={faq.q} className="premium-card-3d border-none bg-white">
                                <CardContent className="p-8">
                                    <h3 className="font-black text-slate-900 mb-4 leading-tight">{faq.q}</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{faq.a}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
