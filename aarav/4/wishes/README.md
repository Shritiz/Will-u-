# Birthday Wishes Collector

`wish.html` is the page you can send to people. It saves each wish in the visitor's browser first, then posts it to a Google Apps Script web app so the main copy lands in Google Sheets.

## Google Sheets Setup

1. Create or open the Google Sheet for the wishes.
2. Open `Extensions > Apps Script`.
3. Paste the contents of `google-sheets-apps-script.js`.
4. If the script is not bound to the sheet, set `CONFIG.spreadsheetId` to your sheet ID.
5. Deploy it as a web app with:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Copy the `/exec` web app URL into `googleSheetsWebhookUrl` inside `wish.html`.

The sheet tab will be created automatically as `Wishes` with these columns:

`Timestamp`, `ID`, `Name`, `Message`, `Submitted At`

## Notes

The local `server.js` and SQLite database are useful for testing on your own machine, but they will not collect wishes from other people unless you host that Node server publicly. For sending a simple link, use the Google Apps Script flow.
