// General / main menu commands

module.exports = [
  {
    name: "menu",
    aliases: ["help", "list"],
    run: async ({ sock, from, msg, config }) => {
      const p = config.prefix;
      const s = process.uptime();
      const uptime = `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
      const sections = config.menuSections || [];
      const total = sections.reduce((n, sec) => n + sec.commands.length, 0);
      const fill = (t) => String(t || "")
        .replace(/{botName}/g, config.botName)
        .replace(/{ownerName}/g, config.ownerName)
        .replace(/{mode}/g, config.mode)
        .replace(/{prefix}/g, p)
        .replace(/{uptime}/g, uptime)
        .replace(/{total}/g, total);

      const body = sections
        .map((sec) => `*${sec.title}*\n${sec.commands.map((c) => `│ ${p}${c}`).join("\n")}`)
        .join("\n\n");
      const text = `${fill(config.menuHeader)}\n\n${body}\n\n${fill(config.menuFooter)}`.trim();

      const img = config.menuImage;
      if (img) {
        const src = /^https?:\/\//i.test(img) ? { url: img } : (() => {
          const f = require("path").join(__dirname, "..", img);
          return require("fs").existsSync(f) ? require("fs").readFileSync(f) : null;
        })();
        if (src) {
          try { return await sock.sendMessage(from, { image: src, caption: text }, { quoted: msg }); }
          catch (e) { console.error("menu image error:", e.message); }
        }
      }
      await sock.sendMessage(from, { text }, { quoted: msg });
    },
  },
  {
    name: "ping",
    run: async ({ sock, from, msg }) => {
      const start = Date.now();
      await sock.sendMessage(from, { text: "Pinging..." }, { quoted: msg });
      const end = Date.now();
      await sock.sendMessage(from, { text: `🏓 Pong! ${end - start}ms` });
    },
  },
  {
    name: "uptime",
    run: async ({ sock, from, msg }) => {
      const s = process.uptime();
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = Math.floor(s % 60);
      await sock.sendMessage(from, { text: `⏱️ Uptime: ${h}h ${m}m ${sec}s` }, { quoted: msg });
    },
  },
  {
    name: "alive",
    run: async ({ sock, from, msg, config }) => {
      await sock.sendMessage(from, { text: `✅ ${config.botName} is alive and running!` }, { quoted: msg });
    },
  },
  {
    name: "owner",
    run: async ({ sock, from, msg, config }) => {
      await sock.sendMessage(
        from,
        {
          contacts: {
            displayName: config.ownerName,
            contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${config.ownerName}\nTEL;type=CELL;type=VOICE;waid=${config.ownerNumber}:+${config.ownerNumber}\nEND:VCARD` }],
          },
        },
        { quoted: msg }
      );
    },
  },
];
