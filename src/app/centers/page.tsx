'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MapPin, Phone, Globe, ExternalLink, Info, CheckCircle2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const OFFICIAL_CENTERS = [
    {
        name: "Chambres de Commerce et d'Industrie (CCI)",
        description: "Premier réseau national pour le passage de l'examen civique mention naturalisation.",
        url: "https://examen-civique-france.fr/",
        action: "Voir la carte CCI",
        color: "blue"
    },
    {
        name: "France Éducation International (FEI)",
        description: "Opérateur public agréé pour l'organisation de l'examen civique et du TCF.",
        url: "https://www.france-education-international.fr/cartographie-des-centres-de-passation-du-tcf",
        action: "Trouver un centre FEI",
        color: "indigo"
    },
    {
        name: "Le Français des Affaires",
        description: "Ressource officielle pour trouver des centres agréés par la CCIP.",
        url: "https://www.lefrancaisdesaffaires.fr/trouver-un-centre/",
        action: "Rechercher un centre",
        color: "red"
    }
];

export default function CentersPage() {
    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Header Section */}
            <div className="bg-slate-900 h-80 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] -mr-40 -mt-40" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[100px] -ml-20 -mb-20" />
                </div>
                
                <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-widest mb-6">
                            <MapPin className="h-3 w-3" />
                            Localisation Officielle
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                            Centres d&apos;Examen <span className="text-blue-400">en France</span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl text-lg font-medium leading-relaxed">
                            Trouvez rapidement un centre agréé pour passer votre examen civique près de chez vous. 
                            L&apos;inscription se fait directement auprès des organismes certificateurs.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main official resources */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {OFFICIAL_CENTERS.map((center, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="premium-card-3d border-none bg-white h-full flex flex-col hover:shadow-3d-lg transition-all group overflow-hidden">
                                        <div className={`h-2 w-full bg-${center.color}-500 transition-all group-hover:h-3`} />
                                        <CardHeader>
                                            <CardTitle className="text-xl font-black tracking-tight group-hover:text-blue-600 transition-colors">
                                                {center.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-slate-600 font-medium leading-relaxed">
                                                {center.description}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <Button 
                                                className="w-full rounded-2xl h-12 font-black gap-2 shadow-3d-sm"
                                                onClick={() => window.open(center.url, '_blank')}
                                            >
                                                {center.action}
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                            
                            {/* Contact Box */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="premium-card-3d border-none bg-slate-900 h-full flex flex-col text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                                    <CardHeader>
                                        <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-blue-400" />
                                            Besoin d&apos;aide ?
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-4">
                                        <p className="text-slate-400 text-sm font-medium">
                                            Pour toute question générale sur la naturalisation et l&apos;accès à la nationalité :
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                                    <Info className="h-4 w-4 text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-500 uppercase">Contact Citoyens</p>
                                                    <p className="font-bold text-blue-400">0806 001 620</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                                    <Globe className="h-4 w-4 text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-500 uppercase">Site Service Public</p>
                                                    <a href="https://www.service-public.fr" target="_blank" className="text-sm font-bold hover:underline">service-public.fr</a>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </section>

                        <section className="premium-card-3d bg-white p-8 md:p-12 rounded-[2.5rem] border-none shadow-3d-md">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-slate-900">Conseils pour l&apos;Examen</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Avant l&apos;examen
                                    </h3>
                                    <ul className="space-y-3 text-slate-600 font-medium text-sm">
                                        <li>• Anticipez votre réservation (délais de 1 à 3 mois).</li>
                                        <li>• Vérifiez que votre carte d&apos;identité est valide.</li>
                                        <li>• Préparez les frais d&apos;inscription (variables selon le centre).</li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Le jour J
                                    </h3>
                                    <ul className="space-y-3 text-slate-600 font-medium text-sm">
                                        <li>• Arrivez 15 minutes avant le début de la session.</li>
                                        <li>• L&apos;examen dure 45 minutes pour 40 questions.</li>
                                        <li>• Score requis : 32 bonnes réponses sur 40 (80%).</li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar info */}
                    <div className="space-y-8">
                        <Card className="premium-card-3d border-none bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-blue-200">
                            <h3 className="text-xl font-black mb-4 tracking-tight">Prêt à réussir ?</h3>
                            <p className="text-blue-100 font-medium mb-8 leading-relaxed">
                                Utilisez notre mode Examen Blanc pour vous mettre en conditions réelles et valider vos connaissances.
                            </p>
                            <Button variant="secondary" className="w-full rounded-2xl h-14 font-black shadow-lg" onClick={() => window.location.href = '/exam'}>
                                Lancer un Examen Blanc
                            </Button>
                        </Card>

                        <div className="bg-white p-8 rounded-[2.5rem] premium-card-3d border-none space-y-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Documents à prévoir</h4>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-sm font-bold text-slate-700">Pièce d&apos;identité originale</span>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-sm font-bold text-slate-700">Confirmation d&apos;inscription</span>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-sm font-bold text-slate-700">Justificatif de domicile (parfois)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
