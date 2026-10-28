// .vv command — reply to a "view once" photo/video,
// and the bot re-sends it as normal media.

function extractViewOnce(message) {
  if (!message) return null;
  // Baileys wraps view-once messages differently across versions
  const vo =
    message.viewOnceMessageV2?.message ||
    message.viewOnceMessage?.message ||
    message.viewOnceMessageV2Extension?.message ||
    null;
  return vo;
}

module.exports = [
  {
    name: "vv",
    aliases: ["reveal", "antiviewonce"],
    run: async ({ sock, from, msg, downloadMediaMessage }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted) {
        return sock.sendMessage(
          from,
          { text: "⚠️ Reply to a view-once photo/video with `.vv`." },
          { quoted: msg }
        );
      }

      const voContent = extractViewOnce(quoted) || quoted; // sometimes the quoted message is already plain media

      const fakeMsg = {
        key: msg.message.extendedTextMessage.contextInfo.stanzaId
          ? {
              remoteJid: from,
              id: msg.message.extendedTextMessage.contextInfo.stanzaId,
              participant: msg.message.extendedTextMessage.contextInfo.participant,
            }
          : msg.key,
        message: voContent,
      };

      try {
        if (voContent.imageMessage) {
          const buffer = await downloadMediaMessage(fakeMsg, "buffer", {});
          await sock.sendMessage(from, { image: buffer, caption: voContent.imageMessage.caption || "👁️ View-once revealed" }, { quoted: msg });
        } else if (voContent.videoMessage) {
          const buffer = await downloadMediaMessage(fakeMsg, "buffer", {});
          await sock.sendMessage(from, { video: buffer, caption: voContent.videoMessage.caption || "👁️ View-once revealed" }, { quoted: msg });
        } else if (voContent.audioMessage) {
          const buffer = await downloadMediaMessage(fakeMsg, "buffer", {});
          await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mp4" }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: "⚠️ That message is not a view-once photo/video." }, { quoted: msg });
        }
      } catch (err) {
        console.error(".vv error:", err);
        await sock.sendMessage(from, { text: "❌ Could not download the media. The message may be too old." }, { quoted: msg });
      }
    },
  },
];
