// 💎 Premium core: status, trial, buy, admin activation, premium menu, premium feature switches
const premium = require("../premium");

const reply = (sock, from, msg, text) => sock.sendMessage(from, { text }, { quoted: msg });
const onlySeller = (isOwner, ownerKey) => premium.isSeller(ownerKey);

// split long text into WhatsApp-friendly chunks
function chunks(text, max = 3000) {
  const out = [];
  let cur = "";
  for (const part of text.split("\n")) {
    if ((cur + "\n" + part).length > max) { out.push(cur); cur = part; }
    else cur = cur ? cur + "\n" + part : part;
  }
  if (cur) out.push(cur);
  return out;
}

function toggle(name, featureKey, label, hint) {
  return {
    name,
    premium: true,
    category: "⚙️ Premium Settings",
    run: async ({ sock, from, msg, args, isOwner, config }) => {
      if (!isOwner) return reply(sock, from, msg, "⚠️ Only the owner can use this command.");
      const c = (args[0] || "").toLowerCase();
      if (c !== "on" && c !== "off") return reply(sock, from, msg, `Example: .${name} on  /  .${name} off\n${hint || ""}`.trim());
      config.features[featureKey] = c === "on";
      await reply(sock, from, msg, `✅ ${label}: ${c.toUpperCase()}`);
    },
  };
}

module.exports = [
  {
    name: "premium",
    aliases: ["plan", "subscription", "mysub"],
    run: async ({ sock, from, msg, ownerKey, config }) => {
      const s = premium.status(ownerKey);
      const label = { seller: "👑 Seller / Admin", paid: "💎 Premium (Paid)", trial: "🎁 Free Trial", expired: "⛔ Expired" }[s.type];
      const text =
        `💎 *${config.botName} PREMIUM*\n\n` +
        `📊 Status: ${label}\n` +
        (s.active ? `⏳ Bachay hue: *${premium.fmtLeft(s.msLeft)}*\n` : `⚠️ Trial khatam — commands band hain.\n`) +
        `\n💰 Price: *${premium.price()} PKR/month*\n` +
        `🎁 Free trial: *${premium.trialDays()} din* (pehli dafa number lagane par)\n` +
        `✨ 1000+ premium commands & features\n\n` +
        `💳 ${config.premium?.paymentInfo || ""}\n📞 wa.me/${premium.clean(config.sellerNumber)}\n\n` +
        `📜 ${config.prefix}pmenu — premium commands`;
      await reply(sock, from, msg, text);
    },
  },
  {
    name: "trial",
    run: async ({ sock, from, msg, ownerKey, config }) => {
      const s = premium.status(ownerKey);
      if (s.type === "trial") return reply(sock, from, msg, `🎁 Free trial chal raha hai. Bachay hue: *${premium.fmtLeft(s.msLeft)}*`);
      if (s.type === "paid" || s.type === "seller") return reply(sock, from, msg, "💎 Aap already premium hain. Trial ki zarurat nahi.");
      await reply(sock, from, msg, `⛔ Aap ka ${premium.trialDays()} din ka free trial khatam ho chuka hai (trial sirf ek dafa milta hai).\n\n💎 ${premium.price()} PKR/month mein premium lein: *${config.prefix}buy*`);
    },
  },
  {
    name: "buy",
    aliases: ["subscribe", "upgrade"],
    run: async ({ sock, from, msg, config }) => {
      await reply(sock, from,  msg,
        `💎 *Premium kharidne ka tareeqa*\n\n` +
        `1️⃣ *${premium.price()} PKR* bhejein (1 month)\n   💳 ${config.premium?.paymentInfo || ""}\n` +
        `2️⃣ Payment ka screenshot + apna bot number bhejein:\n   📞 wa.me/${premium.clean(config.sellerNumber)}\n` +
        `3️⃣ Seller aap ka premium activate kar dega ✅\n\n` +
        `Multiple months: 2 months = Rs ${premium.price() * 2}, 3 months = Rs ${premium.price() * 3}`);
    },
  },
  // ---------- premium menu ----------
  {
    name: "pmenu",
    aliases: ["premiummenu", "pm"],
    run: async ({ sock, from, msg, args, config, commands }) => {
      const p = config.prefix;
      const seen = new Set();
      const byCat = new Map();
      for (const c of commands.values()) {
        if (!c.premium || seen.has(c)) continue;
        seen.add(c);
        const cat = c.category || "✨ Misc";
        if (!byCat.has(cat)) byCat.set(cat, []);
        byCat.get(cat).push(c.name);
      }
      const q = args.join(" ").toLowerCase().trim();
      if (!q) {
        const total = [...byCat.values()].reduce((n, a) => n + a.length, 0);
        const lines = [...byCat.entries()].map(([cat, a], i) => `${i + 1}. ${cat} — *${a.length}*`);
        return reply(sock, from, msg,
          `💎 *${config.botName} PREMIUM MENU*\n📦 Total premium commands: *${total}*\n\n${lines.join("\n")}\n\n` +
          `📂 Category dekhne ke liye number ya naam likhein:\n   ${p}pmenu 1   ya   ${p}pmenu convert\n` +
          `🔎 Search: ${p}psearch <word>`);
      }
      const cats = [...byCat.entries()];
      let hits;
      if (/^\d+$/.test(q)) hits = cats[Number(q) - 1] ? [cats[Number(q) - 1]] : [];
      else {
        const stem = q.length >= 6 ? q.slice(0, 5) : q; // "converters" -> "conve"
        hits = cats.filter(([cat]) => cat.toLowerCase().includes(q));
        if (!hits.length) hits = cats.filter(([cat]) => cat.toLowerCase().includes(stem));
      }
      if (!hits.length) return reply(sock, from, msg, `❌ Category nahi mili. ${p}pmenu likh kar list dekhein.`);
      const body = hits.map(([cat, names]) => `💎 *${cat}* (${names.length})\n${names.map((n) => p + n).join("  •  ")}`).join("\n\n");
      for (const part of chunks(body, 3000)) await sock.sendMessage(from, { text: part }, { quoted: msg });
    },
  },
  {
    name: "psearch",
    category: "💎 Premium Core",
    run: async ({ sock, from, msg, args, config, commands }) => {
      const q = (args[0] || "").toLowerCase();
      if (!q) return reply(sock, from, msg, "Example: .psearch km");
      const names = [...new Set([...commands.values()].filter((c) => c.premium && c.name.includes(q)).map((c) => c.name))];
      if (!names.length) return reply(sock, from, msg, "❌ Kuch nahi mila.");
      const shown = names.slice(0, 80).map((n) => config.prefix + n).join("  •  ");
      await reply(sock, from, msg, `🔎 ${names.length} mile:\n\n${shown}${names.length > 80 ? "\n…" : ""}`);
    },
  },
  {
    name: "pcount",
    run: async ({ sock, from, msg, commands }) => {
      const all = new Set([...commands.values()]);
      const prem = [...all].filter((c) => c.premium).length;
      await reply(sock, from, msg, `📦 Total commands: *${all.size}*\n💎 Premium: *${prem}*\n🆓 Free: *${all.size - prem}*`);
    },
  },

  // ---------- premium feature switches ----------
  toggle("autotyping", "autoTyping", "Auto typing"),
  toggle("autorecording", "autoRecording", "Auto recording"),
  toggle("alwaysonline", "alwaysOnline", "Always online"),
  toggle("anticall", "antiCall", "Anti-call"),
  toggle("antibadword", "antiBadWord", "Anti bad-word (groups)"),
  toggle("autoreply", "autoReply", "Auto reply", "Replies add karein: .addreply hi=hello"),
  toggle("autobio", "autoBio", "Auto bio (time)"),
  {
    name: "pstatus",
    premium: true,
    category: "⚙️ Premium Settings",
    run: async ({ sock, from, msg, config }) => {
      const f = config.features;
      const on = (v) => (v ? "ON ✅" : "OFF ❌");
      await reply(sock, from, msg,
        `💎 *Premium Settings*\nAuto typing: ${on(f.autoTyping)}\nAuto recording: ${on(f.autoRecording)}\nAlways online: ${on(f.alwaysOnline)}\nAnti-call: ${on(f.antiCall)}\nAnti bad-word: ${on(f.antiBadWord)}\nAuto reply: ${on(f.autoReply)}\nAuto bio: ${on(f.autoBio)}`);
    },
  },
  {
    name: "addreply",
    premium: true,
    category: "⚙️ Premium Settings",
    run: async ({ sock, from, msg, args, isOwner, ownerKey }) => {
      if (!isOwner) return reply(sock, from, msg, "⚠️ Only the owner can use this command.");
      const [k, ...v] = args.join(" ").split("=");
      if (!k?.trim() || !v.length) return reply(sock, from, msg, "Example: .addreply hi=Hello, kaise hain?");
      const r = premium.getData(ownerKey, "autoreplies", {});
      r[k.trim().toLowerCase()] = v.join("=").trim();
      premium.setData(ownerKey, "autoreplies", r);
      await reply(sock, from, msg, `✅ Reply save: "${k.trim()}" → "${v.join("=").trim()}"\n(.autoreply on karna na bhoolein)`);
    },
  },
  {
    name: "delreply",
    premium: true,
    category: "⚙️ Premium Settings",
    run: async ({ sock, from, msg, args, isOwner, ownerKey }) => {
      if (!isOwner) return reply(sock, from, msg, "⚠️ Only the owner can use this command.");
      const r = premium.getData(ownerKey, "autoreplies", {});
      const k = args.join(" ").trim().toLowerCase();
      if (!(k in r)) return reply(sock, from, msg, "❌ Yeh keyword nahi mila.");
      delete r[k];
      premium.setData(ownerKey, "autoreplies", r);
      await reply(sock, from, msg, "🗑️ Reply delete ho gaya.");
    },
  },
  {
    name: "replies",
    premium: true,
    category: "⚙️ Premium Settings",
    run: async ({ sock, from, msg, ownerKey }) => {
      const r = Object.entries(premium.getData(ownerKey, "autoreplies", {}));
      await reply(sock, from, msg, r.length ? `🤖 *Auto replies*\n\n${r.map(([k, v]) => `• ${k} → ${v}`).join("\n")}` : "Koi auto reply save nahi.");
    },
  },
  {
    name: "afk",
    premium: true,
    category: "⚙️ Premium Settings",
    run: async ({ sock, from, msg, args, isOwner, ownerKey }) => {
      if (!isOwner) return reply(sock, from, msg, "⚠️ Only the owner can use this command.");
      premium.setData(ownerKey, "afk", { reason: args.join(" ") || "Busy", since: Date.now() });
      await reply(sock, from, msg, "💤 AFK mode ON. Wapas aane par *.back* likhein.");
    },
  },
  {
    name: "back",
    premium: true,
    category: "⚙️ Premium Settings",
    run: async ({ sock, from, msg, isOwner, ownerKey }) => {
      if (!isOwner) return reply(sock, from, msg, "⚠️ Only the owner can use this command.");
      premium.setData(ownerKey, "afk", null);
      await reply(sock, from, msg, "✅ Welcome back! AFK mode OFF.");
    },
  },
];
