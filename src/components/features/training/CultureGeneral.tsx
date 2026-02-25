'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Map, Flag } from 'lucide-react';
import Link from 'next/link';

import { motion, AnimatePresence } from 'framer-motion';

export default function CultureGeneral() {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="min-h-screen bg-white md:bg-gray-50/50 py-6 sm:py-10 px-4"
            >
                <div className="container mx-auto max-w-4xl">
                    <div className="mb-8 flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white shadow-sm border border-gray-100">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Culture Générale</h1>
                            <p className="text-gray-500 text-sm sm:text-base">L&apos;essentiel pour votre entretien d'assimilation.</p>
                        </div>
                    </div>

                    <Tabs defaultValue="history" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100/50 p-1 rounded-xl">
                            <TabsTrigger value="history" className="rounded-lg py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <BookOpen className="mr-2 h-4 w-4 hidden sm:inline" /> Histoire
                            </TabsTrigger>
                            <TabsTrigger value="geography" className="rounded-lg py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Map className="mr-2 h-4 w-4 hidden sm:inline" /> Géo
                            </TabsTrigger>
                            <TabsTrigger value="symbols" className="rounded-lg py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                <Flag className="mr-2 h-4 w-4 hidden sm:inline" /> Symboles
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="history" className="space-y-6">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <div className="h-2 bg-blue-600 w-full" />
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-black text-blue-900">Les Grandes Dates</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 p-6">
                                        <TimelineItem date="1789" title="La Révolution Française" description="Prise de la Bastille (14 juillet) et Déclaration des Droits de l'Homme et du Citoyen." />
                                        <TimelineItem date="1848" title="Abolition de l'esclavage" description="Instauration définitive et suffrage universel masculin." />
                                        <TimelineItem date="1905" title="Laïcité" description="Loi de séparation de l'Église et de l'État." />
                                        <TimelineItem date="1944" title="Droit de vote des femmes" description="Première participation aux élections en 1945." />
                                        <TimelineItem date="1958" title="La Ve République" description="Constitution actuelle initiée par le Général de Gaulle." />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="geography" className="space-y-6">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <div className="h-2 bg-green-600 w-full" />
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-black text-green-900">Géographie & Territoire</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-6 md:grid-cols-2 p-6">
                                        <div className="space-y-3 bg-gray-50 p-5 rounded-2xl">
                                            <h3 className="font-black text-sm uppercase tracking-widest text-green-700">Les Fleuves</h3>
                                            <ul className="space-y-2 text-gray-700 font-medium">
                                                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /> La Seine (Paris)</li>
                                                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /> La Loire (le plus long)</li>
                                                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /> Le Rhône & La Garonne</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-3 bg-gray-50 p-5 rounded-2xl">
                                            <h3 className="font-black text-sm uppercase tracking-widest text-green-700">Les Montagnes</h3>
                                            <ul className="space-y-2 text-gray-700 font-medium">
                                                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /> Les Alpes (Mont Blanc)</li>
                                                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /> Les Pyrénées & Jura</li>
                                                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /> Le Massif Central</li>
                                            </ul>
                                        </div>
                                        <div className="md:col-span-2 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                                            <h3 className="font-black text-blue-800 mb-2">L&apos;Outre-Mer (DROM-COM)</h3>
                                            <p className="text-sm text-blue-900/80 leading-relaxed font-medium">
                                                Guadeloupe, Martinique, Guyane, La Réunion et Mayotte sont les 5 départements d'outre-mer.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="symbols" className="space-y-6">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="border-none shadow-sm overflow-hidden">
                                    <div className="h-2 bg-red-600 w-full" />
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-black text-red-900">Les Symboles de la Nation</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 sm:gap-6 md:grid-cols-2 p-6">
                                        <SymbolCard
                                            icon="🇫🇷"
                                            title="Le Drapeau"
                                            desc="Bleu, Blanc, Rouge. Emblème de la République."
                                        />
                                        <SymbolCard
                                            icon="🗽"
                                            title="Marianne"
                                            desc="Allégorie de la Liberté et de la République."
                                        />
                                        <SymbolCard
                                            icon="🎵"
                                            title="La Marseillaise"
                                            desc="L'hymne national composé en 1792."
                                        />
                                        <SymbolCard
                                            icon="📜"
                                            title="La Devise"
                                            desc="Liberté, Égalité, Fraternité."
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function TimelineItem({ date, title, description }: { date: string, title: string, description: string }) {
    return (
        <div className="flex gap-6 items-start">
            <div className="min-w-[70px] font-black text-xl text-blue-600 pt-1">{date}</div>
            <div className="pb-4 border-b border-gray-100 last:border-0 w-full">
                <h4 className="font-bold text-lg text-gray-900">{title}</h4>
                <p className="text-gray-500 text-sm">{description}</p>
            </div>
        </div>
    );
}

function SymbolCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className="flex gap-4 items-center p-5 bg-white rounded-2xl border border-gray-100 hover:border-red-100 hover:shadow-md transition-all group">
            <div className="text-4xl group-hover:scale-110 transition-transform">{icon}</div>
            <div>
                <h4 className="font-black text-gray-900">{title}</h4>
                <p className="text-xs text-gray-500 font-medium">{desc}</p>
            </div>
        </div>
    );
}
