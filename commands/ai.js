// .ai command — OpenAI-compatible chat API (put your key in config.js)
const axios = require("axios");

module.exports = [
  {
    name: "ai",
    aliases: ["gpt", "chatbot", "ask"],
    run: async ({ sock, from, msg, args, config }) => {
      const question = args.join(" ");
      if (!question) return sock.sendMessage(from, { text: "Example: .ai what is the capital of Pakistan?" }, { quoted: msg });

      if (!config.aiApiKey) {
        return sock.sendMessage(
          from,
          { text: "⚠️ The AI command is not set up yet. Add your `aiApiKey` in config.js (OpenAI or any OpenAI-compatible service)." },
          { quoted: msg }
        );
      }

      try {
        const { data } = await axios.post(
          config.aiApiUrl,
          {
            model: config.aiModel,
            messages: [{ role: "user", content: question }],
          },
          { headers: { Authorization: `Bearer ${config.aiApiKey}`, "Content-Type": "application/json" } }
        );
        const reply = data.choices?.[0]?.message?.content?.trim();
        await sock.sendMessage(from, { text: reply || "❌ No answer received." }, { quoted: msg });
      } catch (err) {
        console.error(".ai error:", err?.response?.data || err.message);
        await sock.sendMessage(from, { text: "❌ Could not get an answer from the AI. Check your API key." }, { quoted: msg });
      }
    },
  },
];
