import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight, BookOpen, Quote } from 'lucide-react';
import { BLOG_POSTS } from '../../data/blog-posts';

export const metadata: Metadata = {
    title: "Le Blog CiviqQuiz | Actualités et Conseils",
    description: "Retrouvez tous nos conseils, actualités et astuces pour réussir votre entretien de naturalisation et votre examen civique.",
};

export default function BlogIndexPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 overflow-hidden">
            {/* Hero Section */}
            <div className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden mb-12">
                <div className="absolute inset-0 bg-slate-900 dark:bg-slate-950 z-0">
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse" />
                    <div className="absolute top-20 -right-20 w-72 h-72 bg-emerald-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
                </div>
                
                <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                    <div className="inline-flex items-center justify-center p-2 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-emerald-300 mb-8 font-black uppercase tracking-widest text-[10px] shadow-lg">
                        <Quote className="w-4 h-4 mr-2" />
                        Conseils & Actualités
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                        Le Blog <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-white to-blue-400">CiviqQuiz</span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                        Stratégies, histoires inspirantes et guides juridiques. Tout ce dont vous avez besoin pour comprendre le processus et réussir sereinement.
                    </p>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-50 dark:bg-slate-950" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0% 100%)' }} />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post, idx) => (
                        <Link 
                            key={post.id} 
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col premium-card-3d bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 hover:border-emerald-200 dark:border-slate-800 dark:hover:border-emerald-500/50 shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/50"
                        >
                            <div className="h-48 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                                {/* Placeholder for an actual image, we use gradient and icon for now */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 group-hover:scale-110 transition-transform duration-700" />
                                <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors duration-500" />
                                
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 shadow-sm">
                                        {post.category}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.readTime}</span>
                                </div>
                                
                                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {post.title}
                                </h2>
                                
                                <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 text-sm leading-relaxed flex-1">
                                    {post.excerpt}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200">
                                        {post.author}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
