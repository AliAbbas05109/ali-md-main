// Owner-only commands

module.exports = [
  {
    name: "mode",
    run: async ({ sock, from, msg, args, isOwner, config }) => {
      if (!isOwner) return sock.sendMessage(from, { text: "⚠️ Only the owner can use this command." }, { quoted: msg });
      const choice = args[0];
      if (choice !== "public" && choice !== "private") {
        return sock.sendMessage(from, { text: "Example: .mode public  or  .mode private" }, { quoted: msg });
      }
      config.mode = choice;
      await sock.sendMessage(from, { text: `✅ Mode set to: ${choice}` }, { quoted: msg });
    },
  },
  {
    name: "broadcast",
    run: async ({ sock, from, msg, args, isOwner }) => {
      if (!isOwner) return sock.sendMessage(from, { text: "⚠️ Only the owner can use this command." }, { quoted: msg });
      const text = args.join(" ");
      if (!text) return sock.sendMessage(from, { text: "Example: .broadcast Hello everyone" }, { quoted: msg });
      await sock.sendMessage(from, { text: `📢 Broadcast:\n${text}` }, { quoted: msg });
    },
  },
];
