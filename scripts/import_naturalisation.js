const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const debugPath = path.join(__dirname, '..', 'debug_import.txt');
fs.writeFileSync(debugPath, 'Script started...\n');

try {
    const envPath = path.join(__dirname, '..', '.env.local');
    fs.appendFileSync(debugPath, `Reading env from: ${envPath}\n`);
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split(/\r?\n/).forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        const index = trimmedLine.indexOf('=');
        if (index > 0) {
            const key = trimmedLine.substring(0, index).trim();
            let val = trimmedLine.substring(index + 1).trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.substring(1, val.length - 1);
            env[key] = val;
        }
    });

    fs.appendFileSync(debugPath, `Project ID: ${env.FIREBASE_PROJECT_ID}\n`);
    fs.appendFileSync(debugPath, `Client Email: ${env.FIREBASE_CLIENT_EMAIL}\n`);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: env.FIREBASE_PROJECT_ID,
                clientEmail: env.FIREBASE_CLIENT_EMAIL,
                privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
    }

    const db = admin.firestore();
    fs.appendFileSync(debugPath, 'Firestore initialized\n');

    async function importQuestions() {
        const csvPath = path.join(__dirname, '..', 'naturalisation_questions.csv');
        fs.appendFileSync(debugPath, `Reading CSV from: ${csvPath}\n`);
        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim() !== '');

        // Skip header
        const dataLines = lines.slice(1);

        fs.appendFileSync(debugPath, `Processing ${dataLines.length} questions...\n`);

        // Simple CSV parser for this specific format
        function parseCsvLine(line) {
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        }

        const batch = db.batch();
        const questionsRef = db.collection('questions');

        let importedCount = 0;

        for (const line of dataLines) {
            const [id, question, theme, level, rA, rB, rC, rD, correct, explanation] = parseCsvLine(line);

            if (!question) continue;

            const correctMap = { A: 0, B: 1, C: 2, D: 3 };
            const correctIndex = correctMap[correct] || 0;

            const choices = [rA, rB, rC, rD].filter(c => c && c !== '');

            const docData = {
                question: question,
                choices: choices,
                correct_index: correctIndex,
                theme: 'naturalisation',
                level: level || 'B1',
                explanation: explanation || '',
                exam_types: ['titre_sejour', 'naturalisation'],
                is_active: true,
                tags: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                original_id: id
            };

            const newDocRef = questionsRef.doc();
            batch.set(newDocRef, docData);
            importedCount++;
        }

        fs.appendFileSync(debugPath, `Committing batch of ${importedCount}...\n`);
        await batch.commit();
        fs.appendFileSync(debugPath, `Successfully imported ${importedCount} questions.\n`);
    }

    importQuestions().catch(err => {
        fs.appendFileSync(debugPath, `Import failed: ${err.message}\n`);
        process.exit(1);
    });

} catch (e) {
    fs.appendFileSync(debugPath, `Script error: ${e.message}\n`);
}
