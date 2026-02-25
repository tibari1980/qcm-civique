// Script d'analyse rapide - Pure JS, pas de TypeScript
const path = require('path');
const xlsx = require('./node_modules/xlsx');
const fs = require('fs');

const filePath = path.resolve('d:/Antigravity-project/QCM-Application/QCM_Test_Civique_5000.xlsx');

console.log('Lecture du fichier...');
const buf = fs.readFileSync(filePath);
const wb = xlsx.read(buf, { type: 'buffer' });
const sheet = wb.Sheets[wb.SheetNames[0]];

// Raw headers
const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
console.log('\n=== NOM DES COLONNES ===');
console.log(JSON.stringify(rawRows[0]));
console.log('\n=== LIGNE 1 (data) ===');
console.log(JSON.stringify(rawRows[1]));
console.log('\n=== LIGNE 2 (data) ===');
console.log(JSON.stringify(rawRows[2]));
console.log('\nTOTAL LIGNES:', rawRows.length - 1);

// With column names
const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
if (rows.length === 0) { console.log('AUCUNE LIGNE'); process.exit(0); }

const keys = Object.keys(rows[0]);
console.log('\n=== TOUTES LES CLÉS ===', JSON.stringify(keys));

// Theme distribution
const themeKey = keys.find(k => /th.?me/i.test(k) || k.toLowerCase() === 'theme');
console.log('COLONNE THEME:', themeKey);
if (themeKey) {
    const tc = {};
    rows.forEach(r => { const t = String(r[themeKey] || 'VIDE'); tc[t] = (tc[t] || 0) + 1; });
    console.log('\n=== DISTRIBUTION PAR THEME ===');
    Object.entries(tc).sort((a, b) => b[1] - a[1]).forEach(([t, n]) => console.log(`  ${String(n).padStart(5)} | ${t}`));
}

// Simulate dedup
const qKey = keys.find(k => k.toLowerCase() === 'question');
console.log('\nCOLONNE QUESTION:', qKey);
if (qKey) {
    const clean = t => t
        .replace(/\(Variante\s*\d*\)/gi, '')
        .replace(/^Variante\s*\d*\s*[:.-]?\s*/gi, '')
        .replace(/Variante\s*\d*/gi, '')
        .replace(/\s+/g, ' ').trim();

    const seen = new Set();
    let u = 0, d = 0;
    rows.forEach(r => {
        const q = clean(String(r[qKey] || ''));
        if (!q) { d++; return; }
        if (seen.has(q.toLowerCase())) d++;
        else { seen.add(q.toLowerCase()); u++; }
    });
    console.log('\n=== SIMULATION NETTOYAGE + DÉDUP ===');
    console.log('  Questions uniques   :', u);
    console.log('  Doublons intra-fichier:', d);

    // Afficher quelques exemples bruts vs nettoyés
    console.log('\n=== EXEMPLES (brut -> nettoyé) ===');
    for (let i = 0; i < 5; i++) {
        const brut = String(rows[i][qKey] || '');
        console.log(`  ROW${i + 1}: "${brut.slice(0, 80)}" -> "${clean(brut).slice(0, 80)}"`);
    }
}
