'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../../ui/button';
import { Award, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export function Premium3DCTA() {
    const cardRef = useRef<HTMLDivElement>(null);
    
    // Position of the mouse on the card (normalized between -0.5 and 0.5)
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    // Adding spring physics for smooth return to center
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
    
    // Tilt intensity (Adjust 15deg to be more or less intense)
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
    
    // Glare & lighting effects
    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);
    const shadowX = useTransform(mouseXSpring, [-0.5, 0.5], ["-20px", "20px"]);
    const shadowY = useTransform(mouseYSpring, [-0.5, 0.5], ["-20px", "20px"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        
        const width = rect.width;
        const height = rect.height;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <section className="py-32 relative overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* Background Ambient Glow */}
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] opacity-60 mix-blend-screen animate-pulse" />
                <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen" />
                <div className="absolute top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-16 lg:gap-24">
                
                {/* Left Content (Copywriting) */}
                <div className="flex-1 text-left space-y-8 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black tracking-widest text-xs uppercase shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    >
                        <Sparkles className="w-4 h-4" /> La Clé pour la réussite
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1]"
                    >
                        L'Attestation <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">à portée de clics.</span>
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-slate-400 text-xl font-light leading-relaxed"
                    >
                        Ne laissez rien au hasard. Débloquez instantanément vos entraînements personnalisés, maîtrisez les attentes de la préfecture et décrochez votre certificat dès la première tentative.
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Link href="/register">
                            <Button className="h-16 px-10 text-lg rounded-full bg-white text-slate-900 border border-transparent hover:bg-slate-200 transition-all font-black tracking-widest uppercase hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] group overflow-hidden relative">
                                <div className="absolute inset-0 w-full h-full flex justify-center items-center pointer-events-none group-hover:bg-gradient-to-tr from-white/0 via-black/5 to-white/0 transition-opacity" />
                                Je Démarre Mon Parcours
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Right Content (3D Card) */}
                <div 
                    className="flex-1 w-full max-w-[500px]" 
                    style={{ perspective: "1500px" }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    ref={cardRef}
                >
                    <motion.div 
                        style={{
                            rotateX,
                            rotateY,
                            transformStyle: "preserve-3d",
                        }}
                        className="w-full aspect-[4/5] rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] p-8 relative flex flex-col justify-between overflow-hidden"
                    >
                        {/* Dynamic Shadow underneath inner content */}
                        <motion.div 
                            style={{ 
                                x: shadowX, 
                                y: shadowY 
                            }} 
                            className="absolute -inset-10 bg-black/40 blur-2xl z-0" 
                        />
                        
                        {/* Dynamic Glare Reflection */}
                        <motion.div 
                            style={{
                                background: "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 60%)",
                                left: glareX,
                                top: glareY,
                                transform: "translate(-50%, -50%)",
                            }}
                            className="absolute w-[200%] h-[200%] mix-blend-overlay z-20 pointer-events-none opacity-50 transition-opacity duration-300"
                        />
                        
                        <div className="relative z-10 w-full flex justify-between items-center" style={{ transform: "translateZ(40px)" }}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Pass Officiel 2026</h4>
                                    <p className="text-slate-400 text-xs font-semibold">CiviqQuiz Platform</p>
                                </div>
                            </div>
                            <TricolorBadge />
                        </div>
                        
                        <div className="relative z-10 space-y-4" style={{ transform: "translateZ(80px)" }}>
                            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center p-[2px] mx-auto shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border border-yellow-500/30">
                                    <Award className="w-10 h-10 text-yellow-400" />
                                </div>
                            </div>
                            <h3 className="text-white text-3xl font-black text-center tracking-tight">CERTIFIÉ</h3>
                            <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-md shadow-inner">
                                <p className="text-white/80 text-xs uppercase font-black tracking-widest text-center mb-2">Score de conformité</p>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                     <div className="h-full w-[98%] bg-gradient-to-r from-blue-500 via-white to-red-500 rounded-full" />
                                </div>
                                <div className="flex justify-between text-[10px] text-white/50 mt-2 font-bold uppercase tracking-widest">
                                    <span>Examen</span>
                                    <span className="text-green-400">Prêt</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-4" style={{ transform: "translateZ(30px)" }}>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Candidat</p>
                                <div className="h-2 w-24 bg-white/20 rounded animate-pulse" />
                            </div>
                            <div className="text-right">
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Session</p>
                                <p className="text-white text-xs font-bold">N° #CX749A</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

const TricolorBadge = () => (
    <div className="flex h-5 w-8 rounded overflow-hidden shadow-sm">
        <div className="flex-1 bg-blue-600" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-red-600" />
    </div>
);
