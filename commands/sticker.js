// Sticker tools
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = [
  {
    name: "sticker",
    aliases: ["s"],
    run: async ({ sock, from, msg, downloadMediaMessage }) => {
      const target =
        msg.message?.imageMessage || msg.message?.videoMessage
          ? msg
          : msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ? {
              key: msg.key,
              message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
            }
          : null;

      if (!target) {
        return sock.sendMessage(from, { text: "⚠️ Send a photo/short video with `.sticker` as caption, or reply to one with `.sticker`." }, { quoted: msg });
      }

      try {
        const buffer = await downloadMediaMessage(target, "buffer", {});
        const sticker = new Sticker(buffer, {
          pack: "Ali MD",
          author: "Ali",
          type: StickerTypes.FULL,
          quality: 70,
        });
        const webpBuffer = await sticker.toBuffer();
        await sock.sendMessage(from, { sticker: webpBuffer }, { quoted: msg });
      } catch (err) {
        console.error(".sticker error:", err);
        await sock.sendMessage(from, { text: "❌ Could not create the sticker. (Keep videos under 10 sec and make sure ffmpeg is installed.)" }, { quoted: msg });
      }
    },
  },
  {
    name: "toimg",
    aliases: ["simg"],
    run: async ({ sock, from, msg, downloadMediaMessage }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const sticker = quoted?.stickerMessage || msg.message?.stickerMessage;

      if (!sticker) {
        return sock.sendMessage(from, { text: "⚠️ Reply to a sticker with `.toimg`." }, { quoted: msg });
      }

      try {
        const target = msg.message?.stickerMessage
          ? msg
          : { key: msg.key, message: { stickerMessage: sticker } };
        const buffer = await downloadMediaMessage(target, "buffer", {});
        await sock.sendMessage(from, { image: buffer }, { quoted: msg });
      } catch (err) {
        console.error(".toimg error:", err);
        await sock.sendMessage(from, { text: "❌ Could not convert the sticker." }, { quoted: msg });
      }
    },
  },
];
