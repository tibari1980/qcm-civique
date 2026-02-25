'use client';

import React, { useState, useRef } from 'react';
import {
    UploadCloud, FileSpreadsheet, CheckCircle2,
    AlertCircle, List, Database, RotateCcw
} from 'lucide-react';
import { doc, writeBatch, collection, getCountFromServer, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import { useAdminGuard } from '@/lib/adminGuard';
import { cleanQuestionText, normalizeQuestionText } from '@/utils/cleaning';
import { useSoundEffects } from '@/hooks/useSoundEffects';

/* ─── Normalisation des chaînes (suppression accents, espaces, etc.) ─── */
const normalizeTheme = (s: string) =>
    String(s || '')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .replace(/_/g, ' ')             // Remplace underscores par espaces
        .replace(/\s+/g, ' ')           // Compresse les espaces multiples
        .trim();

/* ─── Mapping thème Excel → thème Firestore ─── */
// On stocke les clés NORMALISÉES pour faciliter la recherche
const THEME_MAP: Record<string, string> = {
    [normalizeTheme('société et citoyenneté')]: 'societe',
    [normalizeTheme('histoire de france')]: 'histoire',
    [normalizeTheme('institutions françaises')]: 'institutions',
    [normalizeTheme('valeurs de la république')]: 'vals_principes',
    [normalizeTheme('droits et devoirs')]: 'droits',
    [normalizeTheme('géographie')]: 'geographie',
    [normalizeTheme('principes et valeurs')]: 'vals_principes',
    [normalizeTheme('naturalisation')]: 'naturalisation',
    [normalizeTheme('valeurs de la republique (ou principes et valeurs)')]: 'vals_principes',
    'valeurs_de_la_republique_(ou_principes_et_valeurs)': 'vals_principes', // Fallback direct
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
            const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];

            const normalize = normalizeTheme;

            const getVal = (row: Record<string, any>, aliases: string[]) => {
                const keys = Object.keys(row);
                const normalizedAliases = aliases.map(a => normalize(a));
                const foundKey = keys.find(k => normalizedAliases.includes(normalize(k)));
                if (foundKey && row[foundKey] !== undefined) return row[foundKey];
                return null;
            };

            // Detect and log columns for diagnostics
            if (rows.length > 0) {
                const detectedCols = Object.keys(rows[0]);
                addLog('info', `📊 Colonnes détectées : ${detectedCols.join(', ')}`);

                // Identify mapping success
                const hasQuestion = !!getVal(rows[0], ['Question', 'texte', 'intitulé', 'Enoncé', 'Sujet']);
                const hasChoices = !!getVal(rows[0], ['Réponse A', 'A', 'Choice A', 'Choix A']);
                if (!hasQuestion) addLog('error', '⚠️ Colonne "Question" non identifiée. Vérifiez l\'en-tête.');
                if (!hasChoices) addLog('error', '⚠️ Colonnes de choix (A, B...) non identifiées.');
            }

            // Construire le Set des questions existantes (comparaison robuste)
            const existingTexts = new Set<string>(
                existingSnap.docs.map(d => normalizeQuestionText(d.data().question || ''))
            );
            addLog('info', `✅ ${rows.length} ligne(s) dans le fichier — ${existingTexts.size} question(s) déjà en base.`);

            setProgress({ done: 0, total: rows.length, imported: 0, skipped: 0 });

            let batch = writeBatch(db);
            let batchCount = 0;
            let totalImported = 0;
            let totalProcessed = 0;
            let skippedEmpty = 0;
            let skippedBadData = 0;
            const duplicatesList: string[] = [];

            addLog('info', `🚀 Début de l'import : ${rows.length} lignes à traiter...`);

            for (const row of rows) {
                totalProcessed++;

                // Columns aliases for robustness
                const rawText = String(getVal(row, ['Question', 'texte', 'intitulé', 'Enoncé', 'Sujet']) || '').trim();

                if (!rawText) {
                    skippedEmpty++;
                    if (skippedEmpty <= 5) {
                        addLog('error', `⚠️ Ligne ${totalProcessed} : Texte de question vide. Valeur brute: ${JSON.stringify(row)}`);
                    }
                    // Update progress UI even when skipping
                    setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData });
                    continue;
                }

                const rawQ = cleanQuestionText(rawText);
                if (!rawQ) {
                    skippedEmpty++;
                    setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData });
                    continue;
                }

                // Check for duplicates
                const normQ = normalizeQuestionText(rawQ);
                const normRaw = normalizeQuestionText(rawText);
                if (existingTexts.has(normQ) || existingTexts.has(normRaw)) {
                    duplicatesList.push(rawQ);
                    if (duplicatesList.length <= 5) {
                        addLog('info', `🔁 Doublon ignoré : "${rawQ.slice(0, 50)}..."`);
                    } else if (duplicatesList.length === 6) {
                        addLog('info', `🔁 ... plus de doublons détectés.`);
                    }
                    setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData });
                    continue;
                }

                existingTexts.add(normQ);
                existingTexts.add(normRaw);

                const rawIdValue = getVal(row, ['ID', 'identifiant']);
                // Generate a highly unique ID and log it for the first few rows
                const questionDocRef = doc(collection(db, 'questions'));
                const finalId = questionDocRef.id;

                if (totalImported < 5) {
                    addLog('info', `🔍 ID généré pour la question ${totalImported + 1} : ${finalId}`);
                }

                const rawTheme = String(getVal(row, ['Thème', 'Theme', 'Sujet', 'Category']) || '').trim();
                const normTheme = normalizeTheme(rawTheme);
                const theme = THEME_MAP[normTheme] || THEME_MAP[rawTheme.toLowerCase()] || rawTheme.replace(/\s+/g, '_').toLowerCase() || 'general';

                const rawLevel = String(getVal(row, ['Niveau', 'Level', 'Difficulté']) || 'Débutant');
                const level = LEVEL_MAP[rawLevel] || 'Débutant';

                const answerRaw = String(getVal(row, ['Bonne réponse', 'Réponse correcte', 'Correct', 'Reponse', 'Correction', 'Valid']) || 'A').toUpperCase();
                const correctMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
                const correct_index = correctMap[answerRaw] ?? 0;

                const choices = [
                    String(getVal(row, ['Réponse A', 'A', 'Choice A', 'Choix A']) || ''),
                    String(getVal(row, ['Réponse B', 'B', 'Choice B', 'Choix B']) || ''),
                    String(getVal(row, ['Réponse C', 'C', 'Choice C', 'Choix C']) || ''),
                    String(getVal(row, ['Réponse D', 'D', 'Choice D', 'Choix D']) || ''),
                ].filter(Boolean).map(c => cleanQuestionText(c));

                if (choices.length < 2) {
                    skippedBadData++;
                    addLog('error', `⚠️ Ligne ${totalProcessed} ignorée : Pas assez de choix trouvés (${choices.length})`);
                    setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData });
                    continue;
                }

                // New metadata fields
                const source = String(getVal(row, ['Source', 'Origine']) || '');
                const reference = String(getVal(row, ['Référence', 'Reference', 'Réf']) || '');
                // Detection plus souple du type d'examen
                const examRaw = String(getVal(row, ['Examen', 'Type', 'Parcours', 'Type d\'examen', 'Catégorie', 'Type Examen']) || '').toLowerCase();
                const isNat = (examRaw.includes('naturalisation') ||
                    examRaw.includes('nationalité') ||
                    examRaw.includes('nat') ||
                    examRaw.includes('français'));

                // Si c'est Naturalisation, on l'associe aux deux par défaut (socle commun)
                const exam_types = isNat ? ['titre_sejour', 'naturalisation'] : ['titre_sejour'];

                batch.set(questionDocRef, {
                    theme, level,
                    exam_types, // Multi-selection
                    question: rawQ,
                    choices,
                    correct_index,
                    explanation: cleanQuestionText(String(getVal(row, ['Explication', 'Explanation', 'Commentaire']) || '')),
                    source: source,
                    reference: reference,
                    original_id: rawIdValue ? String(rawIdValue) : '',
                    tags: [],
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });

                batchCount++;
                totalImported++;

                if (batchCount >= 100) {
                    const currentBatchSize = batchCount;
                    addLog('info', `💾 Envoi d'un lot de ${currentBatchSize} questions...`);
                    try {
                        await batch.commit();
                        addLog('success', `✅ Lot de ${currentBatchSize} questions enregistré avec succès.`);
                    } catch (commitErr) {
                        addLog('error', `❌ Échec de l'enregistrement du lot : ${commitErr instanceof Error ? commitErr.message : String(commitErr)}`);
                        throw commitErr; // Stop the whole import if a batch fails
                    }
                    playSound('click');
                    batch = writeBatch(db);
                    batchCount = 0;
                    await new Promise(r => setTimeout(r, 150));
                }

                // Update UI every 5 rows to keep it fluid without overwhelming React
                if (totalProcessed % 5 === 0 || totalProcessed === rows.length) {
                    setProgress({ done: totalProcessed, total: rows.length, imported: totalImported, skipped: duplicatesList.length + skippedEmpty + skippedBadData });
                }
            }

            if (batchCount > 0) {
                addLog('info', `💾 Envoi du dernier lot de ${batchCount} questions...`);
                try {
                    await batch.commit();
                    addLog('success', `✅ Dernier lot enregistré.`);
                } catch (commitErr) {
                    addLog('error', `❌ Échec du dernier lot : ${commitErr instanceof Error ? commitErr.message : String(commitErr)}`);
                }
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
            if (msg.includes('resource-exhausted') || msg.includes('quota')) {
                addLog('error', '🛑 QUOTA DÉPASSÉ : Vous avez atteint la limite quotidienne de Firebase (Spark).');
                addLog('info', '💡 Solution : Attendez demain (minuit UTC) ou passez au forfait Blaze.');
            } else {
                addLog('error', `❌ Erreur : ${msg}`);
            }
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
        if (!window.confirm("⚠️ ATTENTION : Suppression TOTALE.\n\nÊtes-vous sûr ?")) return;

        setRunning(true);
        setLogs([]);
        addLog('info', '🛡️ VERSION SURVIE V4 ACTIVÉE (Suppression unitaire)');
        addLog('info', '🚀 Cette version supprime les questions une par une pour éviter les blocages de lots.');

        try {
            const snap = await getDocs(collection(db, 'questions'));
            const total = snap.size;

            if (total === 0) {
                addLog('info', 'La base est déjà vide.');
                setRunning(false);
                return;
            }

            addLog('info', `🗑️ Début de la suppression de ${total} questions...`);
            setProgress({ done: 0, total, imported: 0, skipped: 0 });

            let processedInLoop = 0;

            for (const d of snap.docs) {
                if (!d?.ref) { processedInLoop++; continue; }

                try {
                    await deleteDoc(d.ref);
                    processedInLoop++;

                    if (processedInLoop % 5 === 0 || processedInLoop === total) {
                        setProgress({ done: processedInLoop, total, imported: 0, skipped: 0 });
                        addLog('info', `🗑️ Suppression en cours : ${processedInLoop} / ${total}...`);
                    }

                    // Très courte pause pour laisser le navigateur respirer
                    await new Promise(r => setTimeout(r, 80));
                } catch (err) {
                    addLog('error', `❌ Échec sur la question ${processedInLoop} : ${err instanceof Error ? err.message : String(err)}`);
                    throw err; // On arrête tout si une suppression échoue vraiment
                }
            }

            addLog('success', `🎉 TERMINÉ ! ${total} questions supprimées.`);
            setCount(0);
            playSound('success');

        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            if (errorMsg.includes('resource-exhausted') || errorMsg.includes('quota')) {
                addLog('error', '🛑 QUOTA DÉPASSÉ : Plus aucune suppression possible aujourd\'hui.');
            } else {
                addLog('error', `❌ Erreur : ${errorMsg}`);
            }
            addLog('info', '💡 CONSEIL : Si ça bloque encore, essayez de rafraîchir la page (F5).');
        } finally {
            setRunning(false);
        }
    };

    const fixThemes = async () => {
        if (!window.confirm('Voulez-vous analyser et corriger les thèmes ?')) return;
        setRunning(true);
        setLogs([]);
        addLog('info', '🔍 Analyse résiliente des thèmes...');
        try {
            const snap = await getDocs(collection(db, 'questions'));
            const total = snap.size;
            let fixedCount = 0;
            let processed = 0;
            let batch = writeBatch(db);
            let batchCount = 0;
            const canonicalThemes = ['vals_principes', 'histoire', 'geographie', 'institutions', 'societe', 'droits'];

            for (const d of snap.docs) {
                processed++;
                const data = d.data();
                const currentTheme = data.theme || 'general';

                if (!canonicalThemes.includes(currentTheme)) {
                    const norm = normalizeTheme(currentTheme);
                    const newTheme = THEME_MAP[norm] || THEME_MAP[currentTheme.toLowerCase()];
                    if (newTheme && newTheme !== currentTheme) {
                        batch.update(d.ref, { theme: newTheme, updated_at: new Date().toISOString() });
                        fixedCount++;
                        batchCount++;
                    }
                }

                if (batchCount >= 20) {
                    addLog('info', `🛠️ Application des corrections (${processed}/${total})...`);
                    await batch.commit();
                    batch = writeBatch(db);
                    batchCount = 0;
                    setProgress({ done: processed, total, imported: fixedCount, skipped: 0 });
                    await new Promise(r => setTimeout(r, 300));
                } else if (processed % 10 === 0) {
                    setProgress({ done: processed, total, imported: fixedCount, skipped: 0 });
                }
            }

            if (batchCount > 0) await batch.commit();
            addLog('success', `✨ Terminé : ${fixedCount} questions réparées.`);
            await fetchCount();
            playSound('success');
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
                        Importez un fichier <strong>Excel (.xlsx)</strong> ou <strong>CSV (.csv)</strong> pour enrichir la base de données.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={fixThemes}
                        disabled={running}
                        className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                        <Database className="h-4 w-4" />
                        Réparer Thèmes
                    </button>
                    <button
                        onClick={async () => {
                            if (!window.confirm('Voulez-vous migrer les 1904+ questions vers le nouveau format multi-parcours ?')) return;
                            setRunning(true);
                            setLogs([]);
                            addLog('info', '🚀 Début de la migration des parcours...');
                            try {
                                const snap = await getDocs(collection(db, 'questions'));
                                let batch = writeBatch(db);
                                let count = 0;
                                let total = 0;
                                for (const d of snap.docs) {
                                    const data = d.data();
                                    if (!data.exam_types) {
                                        const old = data.exam_type || 'titre_sejour';
                                        const next = old === 'naturalisation' ? ['titre_sejour', 'naturalisation'] : [old];
                                        batch.update(d.ref, { exam_types: next });
                                        count++;
                                        total++;
                                        if (count >= 100) {
                                            await batch.commit();
                                            batch = writeBatch(db);
                                            count = 0;
                                            addLog('info', `✅ ${total} questions migrées...`);
                                        }
                                    }
                                }
                                if (count > 0) await batch.commit();
                                addLog('success', `✨ Migration terminée : ${total} questions mises à jour.`);
                            } catch (e) {
                                addLog('error', `❌ Erreur : ${e instanceof Error ? e.message : String(e)}`);
                            } finally {
                                setRunning(false);
                            }
                        }}
                        disabled={running}
                        className="flex items-center gap-2 text-sm font-medium text-purple-700 bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Migrer Parcours
                    </button>
                    <a
                        href="/data.xlsx"
                        download="modele_import_qcm.xlsx"
                        className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary-soft)] px-4 py-2 rounded-lg hover:brightness-95 transition-colors"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Télécharger le modèle
                    </a>
                </div>
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
                        : 'border-[var(--color-primary)]/30 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]',
                ].join(' ')}
                role="button"
                aria-label="Zone de dépôt de fichier Excel"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
            >
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
                <UploadCloud className="h-10 w-10 mx-auto text-[var(--color-primary)]/40 mb-3" aria-hidden="true" />
                {fileName ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                        {fileName}
                    </div>
                ) : (
                    <>
                        <p className="text-sm font-medium text-gray-700">
                            Glissez votre fichier ici ou <span className="text-[var(--color-primary)] underline">parcourez</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Formats supportés : .xlsx, .xls, .csv</p>
                    </>
                )}
            </div>

            {/* Format aide */}
            <div className="bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/10 rounded-xl p-4 mb-6 text-sm text-[var(--color-primary)]">
                <p className="font-semibold mb-2">📋 Format attendu (Excel ou CSV) :</p>
                <div className="overflow-x-auto">
                    <table className="text-xs border-collapse" aria-label="Format du fichier d'import">
                        <thead>
                            <tr>
                                {['ID', 'Question', 'Thème', 'Niveau', 'Réponse A', 'Réponse B', 'Réponse C', 'Réponse D', 'Bonne réponse', 'Explication'].map(h => (
                                    <th key={h} className="border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 px-2 py-1 text-left">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {['1', 'Qui vote les lois ?', 'Institutions françaises', 'B1', 'Le Président', 'Le Parlement', 'La Police', 'Le Maire', 'B', 'Le Parlement vote les lois.'].map((v, i) => (
                                    <td key={i} className="border border-[var(--color-primary)]/20 px-2 py-1">{v}</td>
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
                            className="h-full bg-[var(--color-primary)] transition-all duration-300 rounded-full"
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
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[var(--color-primary)] transition-colors"
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
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
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
