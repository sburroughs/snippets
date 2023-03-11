const docId = 'xxx';
const sheetId = 'xxx';
const sheetName = 'Sheet1';

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('Generate');
    menu.addItem('Docs From ' + sheetName, 'createNewGoogleDocs');
    menu.addToUi();
}

function createNewGoogleDocs() {
    const googleDocTemplate = DriveApp.getFileById(docId);
    const destinationFolder = DriveApp.getFolderById(sheetId).getParents().next();
    const sheet = SpreadsheetApp
        .getActiveSpreadsheet()
        .getSheetByName(sheetName);

    const rows = sheet.getDataRange().getValues();
    rows.forEach((row, index) => generateDoc(row, index, googleDocTemplate, destinationFolder, sheet));

}

function generateDoc(row, index, googleDocTemplate, destinationFolder, sheet) {
    if (index === 0) return; // skip header
    if (row[0]) return; // skip already created links

    const copy = googleDocTemplate.makeCopy(`${row[1]} ${row[2]}`, destinationFolder);
    const doc = DocumentApp.openById(copy.getId());
    interpolateDoc(doc, row);
    doc.saveAndClose();

    // sets link
    const url = doc.getUrl();
    sheet.getRange(index + 1, 1).setValue(url)
}

function interpolateDoc(doc, row) {

    const body = doc.getBody();
    body.replaceText('{{identifier}}', row[1]);
    body.replaceText('{{title}}', row[2]);
    body.replaceText('{{subtitle}}', row[3]);

    const maxMemos = 30
    const memoStartIndex = 4;
    for (var i = 0; i < maxMemos; i++) {
        body.replaceText('{{memo' + (i + 1) + '}}', row[memoStartIndex + i]);
    }

}
