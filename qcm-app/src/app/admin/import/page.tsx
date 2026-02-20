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
import { cleanQuestionText } from '@/utils/cleaning';
import { useSoundEffects } from '@/hooks/useSoundEffects';

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
    const { playSound } = useSoundEffects();
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [progress, setProgress] = useState<{ done: number; total: number; imported: number; skipped: number } | null>(null);
    const [running, setRunning] = useState(false);
    const [count, setCount] = useState<number | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const [skippedDuplicates, setSkippedDuplicates] = useState<string[]>([]);
    const [summary, setSummary] = useState<{ imported: number; duplicates: number; empty: number; badData: number; total: number } | null>(null);

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
        setSkippedDuplicates([]);
        setSummary(null);
        addLog('info', `📂 Lecture du fichier "${file.name}"…`);

        try {
            // ── Parallélisation : parsing Excel + fetch Firestore simultanés ──
            addLog('info', '⚡ Lecture du fichier et chargement de la base en parallèle…');
            const [arrayBuffer, existingSnap] = await Promise.all([
                file.arrayBuffer(),
                getDocs(collection(db, 'questions')),
            ]);

            const workbook = XLSX.read(arrayBuffer);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rows: any[] = XLSX.utils.sheet_to_json(sheet);

            // Construire le Set des questions existantes (comparaison insensible à la casse)
            const existingTexts = new Set<string>(
                existingSnap.docs.map(d => String(d.data().question || '').trim().toLowerCase())
            );
            addLog('info', `✅ ${rows.length} ligne(s) dans le fichier — ${existingTexts.size} question(s) déjà en base.`);

            setProgress({ done: 0, total: rows.length, imported: 0, skipped: 0 });

            let batch = writeBatch(db);
            let batchCount = 0;
            let totalImported = 0;
            let totalProcessed = 0;  // lignes traitées (importées + ignorées)
            let skippedEmpty = 0;    // lignes vides / données manquantes
            let skippedBadData = 0;  // lignes avec < 2 choix
            const duplicatesList: string[] = [];

            for (const row of rows) {
                totalProcessed++;

                const rawText = String(row['Question'] || row['question'] || '').trim();
                if (!rawText) { skippedEmpty++; setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData }); continue; }

                // ── Nettoyage du texte de la question pour le STOCKAGE ──
                const rawQ = cleanQuestionText(rawText);

                if (!rawQ) { skippedEmpty++; setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData }); continue; }

                // ── Vérification doublon contre la base Firestore (texte nettoyé) ──
                if (existingTexts.has(rawQ.toLowerCase())) {
                    duplicatesList.push(rawQ);
                    setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData });
                    continue;
                }
                // Déduplication intra-fichier sur le TEXTE BRUT (avant nettoyage)
                // → évite de confondre "Variante 1 : Q" et "Variante 2 : Q" avec le même Q
                if (existingTexts.has(rawText.toLowerCase())) {
                    duplicatesList.push(rawQ);
                    setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData });
                    continue;
                }
                // Ajouter les deux formes pour couvrir tous les cas de doublons
                existingTexts.add(rawQ.toLowerCase());
                existingTexts.add(rawText.toLowerCase());

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

                if (choices.length < 2) {
                    skippedBadData++;
                    setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData });
                    continue;
                }

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

                if (batchCount >= 450) {
                    await batch.commit();
                    playSound('click'); // "Bip" sound after each batch
                    setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData });
                    batch = writeBatch(db);
                    batchCount = 0;
                    await new Promise(r => setTimeout(r, 100));
                }
            }

            if (batchCount > 0) {
                await batch.commit();
                playSound('success');
            }


            const totalIgnored = duplicatesList.length + skippedEmpty + skippedBadData;
            // Barre à 100%
            setProgress({ done: rows.length, total: rows.length, imported: totalImported, skipped: totalIgnored });

            // Récap visuel
            setSummary({ imported: totalImported, duplicates: duplicatesList.length, empty: skippedEmpty, badData: skippedBadData, total: rows.length });

            addLog('success', `🎉 Import terminé — ${totalImported} importées, ${totalIgnored} ignorées sur ${rows.length} lignes.`);

            if (duplicatesList.length > 0) setSkippedDuplicates(duplicatesList);
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

            setProgress({ done: 0, total, imported: 0, skipped: 0 });

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
                    setProgress({ done: deletedCount, total, imported: 0, skipped: 0 });
                    await new Promise(r => setTimeout(r, 50));
                }
            }

            if (batchCount > 0) await batch.commit();

            setProgress({ done: total, total, imported: 0, skipped: 0 });
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
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span className="font-medium">Lignes traitées</span>
                        <span className="font-bold">{progress.done} / {progress.total}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full bg-[#002394] transition-all duration-300 rounded-full"
                            style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                            role="progressbar"
                            aria-valuenow={progress.done}
                            aria-valuemax={progress.total}
                        />
                    </div>
                    <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            Importées : {progress.imported}
                        </span>
                        <span className="flex items-center gap-1 text-amber-700 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                            Ignorées : {progress.skipped}
                        </span>
                    </div>
                </div>
            )}

            {/* ── Récapitulatif visuel post-import ── */}
            {summary && (
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 mb-4">
                    <p className="text-sm font-bold text-emerald-800 mb-3">📊 Résumé de l&apos;import</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white rounded-lg p-3 text-center border border-emerald-100 shadow-sm">
                            <span className="block text-2xl font-extrabold text-emerald-600">{summary.imported}</span>
                            <span className="text-xs text-emerald-700 font-medium">✅ Importées</span>
                        </div>
                        <div className="bg-white rounded-lg p-3 text-center border border-amber-100 shadow-sm">
                            <span className="block text-2xl font-extrabold text-amber-600">{summary.duplicates}</span>
                            <span className="text-xs text-amber-700 font-medium">🔁 Doublons ignorés</span>
                        </div>
                        {summary.empty > 0 && (
                            <div className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm">
                                <span className="block text-2xl font-extrabold text-gray-500">{summary.empty}</span>
                                <span className="text-xs text-gray-600 font-medium">📭 Lignes vides</span>
                            </div>
                        )}
                        {summary.badData > 0 && (
                            <div className="bg-white rounded-lg p-3 text-center border border-red-100 shadow-sm">
                                <span className="block text-2xl font-extrabold text-red-500">{summary.badData}</span>
                                <span className="text-xs text-red-600 font-medium">⚠️ Données invalides</span>
                            </div>
                        )}
                        <div className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm col-span-2 sm:col-span-1">
                            <span className="block text-2xl font-extrabold text-gray-700">{summary.total}</span>
                            <span className="text-xs text-gray-600 font-medium">📋 Total lignes</span>
                        </div>
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

            {/* Questions ignorées (doublons) */}
            {skippedDuplicates.length > 0 && (
                <details className="mb-4 border border-amber-200 bg-amber-50 rounded-xl overflow-hidden">
                    <summary
                        className="px-4 py-3 text-sm font-semibold text-amber-800 cursor-pointer flex items-center gap-2 select-none hover:bg-amber-100 transition-colors"
                        aria-label={`${skippedDuplicates.length} questions ignorées car déjà présentes en base`}
                    >
                        <span className="text-base">🔁</span>
                        {skippedDuplicates.length} question(s) ignorée(s) — déjà présente(s) dans la base
                        <span className="ml-auto text-xs text-amber-600 font-normal">(cliquez pour afficher)</span>
                    </summary>
                    <ul className="px-4 pb-4 pt-2 space-y-1 max-h-60 overflow-y-auto" aria-label="Liste des questions ignorées">
                        {skippedDuplicates.map((q, i) => (
                            <li key={i} className="text-xs text-amber-900 flex items-start gap-2">
                                <span className="mt-0.5 text-amber-400 shrink-0">•</span>
                                <span>{q}</span>
                            </li>
                        ))}
                    </ul>
                </details>
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
