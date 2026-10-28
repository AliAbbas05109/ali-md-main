// .getdp <number> — gets the profile picture of any WhatsApp number
// (only works if the picture is visible to everyone, per their privacy settings)

module.exports = [
  {
    name: "getdp",
    aliases: ["pp", "getpp", "dp"],
    run: async ({ sock, from, msg, args }) => {
      let number = args[0];

      // If no number is given, use the replied/mentioned contact
      if (!number) {
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (quotedParticipant) number = quotedParticipant;
        else if (mentioned) number = mentioned;
      }

      if (!number) {
        return sock.sendMessage(from, { text: "Example: .getdp 923001234567\nor mention/reply to someone and send `.getdp`." }, { quoted: msg });
      }

      const jid = number.includes("@") ? number : `${number.replace(/\D/g, "")}@s.whatsapp.net`;
      number = jid.split("@")[0];

      try {
        const url = await sock.profilePictureUrl(jid, "image");
        await sock.sendMessage(from, { image: { url }, caption: `🖼️ DP of +${number}` }, { quoted: msg });
      } catch (err) {
        await sock.sendMessage(from, { text: "❌ Could not get the profile picture. It may not be set or is hidden by privacy settings." }, { quoted: msg });
      }
    },
  },
];
