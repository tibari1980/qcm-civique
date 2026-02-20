'use client';

import React, { useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdminGuard } from '@/lib/adminGuard';
import { ArrowLeft, Copy, CheckCircle2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cleanQuestionText } from '@/utils/cleaning';

type LogLine = { type: 'info' | 'success' | 'error' | 'warn'; text: string };

export default function AdminDeduplicatePage() {
    useAdminGuard();
    const router = useRouter();
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [preview, setPreview] = useState<{ text: string; copies: number }[]>([]);
    const [phase, setPhase] = useState<'idle' | 'preview' | 'done'>('idle');

    const addLog = (type: LogLine['type'], text: string) =>
        setLogs(prev => [...prev, { type, text }]);

    const runDedup = async () => {
        setRunning(true);
        setDone(false);
        setLogs([]);
        setPreview([]);
        addLog('info', '🔍 Chargement de toutes les questions…');

        try {
            const snap = await getDocs(collection(db, 'questions'));
            addLog('info', `📦 ${snap.size} document(s) trouvés en base.`);

            // Grouper par texte normalisé (nettoyé des variantes)
            const groups = new Map<string, { id: string; text: string }[]>();
            for (const d of snap.docs) {
                const rawText = (d.data().question || '').trim();
                const cleanedText = cleanQuestionText(rawText);
                const key = cleanedText.toLowerCase();
                if (!key) continue;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push({ id: d.id, text: rawText });
            }

            // Identifier les doublons
            const duplicates: { key: string; docs: { id: string; text: string }[] }[] = [];
            groups.forEach((docs, key) => {
                if (docs.length > 1) duplicates.push({ key, docs });
            });

            addLog('info', `🔁 ${duplicates.length} groupe(s) de doublons détecté(s).`);

            if (duplicates.length === 0) {
                addLog('success', '✅ Aucun doublon trouvé. La base est déjà propre !');
                setDone(true);
                setPhase('done');
                setRunning(false);
                return;
            }

            // Afficher le preview
            setPreview(duplicates.map(d => ({
                text: d.docs[0].text,
                copies: d.docs.length,
            })));
            setPhase('preview');

            // Supprimer les copies (garder doc[0], supprimer doc[1..n])
            let batch = writeBatch(db);
            let batchCount = 0;
            let totalDeleted = 0;

            for (const group of duplicates) {
                const toDelete = group.docs.slice(1); // Garder le premier
                addLog('warn', `🗑️  "${group.docs[0].text.slice(0, 60)}…" — ${toDelete.length} copie(s) supprimée(s).`);
                for (const d of toDelete) {
                    batch.delete(doc(db, 'questions', d.id));
                    batchCount++;
                    totalDeleted++;
                    if (batchCount >= 400) {
                        await batch.commit();
                        addLog('info', `💾 Lot intermédiaire commité (${totalDeleted} supprimés)…`);
                        batch = writeBatch(db);
                        batchCount = 0;
                    }
                }
            }

            if (batchCount > 0) await batch.commit();

            addLog('success', `🎉 ${totalDeleted} doublon(s) supprimé(s) — ${snap.size - totalDeleted} questions restantes en base.`);
            setDone(true);
            setPhase('done');
        } catch (err) {
            addLog('error', `❌ Erreur : ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setRunning(false);
        }
    };

    const logColor: Record<LogLine['type'], string> = {
        info: 'text-gray-300',
        success: 'text-emerald-400 font-semibold',
        error: 'text-red-400 font-semibold',
        warn: 'text-amber-400',
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> Retour
            </button>

            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-50 rounded-xl">
                    <Copy className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Supprimer les questions dupliquées</h1>
                    <p className="text-sm text-gray-500">Détecte et supprime les doublons en gardant une seule version de chaque question.</p>
                </div>
            </div>

            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 mb-6">
                ⚠️ Cette opération supprime définitivement les copies en doublon de Firestore. Les questions uniques ne sont pas touchées.
            </div>

            {/* Preview of duplicates before deletion */}
            {phase === 'preview' && preview.length > 0 && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-amber-800 mb-3">
                        <Trash2 className="inline h-4 w-4 mr-1" />
                        {preview.length} groupe(s) de doublons seront purgés :
                    </p>
                    <ul className="space-y-1 max-h-40 overflow-y-auto">
                        {preview.map((p, i) => (
                            <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                                <span className="bg-amber-200 text-amber-800 rounded px-1 font-bold flex-shrink-0">×{p.copies}</span>
                                <span className="truncate">{p.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={runDedup}
                disabled={running || done}
                aria-busy={running}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
                {running
                    ? <><RefreshCw className="h-4 w-4 animate-spin" /> Suppression en cours…</>
                    : done
                        ? <><CheckCircle2 className="h-4 w-4" /> Terminé</>
                        : <><Trash2 className="h-4 w-4" /> Détecter et supprimer les doublons</>
                }
            </button>

            {logs.length > 0 && (
                <div className="mt-6 bg-gray-900 rounded-xl p-4 max-h-80 overflow-y-auto font-mono text-xs space-y-1">
                    {logs.map((l, i) => (
                        <div key={i} className={logColor[l.type]}>{l.text}</div>
                    ))}
                    {done && (
                        <div className="flex items-center gap-2 text-emerald-400 pt-2 border-t border-gray-700 mt-2">
                            <CheckCircle2 className="h-4 w-4" /> Opération terminée.
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
