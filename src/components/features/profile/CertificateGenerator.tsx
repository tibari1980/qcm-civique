import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, ShieldCheck, Award, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CertificateProps {
    userName: string;
    date: string;
    track: 'residence' | 'naturalisation';
    preview?: boolean;
}

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
                <div className="flex justify-end gap-3 no-print">
                    <Button variant="outline" onClick={handlePrint} className="gap-2 h-11 px-6 rounded-xl border-gray-200 hover:bg-gray-50 font-bold transition-all">
                        <Printer className="h-4 w-4" /> Imprimer
                    </Button>
                    <Button
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-70"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Télécharger (PDF)
                    </Button>
                </div>
            )}

            {/* Certificate Visual Area */}
            <Card className="border-none shadow-2xl bg-white overflow-hidden max-w-4xl mx-auto cert-card" ref={certificateRef}>
                <CardContent className="p-12 relative min-h-[600px] flex flex-col items-center justify-between text-center border-[12px] border-double border-blue-50/50 m-4 bg-white">

                    {/* Corner Decorations */}
                    <div className="absolute top-4 left-4 w-20 h-20 border-t-4 border-l-4 border-blue-600/10" />
                    <div className="absolute top-4 right-4 w-20 h-20 border-t-4 border-r-4 border-blue-600/10" />
                    <div className="absolute bottom-4 left-4 w-20 h-20 border-b-4 border-l-4 border-blue-600/10" />
                    <div className="absolute bottom-4 right-4 w-20 h-20 border-b-4 border-r-4 border-blue-600/10" />

                    {/* Header with Republic Flag & Devise */}
                    <div className="space-y-6 pt-4 w-full">
                        <div className="flex flex-col items-center gap-4">
                            {/* Official Tricolored Header */}
                            <div className="flex h-12 w-32 shadow-sm rounded-sm overflow-hidden border border-gray-100">
                                <div className="bg-[#002654] w-1/3 h-full" />
                                <div className="bg-white w-1/3 h-full" />
                                <div className="bg-[#ED2939] w-1/3 h-full" />
                            </div>

                            <div className="space-y-1">
                                <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">République Française</h1>
                                <p className="text-[11px] font-serif italic font-bold text-gray-500 tracking-wider">
                                    Liberté • Égalité • Fraternité
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <h2 className="text-5xl font-serif italic text-blue-900 drop-shadow-sm">Certificat de Réussite</h2>
                            <div className="w-16 h-0.5 bg-amber-400 mx-auto mt-4" />
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
                            <span className="text-gray-900 font-bold"> {track === 'naturalisation' ? 'Naturalisation' : 'Titre de Séjour'}</span>.
                        </p>
                    </div>

                    {/* Bottom Info */}
                    <div className="w-full flex justify-between items-end pb-4 px-10">
                        <div className="text-left space-y-2">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Fait le</p>
                            <p className="text-base font-bold text-gray-800 border-b border-gray-100 pb-1">
                                {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div className="relative group">
                            <div className="absolute -top-16 -left-16 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                <ShieldCheck className="w-40 h-40 text-blue-900" />
                            </div>
                            <div className="bg-amber-50 rounded-full p-6 border-4 border-white shadow-xl relative z-10">
                                <Award className="w-12 h-12 text-amber-600" />
                            </div>
                            <p className="mt-4 text-[9px] font-black uppercase tracking-tighter text-gray-400">Sceau d&apos;Excellence Civique</p>
                        </div>

                        <div className="text-right space-y-2">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Signature</p>
                            <div className="h-14 flex flex-col items-end justify-center">
                                <span className="font-serif italic text-2xl text-blue-900 leading-tight">Civisme IA</span>
                                <span className="text-[8px] font-bold text-blue-600/50 uppercase tracking-widest">Validé numériquement</span>
                            </div>
                        </div>
                    </div>

                    {/* Official Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] rotate-[-15deg] overflow-hidden select-none">
                        <h4 className="text-[180px] font-black uppercase tracking-tighter whitespace-nowrap">République</h4>
                    </div>
                </CardContent>
            </Card>

            {/* Success Message for the user */}
            {!preview && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl text-center shadow-sm"
                >
                    <p className="text-blue-800 text-sm font-semibold flex items-center justify-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        Félicitations {userName} ! Ce document atteste officiellement de votre succès à l&apos;examen.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
