module.exports = {
  botName: "ALI MD",
  ownerName: "Ali",
  ownerNumber: "923257825672", // your number with country code, no "+"
  prefix: ".",                 // commands start with this symbol, e.g. .menu
  mode: "public",              // "public" = everyone can use, "private" = owner only

  // ================= PREMIUM / SELLER =================
  // sellerNumber = the person who SELLS the bot (you). This number always has premium
  // and can use .activate / .deactivate / .premiumlist. Country code, no "+".
  sellerNumber: "923257825672",
  admins: [],
  // ================= ADMIN PASSWORD =================
  // .admin (and every admin command) asks for this password first.
  adminPassword: "Tryali320189abbas109",
  adminSessionMinutes: 30,     // after the right password, admin stays unlocked this long (.adminlogout locks it again)
                  // extra seller/admin numbers, e.g. ["923111234567"]
  premium: {
    pricePerMonth: 199,        // PKR per month
    trialDays: 3,              // free trial, starts the first time a number links the bot
    easypaisaNumber: "03257825672",
    accountName: "Ansar Abbas",
    adminWhatsApp: "03257825672",
    paymentInfo: "Easypaisa: 03257825672\nAccount Name: Ansar Abbas",
  },
  // Added at the end of every reply the bot sends for a command
  footer: "Developed By Ali ✅",
  // React to every command first (e.g. .menu gets a reaction), then the bot replies.
  commandReact: true,
  commandReactEmoji: "⏳",     // shown while the command runs
  commandDoneEmoji: "✅",      // shown when it finishes ("" = keep the first emoji)

  // Login method: true = pairing code (no QR needed).
  usePairingCode: true,
  // Your WhatsApp number (the pairing code is generated for this number).
  // Format: country code + number, no "+". Example: "923001234567"
  pairingNumber: "923001234567",

  // Feature switches — can also be changed at runtime with the settings commands
  features: {
    antiDelete: true,      // re-sends deleted messages
    autoReact: false,      // reacts to every message with a random emoji
    autoStatusView: false, // views contacts' statuses automatically
    autoRead: false,       // marks every message as seen
    welcome: true,         // welcome message when someone joins a group
    goodbye: true,         // goodbye message when someone leaves a group
    antiLink: false,       // deletes links sent by non-admins in groups
    autoStatusLike: false, // likes statuses with ❤️ (autoStatusView must be on too)
    // ---- premium features (only work while premium/trial is active) ----
    autoTyping: false,     // shows "typing..." when a message arrives
    autoRecording: false,  // shows "recording audio..." when a message arrives
    alwaysOnline: false,   // keeps the account shown as online
    antiCall: false,       // rejects incoming calls
    antiBadWord: false,    // deletes bad words in groups (non-admins)
    autoReply: false,      // keyword auto replies (.addreply hi=hello)
    autoBio: false,        // updates the About text with the time every minute
  },

  welcomeMessage: "👋 Welcome @user to the group!",
  goodbyeMessage: "👋 @user has left the group.",

  // Emojis used by auto-react (one is picked at random)
  reactEmojis: ["👍", "❤️", "😂", "🔥", "✅", "😮", "😍", "🥰", "😎", "🤩", "💯", "👏", "🎉", "😇", "🤝", "💖", "✨", "😁", "🥳"],

  // ================= MENU (what .menu shows) =================
  // Optional picture above the menu: a link (https://...) or a file name in the
  // bot folder (e.g. "menu.jpg"). Leave "" for text only.
  menuImage: "",

  // Top part of the menu. You can use: {botName} {ownerName} {mode} {prefix} {uptime} {total}
  menuHeader:
`╭━━━〔 *{botName}* 〕━━━╮
┃ 👤 Owner : {ownerName}
┃ 🌐 Mode  : {mode}
┃ 🔣 Prefix: {prefix}
┃ ⏱️ Uptime: {uptime}
┃ 📦 Commands: {total}
╰━━━━━━━━━━━━━━━━━━╯

Hello! Here is everything I can do:`,

  // Bottom part of the menu
  menuFooter: "✨ Powered by {ownerName} ✨",

  // Menu sections. "title" is the heading, "commands" is the list shown under it.
  // Add, remove or rename anything here — the prefix is added automatically.
  menuSections: [
    { title: "📿 ISLAMIC", commands: ["duamorning", "duaevening", "duasleep", "duawakeup", "duaeating", "ayatulkursi", "kalima", "bismillah", "islamicquote", "pillarsislam", "pillarsiman", "subhanallah", "alhamdulillah", "allahuakbar", "astaghfirullah"] },
    { title: "🛠️ UTILITY", commands: ["ping", "uptime", "time", "date", "weather <city>", "calc <expr>", "base64 <text>", "unbase64 <text>", "define <word>", "wiki <topic>", "tourl", "urlencode", "urldecode", "binary", "dbinary", "reverse <text>", "password [length]", "jid"] },
    { title: "🎉 FUN", commands: ["8ball <question>", "quote", "joke", "compliment", "flip", "roll", "motivate", "truth", "dare", "rate <thing>", "ship @a @b", "fact"] },
    { title: "🌸 ANIME & REACTIONS", commands: ["animegirl", "animeboy", "neko", "wallpaper", "hug @user", "kiss @user", "pat @user", "slap @user", "cuddle @user", "tickle @user", "highfive", "handhold", "wave", "dance", "cry", "blush", "smile", "laugh", "poke", "bite", "punch", "thumbsup"] },
    { title: "🤖 AI", commands: ["ai <question>"] },
    { title: "⬇️ DOWNLOAD", commands: ["play <name or link>", "ytmp3 <link>", "ytmp4 <link>", "tiktok <link>", "facebook <link>", "pinterest <link>"] },
    { title: "🖼️ STICKER", commands: ["sticker (reply to photo/video)", "toimg (reply to sticker)"] },
    { title: "🔒 PRIVACY", commands: ["vv (reply to view-once media)", "getdp <number>"] },
    { title: "👥 GROUP", commands: ["ginfo", "tagall", "tagadmins", "hidetag <text> (admin)", "kick @user (admin)", "promote @user (admin)", "demote @user (admin)", "mute (admin)", "unmute (admin)", "link", "revoke (admin)", "requests (admin)", "acceptall (admin)", "rejectall (admin)", "del (reply, admin)"] },
    { title: "💎 PLAN (199 PKR/month • 3 din free trial)", commands: ["premium", "trial", "buy", "pmenu", "pmenu <category>", "pcount", "convert 10 km mi", "(1000+ commands: .pmenu)"] },
    { title: "⚙️ SETTINGS (owner)", commands: ["settings", "antidelete on/off", "autoreact on/off", "autostatus on/off", "statuslike on/off", "autoread on/off", "welcome on/off", "goodbye on/off", "antilink on/off"] },
    { title: "👑 OWNER", commands: ["mode public/private", "broadcast <text>", "owner"] },
    { title: "🔐 ADMIN (password needed)", commands: ["admin", "adduser <number> [months]", "removeuser <number>", "userlist", "checkuser <number>", "kickuser @user (group)", "addmember <number> (group)", "adminlogout"] },
  ],

  // .ai command — put your OpenAI-compatible API key here.
  // If left empty, .ai will tell the user the key is not set.
  aiApiKey: "",
  aiApiUrl: "https://api.openai.com/v1/chat/completions",
  aiModel: "gpt-4o-mini",
};
