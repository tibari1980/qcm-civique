'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { cleanQuestionText } from '@/utils/cleaning';

export default function CleanupPage() {
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState(0);
    const [updatedCount, setUpdatedCount] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const handleCleanup = async () => {
        if (!user) return;
        setStatus('running');
        setLogs([]);
        setUpdatedCount(0);

        try {
            addLog("Fetching questions...");
            const questionsRef = collection(db, 'questions');
            const snapshot = await getDocs(questionsRef);
            setTotal(snapshot.size);
            addLog(`Found ${snapshot.size} questions.`);

            let batch = writeBatch(db);
            let count = 0;
            let currentUpdated = 0;
            let processed = 0;

            for (const docSnapshot of snapshot.docs) {
                processed++;
                setProgress(Math.round((processed / snapshot.size) * 100));

                const data = docSnapshot.data();
                const originalQuestion = data.question;

                if (!originalQuestion) continue;

                const newQuestion = cleanQuestionText(originalQuestion);

                if (newQuestion !== originalQuestion) {
                    // addLog(`Updating: "${originalQuestion}" -> "${newQuestion}"`);
                    const docRef = doc(db, "questions", docSnapshot.id);
                    batch.update(docRef, { question: newQuestion });
                    count++;
                    currentUpdated++;

                    if (count >= 400) {
                        addLog(`Committing batch of ${count} updates...`);
                        await batch.commit();
                        batch = writeBatch(db);
                        count = 0;
                    }
                }
            }

            if (count > 0) {
                addLog(`Committing final batch of ${count} updates...`);
                await batch.commit();
            }

            setUpdatedCount(currentUpdated);
            setStatus('completed');
            addLog(`Cleanup finished. Updated ${currentUpdated} questions.`);

        } catch (error) {
            console.error(error);
            setStatus('error');
            addLog("Error: " + error);
        }
    };

    if (authLoading) return <div className="p-8">Loading...</div>;

    if (!user) return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
            <p>Please log in to use this tool.</p>
        </div>
    );

    return (
        <div className="container mx-auto py-12 px-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-yellow-500" />
                        Admin: Data Cleanup
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-gray-600">
                        This tool removes &quot;Variante&quot; text from all questions in the database.
                    </p>

                    <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                        {logs.length === 0 ? <span className="text-gray-400">Ready to start...</span> : logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>

                    {status === 'running' && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Processing...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'completed' && (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                            <CheckCircle />
                            <div>
                                <p className="font-bold">Success!</p>
                                <p>Updated {updatedCount} questions.</p>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleCleanup}
                        disabled={status === 'running'}
                        className="w-full"
                        size="lg"
                    >
                        {status === 'running' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {status === 'running' ? 'Cleaning...' : 'Start Cleanup'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
