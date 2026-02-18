'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { doc, writeBatch, getFirestore, collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';

export default function AdminImportPage() {
    const { user, loading } = useAuth();
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    const [permissionError, setPermissionError] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const runImport = async () => {
        if (!user) return;
        setImporting(true);
        setLogs([]);
        setPermissionError(false);
        addLog("Starting download of /data.xlsx...");

        try {
            // 1. Fetch file
            const response = await fetch('/data.xlsx');
            if (!response.ok) throw new Error("Failed to fetch /data.xlsx");
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();

            addLog("File downloaded. Parsing Excel...");

            // 2. Parse Excel
            const workbook = XLSX.read(arrayBuffer);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows: any[] = XLSX.utils.sheet_to_json(sheet);

            addLog(`Found ${rows.length} rows. Starting Firestore import...`);

            // 3. Import to Firestore
            // Theme Mapping
            const themeMapping: Record<string, string> = {
                "Société et citoyenneté": "societe",
                "Histoire de France": "histoire",
                "Institutions françaises": "institutions",
                "Valeurs de la République": "principes",
                "Droits et devoirs": "droits"
            };

            let batch = writeBatch(db);
            let count = 0;
            let totalImported = 0;

            for (const row of rows) {
                const id = `question_${row.ID}`;
                const theme = themeMapping[row['Thème']] || 'autru';
                const level = row['Niveau'] || 'Débutant';

                // Map Answer
                const answerLetter = row['Bonne réponse'];
                let correct_index = 0;
                if (answerLetter === 'B') correct_index = 1;
                if (answerLetter === 'C') correct_index = 2;
                if (answerLetter === 'D') correct_index = 3;

                const questionData = {
                    id: id,
                    theme: theme,
                    original_theme: row['Thème'],
                    level: level,
                    question: row['Question'],
                    choices: [
                        String(row['Réponse A'] || ""),
                        String(row['Réponse B'] || ""),
                        String(row['Réponse C'] || ""),
                        String(row['Réponse D'] || "")
                    ],
                    correct_index: correct_index,
                    explanation: "",
                    created_at: Date.now() // Use timestamp for client SDK
                };

                const docRef = doc(db, "questions", id);
                batch.set(docRef, questionData);
                count++;

                if (count >= 400) {
                    await batch.commit();
                    totalImported += count;
                    setProgress(`Imported ${totalImported} / ${rows.length}`);
                    // addLog(`Batch committed. Total: ${totalImported}`);
                    batch = writeBatch(db);
                    count = 0;
                    // Small delay to not freeze UI
                    await new Promise(r => setTimeout(r, 50));
                }
            }

            if (count > 0) {
                await batch.commit();
                totalImported += count;
            }

            addLog(`SUCCESS! Imported ${totalImported} questions.`);
            setProgress("Terminé !");

        } catch (error: any) {
            console.error(error);
            addLog("Error: " + error.message);
            if (error.message.includes("Missing or insufficient permissions")) {
                setPermissionError(true);
            }
        } finally {
            setImporting(false);
        }
    };

    const [countData, setCountData] = useState<number | null>(null);

    const checkCount = async () => {
        try {
            addLog("Vérification du nombre de documents...");
            const coll = collection(db, "questions");
            const snapshot = await getCountFromServer(coll);
            const count = snapshot.data().count;
            setCountData(count);
            addLog(`Total questions in Firestore: ${count}`);
            if (count === 5000) {
                addLog("✅ Le compte est bon (5000 questions).");
            } else {
                addLog(`⚠️ Attention : ${count} questions trouvées (attendu: 5000).`);
            }
        } catch (e: any) {
            console.error(e);
            addLog("Error checking count: " + e.message);
        }
    };

    if (loading) return <div>Chargement...</div>;
    // Removed strict admin check for demo purposes, assume logged in user is admin-ish
    if (!user) return <div className="p-10">Veuillez vous connecter.</div>;

    return (
        <div className="container mx-auto p-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Import des Questions (Admin)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600">
                        Cliquez ci-dessous pour importer le fichier <code>public/data.xlsx</code> dans Firestore.
                        Cette opération peut prendre quelques minutes.
                    </p>

                    {permissionError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md text-sm">
                            <h3 className="font-bold mb-2">Erreur de Permissions Firestore</h3>
                            <p className="mb-2">
                                Votre base de données bloque l'écriture. Veuillez mettre à jour vos <strong>Règles de sécurité Firestore</strong> dans la console Firebase.
                            </p>
                            <div className="bg-white p-2 rounded border border-gray-300 font-mono text-xs overflow-x-auto">
                                allow read, write: if request.auth != null;
                            </div>
                            <p className="mt-2 text-xs">
                                (À placer dans l'onglet "Rules" de votre Firestore Database)
                            </p>
                        </div>
                    )}

                    <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto font-mono text-xs">
                        {logs.map((log, i) => <div key={i}>{log}</div>)}
                    </div>

                    <div className="flex justify-between items-center gap-4">
                        <div className="text-sm font-bold text-blue-600">{progress}</div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={checkCount}>
                                Vérifier (Count)
                            </Button>
                            <Button onClick={runImport} disabled={importing}>
                                {importing ? 'Import en cours...' : 'Lancer l\'import'}
                            </Button>
                        </div>
                    </div>
                    {countData !== null && (
                        <div className="text-center mt-4 p-4 bg-green-50 rounded">
                            <p className="text-lg font-bold text-green-700">{countData} questions en base.</p>
                            <p className="text-sm text-green-600">Pas de doublons possibles (ID unique).</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
