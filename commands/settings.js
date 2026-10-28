// Feature on/off switches — owner only

function toggle(name, featureKey, label) {
  return {
    name,
    run: async ({ sock, from, msg, args, isOwner, config }) => {
      if (!isOwner) return sock.sendMessage(from, { text: "⚠️ Only the owner can use this command." }, { quoted: msg });
      const choice = args[0]?.toLowerCase();
      if (choice !== "on" && choice !== "off") {
        return sock.sendMessage(from, { text: `Example: .${name} on  or  .${name} off` }, { quoted: msg });
      }
      config.features[featureKey] = choice === "on";
      await sock.sendMessage(from, { text: `✅ ${label}: ${choice === "on" ? "ON" : "OFF"}` }, { quoted: msg });
    },
  };
}

module.exports = [
  toggle("antidelete", "antiDelete", "Anti-delete"),
  toggle("autoreact", "autoReact", "Auto react"),
  toggle("autostatus", "autoStatusView", "Auto status view"),
  toggle("autoread", "autoRead", "Auto read"),
  toggle("welcome", "welcome", "Welcome message"),
  toggle("goodbye", "goodbye", "Goodbye message"),
  toggle("antilink", "antiLink", "Anti-link"),
  toggle("statuslike", "autoStatusLike", "Auto status like"),
  {
    name: "settings",
    run: async ({ sock, from, msg, config }) => {
      const f = config.features;
      const text = `⚙️ *Current Settings*
Anti-delete: ${f.antiDelete ? "ON" : "OFF"}
Auto react: ${f.autoReact ? "ON" : "OFF"}
Auto status view: ${f.autoStatusView ? "ON" : "OFF"}
Auto status like: ${f.autoStatusLike ? "ON" : "OFF"}
Auto read: ${f.autoRead ? "ON" : "OFF"}
Welcome: ${f.welcome ? "ON" : "OFF"}
Goodbye: ${f.goodbye ? "ON" : "OFF"}
Anti-link: ${f.antiLink ? "ON" : "OFF"}`;
      await sock.sendMessage(from, { text }, { quoted: msg });
    },
  },
];
