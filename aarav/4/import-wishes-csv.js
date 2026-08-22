#!/usr/bin/env node

/*
 * Usage:
 *   node import-wishes-csv.js path/to/wishes.csv
 *
 * Expected columns (case-insensitive):
 * Timestamp, ID, Name, Message, Submitted At
 *
 * New IDs are appended to wishes-data.json. Existing IDs are left untouched.
 * The browser-readable wishes-data.js file is regenerated after every import.
 */

const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const sourcePath = process.argv[2];
const dataPath = path.join(rootDir, "wishes-data.json");
const browserDataPath = path.join(rootDir, "wishes-data.js");

function fail(message) {
    console.error(`Error: ${message}`);
    process.exitCode = 1;
}

function parseCsv(contents) {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;

    for (let index = 0; index < contents.length; index += 1) {
        const character = contents[index];
        const nextCharacter = contents[index + 1];

        if (character === '"') {
            if (quoted && nextCharacter === '"') {
                value += '"';
                index += 1;
            } else {
                quoted = !quoted;
            }
            continue;
        }

        if (character === "," && !quoted) {
            row.push(value);
            value = "";
            continue;
        }

        if ((character === "\n" || character === "\r") && !quoted) {
            if (character === "\r" && nextCharacter === "\n") {
                index += 1;
            }
            row.push(value);
            if (row.some(function (cell) { return cell.trim(); })) {
                rows.push(row);
            }
            row = [];
            value = "";
            continue;
        }

        value += character;
    }

    if (quoted) {
        throw new Error("The CSV has an unclosed quoted value.");
    }

    row.push(value);
    if (row.some(function (cell) { return cell.trim(); })) {
        rows.push(row);
    }

    return rows;
}

function normalizeHeader(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findColumn(headers, acceptedNames) {
    return headers.findIndex(function (header) {
        return acceptedNames.includes(normalizeHeader(header));
    });
}

function cleanText(value) {
    return String(value || "").trim();
}

function normalizeMessage(value) {
    return cleanText(value).replace(/<br\s*\/?>/gi, "\n");
}

function readExistingWishes() {
    if (!fs.existsSync(dataPath)) {
        return [];
    }

    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    if (!Array.isArray(data)) {
        throw new Error("wishes-data.json must contain an array.");
    }
    return data;
}

function writeFileAtomically(filePath, contents) {
    const temporaryPath = `${filePath}.tmp`;
    fs.writeFileSync(temporaryPath, contents, "utf8");
    fs.renameSync(temporaryPath, filePath);
}

function writeWishFiles(wishes) {
    const json = `${JSON.stringify(wishes, null, 2)}\n`;
    const browserData = [
        "/* Generated from wishes-data.json by import-wishes-csv.js. */",
        `window.BIRTHDAY_WISHES = ${JSON.stringify(wishes, null, 4)};`,
        ""
    ].join("\n");

    writeFileAtomically(dataPath, json);
    writeFileAtomically(browserDataPath, browserData);
}

function importWishes() {
    if (!sourcePath) {
        fail("Provide a CSV file. Example: npm run import-wishes -- wishes.csv");
        return;
    }

    const resolvedSource = path.resolve(process.cwd(), sourcePath);
    if (!fs.existsSync(resolvedSource)) {
        fail(`CSV file not found: ${resolvedSource}`);
        return;
    }

    const rows = parseCsv(fs.readFileSync(resolvedSource, "utf8"));
    if (rows.length < 2) {
        fail("The CSV needs a header row and at least one wish.");
        return;
    }

    const headers = rows[0];
    const submittedAtColumn = findColumn(headers, ["timestamp", "timeofsubmission", "submissiontime", "submittedtime"]);
    const idColumn = findColumn(headers, ["id", "wishid"]);
    const nameColumn = findColumn(headers, ["name", "sender", "from"]);
    const messageColumn = findColumn(headers, ["message", "wish", "birthdaywish"]);
    const recordedAtColumn = findColumn(headers, ["submittedat", "recordedat", "createdat"]);

    if ([submittedAtColumn, idColumn, nameColumn, messageColumn].some(function (column) { return column < 0; })) {
        fail("CSV must include Timestamp, ID, Name, and Message columns.");
        return;
    }

    const wishes = readExistingWishes();
    const knownIds = new Set(wishes.map(function (wish) { return cleanText(wish.id); }).filter(Boolean));
    let added = 0;
    let skipped = 0;
    let ignored = 0;

    rows.slice(1).forEach(function (row) {
        const id = cleanText(row[idColumn]);
        const name = cleanText(row[nameColumn]);
        const message = normalizeMessage(row[messageColumn]);

        if (!id || !name || !message) {
            ignored += 1;
            return;
        }

        if (knownIds.has(id)) {
            skipped += 1;
            return;
        }

        wishes.push({
            submittedAt: cleanText(row[submittedAtColumn]),
            id,
            name,
            message,
            recordedAt: recordedAtColumn >= 0 ? cleanText(row[recordedAtColumn]) : ""
        });
        knownIds.add(id);
        added += 1;
    });

    writeWishFiles(wishes);
    console.log(`Imported ${added} new wish${added === 1 ? "" : "es"}.`);
    console.log(`Skipped ${skipped} duplicate ID${skipped === 1 ? "" : "s"}.`);
    if (ignored) {
        console.log(`Ignored ${ignored} incomplete row${ignored === 1 ? "" : "s"}.`);
    }
    console.log(`Love Wall now contains ${wishes.length} wishes.`);
}

try {
    importWishes();
} catch (error) {
    fail(error.message);
}
