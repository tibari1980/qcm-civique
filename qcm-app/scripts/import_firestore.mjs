import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBgwmq_u5Z6rJS4z7Ndebo5dWzgP0MyHNE",
    authDomain: "qcm-civique.firebaseapp.com",
    projectId: "qcm-civique",
    storageBucket: "qcm-civique.firebasestorage.app",
    messagingSenderId: "821949209591",
    appId: "1:821949209591:web:94e7e231696ce45b64ecf2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Theme Mapping
const themeMapping = {
    "Société et citoyenneté": "societe",
    "Histoire de France": "histoire",
    "Institutions françaises": "institutions",
    "Valeurs de la République": "principes",
    "Droits et devoirs": "droits"
};

// Find Excel file
const possiblePaths = [
    path.resolve(__dirname, '../../QCM_Test_Civique_5000.xlsx'),
    'D:\\Antigravity-project\\QCM-Application\\QCM_Test_Civique_5000.xlsx'
];

let foundPath = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        foundPath = p;
        break;
    }
}

if (!foundPath) {
    console.error("Excel file not found.");
    process.exit(1);
}

// Logging helper
function log(msg) {
    console.log(msg);
    fs.appendFileSync('scripts/import_log.txt', msg + '\n');
}

async function importData() {
    try {
        log("Starting import...");
        log("Signing in anonymously...");
        await signInAnonymously(auth);
        log("Signed in.");

        log(`Reading file: ${foundPath}`);
        const workbook = XLSX.readFile(foundPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        log(`Found ${rows.length} rows.`);

        let batch = writeBatch(db);
        let count = 0;
        let totalImported = 0;

        for (const row of rows) {
            const id = `question_${row.ID}`;
            const theme = themeMapping[row['Thème']] || 'autru'; // Default 
            const level = row['Niveau'] || 'Débutant';

            // Map Answer
            const answerLetter = row['Bonne réponse']; // A, B, C, D
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
                explanation: "", // No explanation in Excel
                created_at: new Date()
            };

            const docRef = doc(db, "questions", id);
            batch.set(docRef, questionData);
            count++;

            // Commit every 400
            if (count >= 400) {
                await batch.commit();
                totalImported += count;
                log(`Imported ${totalImported} questions...`);
                batch = writeBatch(db);
                count = 0;
            }
        }

        if (count > 0) {
            await batch.commit();
            totalImported += count;
        }

        log(`FINISHED! Total imported: ${totalImported}`);
        process.exit(0);

    } catch (error) {
        log("Import failed: " + error);
        if (error.code) log("Error Code: " + error.code);
        process.exit(1);
    }
}

importData();
