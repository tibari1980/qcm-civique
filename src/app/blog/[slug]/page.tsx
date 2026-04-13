import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, User, Share2 } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../../../data/blog-posts';

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) return { title: 'Article non trouvé' };

    return {
        title: `${post.title} | Blog CiviqQuiz`,
        description: post.excerpt,
    };
}

// Un parseur très basique pour le markdown local (h2, h3, listes, gras)
const renderMarkdown = (text: string) => {
    const lines = text.split('\\n');
    return lines.map((line, index) => {
        const key = `line-${index}`;
        
        let processedLine = line;
        // Bold
        processedLine = processedLine.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');

        if (line.startsWith('### ')) {
            return <h3 key={key} className="text-2xl font-black text-slate-900 dark:text-white mt-10 mb-4" dangerouslySetInnerHTML={{ __html: processedLine.substring(4) }} />;
        }
        if (line.startsWith('## ')) {
            return <h2 key={key} className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-12 mb-6" dangerouslySetInnerHTML={{ __html: processedLine.substring(3) }} />;
        }
        if (line.startsWith('- ')) {
            return (
                <ul key={key} className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300">
                    <li className="mb-2" dangerouslySetInnerHTML={{ __html: processedLine.substring(2) }} />
                </ul>
            );
        }
        if (line.trim() === '') return <div key={key} className="h-4" />;

        return <p key={key} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: processedLine }} />;
    });
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    const otherPosts = BLOG_POSTS.filter(p => p.id !== post.id).slice(0, 2);

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Minimalist Header for reading mode */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white pt-24 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-600/30 rounded-full filter blur-[100px] animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full filter blur-[100px]" />
                </div>

                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                    <Link href="/blog" className="inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-8 font-bold text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Retour au blog
                    </Link>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-300 mb-6">
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-emerald-400 border border-emerald-500/30">
                            {post.category}
                        </span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {post.readTime} de lecture</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
                        {post.title}
                    </h1>

                    <p className="text-xl text-slate-300 font-medium leading-relaxed max-w-3xl">
                        {post.excerpt}
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-20">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 sm:p-12 mb-16">
                    <div className="flex items-center justify-between pb-8 mb-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white">{post.author}</div>
                                <div className="text-sm text-slate-500">Expert CiviqQuiz</div>
                            </div>
                        </div>
                        <button className="p-3 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 transition-colors" title="Partager">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none prose-emerald">
                        {renderMarkdown(post.content)}
                    </div>
                </div>

                {/* Read Next Section */}
                {otherPosts.length > 0 && (
                    <div className="mt-20">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                            Lire la suite
                            <div className="h-1 w-12 bg-emerald-500 rounded-full" />
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {otherPosts.map((other) => (
                                <Link 
                                    key={other.id} 
                                    href={`/blog/${other.slug}`}
                                    className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
                                        <span className="text-emerald-500">{other.category}</span>
                                        <span>•</span>
                                        <span>{other.readTime}</span>
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                        {other.title}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
