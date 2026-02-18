const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const possiblePaths = [
    path.resolve(__dirname, '../../QCM_Test_Civique_5000.xlsx'),
    path.resolve(__dirname, '../QCM_Test_Civique_5000.xlsx'),
    'D:\\Antigravity-project\\QCM_Test_Civique_5000.xlsx',
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
    fs.writeFileSync('scripts/excel_debug.txt', 'File not found in: ' + JSON.stringify(possiblePaths));
    process.exit(1);
}

try {
    const workbook = XLSX.readFile(foundPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 1 });
    // Write headers to file
    fs.writeFileSync('scripts/excel_headers.json', JSON.stringify(data[0], null, 2));
    // Write success marker
    fs.writeFileSync('scripts/excel_debug.txt', 'Success reading: ' + foundPath);
} catch (e) {
    fs.writeFileSync('scripts/excel_debug.txt', 'Error: ' + e.message);
}
