// ALI MD — Premium / Trial / Subscription core
// Data is saved in data/premium.json (one record per bot-owner number).
const fs = require("fs");
const path = require("path");
const config = require("./config");

const DATA_DIR = path.join(__dirname, "data");
const FILE = path.join(DATA_DIR, "premium.json");
const DAY = 24 * 60 * 60 * 1000;

fs.mkdirSync(DATA_DIR, { recursive: true });

let db = { users: {}, userdata: {} };
try {
  db = { users: {}, userdata: {}, ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
} catch {}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); }
    catch (e) { console.error("premium save error:", e.message); }
  }, 300);
}

const clean = (n) => String(n || "").replace(/\D/g, "");
const trialDays = () => Number(config.premium?.trialDays ?? 3);
const price = () => config.premium?.pricePerMonth ?? 199;

function isSeller(number) {
  const n = clean(number);
  return !!n && [config.sellerNumber, ...(config.admins || [])].map(clean).includes(n);
}

// Called when a number links / the bot connects. Starts the free trial ONCE per number.
function ensureTrial(number) {
  const n = clean(number);
  if (!n) return null;
  if (!db.users[n]) {
    db.users[n] = { trialStart: Date.now(), trialEnd: Date.now() + trialDays() * DAY, paidUntil: 0, history: [] };
    save();
  }
  return db.users[n];
}

// -> { active, type: "seller"|"paid"|"trial"|"expired", msLeft }
function status(number) {
  const n = clean(number);
  if (isSeller(n)) return { active: true, type: "seller", msLeft: Infinity };
  const u = ensureTrial(n);
  if (!u) return { active: false, type: "expired", msLeft: 0 };
  const now = Date.now();
  if (u.paidUntil > now) return { active: true, type: "paid", msLeft: u.paidUntil - now };
  if (u.trialEnd > now) return { active: true, type: "trial", msLeft: u.trialEnd - now };
  return { active: false, type: "expired", msLeft: 0 };
}

function activate(number, months = 1) {
  const n = clean(number);
  const u = ensureTrial(n);
  const base = Math.max(Date.now(), u.paidUntil || 0);
  u.paidUntil = base + months * 30 * DAY;
  u.history.push({ at: Date.now(), months, amount: months * price() });
  save();
  return u;
}

function deactivate(number) {
  const n = clean(number);
  const u = db.users[n];
  if (!u) return false;
  u.paidUntil = 0;
  u.trialEnd = 0;
  save();
  return true;
}

function fmtLeft(ms) {
  if (ms === Infinity) return "unlimited ♾️";
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return d > 0 ? `${d} din ${h} ghanta` : `${h} ghanta ${m} min`;
}

function list() {
  return Object.entries(db.users).map(([number, u]) => ({ number, ...u, ...status(number) }));
}

// ---- small per-owner key/value store (notes, todo, afk, autoreply ...) ----
function getData(number, key, fallback) {
  const n = clean(number);
  const v = db.userdata[n]?.[key];
  return v === undefined ? fallback : v;
}
function setData(number, key, value) {
  const n = clean(number);
  if (!db.userdata[n]) db.userdata[n] = {};
  db.userdata[n][key] = value;
  save();
}

// Shown for EVERY command once the 3-day free trial / paid month is over
function lockedText() {
  const p = config.premium || {};
  const admin = clean(p.adminWhatsApp || config.sellerNumber);
  return (
    `⛔ *Free trial ended!*\n\n` +
    `💎 Buy monthly plan: *${price()} PKR*\n\n` +
    `💳 *Easypaisa:* ${p.easypaisaNumber || "03257825672"}\n` +
    `👤 *Account Name:* ${p.accountName || "Ansar Abbas"}\n\n` +
    `📞 *Contact with admin:*\n${p.adminWhatsApp || "03257825672"}\n` +
    `wa.me/${admin.startsWith("0") ? "92" + admin.slice(1) : admin}`
  );
}

const isKnown = (number) => !!db.users[clean(number)];
const record = (number) => db.users[clean(number)] || null;

module.exports = {
  record, isKnown, ensureTrial, status, activate, deactivate, fmtLeft, list, isSeller,
  getData, setData, lockedText, price, trialDays, clean,
};
