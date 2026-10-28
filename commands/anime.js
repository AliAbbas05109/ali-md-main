// Anime images and safe reaction GIFs — waifu.pics / nekos.best public APIs (SFW only)
const axios = require("axios");

async function sendWaifuPicsImage(sock, from, msg, category) {
  try {
    const { data } = await axios.get(`https://api.waifu.pics/sfw/${category}`);
    await sock.sendMessage(from, { image: { url: data.url } }, { quoted: msg });
  } catch (err) {
    console.error(`waifu.pics ${category} error:`, err);
    await sock.sendMessage(from, { text: "❌ Could not fetch the image." }, { quoted: msg });
  }
}

async function sendReactionGif({ sock, from, msg, category, mentionText }) {
  try {
    const { data } = await axios.get(`https://nekos.best/api/v2/${category}`);
    const result = data?.results?.[0];
    if (!result) throw new Error("no result");
    await sock.sendMessage(from, { video: { url: result.url }, gifPlayback: true, caption: mentionText || "" }, { quoted: msg });
  } catch (err) {
    console.error(`nekos.best ${category} error:`, err);
    await sock.sendMessage(from, { text: "❌ Could not fetch the GIF." }, { quoted: msg });
  }
}

function reactionCmd(name, category, verb) {
  return {
    name,
    run: async ({ sock, from, msg, args }) => {
      const target = args[0] ? `@${args[0].replace(/\D/g, "")}` : "";
      await sendReactionGif({ sock, from, msg, category, mentionText: target ? `${verb} ${target}` : undefined });
    },
  };
}

module.exports = [
  // --- anime art (SFW) ---
  { name: "animegirl", run: async ({ sock, from, msg }) => sendWaifuPicsImage(sock, from, msg, "waifu") },
  { name: "animeboy", run: async ({ sock, from, msg }) => sendWaifuPicsImage(sock, from, msg, "neko") },
  { name: "neko", run: async ({ sock, from, msg }) => sendWaifuPicsImage(sock, from, msg, "neko") },
  { name: "wallpaper", aliases: ["animewallpaper"], run: async ({ sock, from, msg }) => sendWaifuPicsImage(sock, from, msg, "waifu") },

  // --- reaction GIFs (all SFW) ---
  reactionCmd("hug", "hug", "🤗 Hug"),
  reactionCmd("kiss", "kiss", "😘 Kiss"),
  reactionCmd("pat", "pat", "🤚 Pat"),
  reactionCmd("slap", "slap", "👋 Slap"),
  reactionCmd("cuddle", "cuddle", "🥰 Cuddle"),
  reactionCmd("tickle", "tickle", "😆 Tickle"),
  reactionCmd("highfive", "highfive", "🙌 High Five"),
  reactionCmd("handhold", "handhold", "🤝 Hand hold"),
  reactionCmd("wave", "wave", "👋 Wave"),
  reactionCmd("dance", "dance", "💃 Dance"),
  reactionCmd("cry", "cry", "😢 Cry"),
  reactionCmd("blush", "blush", "☺️ Blush"),
  reactionCmd("smile", "smile", "😊 Smile"),
  reactionCmd("laugh", "laugh", "😂 Laugh"),
  reactionCmd("poke", "poke", "👉 Poke"),
  reactionCmd("bite", "bite", "😬 Bite"),
  reactionCmd("punch", "punch", "👊 Punch"),
  reactionCmd("thumbsup", "thumbsup", "👍 Thumbs up"),
];
