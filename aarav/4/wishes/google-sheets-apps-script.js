// Google Apps Script template for the birthday wishes collector.
// 1. Open the Google Sheet you want to use.
// 2. Open Extensions > Apps Script.
// 3. Paste this code into the script editor.
// 4. If the script is not bound to the sheet, paste the sheet ID below.
// 5. Deploy as a web app: Execute as me, Who has access: Anyone.

const CONFIG = {
  spreadsheetId: '',
  sheetName: 'Wishes'
};

function doPost(e) {
  try {
    const payload = parsePayload(e);
    const id = cleanText(payload.id || Utilities.getUuid(), 120);
    const name = cleanText(payload.name, 120);
    const message = cleanText(payload.message, 1200);
    const createdAt = cleanText(payload.createdAt, 80);
    const spreadsheetId = cleanText(payload.sheetId || CONFIG.spreadsheetId, 160);
    const spreadsheet = spreadsheetId
      ? SpreadsheetApp.openById(spreadsheetId)
      : SpreadsheetApp.getActiveSpreadsheet();

    if (!name || !message) {
      throw new Error('Name and message are required.');
    }

    if (!spreadsheet) {
      throw new Error('No spreadsheet was found. Add CONFIG.spreadsheetId or bind this script to a sheet.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    let sheet = spreadsheet.getSheetByName(CONFIG.sheetName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(CONFIG.sheetName);
      sheet.appendRow(['Timestamp', 'ID', 'Name', 'Message', 'Submitted At']);
    }

    sheet.appendRow([
      new Date(),
      id,
      name,
      message,
      createdAt
    ]);

    lock.releaseLock();

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, id, name }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Use POST to submit wishes.');
}

function parsePayload(e) {
  if (e && e.parameter && Object.keys(e.parameter).length) {
    return e.parameter;
  }

  const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '';
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch (error) {
    return rawBody.split('&').reduce(function (payload, pair) {
      const parts = pair.split('=');
      const key = decodeURIComponent((parts[0] || '').replace(/\+/g, ' '));
      const value = decodeURIComponent((parts.slice(1).join('=') || '').replace(/\+/g, ' '));
      if (key) {
        payload[key] = value;
      }
      return payload;
    }, {});
  }
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}
