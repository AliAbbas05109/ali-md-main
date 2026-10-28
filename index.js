// CLI mode: one bot on the number in config.js (no website needed)
const bot = require("./bot");
const config = require("./config");

(async () => {
  await bot.init();
  await bot.startSession({
    id: "main",
    authDir: "auth_info",
    interactive: true,
    phoneNumber: config.pairingNumber,
    ownerNumber: config.ownerNumber,
  });
})();
