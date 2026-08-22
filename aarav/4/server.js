const http = require("http");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { URL } = require("url");

const dbPath = path.join(__dirname, "wishes", "wishes.sqlite");
const db = new sqlite3.Database(dbPath);

function initDatabase() {
    db.serialize(function () {
        db.run(`
            CREATE TABLE IF NOT EXISTS wishes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        `);
    });
}

function getWishes() {
    return new Promise(function (resolve, reject) {
        db.all("SELECT id, name, message, created_at AS createdAt FROM wishes ORDER BY created_at ASC", function (error, rows) {
            if (error) {
                reject(error);
                return;
            }
            resolve(rows);
        });
    });
}

function addWish(name, message) {
    return new Promise(function (resolve, reject) {
        const id = Date.now().toString(36);
        const createdAt = new Date().toISOString();
        db.run(
            "INSERT INTO wishes (id, name, message, created_at) VALUES (?, ?, ?, ?)",
            [id, name, message, createdAt],
            function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve({ id, name, message, createdAt });
            }
        );
    });
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case ".html": return "text/html; charset=utf-8";
        case ".css": return "text/css; charset=utf-8";
        case ".js": return "application/javascript; charset=utf-8";
        case ".json": return "application/json; charset=utf-8";
        default: return "application/octet-stream";
    }
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload));
}

function serveFile(res, filePath) {
    fs.readFile(filePath, function (error, content) {
        if (error) {
            sendJson(res, 404, { error: "Not found" });
            return;
        }

        res.writeHead(200, { "Content-Type": getContentType(filePath) });
        res.end(content);
    });
}

const server = http.createServer(function (req, res) {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = requestUrl.pathname;

    if (pathname === "/api/wishes" && req.method === "GET") {
        getWishes()
            .then(function (wishes) {
                sendJson(res, 200, wishes);
            })
            .catch(function (error) {
                sendJson(res, 500, { error: error.message });
            });
        return;
    }

    if (pathname === "/api/wishes" && req.method === "POST") {
        let body = "";
        req.on("data", function (chunk) {
            body += chunk.toString();
        });
        req.on("end", function () {
            try {
                const payload = JSON.parse(body || "{}");
                const name = String(payload.name || "").trim();
                const message = String(payload.message || "").trim();

                if (!name || !message) {
                    sendJson(res, 400, { error: "Please enter your name and a wish." });
                    return;
                }

                addWish(name, message)
                    .then(function (wish) {
                        sendJson(res, 201, wish);
                    })
                    .catch(function (error) {
                        sendJson(res, 500, { error: error.message });
                    });
            } catch (error) {
                sendJson(res, 400, { error: "Invalid JSON payload." });
            }
        });
        return;
    }

    let filePath = pathname;
    if (filePath === "/") {
        filePath = "/wishes/wish.html";
    }

    const resolvedPath = path.join(__dirname, filePath.replace(/^\/+/, ""));
    const relativePath = path.relative(__dirname, resolvedPath);
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        sendJson(res, 403, { error: "Forbidden" });
        return;
    }

    serveFile(res, resolvedPath);
});

initDatabase();

const port = Number(process.env.PORT) || 3000;
server.listen(port, function () {
    console.log(`Wish collector running at http://localhost:${port}`);
});
