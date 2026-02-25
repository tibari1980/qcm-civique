import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

const filePath = 'd:/Antigravity-project/QCM-Application/QCM_Test_Civique_5000.xlsx';
const buf = readFileSync(filePath);
const wb = XLSX.read(buf);
const sheet = wb.Sheets[wb.SheetNames[0]];

// Headers
const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
console.log('=== NOM DES COLONNES ===');
console.log(JSON.stringify(raw[0]));
console.log('\n=== LIGNE 1 ===');
console.log(JSON.stringify(raw[1]));
console.log('\n=== LIGNE 2 ===');
console.log(JSON.stringify(raw[2]));
console.log('\n=== TOTAL LIGNES ===', raw.length - 1);

// Parsed rows
const rows = XLSX.utils.sheet_to_json(sheet) as any[];
if (rows.length === 0) { console.log('AUCUNE LIGNE PARSÉE'); process.exit(0); }

// Detect question column
const allKeys = Object.keys(rows[0]);
console.log('\n=== TOUTES LES CLÉS ===', JSON.stringify(allKeys));

// Count themes
const themeKey = allKeys.find(k => k.toLowerCase().includes('th') || k.toLowerCase().includes('theme'));
console.log('\n=== COLONNE THÈME DÉTECTÉE ===', themeKey);
if (themeKey) {
    const counts: Record<string, number> = {};
    rows.forEach((r: any) => {
        const val = themeKey ? r[themeKey] : null;
        const t = String(val || 'VIDE');
        counts[t] = (counts[t] || 0) + 1;
    });
    console.log('\n=== NOMBRES PAR THÈME ===');
    Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => console.log(`  ${n.toString().padStart(5)} | ${t}`));
}
Riverside.

// Simulate variante cleaning on question column
const qKey = allKeys.find(k => k.toLowerCase() === 'question');
console.log('\n=== COLONNE QUESTION DÉTECTÉE ===', qKey);
if (qKey) {
    const clean = (t: string) => t
        .replace(/\(Variante\s*\d*\)/gi, '')
        .replace(/^Variante\s*\d*\s*[:.-]?\s*/gi, '')
        .replace(/Variante\s*\d*/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    const seen = new Set<string>();
    let dupes = 0, unique = 0;
    rows.forEach((r: any) => {
        const q = clean(String(r[qKey] || ''));
        if (seen.has(q.toLowerCase())) dupes++;
        else { seen.add(q.toLowerCase()); unique++; }
    });
    console.log(`\n=== SIMULATION DÉDUPLICATION ===`);
    console.log(`  Uniques après nettoyage : ${unique}`);
    console.log(`  Doublons intra-fichier  : ${dupes}`);
    console.log(`  Exemple cleaned row 1   : "${clean(String(rows[0][qKey] || ''))}"`);
    console.log(`  Exemple cleaned row 2   : "${clean(String(rows[1][qKey] || ''))}"`);
}
