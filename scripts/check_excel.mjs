import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.resolve('../QCM_Test_Civique_5000.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Headers:', data[0]);
    console.log('First Row:', data[1]);
} catch (error) {
    console.error('Error reading file:', error);
}
