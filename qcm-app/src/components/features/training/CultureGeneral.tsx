'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, Map, Flag } from 'lucide-react';
import Link from 'next/link';

export default function CultureGeneral() {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Culture Générale</h1>
                </div>

                <Tabs defaultValue="history" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value="history" className="text-lg py-3"><BookOpen className="mr-2 h-5 w-5" /> Histoire</TabsTrigger>
                        <TabsTrigger value="geography" className="text-lg py-3"><Map className="mr-2 h-5 w-5" /> Géographie</TabsTrigger>
                        <TabsTrigger value="symbols" className="text-lg py-3"><Flag className="mr-2 h-5 w-5" /> Symboles</TabsTrigger>
                    </TabsList>

                    <TabsContent value="history" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl text-[var(--color-primary)]">Les Grandes Dates</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <TimelineItem date="1789" title="La Révolution Française" description="Prise de la Bastille et Déclaration des Droits de l'Homme et du Citoyen." />
                                <TimelineItem date="1848" title="Abolition de l'esclavage" description="Instauration du suffrage universel masculin." />
                                <TimelineItem date="1905" title="Séparation de l'Église et de l'État" description="Loi fondatrice de la laïcité en France." />
                                <TimelineItem date="1944" title="Droit de vote des femmes" description="Les femmes votent pour la première fois en 1945." />
                                <TimelineItem date="1958" title="La Ve République" description="Adoption de la constitution actuelle, initiée par le Général de Gaulle." />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="geography" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl text-[var(--color-primary)]">Géographie de la France</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-lg">Fleuves principaux</h3>
                                    <ul className="list-disc list-inside text-gray-700">
                                        <li>La Seine (Paris)</li>
                                        <li>La Loire (le plus long)</li>
                                        <li>Le Rhône</li>
                                        <li>La Garonne</li>
                                        <li>Le Rhin (frontière)</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-lg">Montagnes</h3>
                                    <ul className="list-disc list-inside text-gray-700">
                                        <li>Les Alpes (Mont Blanc)</li>
                                        <li>Les Pyrénées</li>
                                        <li>Le Massif Central</li>
                                        <li>Le Jura</li>
                                        <li>Les Vosges</li>
                                    </ul>
                                </div>
                                <div className="md:col-span-2 mt-4 bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg text-blue-800 mb-2">L&apos;Outre-Mer (DROM-COM)</h3>
                                    <p className="text-gray-700">Guadeloupe, Martinique, Guyane, La Réunion, Mayotte, etc.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="symbols" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl text-[var(--color-primary)]">Les Symboles de la République</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <SymbolCard
                                    icon="🇫🇷"
                                    title="Le Drapeau Tricolore"
                                    desc="Bleu, Blanc, Rouge. Emblème national figurant dans l'article 2 de la Constitution."
                                />
                                <SymbolCard
                                    icon="🗽"
                                    title="Marianne"
                                    desc="Allégorie de la République. Son buste est présent dans toutes les mairies."
                                />
                                <SymbolCard
                                    icon="🎵"
                                    title="La Marseillaise"
                                    desc="L'hymne national, composé par Rouget de Lisle en 1792."
                                />
                                <SymbolCard
                                    icon="📜"
                                    title="La Devise"
                                    desc="Liberté, Égalité, Fraternité. Héritage du siècle des Lumières."
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function TimelineItem({ date, title, description }: { date: string, title: string, description: string }) {
    return (
        <div className="flex gap-4 items-start">
            <div className="min-w-[80px] font-bold text-xl text-[var(--color-primary)]">{date}</div>
            <div>
                <h4 className="font-semibold text-lg">{title}</h4>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    );
}

function SymbolCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
    return (
        <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border hover:shadow-sm transition-shadow">
            <div className="text-4xl">{icon}</div>
            <div>
                <h4 className="font-bold text-lg mb-1">{title}</h4>
                <p className="text-sm text-gray-600">{desc}</p>
            </div>
        </div>
    );
}
