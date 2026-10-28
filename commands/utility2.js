// Extra utility commands
const axios = require("axios");

module.exports = [
  {
    name: "wikipedia",
    aliases: ["wiki"],
    run: async ({ sock, from, msg, args }) => {
      const query = args.join(" ");
      if (!query) return sock.sendMessage(from, { text: "Example: .wiki Pakistan" }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        await sock.sendMessage(from, { text: `📚 *${data.title}*\n\n${data.extract}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Nothing found." }, { quoted: msg });
      }
    },
  },
  {
    name: "tourl",
    run: async ({ sock, from, msg, downloadMediaMessage }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const target = quoted ? { key: msg.key, message: quoted } : (msg.message?.imageMessage ? msg : null);
      if (!target) return sock.sendMessage(from, { text: "⚠️ Reply to an image with `.tourl`." }, { quoted: msg });

      try {
        const buffer = await downloadMediaMessage(target, "buffer", {});
        const { data } = await axios.post("https://tmpfiles.org/api/v1/upload", buffer, {
          headers: { "Content-Type": "application/octet-stream" },
        });
        const url = data?.data?.url?.replace("tmpfiles.org/", "tmpfiles.org/dl/");
        await sock.sendMessage(from, { text: url ? `🔗 ${url}` : "❌ Upload failed." }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Upload failed." }, { quoted: msg });
      }
    },
  },
  {
    name: "urlencode",
    run: async ({ sock, from, msg, args }) => {
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Example: .urlencode hello world" }, { quoted: msg });
      await sock.sendMessage(from, { text: encodeURIComponent(text) }, { quoted: msg });
    },
  },
  {
    name: "urldecode",
    run: async ({ sock, from, msg, args }) => {
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Example: .urldecode hello%20world" }, { quoted: msg });
      await sock.sendMessage(from, { text: decodeURIComponent(text) }, { quoted: msg });
    },
  },
  {
    name: "binary",
    run: async ({ sock, from, msg, args }) => {
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Example: .binary hello" }, { quoted: msg });
      const bin = text.split("").map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
      await sock.sendMessage(from, { text: bin }, { quoted: msg });
    },
  },
  {
    name: "dbinary",
    run: async ({ sock, from, msg, args }) => {
      const bin = args.join("");
      if (!bin) return sock.sendMessage(from, { text: "Example: .dbinary 0110100001101001" }, { quoted: msg });
      try {
        const text = bin.match(/.{1,8}/g).map((b) => String.fromCharCode(parseInt(b, 2))).join("");
        await sock.sendMessage(from, { text }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Invalid binary." }, { quoted: msg });
      }
    },
  },
];
