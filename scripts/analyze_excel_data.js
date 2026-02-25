const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const possiblePaths = [
    'D:\\Antigravity-project\\QCM-Application\\QCM_Test_Civique_5000.xlsx'
];
const foundPath = possiblePaths[0];

try {
    const workbook = XLSX.readFile(foundPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet); // Returns objects

    const analysis = {
        totalRows: data.length,
        themes: new Set(),
        levels: new Set(),
        answerFormats: new Set(),
        sampleRow: data[0]
    };

    data.forEach(row => {
        if (row['Thème']) analysis.themes.add(row['Thème']);
        if (row['Niveau']) analysis.levels.add(row['Niveau']);
        if (row['Bonne réponse']) analysis.answerFormats.add(row['Bonne réponse']);
    });

    console.log({
        total: analysis.totalRows,
        themes: Array.from(analysis.themes),
        levels: Array.from(analysis.levels),
        answerFormats: Array.from(analysis.answerFormats).slice(0, 10), // Show first 10 variations
        sample: analysis.sampleRow
    });

    fs.writeFileSync('scripts/data_analysis.json', JSON.stringify({
        total: analysis.totalRows,
        themes: Array.from(analysis.themes),
        levels: Array.from(analysis.levels),
        answerFormats: Array.from(analysis.answerFormats),
        sample: analysis.sampleRow
    }, null, 2));

} catch (e) {
    console.error(e);
}
