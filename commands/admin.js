// 🔐 Admin commands. Every command here has admin: true, so bot.js asks for the
// admin password (config.adminPassword) before running any of them.
const premium = require("../premium");

const reply = (sock, from, msg, text) => sock.sendMessage(from, { text }, { quoted: msg });

// "03001234567" -> "923001234567"; "+92 300 1234567" -> "923001234567"
function normNumber(raw) {
  let n = premium.clean(raw);
  if (n.startsWith("00")) n = n.slice(2);
  if (n.startsWith("0")) n = "92" + n.slice(1);
  return n;
}

// number from args, or from a mention / replied message
function targetNumber(msg, args) {
  const ctx = msg.message.extendedTextMessage?.contextInfo;
  const jid = ctx?.mentionedJid?.[0] || ctx?.participant;
  if (args[0] && premium.clean(args[0]).length >= 8) return normNumber(args[0]);
  return jid ? premium.clean(jid.split("@")[0].split(":")[0]) : "";
}

const adminMenu = (p) =>
  `🔐 *ADMIN PANEL*\n\n` +
  `👥 *Users (monthly plan)*\n` +
  `│ ${p}adduser <number> [months] — add user in plan / renew\n` +
  `│ ${p}removeuser <number> — remove user or kick\n` +
  `│ ${p}userlist — and income\n` +
  `│ ${p}checkuser <number> \n\n` +
  `🚪 *Group*\n` +
  `│ ${p}kickuser @user` +
  `│ ${p}addmember <number>` +
  `🔒 ${p}adminlogout ` +
  `Example: ${p}adduser 03001234567 1`;

module.exports = [
  {
    name: "admin",
    aliases: ["adminmenu", "adminpanel"],
    admin: true,
    run: async ({ sock, from, msg, config }) => {
      await reply(sock, from, msg, adminMenu(config.prefix));
    },
  },
  {
    name: "adduser",
    aliases: ["activate", "addmonth"],
    admin: true,
    run: async ({ sock, from, msg, args, config }) => {
      const number = normNumber(args[0]);
      const months = Math.max(1, Math.min(24, parseInt(args[1] || "1", 10) || 1));
      if (number.length < 8) return reply(sock, from, msg, `Example: ${config.prefix}adduser 03001234567 1\n(number, months)`);
      const u = premium.activate(number, months);
      await reply(sock, from, msg,
        `✅ *${number}*is ${months} Add To This Plan.\n` +
        `📅 Last Date: ${new Date(u.paidUntil).toLocaleDateString()}\n` +
        `💰 Amount: Rs ${months * premium.price()}`);
    },
  },
  {
    name: "removeuser",
    aliases: ["deactivate"],
    admin: true,
    run: async ({ sock, from, msg, args, config }) => {
      const number = normNumber(args[0]);
      if (number.length < 8) return reply(sock, from, msg, `Example: ${config.prefix}removeuser 03001234567`);
      await reply(sock, from, msg, premium.deactivate(number) ? `⛔ ${number} Is Removed From list` : "❌This is Now Not In List.");
    },
  },
  {
    name: "userlist",
    aliases: ["premiumlist", "plist", "users"],
    admin: true,
    run: async ({ sock, from, msg }) => {
      const all = premium.list();
      if (!all.length) return reply(sock, from, msg, "No User Yet.");
      const icon = { paid: "💎", trial: "🎁", expired: "⛔", seller: "👑" };
      const revenue = all.reduce((n, u) => n + (u.history || []).reduce((a, h) => a + (h.amount || 0), 0), 0);
      const lines = all.map((u) => `${icon[u.type]} ${u.number} — ${u.active ? premium.fmtLeft(u.msLeft) : "expired"}`);
      await reply(sock, from, msg, `👥 *Users: ${all.length}* | 💰 Total: Rs ${revenue}\n\n${lines.join("\n")}`);
    },
  },
  {
    name: "checkuser",
    admin: true,
    run: async ({ sock, from, msg, args, config }) => {
      const number = normNumber(args[0]);
      if (number.length < 8) return reply(sock, from, msg, `Example: ${config.prefix}checkuser 03001234567`);
      if (!premium.isKnown(number) && !premium.isSeller(number)) return reply(sock, from, msg, "❌ This User Is Not In List.");
      const s = premium.status(number);
      const label = { seller: "👑 Seller", paid: "💎 Paid", trial: "🎁 Free trial", expired: "⛔ Expired" }[s.type];
      await reply(sock, from, msg, `👤 *${number}*\n📊 Status: ${label}${s.active ? `\n⏳Remaning: ${premium.fmtLeft(s.msLeft)}` : ""}`);
    },
  },
  {
    name: "kickuser",
    aliases: ["akick"],
    admin: true,
    run: async ({ sock, from, msg, args, isGroup, config }) => {
      if (!isGroup) return reply(sock, from, msg, "⚠️ This Comand Only Work In Group.");
      const ctx = msg.message.extendedTextMessage?.contextInfo;
      let targets = ctx?.mentionedJid?.length ? ctx.mentionedJid : ctx?.participant && !args[0] ? [ctx.participant] : [];
      if (!targets.length && args[0] && normNumber(args[0]).length >= 8) targets = [normNumber(args[0]) + "@s.whatsapp.net"];
      if (!targets.length) return reply(sock, from, msg, `Example: ${config.prefix}kickuser @user\n(Reply to somone to kick)`);
      try {
        await sock.groupParticipantsUpdate(from, targets, "remove");
        await reply(sock, from, msg, "✅User Removed Succesfull.");
      } catch (e) {
        await reply(sock, from, msg, "❌ Canot Kick you are not admin.");
      }
    },
  },
  {
    name: "addmember",
    admin: true,
    run: async ({ sock, from, msg, args, isGroup, config }) => {
      if (!isGroup) return reply(sock, from, msg, "⚠️This Comand Only Work In Group.");
      const number = normNumber(args[0]);
      if (number.length < 8) return reply(sock, from, msg, `Example: ${config.prefix}Addmember 03001234567`);
      try {
        await sock.groupParticipantsUpdate(from, [number + "@s.whatsapp.net"], "add");
        await reply(sock, from, msg, `✅ ${number}Request has been sent.`);
      } catch (e) {
        await reply(sock, from, msg, "❌ Canot Kick you are not admin .");
      }
    },
  },
  {
    name: "adminlogout",
    aliases: ["adminlock", "adminoff"],
    admin: true,
    run: async ({ sock, from, msg, session, sender }) => {
      session.adminAuth?.delete((sender || "").split("@")[0].split(":")[0].replace(/\D/g, ""));
      await reply(sock, from, msg, "🔒 Logout Succesful.Use Password Again For Access.");
    },
  },
];
