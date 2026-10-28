// Extra group commands — invite link, join requests

module.exports = [
  {
    name: "link",
    aliases: ["grouplink"],
    run: async ({ sock, from, msg, isGroup }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      try {
        const code = await sock.groupInviteCode(from);
        await sock.sendMessage(from, { text: `🔗 https://chat.whatsapp.com/${code}` }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Could not get the invite link." }, { quoted: msg });
      }
    },
  },
  {
    name: "revoke",
    run: async ({ sock, from, msg, isGroup, isSenderAdmin }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const admin = await isSenderAdmin();
      if (!admin) return sock.sendMessage(from, { text: "⚠️ Only group admins can use this command." }, { quoted: msg });
      await sock.groupRevokeInvite(from);
      await sock.sendMessage(from, { text: "✅ Old group link revoked. Use `.link` to get the new one." }, { quoted: msg });
    },
  },
  {
    name: "requests",
    aliases: ["grouprequests"],
    run: async ({ sock, from, msg, isGroup, isSenderAdmin }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const admin = await isSenderAdmin();
      if (!admin) return sock.sendMessage(from, { text: "⚠️ Only group admins can use this command." }, { quoted: msg });
      try {
        const list = await sock.groupRequestParticipantsList(from);
        if (!list.length) return sock.sendMessage(from, { text: "There are no pending join requests." }, { quoted: msg });
        const text = list.map((p) => `• @${p.jid.split("@")[0]}`).join("\n");
        await sock.sendMessage(from, { text: `📋 *Pending Requests:*\n${text}`, mentions: list.map((p) => p.jid) }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Could not load join requests." }, { quoted: msg });
      }
    },
  },
  {
    name: "acceptall",
    run: async ({ sock, from, msg, isGroup, isSenderAdmin }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const admin = await isSenderAdmin();
      if (!admin) return sock.sendMessage(from, { text: "⚠️ Only group admins can use this command." }, { quoted: msg });
      try {
        const list = await sock.groupRequestParticipantsList(from);
        if (!list.length) return sock.sendMessage(from, { text: "There are no pending requests." }, { quoted: msg });
        await sock.groupRequestParticipantsUpdate(from, list.map((p) => p.jid), "approve");
        await sock.sendMessage(from, { text: `✅ ${list.length} requests accepted.` }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Could not accept requests." }, { quoted: msg });
      }
    },
  },
  {
    name: "rejectall",
    run: async ({ sock, from, msg, isGroup, isSenderAdmin }) => {
      if (!isGroup) return sock.sendMessage(from, { text: "This command only works in groups." }, { quoted: msg });
      const admin = await isSenderAdmin();
      if (!admin) return sock.sendMessage(from, { text: "⚠️ Only group admins can use this command." }, { quoted: msg });
      try {
        const list = await sock.groupRequestParticipantsList(from);
        if (!list.length) return sock.sendMessage(from, { text: "There are no pending requests." }, { quoted: msg });
        await sock.groupRequestParticipantsUpdate(from, list.map((p) => p.jid), "reject");
        await sock.sendMessage(from, { text: `✅ ${list.length} requests rejected.` }, { quoted: msg });
      } catch {
        await sock.sendMessage(from, { text: "❌ Could not reject requests." }, { quoted: msg });
      }
    },
  },
];
