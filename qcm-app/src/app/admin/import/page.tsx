'use client';

import React, { useState, useRef } from 'react';
import {
    UploadCloud, FileSpreadsheet, CheckCircle2,
    AlertCircle, List, Database
} from 'lucide-react';
import { doc, writeBatch, collection, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import { useAdminGuard } from '@/lib/adminGuard';

/* ─── Mapping thème Excel → thème Firestore ─── */
const THEME_MAP: Record<string, string> = {
    'Société et citoyenneté': 'societe',
    'Histoire de France': 'histoire',
    'Institutions françaises': 'institutions',
    'Valeurs de la République': 'vals_principes',
    'Droits et devoirs': 'droits',
    'Géographie': 'geographie',
    'Principes et valeurs': 'vals_principes',
};

const LEVEL_MAP: Record<string, string> = {
    'A1': 'Débutant', 'A2': 'Débutant',
    'B1': 'Intermédiaire', 'B2': 'Avancé',
    'Débutant': 'Débutant', 'Intermédiaire': 'Intermédiaire', 'Avancé': 'Avancé',
};

type LogLine = { type: 'info' | 'success' | 'error'; text: string };

export default function AdminImportPage() {
    useAdminGuard();
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [running, setRunning] = useState(false);
    const [count, setCount] = useState<number | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const logRef = useRef<HTMLDivElement>(null);

    const addLog = (type: LogLine['type'], text: string) => {
        setLogs(prev => [...prev, { type, text }]);
        setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50);
    };

    /* ── Compter les questions ── */
    const fetchCount = async () => {
        const snap = await getCountFromServer(collection(db, 'questions'));
        const n = snap.data().count;
        setCount(n);
        addLog('info', `📦 ${n} question(s) actuellement en base.`);
    };

    /* ── Import ── */
    const runImport = async (file: File) => {
        setRunning(true);
        setLogs([]);
        setProgress(null);
        addLog('info', `📂 Lecture du fichier "${file.name}"…`);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rows: any[] = XLSX.utils.sheet_to_json(sheet);

            addLog('info', `✅ ${rows.length} lignes trouvées. Import Firestore…`);
            setProgress({ done: 0, total: rows.length });

            let batch = writeBatch(db);
            let batchCount = 0;
            let totalImported = 0;
            let skipped = 0;

            for (const row of rows) {
                const rawQ = String(row['Question'] || row['question'] || '').trim();
                if (!rawQ) { skipped++; continue; }

                const id = `q_${row['ID'] ?? row['id'] ?? Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                const rawTheme = String(row['Thème'] || row['Theme'] || row['theme'] || '');
                const theme = THEME_MAP[rawTheme] || rawTheme.toLowerCase().replace(/\s+/g, '_') || 'general';
                const rawLevel = String(row['Niveau'] || row['level'] || 'Débutant');
                const level = LEVEL_MAP[rawLevel] || 'Débutant';

                const answerLetter = String(row['Bonne réponse'] || row['Réponse correcte'] || row['correct'] || 'A').toUpperCase();
                const correctMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
                const correct_index = correctMap[answerLetter] ?? 0;

                const choices = [
                    String(row['Réponse A'] || row['A'] || ''),
                    String(row['Réponse B'] || row['B'] || ''),
                    String(row['Réponse C'] || row['C'] || ''),
                    String(row['Réponse D'] || row['D'] || ''),
                ].filter(Boolean);

                if (choices.length < 2) { skipped++; continue; }

                batch.set(doc(db, 'questions', id), {
                    theme, level,
                    exam_type: 'titre_sejour',
                    question: rawQ,
                    choices,
                    correct_index,
                    explanation: String(row['Explication'] || row['explanation'] || ''),
                    tags: [],
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });

                batchCount++;
                totalImported++;

                if (batchCount >= 400) {
                    await batch.commit();
                    setProgress({ done: totalImported, total: rows.length });
                    batch = writeBatch(db);
                    batchCount = 0;
                    await new Promise(r => setTimeout(r, 80));
                }
            }

            if (batchCount > 0) await batch.commit();
            setProgress({ done: totalImported, total: rows.length });

            addLog('success', `🎉 ${totalImported} question(s) importées avec succès !`);
            if (skipped > 0) addLog('info', `⚠️ ${skipped} ligne(s) ignorée(s) (données manquantes).`);
            await fetchCount();

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            addLog('error', `❌ Erreur : ${msg}`);
            if (msg.includes('Missing or insufficient permissions')) {
                addLog('error', '🔐 Droits Firestore insuffisants — vérifiez vos security rules.');
            }
        } finally {
            setRunning(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setFileName(file.name); runImport(file); }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) { setFileName(file.name); runImport(file); }
    };

    /* ── Supprimer tout ── */
    const deleteAll = async () => {
        if (!window.confirm("⚠️ ATTENTION : Vous allez supprimer TOUTES les questions de la base de données.\n\nCette action est irréversible. Êtes-vous sûr ?")) return;

        setRunning(true);
        setLogs([]);
        addLog('info', '🗑️ Suppression de toutes les questions en cours...');

        try {
            const snap = await getDocs(collection(db, 'questions'));
            const total = snap.size;

            if (total === 0) {
                addLog('info', 'La base est déjà vide.');
                setRunning(false);
                return;
            }

            setProgress({ done: 0, total });

            let batch = writeBatch(db);
            let batchCount = 0;
            let deletedCount = 0;

            for (const d of snap.docs) {
                batch.delete(d.ref);
                batchCount++;
                deletedCount++;

                if (batchCount >= 400) {
                    await batch.commit();
                    batch = writeBatch(db);
                    batchCount = 0;
                    setProgress({ done: deletedCount, total });
                    await new Promise(r => setTimeout(r, 50));
                }
            }

            if (batchCount > 0) await batch.commit();

            setProgress({ done: total, total });
            addLog('success', `✅ Base vidée : ${total} questions supprimées.`);
            setCount(0);

        } catch (err: unknown) {
            addLog('error', `❌ Erreur : ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Import de questions</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Importez un fichier <strong>Excel (.xlsx)</strong> pour enrichir la base de données.
                    </p>
                </div>
                <a
                    href="/data.xlsx"
                    download="modele_import_qcm.xlsx"
                    className="flex items-center gap-2 text-sm font-medium text-[#002394] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    Télécharger le modèle
                </a>
            </div>

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => !running && fileRef.current?.click()}
                className={[
                    'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-6',
                    running
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-[#002394]/30 hover:border-[#002394] hover:bg-blue-50',
                ].join(' ')}
                role="button"
                aria-label="Zone de dépôt de fichier Excel"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            >
                <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                <UploadCloud className="h-10 w-10 mx-auto text-[#002394]/40 mb-3" aria-hidden="true" />
                {fileName ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                        {fileName}
                    </div>
                ) : (
                    <>
                        <p className="text-sm font-medium text-gray-700">
                            Glissez votre fichier ici ou <span className="text-[#002394] underline">parcourez</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Formats supportés : .xlsx, .xls</p>
                    </>
                )}
            </div>

            {/* Format aide */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
                <p className="font-semibold mb-2">📋 Format Excel attendu :</p>
                <div className="overflow-x-auto">
                    <table className="text-xs border-collapse" aria-label="Format du fichier Excel">
                        <thead>
                            <tr>
                                {['ID', 'Question', 'Thème', 'Niveau', 'Réponse A', 'Réponse B', 'Réponse C', 'Réponse D', 'Bonne réponse', 'Explication'].map(h => (
                                    <th key={h} className="border border-blue-200 bg-blue-100 px-2 py-1 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {['1', 'Qui vote les lois ?', 'Institutions françaises', 'B1', 'Le Président', 'Le Parlement', 'La Police', 'Le Maire', 'B', 'Le Parlement vote les lois.'].map((v, i) => (
                                    <td key={i} className="border border-blue-200 px-2 py-1">{v}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Progress */}
            {progress && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progression</span>
                        <span>{progress.done} / {progress.total}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#002394] transition-all duration-300 rounded-full"
                            style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                            role="progressbar"
                            aria-valuenow={progress.done}
                            aria-valuemax={progress.total}
                        />
                    </div>
                </div>
            )}

            {/* Logs */}
            {logs.length > 0 && (
                <div
                    ref={logRef}
                    className="bg-gray-900 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs space-y-1 mb-4"
                    aria-live="polite"
                    aria-label="Journal d'import"
                >
                    {logs.map((l, i) => (
                        <div key={i} className={
                            l.type === 'success' ? 'text-emerald-400' :
                                l.type === 'error' ? 'text-red-400' : 'text-gray-300'
                        }>
                            {l.text}
                        </div>
                    ))}
                </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={fetchCount}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#002394] transition-colors"
                    >
                        <Database className="h-4 w-4" aria-hidden="true" />
                        Compter
                    </button>

                    <button
                        onClick={deleteAll}
                        disabled={running}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        Vider la base
                    </button>
                </div>

                {count !== null && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#002394]">
                        <List className="h-4 w-4" aria-hidden="true" />
                        {count} questions en base
                    </div>
                )}

                {logs.some(l => l.type === 'success') && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Import terminé
                    </div>
                )}
                {logs.some(l => l.type === 'error') && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                        Erreur — voir les logs
                    </div>
                )}
            </div>
        </div>
    );
}
