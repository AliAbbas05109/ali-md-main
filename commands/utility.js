// Utility commands
const axios = require("axios");

module.exports = [
  {
    name: "time",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: `🕐 Current time: ${new Date().toLocaleString()}` }, { quoted: msg });
    },
  },
  {
    name: "date",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: `📅 Today: ${new Date().toDateString()}` }, { quoted: msg });
    },
  },
  {
    name: "calculate",
    aliases: ["calc"],
    run: async ({ sock, from, msg, args }) => {
      const expr = args.join(" ");
      if (!expr) return sock.sendMessage(from, { text: "Example: .calculate 5*3+2" }, { quoted: msg });
      if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
        return sock.sendMessage(from, { text: "⚠️ Use only numbers and + - * / ( )" }, { quoted: msg });
      }
      try {
        const result = Function(`"use strict";return (${expr})`)();
        await sock.sendMessage(from, { text: `🧮 ${expr} = ${result}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Invalid expression." }, { quoted: msg });
      }
    },
  },
  {
    name: "base64",
    run: async ({ sock, from, msg, args }) => {
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Example: .base64 hello" }, { quoted: msg });
      await sock.sendMessage(from, { text: Buffer.from(text).toString("base64") }, { quoted: msg });
    },
  },
  {
    name: "unbase64",
    run: async ({ sock, from, msg, args }) => {
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Example: .unbase64 aGVsbG8=" }, { quoted: msg });
      try {
        await sock.sendMessage(from, { text: Buffer.from(text, "base64").toString("utf-8") }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Invalid base64." }, { quoted: msg });
      }
    },
  },
  {
    name: "weather",
    run: async ({ sock, from, msg, args }) => {
      const city = args.join(" ");
      if (!city) return sock.sendMessage(from, { text: "Example: .weather Lahore" }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
        await sock.sendMessage(from, { text: `🌤️ ${data}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Could not fetch the weather." }, { quoted: msg });
      }
    },
  },
  {
    name: "define",
    run: async ({ sock, from, msg, args }) => {
      const word = args.join(" ");
      if (!word) return sock.sendMessage(from, { text: "Example: .define hello" }, { quoted: msg });
      try {
        const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        const meaning = data[0]?.meanings?.[0]?.definitions?.[0]?.definition;
        await sock.sendMessage(from, { text: meaning ? `📖 *${word}*: ${meaning}` : "No definition found." }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Word not found." }, { quoted: msg });
      }
    },
  },
];
