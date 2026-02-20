const XLSX = require('xlsx');
const path = require('path');

try {
    const filePath = path.join(process.cwd(), '..', 'QCM_Test_Civique_5000.xlsx');
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    const headers = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        const cell = worksheet[address];
        headers.push(cell ? cell.v : `EMPTY_${C}`);
    }

    const rows = XLSX.utils.sheet_to_json(worksheet, { range: 0 });
    const firstRow = rows.length > 0 ? rows[0] : null;

    const fs = require('fs');
    fs.writeFileSync('headers.txt', JSON.stringify({ headers, firstRow }, null, 2));
} catch (e) {
    const fs = require('fs');
    fs.writeFileSync('headers.txt', 'Error: ' + e.message + '\n' + e.stack);
}
