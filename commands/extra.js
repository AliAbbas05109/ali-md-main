// Extra commands — text tools, fun games and extra group tools
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const num = (jid) => String(jid || "").split("@")[0].split(":")[0];
const mentionsOf = (msg) => msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

module.exports = [
  {
    name: "reverse",
    run: async ({ sock, from, msg, args }) => {
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Example: .reverse hello" }, { quoted: msg });
      await sock.sendMessage(from, { text: [...text].reverse().join("") }, { quoted: msg });
    },
  },
  {
    name: "password",
    aliases: ["genpass"],
    run: async ({ sock, from, msg, args }) => {
      const len = Math.min(Math.max(parseInt(args[0], 10) || 12, 6), 40);
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
      const crypto = require("crypto");
      let out = "";
      for (let i = 0; i < len; i++) out += chars[crypto.randomInt(chars.length)];
      await sock.sendMessage(from, { text: `🔐 ${out}` }, { quoted: msg });
    },
  },
  {
    name: "jid",
    run: async ({ sock, from, msg, sender }) => {
      await sock.sendMessage(from, { text: `🆔 Chat: ${from}\n👤 You: ${sender}` }, { quoted: msg });
    },
  },
  {
    name: "truth",
    run: async ({ sock, from, msg }) => {
      const q = [
        "What is the most embarrassing thing you have done in public?",
        "What is a secret talent nobody knows you have?",
        "What is the last lie you told?",
        "What is your biggest fear?",
        "Who was your first crush?",
        "What is the weirdest thing you have ever eaten?",
        "What is one habit you wish you could quit?",
      ];
      await sock.sendMessage(from, { text: `🧠 *Truth*\n${pick(q)}` }, { quoted: msg });
    },
  },
  {
    name: "dare",
    run: async ({ sock, from, msg }) => {
      const q = [
        "Send a voice note singing your favorite song.",
        "Change your WhatsApp status to something funny for 1 hour.",
        "Text your best friend 'I miss you' right now.",
        "Do 10 push-ups and send proof.",
        "Speak in a funny accent for the next 5 messages.",
        "Send your most recent photo in the gallery.",
      ];
      await sock.sendMessage(from, { text: `🔥 *Dare*\n${pick(q)}` }, { quoted: msg });
    },
  },
  {
    name: "rate",
    run: async ({ sock, from, msg, args }) => {
      const what = args.join(" ");
      if (!what) return sock.sendMessage(from, { text: "Example: .rate my cooking" }, { quoted: msg });
      await sock.sendMessage(from, { text: `⭐ *${what}* is rated ${Math.floor(Math.random() * 101)}/100` }, { quoted: msg });
    },
  },
  {
    name: "ship",
    run: async ({ sock, from, msg }) => {
      const m = mentionsOf(msg);
      if (m.length < 2) return sock.sendMessage(from, { text: "Example: .ship @person1 @person2" }, { quoted: msg });
      const pct = Math.floor(Math.random() * 101);
      await sock.sendMessage(from, { text: `💞 @${num(m[0])} + @${num(m[1])} = *${pct}%* match!`, mentions: m.slice(0, 2) }, { quoted: msg });
    },
  },
  {
    name: "fact",
    run: async ({ sock, from, msg }) => {
      const f = [
        "Honey never spoils — edible honey was found in ancient Egyptian tombs.",
        "Octopuses have three hearts.",
        "A day on Venus is longer than a year on Venus.",
        "Bananas are berries, but strawberries are not.",
        "Sharks existed before trees.",
        "There are more stars in the universe than grains of sand on Earth.",
      ];
      await sock.sendMessage(from, { text: `📚 *Fact*\n${pick(f)}` }, { quoted: msg });
    },
  },
  {
    name: "tagadmins",
    aliases: ["admins"],
    run: async ({ sock, from, msg, isGroup }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const meta = await sock.groupMetadata(from);
      const admins = meta.participants.filter((p) => p.admin).map((p) => p.id);
      const text = admins.map((a) => `@${num(a)}`).join("\n");
      await sock.sendMessage(from, { text: `🛡️ *Group Admins*\n\n${text}`, mentions: admins }, { quoted: msg });
    },
  },
  {
    name: "hidetag",
    aliases: ["tag"],
    run: async ({ sock, from, msg, args, isGroup, isSenderAdmin, isOwner }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      if (!isOwner && !(await isSenderAdmin())) return sock.sendMessage(from, { text: "⚠️ Only group admins can use this command." }, { quoted: msg });
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Example: .hidetag Meeting at 5 PM" }, { quoted: msg });
      const meta = await sock.groupMetadata(from);
      await sock.sendMessage(from, { text, mentions: meta.participants.map((p) => p.id) });
    },
  },
  {
    name: "del",
    aliases: ["delete"],
    run: async ({ sock, from, msg, isGroup, isSenderAdmin, isOwner }) => {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      if (!ctx?.stanzaId) return sock.sendMessage(from, { text: "⚠️ Reply to the message you want to delete with `.del`." }, { quoted: msg });
      if (!isOwner && !(isGroup && (await isSenderAdmin()))) return sock.sendMessage(from, { text: "⚠️ Only the owner or a group admin can use this command." }, { quoted: msg });
      try {
        const me = (sock.user?.id || "").split(":")[0].split("@")[0];
        const fromMe = num(ctx.participant) === me;
        await sock.sendMessage(from, { delete: { remoteJid: from, fromMe, id: ctx.stanzaId, participant: ctx.participant } });
      } catch (e) {
        await sock.sendMessage(from, { text: "❌ Could not delete that message (the bot must be admin to delete others' messages)." }, { quoted: msg });
      }
    },
  },
];
