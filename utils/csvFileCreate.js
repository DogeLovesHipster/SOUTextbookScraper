const fs = require('fs');
const path = require('path');

function createCSVFile() {
    const rootPath = path.join(__dirname, '..');
    const filePath = path.join(
        rootPath,
        'csv_files',
        'souTextbooksList.csv',
    );

    const correctFirstRow = 'term,department,course,section,professor,textbook,authors,edition,publisher,isbn,newPrintPrice,usedPrintPrice,newRentalPrintPrice,usedRentalPrintPrice,rentOnlyPrice,digitalPurchasePrice,digitalRentalPrice,oer';

    const columnNames = ['term', 'department', 'course', 'section', 'professor', 'textbook', 'authors', 'edition', 'publisher', 'isbn', 'newPrintPrice', 'usedPrintPrice', 'newRentalPrintPrice', 'usedRentalPrintPrice', 'rentOnlyPrice', 'digitalPurchasePrice', 'digitalRentalPrice', 'oer'];

    if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath);
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, columnNames.join(',') + '\n');
    } else {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const existingRows = fileContent.trim().split('\n');
        const existingFirstRow = existingRows[0];

        if (existingFirstRow !== correctFirstRow) {
            existingRows[0] = correctFirstRow;
            fs.writeFileSync(filePath, existingRows.join('\n') + '\n');
        }
    }
}

module.exports = {
    createCSVFile,
};