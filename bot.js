// ALI MD — bot core: runs one or more WhatsApp sessions (Baileys 7.x)
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const pino = require("pino");
const qrcode = require("qrcode-terminal");
const baseConfig = require("./config");
const premium = require("./premium");

const PLACEHOLDER_NUMBER = "923001234567";
const sessions = new Map(); // id -> session
let B; // Baileys (ESM)

// ---- commands (loaded once) ----
const commands = new Map();
const commandsDir = path.join(__dirname, "commands");
fs.readdirSync(commandsDir).forEach((file) => {
  if (!file.endsWith(".js")) return;
  try {
    require(path.join(commandsDir, file)).forEach((cmd) => {
      commands.set(cmd.name, cmd);
      (cmd.aliases || []).forEach((a) => commands.set(a, cmd));
    });
  } catch (e) {
    console.error(`❌ commands/${file} failed to load:`, e.message);
  }
});
console.log(`✅ Loaded ${commands.size} command mappings (with aliases)`);

const digits = (j) => (j || "").split("@")[0].split(":")[0].replace(/\D/g, "");
const sameUser = (p, ids) => ids.some((i) => i && [p.id, p.phoneNumber, p.lid].includes(i));

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(query, (ans) => { rl.close(); resolve(ans); }));
}

async function init() {
  if (B) return;
  try {
    B = await import("@whiskeysockets/baileys");
  } catch (e) {
    console.error("❌ Baileys could not be loaded. Run `npm install` first. Error:", e.message);
    process.exit(1);
  }
}

// opts: { id, authDir, ownerNumber, phoneNumber, interactive, onPairingCode, onOpen, onRemoved }
async function startSession(opts) {
  const { id, authDir, interactive = false } = opts;
  if (sessions.has(id)) return sessions.get(id);

  // each session gets its own config copy (so .mode / .antilink etc. only affect that session)
  const config = { ...baseConfig, features: { ...baseConfig.features }, ownerNumber: opts.ownerNumber || baseConfig.ownerNumber };
  const session = { id, config, sock: null, connected: false, registered: false, stopped: false, starting: false, attempt: 0, store: new Map(), pairTimer: null, adminAuth: new Map(), adminPending: new Map(), adminFails: new Map(), botSent: new Set() };
  sessions.set(id, session);

  const remember = (msg) => {
    if (!msg?.key?.id) return;
    session.store.set(msg.key.id, { msg, timestamp: Date.now() });
    if (session.store.size > 500) session.store.delete(session.store.keys().next().value);
  };

  session.stop = (removeFiles = false, reason = "") => {
    session.stopped = true;
    clearTimeout(session.pairTimer);
    clearInterval(session.jobs);
    try { session.sock?.ev.removeAllListeners(); } catch {}
    try { session.sock?.end(undefined); } catch {}
    sessions.delete(id);
    if (removeFiles) fs.rmSync(authDir, { recursive: true, force: true });
    opts.onRemoved?.(reason);
  };

  const scheduleRestart = (ms) => setTimeout(() => {
    if (!session.stopped) begin().catch((e) => { console.error(`[${id}] start error:`, e); scheduleRestart(5000); });
  }, ms);

  async function begin() {
    if (session.starting || session.stopped) return;
    session.starting = true;
    try {
      const { state, saveCreds } = await B.useMultiFileAuthState(authDir);
      session.registered = !!state.creds.registered;
      const needPairing = baseConfig.usePairingCode && !state.creds.registered;

      let phoneNumber = (opts.phoneNumber || "").replace(/\D/g, "");
      if (needPairing && interactive && (!phoneNumber || phoneNumber === PLACEHOLDER_NUMBER)) {
        phoneNumber = (await askQuestion("Enter your WhatsApp number (with country code, no +, e.g. 923001234567): ")).replace(/\D/g, "");
        config.ownerNumber = phoneNumber;
      }

      let version;
      try { ({ version } = await B.fetchLatestBaileysVersion()); }
      catch { console.log("⚠️ Could not fetch the latest WhatsApp version, using the default."); }

      const logger = pino({ level: "silent" });
      const sock = B.default({
        ...(version ? { version } : {}),
        logger,
        auth: { creds: state.creds, keys: B.makeCacheableSignalKeyStore(state.keys, logger) },
        browser: B.Browsers.ubuntu("Chrome"),
        markOnlineOnConnect: false,
        syncFullHistory: false,
        getMessage: async (key) => session.store.get(key.id)?.msg?.message || undefined,
      });
      session.sock = sock;
      session.starting = false;

      if (needPairing && !interactive && !session.pairTimer) {
        // server mode: remove the session if not linked within 3 minutes
        session.pairTimer = setTimeout(() => { if (!session.connected && !session.stopped) session.stop(true, "pairing timeout"); }, 180000);
      }

      let pairingShown = false;
      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          if (needPairing && !pairingShown) {
            pairingShown = true;
            try {
              const code = await sock.requestPairingCode(phoneNumber);
              const pretty = code?.match(/.{1,4}/g)?.join("-") || code;
              if (interactive) {
                console.log("\n==============================");
                console.log(` 🔑 Pairing Code: ${pretty}`);
                console.log("==============================");
                console.log("WhatsApp > Settings > Linked Devices > Link a Device > 'Link with phone number instead'");
                console.log("Then enter this code.\n");
              }
              opts.onPairingCode?.(pretty);
            } catch (err) {
              pairingShown = false;
              console.error(`[${id}] Could not create the pairing code:`, err?.message || err);
              opts.onPairingCode?.(null, err?.message || "pairing failed");
            }
          } else if (!baseConfig.usePairingCode && interactive) {
            console.log("\n📱 Scan this QR code with your WhatsApp:\n");
            qrcode.generate(qr, { small: true });
          }
        }

        if (connection === "open") {
          session.attempt = 0;
          session.connected = true;
          session.registered = true;
          clearTimeout(session.pairTimer);
          console.log(`✅ [${id}] Bot connected successfully!`);
          opts.onOpen?.();
          try { await onConnected(session, sock); } catch (e) { console.error(`[${id}] onConnected error:`, e.message); }
        }

        if (connection === "close") {
          session.connected = false;
          if (session.stopped) return;
          const code = lastDisconnect?.error?.output?.statusCode;
          const reason = lastDisconnect?.error?.output?.payload?.message || lastDisconnect?.error?.message || "unknown";
          console.log(`❌ [${id}] Connection closed. Code: ${code} | Reason: ${reason}`);
          try { sock.ev.removeAllListeners(); } catch {}
          session.starting = false;
          const D = B.DisconnectReason;

          if (code === D.loggedOut || code === D.forbidden) {
            if (interactive) {
              console.log("🔒 Logged out of WhatsApp. Removing the old login and creating a new pairing code...");
              fs.rmSync(authDir, { recursive: true, force: true });
              return scheduleRestart(2000);
            }
            console.log(`🔒 [${id}] logged out, session removed.`);
            return session.stop(true, "logged out");
          }
          if (code === D.connectionReplaced) {
            console.log(`⚠️ [${id}] This account is running the bot somewhere else too. Stop the other one, then start again.`);
            if (interactive) return process.exit(100);
            return session.stop(false, "replaced");
          }
          if (code === D.restartRequired) return scheduleRestart(500); // normal right after pairing
          if (code === 405) console.log("ℹ️ Code 405: the library may be outdated. Run `npm update`.");
          session.attempt++;
          const wait = Math.min(30000, 2000 * 2 ** Math.min(session.attempt, 4));
          console.log(`🔄 [${id}] reconnecting in ${wait / 1000}s...`);
          scheduleRestart(wait);
        }
      });

      sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;
        for (const raw of messages) {
          try { await handleMessage(session, sock, raw, remember); } catch (e) { console.error(`[${id}] Message handler error:`, e); }
        }
      });

      sock.ev.on("messages.update", async (updates) => {
        if (!config.features.antiDelete) return;
        for (const update of updates) {
          if (update.update?.message !== null || update.key.fromMe) continue;
          const stored = session.store.get(update.key.id);
          const m = stored?.msg?.message && B.normalizeMessageContent(stored.msg.message);
          if (!m) continue;
          const from = update.key.remoteJid;
          const deletedBy = update.key.participant || update.key.remoteJid;
          try {
            await sock.sendMessage(from, { text: `🗑️ *Anti-Delete*\n@${deletedBy.split("@")[0]} deleted a message:`, mentions: [deletedBy] });
            if (m.conversation || m.extendedTextMessage) {
              await sock.sendMessage(from, { text: `💬 ${m.conversation || m.extendedTextMessage.text}` });
            } else if (m.imageMessage) {
              await sock.sendMessage(from, { image: await B.downloadMediaMessage(stored.msg, "buffer", {}), caption: m.imageMessage.caption || "" });
            } else if (m.videoMessage) {
              await sock.sendMessage(from, { video: await B.downloadMediaMessage(stored.msg, "buffer", {}), caption: m.videoMessage.caption || "" });
            } else if (m.stickerMessage) {
              await sock.sendMessage(from, { sticker: await B.downloadMediaMessage(stored.msg, "buffer", {}) });
            } else if (m.audioMessage) {
              await sock.sendMessage(from, { audio: await B.downloadMediaMessage(stored.msg, "buffer", {}), mimetype: "audio/mp4" });
            }
          } catch (err) {
            console.error(`[${id}] Anti-delete resend error:`, err);
          }
        }
      });

      sock.ev.on("call", async (calls) => {
        try {
          if (!config.features.antiCall || !premActive(session, sock)) return;
          for (const c of calls) {
            if (c.status !== "offer") continue;
            await sock.rejectCall(c.id, c.from);
            await sock.sendMessage(c.from, { text: "📵 Calls are not allowed. Please send a message instead." });
          }
        } catch (e) { console.error(`[${id}] anti-call error:`, e.message); }
      });

      sock.ev.on("group-participants.update", async (event) => {
        const { id: groupId, participants, action } = event;
        try {
          const list = participants.map((p) => (typeof p === "string" ? p : p.id));
          if (action === "add" && config.features.welcome) {
            for (const p of list) await sock.sendMessage(groupId, { text: config.welcomeMessage.replace("@user", `@${p.split("@")[0]}`), mentions: [p] });
          } else if (action === "remove" && config.features.goodbye) {
            for (const p of list) await sock.sendMessage(groupId, { text: config.goodbyeMessage.replace("@user", `@${p.split("@")[0]}`), mentions: [p] });
          }
        } catch (err) {
          console.error(`[${id}] Welcome/Goodbye error:`, err);
        }
      });
    } catch (err) {
      session.starting = false;
      throw err;
    }
  }

  await begin();
  return session;
}

// ---------- premium helpers ----------
const ownerKeyOf = (session, sock) => premium.clean(session.config.ownerNumber) || digits(sock?.user?.id);
const premActive = (session, sock) => premium.status(ownerKeyOf(session, sock)).active;

async function onConnected(session, sock) {
  const key = digits(sock.user?.id) || premium.clean(session.config.ownerNumber);
  if (key && key !== premium.clean(session.config.ownerNumber) && !premium.isSeller(session.config.ownerNumber)) {
    session.config.ownerNumber = key; // the linked number is the owner of its own bot
  }
  const isNew = !premium.isKnown(key);
  premium.ensureTrial(key);
  if (isNew && !premium.isSeller(key)) {
    const p = session.config.prefix;
    try {
      await sock.sendMessage(B.jidNormalizedUser(sock.user.id), {
        text: `🎉 *Welcome to ${session.config.botName}!*\n\n🎁 Aap ko *${premium.trialDays()} din ka FREE trial* mil gaya hai.\n💎 Uske baad *${premium.price()} PKR/month*.\n\n📜 Commands: *${p}menu*\n📊 Status: *${p}premium*`,
      });
    } catch {}
  }
  startBackgroundJobs(session, sock);
}

// Tells the user (once) when their trial/subscription is about to end and when it has ended
async function checkExpiry(session, sock) {
  const key = ownerKeyOf(session, sock);
  if (!key || premium.isSeller(key)) return;
  const u = premium.record(key);
  if (!u) return;
  const s = premium.status(key);
  const me = B.jidNormalizedUser(sock.user.id);
  const p = session.config.prefix;
  const sent = premium.getData(key, "notified", {});
  const end = s.type === "paid" ? u.paidUntil : s.type === "trial" ? u.trialEnd : 0;
  let text = "";
  if (s.active && s.msLeft < 24 * 3600 * 1000 && !sent["warn" + end]) {
    sent["warn" + end] = 1;
    text = `⏰ *Reminder:* aap ka ${s.type === "trial" ? "free trial" : "premium"} *${premium.fmtLeft(s.msLeft)}* mein khatam ho raha hai.\n💎 Jari rakhne ke liye ${premium.price()} PKR/month: *${p}buy*`;
  } else if (!s.active) {
    const last = Math.max(u.trialEnd || 0, u.paidUntil || 0);
    if (!sent["exp" + last]) {
      sent["exp" + last] = 1;
      text = premium.lockedText();
    }
  }
  if (text) {
    premium.setData(key, "notified", sent);
    try { await sock.sendMessage(me, { text }); } catch {}
  }
}

function startBackgroundJobs(session, sock) {
  clearInterval(session.jobs);
  let tick = 0;
  checkExpiry(session, sock).catch(() => {});
  session.jobs = setInterval(async () => {
    tick++;
    try {
      if (!session.connected || session.stopped) return;
      if (tick % 360 === 0) await checkExpiry(session, sock); // about once an hour
      const f = session.config.features;
      if (!premActive(session, sock)) return;
      if (f.alwaysOnline) await sock.sendPresenceUpdate("available");
      if (f.autoBio && tick % 6 === 0) {
        const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        await sock.updateProfileStatus(`${session.config.botName} • ${t} • Online ✅`);
      }
    } catch {}
  }, 10000);
}

// Wraps sock so every reply a command sends ends with the footer ("Developed By Ali")
function withFooter(sock, footer) {
  if (!footer) return sock;
  const tag = `\n\n_${footer}_`;
  return new Proxy(sock, {
    get(target, prop) {
      if (prop !== "sendMessage") { const v = target[prop]; return typeof v === "function" ? v.bind(target) : v; }
      return async (jid, content, options) => {
        if (!content || content.react || content.delete || content.forward || content.sticker) return target.sendMessage(jid, content, options);
        const c = { ...content };
        let needsText = false;
        if (typeof c.text === "string") c.text += tag;
        else if (c.image || c.video || c.document) c.caption = (c.caption || "") + (c.caption ? tag : `_${footer}_`);
        else if (c.audio) needsText = true;
        const res = await target.sendMessage(jid, c, options);
        if (needsText) await target.sendMessage(jid, { text: `_${footer}_` }, options).catch(() => {});
        return res;
      };
    },
  });
}

const BAD_WORDS = ["fuck", "bitch", "bastard", "asshole", "dick", "slut", "harami", "bc ka bacha", "harami", "kutta", "kutti", "bhosd", "madarch", "behnchod", "chutiya", "lanat","teri ma ko lan","kangri ka bacha","bc ka bacha"];

async function handleMessage(session, sock, rawMsg, remember) {
  const { config } = session;
  if (!rawMsg.message) return;
  remember(rawMsg);

  const msg = { ...rawMsg, message: B.normalizeMessageContent(rawMsg.message) || rawMsg.message };
  const from = msg.key.remoteJid;
  if (!from) return;
  const isGroup = from.endsWith("@g.us");
  const myJid = B.jidNormalizedUser(sock.user?.id || "");
  const myLid = sock.user?.lid ? B.jidNormalizedUser(sock.user.lid) : "";
  const sender = msg.key.fromMe ? myJid : isGroup ? (msg.key.participant || from) : from;
  const senderAlt = msg.key.fromMe ? myLid : isGroup ? msg.key.participantAlt : msg.key.remoteJidAlt;
  const ownerDigits = (config.ownerNumber || "").replace(/\D/g, "");
  const isOwner = !!msg.key.fromMe || [sender, senderAlt].some((j) => j && digits(j) === ownerDigits);

  const isSenderAdmin = async () => {
    if (!isGroup) return false;
    const meta = await sock.groupMetadata(from);
    const ids = [sender, senderAlt].filter(Boolean);
    return meta.participants.some((p) => (p.admin === "admin" || p.admin === "superadmin") && sameUser(p, ids));
  };

  if (config.features.autoStatusView && from === "status@broadcast" && !msg.key.fromMe) {
    try { await sock.readMessages([msg.key]); } catch (e) { console.error("Auto status view error:", e.message); }
    if (config.features.autoStatusLike) {
      try {
        await sock.sendMessage("status@broadcast", { react: { text: "❤️", key: msg.key } }, { statusJidList: [msg.key.participant, myJid].filter(Boolean) });
      } catch (e) { console.error("Auto status like error:", e.message); }
    }
  }
  if (from === "status@broadcast") return;

  if (!msg.key.fromMe) {
    if (config.features.autoRead) {
      try { await sock.readMessages([msg.key]); } catch (e) { console.error("Auto read error:", e.message); }
    }
    if (config.features.autoReact) {
      try {
        const emojis = config.reactEmojis?.length ? config.reactEmojis : ["👍", "❤️", "😂", "🔥", "✅", "😮"];
        await sock.sendMessage(from, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key } });
      } catch (e) { console.error("Auto react error:", e.message); }
    }
    const linkText = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    if (premActive(session, sock)) {
      try {
        if (config.features.autoTyping) await sock.sendPresenceUpdate("composing", from);
        else if (config.features.autoRecording) await sock.sendPresenceUpdate("recording", from);
      } catch {}
      if (config.features.antiBadWord && isGroup && linkText && !linkText.startsWith(config.prefix)) {
        const low = linkText.toLowerCase();
        if (BAD_WORDS.some((w) => low.includes(w))) {
          try {
            if (!(await isSenderAdmin())) {
              await sock.sendMessage(from, { delete: msg.key });
              await sock.sendMessage(from, { text: `🚫 @${sender.split("@")[0]}, bad words are not allowed here mehrbani kr ka leave kr do warna ma khud kick kr do ga .`, mentions: [sender] });
              return;
            }
          } catch (e) { console.error("Anti-badword error:", e.message); }
        }
      }
      if (config.features.autoReply && linkText && !linkText.startsWith(config.prefix)) {
        const replies = premium.getData(ownerKeyOf(session, sock), "autoreplies", {});
        const hit = replies[linkText.trim().toLowerCase()];
        if (hit) { try { await sock.sendMessage(from, { text: hit }, { quoted: msg }); } catch {} }
      }
      // AFK: someone mentions / messages the owner while away
      const afk = premium.getData(ownerKeyOf(session, sock), "afk", null);
      if (afk && !isOwner && (!isGroup || (msg.message.extendedTextMessage?.contextInfo?.mentionedJid || []).some((j) => digits(j) === ownerDigits))) {
        try { await sock.sendMessage(from, { text: `💤 Owner abhi AFK hai.\n📝 Wajah: ${afk.reason}\n⏱️ Jab se: ${premium.fmtLeft(Date.now() - afk.since)}` }, { quoted: msg }); } catch {}
      }
    }
    if (config.features.antiLink && isGroup && /https?:\/\/|chat\.whatsapp\.com/i.test(linkText)) {
      try {
        if (!(await isSenderAdmin())) {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.sendMessage(from, { text: `⚠️ @${sender.split("@")[0]}, links are not allowed in this group.{warning**}`, mentions: [sender] });
          return;
        }
      } catch (e) { console.error("Anti-link error:", e.message); }
    }
  }

  const body =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption ||
    "";
  // ---------- ADMIN PASSWORD GATE ----------
  const adminKey = digits(sender);
  const pendKey = adminKey + "|" + from;
  const isAuthed = () => (session.adminAuth.get(adminKey) || 0) > Date.now();
  const adminSay = async (text) => {
    const r = await sock.sendMessage(from, { text }, { quoted: msg });
    if (r?.key?.id) { session.botSent.add(r.key.id); if (session.botSent.size > 300) session.botSent.delete(session.botSent.values().next().value); }
    return r;
  };
  let text = body;     // what we treat as the command text
  let cmdMsg = msg;    // the message the command belongs to (for replies / mentions)
  const pend = session.adminPending.get(pendKey);
  if (pend && !session.botSent.has(msg.key.id)) {
    if (pend.expires < Date.now()) {
      session.adminPending.delete(pendKey);
    } else if (body.startsWith(config.prefix)) {
      session.adminPending.delete(pendKey); // user moved on to another command
    } else if (body) {
      // this message is the password attempt
      session.adminPending.delete(pendKey);
      const fail = session.adminFails.get(adminKey) || { n: 0, until: 0 };
      if (fail.until > Date.now()) {
        await adminSay(`⛔ Bahut zyada ghalat try. ${Math.ceil((fail.until - Date.now()) / 60000)} minute baad dobara try karo.`);
        return;
      }
      try { await sock.sendMessage(from, { delete: msg.key }); } catch {} // hide the password from the chat
      if (body.trim() === String(config.adminPassword || "")) {
        session.adminFails.delete(adminKey);
        session.adminAuth.set(adminKey, Date.now() + (Number(config.adminSessionMinutes) || 30) * 60000);
        await adminSay("✅correct password. Now you can handle this bot .");
        text = config.prefix + pend.cmdName + (pend.args.length ? " " + pend.args.join(" ") : "");
        cmdMsg = pend.msg;
      } else {
        fail.n++;
        if (fail.n >= 3) { fail.n = 0; fail.until = Date.now() + 5 * 60000; await adminSay("❌ Wrong Password. If you try again to access admin panel bot will disconnect — you have no more tries."); }
        else await adminSay(`❌ Wrong Password. (${fail.n}last warning)`);
        session.adminFails.set(adminKey, fail);
        return;
      }
    }
  }

  if (!text.startsWith(config.prefix)) return;

  const args = text.slice(config.prefix.length).trim().split(/\s+/);
  const cmdName = (args.shift() || "").toLowerCase();
  const cmd = commands.get(cmdName);
  if (!cmd) return;

  // private mode: stay completely silent for everyone except the owner
  if (config.mode === "private" && !isOwner) return;

  // admin commands: password first (only for commands marked admin: true)
  if (cmd.admin && !isAuthed()) {
    const fail = session.adminFails.get(adminKey);
    if (fail?.until > Date.now()) return adminSay(`⛔ Donot TRy To Access If You're Not Owner. ${Math.ceil((fail.until - Date.now()) / 60000)}OnLy LeFt To KiCk YoU.`);
    session.adminPending.set(pendKey, { cmdName, args: [...args], msg, expires: Date.now() + 120000 });
    return adminSay("🔐 *Admin Command*\n\nPlease enter password.\n_(Write Password now, In Next Text )_");
  }

  // 1) react to the command message first (e.g. .menu gets a reaction), then reply
  const react = async (emoji) => {
    if (!emoji) return;
    try { await sock.sendMessage(from, { react: { text: emoji, key: cmdMsg.key } }); } catch {}
  };
  if (config.commandReact) await react(cmd.react || config.commandReactEmoji || "⏳");

  // 2) premium gate (trial / paid)
  const ownerKey = ownerKeyOf(session, sock);
  // applies to ALL commands: after the free trial / paid month, nothing works
  if (!premium.status(ownerKey).active) {
    await react("🔒");
    return sock.sendMessage(from, { text: premium.lockedText() }, { quoted: cmdMsg });
  }

  try {
    await cmd.run({ sock: withFooter(sock, config.footer), msg: cmdMsg, from, sender, args, isGroup, isOwner, isSenderAdmin, config, ownerKey, session, premium, commandName: cmdName, commands, messageStore: session.store, downloadMediaMessage: B.downloadMediaMessage });
    if (config.commandReact && config.commandDoneEmoji) await react(config.commandDoneEmoji);
  } catch (err) {
    console.error(`Error in command "${cmdName}":`, err);
    await react("❌");
    await sock.sendMessage(from, { text: "❌ An error occurred while running the command." }, { quoted: cmdMsg });
  }
}

process.on("unhandledRejection", (e) => console.error("Unhandled rejection:", e?.message || e));
process.on("uncaughtException", (e) => console.error("Uncaught exception:", e?.message || e));

module.exports = { init, startSession, sessions, commands };
