const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.resolve(__dirname, '../../QCM_Test_Civique_5000.xlsx');
console.log('Resolved path:', filePath);

if (!fs.existsSync(filePath)) {
    console.error('File not found at path:', filePath);
    process.exit(1);
}

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Get headers (first row)
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Headers:', json[0]);
    console.log('First Row Data:', json[1]);
} catch (error) {
    console.error('Error reading file:', error);
}
