const fs = require('fs');
const path = require('path');

function createCSVFile() {
    const rootPath = path.join(__dirname, '..');
    const filePath = path.join(
        rootPath,
        'csv_files',
        'souTextbooksList.csv',
    );

    const columnNames = ['term', 'department', 'course', 'section', 'professor', 'textbook', 'authors', 'edition', 'publisher', 'isbn', 'newPrintPrice', 'usedPrintPrice', 'newRentalPrintPrice', 'usedRentalPrintPrice', 'rentOnlyPrice', 'digitalPurchasePrice', 'digitalRentalPrice', 'oer'];

    if (!fs.existsSync(rootPath)) {
        fs.mkdirSync(rootPath);
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, columnNames.join(',') + '\n');
    } else {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const existingColumnNames = fileContent.trim().split(',');

        if (!arraysEqual(existingColumnNames, columnNames)) {
            fs.writeFileSync(filePath, columnNames.join(',') + '\n');
        }
    }
}

function arraysEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

module.exports = {
    createCSVFile,
};