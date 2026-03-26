'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Flag,
    History,
    Gavel,
    BookOpen,
    SearchX
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative font-sans">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#002394] via-white to-[#E42517] z-50" />

            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-700" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", damping: 25 }}
                className="max-w-2xl w-full z-10"
            >
                <Card className="premium-card-3d border-none bg-white/95 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
                    <CardContent className="p-8 md:p-12 text-center">
                        {/* Icon 404 */}
                        <motion.div
                            initial={{ rotate: -5, y: 0 }}
                            animate={{ rotate: 5, y: -10 }}
                            transition={{ repeat: Infinity, duration: 3, repeatType: "reverse", ease: "easeInOut" }}
                            className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-blue-50 text-primary mb-8 shadow-3d-sm border-2 border-white"
                        >
                            <SearchX size={48} className="animate-float" />
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                            Oups ! Page <br />
                            <span className="text-blue-600">perdue dans l'histoire.</span>
                        </h1>

                        <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto leading-relaxed">
                            Il semble que le chemin vers cette ressource ne figure pas dans la <span className="font-bold text-gray-800">Constitution</span> de notre site.
                        </p>

                        {/* Main Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
                            <Link href="/dashboard" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full h-14 px-8 text-base font-black bg-primary hover:bg-blue-700 shadow-3d-md hover:shadow-3d-lg transition-all active:scale-95 group rounded-2xl text-white">
                                    <LayoutDashboard className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                                    Retour au tableau de bord
                                </Button>
                            </Link>
                            <Link href="/contact" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full h-14 px-8 text-base font-black border-2 border-slate-100 hover:border-blue-100 hover:bg-blue-50 text-slate-600 transition-all rounded-2xl active:scale-95">
                                    <Flag className="mr-3 h-5 w-5" />
                                    Signaler un problème
                                </Button>
                            </Link>
                        </div>

                        {/* Suggestions */}
                        <div className="border-t border-gray-100 pt-8">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                                Peut-être cherchiez-vous ?
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Link href="/training" className="group">
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all text-center">
                                        <History className="mx-auto mb-2 text-blue-500 h-5 w-5" />
                                        <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600">Chronologie FR</span>
                                    </div>
                                </Link>
                                <Link href="/training" className="group">
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all text-center">
                                        <Gavel className="mx-auto mb-2 text-blue-500 h-5 w-5" />
                                        <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600">Droits & Devoirs</span>
                                    </div>
                                </Link>
                                <Link href="/about" className="group">
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all text-center">
                                        <BookOpen className="mx-auto mb-2 text-blue-500 h-5 w-5" />
                                        <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600">Guide Examen</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </CardContent>

                    {/* Footer Decoration */}
                    <div className="h-2 flex">
                        <div className="flex-1 bg-[#002394]" />
                        <div className="flex-1 bg-white" />
                        <div className="flex-1 bg-[#E42517]" />
                    </div>
                </Card>

                <p className="mt-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest opacity-60">
                    Liberté • Égalité • Fraternité
                </p>
            </motion.div>
        </div>
    );
}
