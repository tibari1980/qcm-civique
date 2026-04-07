import React, { useRef, useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Download, Printer, ShieldCheck, Award, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';


interface CertificateProps {
    userName: string;
    date: string;
    track: 'csp' | 'cr' | 'naturalisation';
    preview?: boolean;
}

const trackLabels: Record<'csp' | 'cr' | 'naturalisation', string> = {
    csp: 'Carte de Séjour Pluriannuelle',
    cr: 'Carte de Résident',
    naturalisation: 'Naturalisation'
};

export default function CertificateGenerator({ userName, date, track, preview = false }: CertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePrint = () => {
        const printContent = certificateRef.current;
        const windowToPrint = window.open('', '', 'width=900,height=650');
        if (windowToPrint && printContent) {
            windowToPrint.document.write(`
                <html>
                    <head>
                        <title>Certificat de Réussite - ${userName}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                .no-print { display: none; }
                                body { margin: 0; padding: 0; background: white; }
                                .cert-card { box-shadow: none !important; border: none !important; }
                            }
                            @font-face {
                                font-family: 'Devise';
                                src: local('Times New Roman');
                            }
                        </style>
                    </head>
                    <body>
                        <div class="p-4">
                            ${printContent.innerHTML}
                        </div>
                        <script>
                            window.onload = function() {
                                window.print();
                                window.close();
                            }
                        </script>
                    </body>
                </html>
            `);
            windowToPrint.document.close();
        }
    };

    const handleDownloadPDF = async () => {
        if (!certificateRef.current) return;
        setIsGenerating(true);

        try {
            // DYNAMIC IMPORT FOR SCALABILITY & EXTREME LOAD SPEED
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`certificat_reussite_${userName.replace(/\s+/g, '_').toLowerCase()}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            {!preview && (
                <div className="flex flex-wrap justify-center sm:justify-end gap-4 no-print">
                    <Button 
                        variant="outline" 
                        onClick={handlePrint} 
                        className="gap-3 h-14 px-8 rounded-2xl border-2 border-slate-100 font-black text-slate-700 hover:bg-slate-50 hover:border-slate-200 shadow-sm transition-all active:scale-95"
                    >
                        <Printer className="h-5 w-5" /> Imprimer
                    </Button>
                    <Button
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                        className="bg-primary hover:bg-blue-700 h-14 px-8 rounded-2xl gap-3 font-black text-white shadow-3d-md hover:shadow-3d-lg transition-all active:scale-95 disabled:opacity-70"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Download className="h-5 w-5" />
                        )}
                        Télécharger (PDF)
                    </Button>
                </div>
            )}

            {/* Certificate Visual Area */}
            <Card className="premium-card-3d border-none bg-white overflow-hidden max-w-4xl mx-auto cert-card" ref={certificateRef}>
                <CardContent className="p-8 md:p-16 relative min-h-[650px] flex flex-col items-center justify-between text-center border-[16px] border-slate-50 m-4 md:m-8 bg-white shadow-inner">

                    {/* Corner Decorations - Premium Gold Style */}
                    <div className="absolute top-6 left-6 w-32 h-32 border-t-4 border-l-4 border-amber-400/20 rounded-tl-3xl" />
                    <div className="absolute top-6 right-6 w-32 h-32 border-t-4 border-r-4 border-amber-400/20 rounded-tr-3xl" />
                    <div className="absolute bottom-6 left-6 w-32 h-32 border-b-4 border-l-4 border-amber-400/20 rounded-bl-3xl" />
                    <div className="absolute bottom-6 right-6 w-32 h-32 border-b-4 border-r-4 border-amber-400/20 rounded-br-3xl" />

                    {/* Official Banner */}
                    <div className="absolute top-0 left-0 right-0 h-2 flex opacity-80" aria-hidden="true">
                        <div className="h-full w-1/3 bg-[#002654]" />
                        <div className="h-full w-1/3 bg-white" />
                        <div className="h-full w-1/3 bg-[#ED2939]" />
                    </div>

                    {/* Header with Republic Flag & Devise */}
                    <div className="space-y-8 pt-8 w-full">
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex h-14 w-40 shadow-3d-sm rounded-lg overflow-hidden border-2 border-white">
                                <div className="bg-[#002654] w-1/3 h-full" />
                                <div className="bg-white w-1/3 h-full" />
                                <div className="bg-[#ED2939] w-1/3 h-full" />
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-400 antialiased">République Française</h1>
                                <div className="flex items-center gap-4 justify-center">
                                    <div className="h-px w-8 bg-slate-200" />
                                    <p className="text-[14px] font-serif italic font-black text-slate-600 tracking-widest uppercase">
                                        Liberté • Égalité • Fraternité
                                    </p>
                                    <div className="h-px w-8 bg-slate-200" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 relative">
                            <h2 className="text-6xl md:text-7xl font-serif italic text-slate-900 drop-shadow-md tracking-tight">
                                Certificat de Réussite
                            </h2>
                            <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 mx-auto mt-8 rounded-full shadow-3d-sm" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-10 my-8">
                        <p className="text-lg text-gray-500 font-medium font-serif italic">Le présent certificat est fièrement décerné à</p>
                        <h3 className="text-6xl font-black text-gray-900 tracking-tight underline decoration-blue-600/20 underline-offset-[12px]">
                            {userName}
                        </h3>
                        <p className="max-w-lg mx-auto text-gray-600 leading-relaxed font-medium px-4">
                            Pour avoir démontré une maîtrise exceptionnelle et une connaissance approfondie de
                            <span className="text-blue-700 font-bold"> l&apos;histoire, de la culture et des valeurs </span>
                            de la nation française dans le cadre du parcours officiel
                            <span className="text-gray-900 font-bold"> {trackLabels[track]}</span>.
                        </p>
                    </div>

                    {/* Bottom Info */}
                    <div className="w-full flex justify-between items-end pb-8 px-8 md:px-16">
                        <div className="text-left space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Établi le</p>
                            <div className="text-xl font-black text-slate-900 border-b-2 border-slate-100 pb-2 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-primary" />
                                {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>

                        <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="relative group mb-4"
                        >
                            <div className="absolute -top-24 -left-24 opacity-5 group-hover:opacity-10 transition-opacity" aria-hidden="true">
                                <ShieldCheck className="w-64 h-64 text-blue-900" />
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-[3rem] p-8 border-8 border-white shadow-3d-lg relative z-10 transition-transform group-hover:rotate-6">
                                <Award className="w-16 h-16 text-amber-600 animate-float" />
                            </div>
                            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/60 drop-shadow-sm">Sceau d&apos;Excellence Civique</p>
                        </motion.div>

                        <div className="text-right space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Validation</p>
                            <div className="h-20 flex flex-col items-end justify-center">
                                <span className="font-serif italic text-3xl text-slate-900 leading-tight">CiviqQuiz Online</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-blue-600/50 uppercase tracking-[0.2em]">Signature Numérique</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Official Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-15deg] overflow-hidden select-none">
                        <h4 className="text-[200px] font-black uppercase tracking-tighter whitespace-nowrap antialiased">CIVIQQUIZ RÉPUBLIQUE</h4>
                    </div>
                </CardContent>
            </Card>

            {/* Success Message for the user */}
            {!preview && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card-3d bg-white border-primary/10 p-8 rounded-[2.5rem] text-center"
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-2xl shadow-3d-sm">
                            <ShieldCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-slate-800 text-lg font-black tracking-tight antialiased">
                            Félicitations {userName} ! Ce document atteste officiellement de votre maîtrise exemplaire.
                        </p>
                        <p className="text-slate-500 text-sm font-medium">
                            Partagez-le ou conservez-le pour prouver votre engagement citoyen.
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
