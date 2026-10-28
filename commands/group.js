// Group admin commands

module.exports = [
  {
    name: "ginfo",
    run: async ({ sock, from, msg, isGroup }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const meta = await sock.groupMetadata(from);
      await sock.sendMessage(from, {
        text: `👥 *Group Info*\nName: ${meta.subject}\nMembers: ${meta.participants.length}\nCreated: ${new Date(meta.creation * 1000).toLocaleDateString()}`,
      }, { quoted: msg });
    },
  },
  {
    name: "tagall",
    run: async ({ sock, from, msg, isGroup }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const meta = await sock.groupMetadata(from);
      const mentions = meta.participants.map((p) => p.id);
      const text = mentions.map((m) => `@${m.split("@")[0]}`).join("\n");
      await sock.sendMessage(from, { text: `📢 *Tag All*\n\n${text}`, mentions }, { quoted: msg });
    },
  },
  {
    name: "kick",
    run: async ({ sock, from, msg, isGroup, isSenderAdmin }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const admin = await isSenderAdmin();
      if (!admin) return sock.sendMessage(from, { text: "⚠️ Only group admins can use this command." }, { quoted: msg });

      const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned || !mentioned.length) return sock.sendMessage(from, { text: "Mention (@) the member you want to remove." }, { quoted: msg });

      await sock.groupParticipantsUpdate(from, mentioned, "remove");
      await sock.sendMessage(from, { text: "✅ Member removed." }, { quoted: msg });
    },
  },
  {
    name: "promote",
    run: async ({ sock, from, msg, isGroup, isSenderAdmin }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const admin = await isSenderAdmin();
      if (!admin) return sock.sendMessage(from, { text: "⚠️ Only group admins can use this command." }, { quoted: msg });

      const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned || !mentioned.length) return sock.sendMessage(from, { text: "Mention (@) the member you want to promote." }, { quoted: msg });

      await sock.groupParticipantsUpdate(from, mentioned, "promote");
      await sock.sendMessage(from, { text: "✅ Member promoted to admin." }, { quoted: msg });
    },
  },
  {
    name: "demote",
    run: async ({ sock, from, msg, isGroup, isSenderAdmin }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const admin = await isSenderAdmin();
      if (!admin) return sock.sendMessage(from, { text: "⚠️ Only group admins can use this command." }, { quoted: msg });

      const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned || !mentioned.length) return sock.sendMessage(from, { text: "Mention (@) a member." }, { quoted: msg });

      await sock.groupParticipantsUpdate(from, mentioned, "demote");
      await sock.sendMessage(from, { text: "✅ Admin rights removed." }, { quoted: msg });
    },
  },
  {
    name: "mute",
    run: async ({ sock, from, msg, isGroup, isSenderAdmin }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const admin = await isSenderAdmin();
      if (!admin) return sock.sendMessage(from, { text: "⚠️ Only group admins can use this command." }, { quoted: msg });
      await sock.groupSettingUpdate(from, "announcement");
      await sock.sendMessage(from, { text: "🔇 Group muted (only admins can send messages)." }, { quoted: msg });
    },
  },
  {
    name: "unmute",
    run: async ({ sock, from, msg, isGroup, isSenderAdmin }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const admin = await isSenderAdmin();
      if (!admin) return sock.sendMessage(from, { text: "⚠️ Only group admins can use this command." }, { quoted: msg });
      await sock.groupSettingUpdate(from, "not_announcement");
      await sock.sendMessage(from, { text: "🔊 Group unmuted (everyone can send messages)." }, { quoted: msg });
    },
  },
];
