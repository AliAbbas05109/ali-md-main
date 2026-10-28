// WEBSITE mode: the user enters a number on the website, the website returns a pairing code,
// and as soon as it is linked the bot starts running on that number.
const http = require("http");
const fs = require("fs");
const path = require("path");
const bot = require("./bot");

const PORT = process.env.PORT || 3000;
const MAX_SESSIONS = Number(process.env.MAX_SESSIONS || 20);
const SESSIONS_DIR = path.join(__dirname, "sessions");
const INDEX_HTML = path.join(__dirname, "public", "index.html");
fs.mkdirSync(SESSIONS_DIR, { recursive: true });

const hits = new Map(); // ip -> [timestamps]
function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 6; // max 6 codes per 10 minutes
}

function json(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

async function pair(number) {
  const id = number;
  const existing = bot.sessions.get(id);
  if (existing?.connected) return { status: "connected" };
  if (existing?.registered) return { status: "already_linked" };
  if (existing) existing.stop(true, "restart pairing");
  if (bot.sessions.size >= MAX_SESSIONS) return { error: "The server is full. Please try again later or in 10 min.", http: 503 };

  const code = await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("Creating the code took too long. Please try again.")), 30000);
    bot.startSession({
      id, authDir: path.join(SESSIONS_DIR, id), ownerNumber: number, phoneNumber: number,
      onPairingCode: (c, err) => { clearTimeout(t); c ? resolve(c) : reject(new Error(err || "Could not create the code")); },
    }).catch((e) => { clearTimeout(t); reject(e); });
  }).catch((e) => ({ error: e.message }));
  if (code.error) { bot.sessions.get(id)?.stop(true, "pair failed"); return { error: code.error, http: 500 }; }
  return { status: "code", code };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();

  if (url.pathname === "/api/pair") {
    const number = (url.searchParams.get("number") || "").replace(/\D/g, "");
    if (number.length < 8 || number.length > 15) return json(res, 400, { error: "Enter a valid number (with country code, without +)." });
    if (limited(ip)) return json(res, 429, { error: "Too many requests. Please try again in a few minutes." });
    const r = await pair(number);
    return json(res, r.http || 200, r);
  }
  if (url.pathname === "/api/status") {
    const number = (url.searchParams.get("number") || "").replace(/\D/g, "");
    return json(res, 200, { connected: !!bot.sessions.get(number)?.connected });
  }
  if (url.pathname === "/" || url.pathname === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(fs.readFileSync(INDEX_HTML));
  }
  res.writeHead(404); res.end("Not found");
});

(async () => {
  await bot.init();
  // on server restart, resume sessions that are already linked
  for (const dir of fs.readdirSync(SESSIONS_DIR)) {
    try {
      const creds = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, dir, "creds.json"), "utf8"));
      if (creds.registered) await bot.startSession({ id: dir, authDir: path.join(SESSIONS_DIR, dir), ownerNumber: dir });
      else fs.rmSync(path.join(SESSIONS_DIR, dir), { recursive: true, force: true });
    } catch { fs.rmSync(path.join(SESSIONS_DIR, dir), { recursive: true, force: true }); }
  }
  server.listen(PORT, "0.0.0.0", () => console.log(`🌐 Website running at: http://localhost:${PORT}`));
})();
