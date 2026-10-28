# ALI MD — WhatsApp Bot (Baileys) + Pairing Website

## Two ways to run

**A) Single bot (your own number)** — `start.bat` (or `npm start`)
Set `ownerNumber` and `pairingNumber` in `config.js`, start, and enter the 8-digit code in WhatsApp.

**B) Pairing website (any number)** — `start-web.bat` (or `npm run web`)
Open `http://localhost:3000`, type a WhatsApp number, press *Generate Pair Code*, then enter the code in
WhatsApp → Settings → Linked Devices → Link a Device → *Link with phone number instead*.
As soon as it links, the bot runs on that number (that number is the owner of its own bot).
To let other people use the site from anywhere, host this project on a server (Railway, Render, a VPS) that runs `npm run web`.
Never run A and B on the same number at the same time.

## Setup (Windows)
1. Install Node.js 20+ (LTS) from nodejs.org.
2. Install ffmpeg (needed for stickers/video) and add it to PATH.
3. **For `.play`, `.ytmp3`, `.ytmp4`:** download `yt-dlp.exe` from
   https://github.com/yt-dlp/yt-dlp/releases/latest and put it in this folder (next to `bot.js`).
   Update it from time to time (`yt-dlp.exe -U`) because YouTube changes often.
4. Open CMD in this folder: `npm install`
5. Edit `config.js` (number, bot name, menu…).
6. Run `start.bat`.

## Customising `.menu`
Everything is in `config.js`:
- `menuHeader` / `menuFooter` — the text at the top and bottom. Placeholders: `{botName} {ownerName} {mode} {prefix} {uptime} {total}`
- `menuSections` — the sections and the commands listed under each one (prefix is added automatically)
- `menuImage` — optional picture above the menu: a link, or a file in the bot folder such as `menu.jpg`
- `prefix` — change `"."` to any symbol

Restart the bot after saving `config.js`.

## Commands
Send `.menu` in WhatsApp to see the full list. Highlights: `.play`, `.ytmp3`, `.ytmp4`, `.tiktok`,
`.facebook`, `.sticker`, `.toimg`, `.vv`, group tools (`.kick .promote .tagall .hidetag .tagadmins .del`),
fun (`.truth .dare .rate .ship .fact`), settings (`.antidelete .autoreact .antilink ...`), `.mode`, `.ai`.

## Adding your own command
Add a block to any file in `commands/` (or make a new file):
```js
{
  name: "hello",
  run: async ({ sock, from, msg }) => {
    await sock.sendMessage(from, { text: "Hello!" }, { quoted: msg });
  },
},
```
Restart the bot and `.hello` works. Add `"hello"` to `menuSections` in `config.js` to show it in `.menu`.

## Notes
- `.tiktok`, `.facebook`, `.pinterest` use free public services that can stop working at any time.
- `.ai` needs your own `aiApiKey` in `config.js`.
- `auth_info/` (and `sessions/` in website mode) hold WhatsApp logins — never share them.
- `.vv` and anti-delete are privacy-sensitive; use them responsibly.
- Do not use the bot for spam, harassment or hacking — WhatsApp can permanently ban the number.


---

# 💎 PREMIUM SYSTEM (v2)

**Price:** 199 PKR / month  |  **Free trial:** 3 days (starts the first time a number links the bot)  |  **1400+ premium commands**

## How it works
1. A customer links their number (website mode: `start-web.bat`). The bot sends them a welcome message and the **3-day trial starts automatically** (one time per number — re-linking does not give a new trial).
2. During the trial / paid period all premium commands work. When it ends, premium commands reply with a lock message (price + payment info). Free commands keep working.
3. The customer pays you (Easypaisa / JazzCash etc.) and sends the screenshot. You (the **seller**) activate them from your own WhatsApp:

| Command (seller only) | What it does |
|---|---|
| `.activate 923001234567 1` | Activates 1 month (change the last number for more months) |
| `.deactivate 923001234567` | Stops premium immediately |
| `.premiumlist` | All users, days left, total earnings |

## Set this up in `config.js`
- `sellerNumber` — YOUR number (always premium, can use `.activate`). `admins: []` for helpers.
- `premium.pricePerMonth`, `premium.trialDays`, `premium.paymentInfo` (your Easypaisa/JazzCash text).
- Subscriptions are saved in `data/premium.json` (back this file up!).

## User commands
`.premium` (status & days left) • `.trial` • `.buy` • `.pmenu` (categories) • `.pmenu 3` / `.pmenu convert` • `.psearch <word>` • `.pcount`

## React-then-reply
Every command first gets a reaction on the user's message (⏳), then the bot replies, then it turns ✅.
Turn off / change in `config.js`: `commandReact`, `commandReactEmoji`, `commandDoneEmoji`. A single command can have its own emoji: `{ name: "menu", react: "📜", ... }`.

## What the 1400+ premium commands are
Many are generated from data tables, so one table = many commands:
- 🔁 **718 unit converters** (every unit to every other: `.km2mi 10`, `.kg2lb 70`, `.c2f 37`, `.marla2sqft 1`, `.tola2g 5`) + `.convert 10 km mi`
- 🌍 **107 world clocks** (`.tzlondon`) • 🏳️ **116 country infos** (`.infopakistan`) • 🔮 zodiac
- 🔤 **49 fancy fonts** • 🔐 **65 ciphers/encoders** (caesar 1-25, morse, hex…) • 🔑 hashes & password/PIN generators
- 🧮 **~150 calculators**: math, statistics, geometry, finance (EMI, zakat, interest), health (BMI), science, number systems, date & time
- 📝 **67 text tools** • 😀 kaomoji • 🎲 dice & games • 💬 quote/fact/joke packs • 📒 notes, to-do, reminders, timers
- ⚙️ **Premium bot features:** `.autotyping`, `.autorecording`, `.alwaysonline`, `.anticall`, `.antibadword`, `.autoreply` (+ `.addreply hi=hello`), `.autobio`, `.afk` / `.back`

## Add a new premium command
```js
{ name: "hello", premium: true, category: "✨ Misc", run: async ({ sock, from, msg }) => {
    await sock.sendMessage(from, { text: "Hello!" }, { quoted: msg });
} },
```
`premium: true` locks it behind the trial/subscription. Without it the command stays free.
