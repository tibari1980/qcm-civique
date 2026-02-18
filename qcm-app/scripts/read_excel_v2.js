const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Attempt to find the file in potential locations
const possiblePaths = [
    path.resolve(__dirname, '../../QCM_Test_Civique_5000.xlsx'), // If in project root (parent of qcm-app)
    path.resolve(__dirname, '../QCM_Test_Civique_5000.xlsx'),    // If in qcm-app root
    'D:\\Antigravity-project\\QCM_Test_Civique_5000.xlsx',       // Absolute guess based on user info
    'D:\\Antigravity-project\\QCM-Application\\QCM_Test_Civique_5000.xlsx' // Another guess
];

console.log("Searching for Excel file...");
let foundPath = null;

for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        foundPath = p;
        break;
    }
}

if (!foundPath) {
    console.error("Could not find QCM_Test_Civique_5000.xlsx in common locations.");
    // List dir to help debug
    console.log("List of ../../:", fs.readdirSync(path.resolve(__dirname, '../../')));
    process.exit(1);
}

console.log("Found file at:", foundPath);

try {
    const workbook = XLSX.readFile(foundPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Read first 3 rows to understand structure
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, limit: 3 });
    console.log("Headers:", data[0]);
    console.log("Row 1:", data[1]);
    console.log("Row 2:", data[2]);
} catch (e) {
    console.error("Error parsing Excel:", e);
}
