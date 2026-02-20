'use client';

import React, { useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdminGuard } from '@/lib/adminGuard';
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

type LogLine = { type: 'info' | 'success' | 'error'; text: string };

/* ── Supprime toutes les mentions Variante du texte d'une question ── */
function cleanVariante(text: string): string {
    return text
        .replace(/\(Variante\s*\d*\)/gi, '')
        .replace(/^Variante\s*\d*\s*[:.-]?\s*/gi, '')
        .replace(/Variante\s*\d*/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export default function AdminCleanVariantePage() {
    useAdminGuard();
    const router = useRouter();
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    const [logs, setLogs] = useState<LogLine[]>([]);

    const addLog = (type: LogLine['type'], text: string) =>
        setLogs(prev => [...prev, { type, text }]);

    const runClean = async () => {
        setRunning(true);
        setDone(false);
        setLogs([]);
        addLog('info', '🔍 Chargement de toutes les questions…');

        try {
            const snap = await getDocs(collection(db, 'questions'));
            addLog('info', `📦 ${snap.size} question(s) trouvées.`);

            let batch = writeBatch(db);
            let batchCount = 0;
            let totalUpdated = 0;

            for (const docSnapshot of snap.docs) {
                const data = docSnapshot.data();
                const original: string = data.question || '';
                if (!original) continue;

                const cleaned = cleanVariante(original);
                if (cleaned === original) continue;

                addLog('info', `✏️  "${original}" → "${cleaned}"`);
                batch.update(doc(db, 'questions', docSnapshot.id), { question: cleaned });
                batchCount++;
                totalUpdated++;

                if (batchCount >= 400) {
                    await batch.commit();
                    addLog('info', `💾 ${totalUpdated} questions mises à jour (batch intermédiaire)…`);
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            }

            if (batchCount > 0) {
                await batch.commit();
            }

            if (totalUpdated === 0) {
                addLog('success', '✅ Aucune question ne contient de mention "Variante". Base de données déjà propre !');
            } else {
                addLog('success', `🎉 ${totalUpdated} question(s) nettoyée(s) avec succès !`);
            }
            setDone(true);
        } catch (err) {
            addLog('error', `❌ Erreur : ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setRunning(false);
        }
    };

    const logColor: Record<LogLine['type'], string> = {
        info: 'text-gray-600',
        success: 'text-emerald-700 font-semibold',
        error: 'text-red-600 font-semibold',
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#002394] mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Retour
            </button>

            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 rounded-xl">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nettoyer les mentions &quot;Variante&quot;</h1>
                    <p className="text-sm text-gray-500">Supprime <code className="bg-gray-100 px-1 rounded">(Variante X)</code> de tous les textes de questions en base.</p>
                </div>
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mb-6">
                ⚠️ Cette opération modifie directement Firestore. Elle est irréversible mais sans risque : seules les mentions &quot;Variante&quot; sont supprimées, pas les questions.
            </div>

            <button
                onClick={runClean}
                disabled={running || done}
                aria-busy={running}
                className="flex items-center gap-2 px-6 py-3 bg-[#002394] text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
                {running
                    ? <><RefreshCw className="h-4 w-4 animate-spin" /> Nettoyage en cours…</>
                    : done
                        ? <><CheckCircle2 className="h-4 w-4" /> Terminé</>
                        : <><Sparkles className="h-4 w-4" /> Lancer le nettoyage</>
                }
            </button>

            {logs.length > 0 && (
                <div className="mt-6 bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-xs space-y-1">
                    {logs.map((l, i) => (
                        <div key={i} className={logColor[l.type]}>{l.text}</div>
                    ))}
                    {done && (
                        <div className="flex items-center gap-2 text-emerald-400 pt-2 border-t border-gray-700 mt-2">
                            <CheckCircle2 className="h-4 w-4" /> Nettoyage terminé — rechargez la page d&apos;entraînement.
                        </div>
                    )}
                    {!running && !done && logs.some(l => l.type === 'error') && (
                        <div className="flex items-center gap-2 text-red-400 pt-2 border-t border-gray-700 mt-2">
                            <AlertCircle className="h-4 w-4" /> Une erreur est survenue.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
