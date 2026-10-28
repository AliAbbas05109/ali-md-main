// 💎 Premium: dice, games, content packs (quotes/facts/jokes...), notes, to-do, reminders
const crypto = require("crypto");
const { cmd, pick, shuffle } = require("../lib/h");

const commands = [];
const add = (...c) => commands.push(...c);
const ex = (config, name, e) => `Example: ${config.prefix}${name} ${e}`;
const rnd = (n) => crypto.randomInt(n);
const digitsOf = (j) => (j || "").split("@")[0].split(":")[0].replace(/\D/g, "");

// ======================= DICE =======================
for (const sides of [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 30, 50, 100, 1000]) {
  add(cmd(`d${sides}`, "🎲 Dice & Games", ({ args }) => {
    const n = Math.min(10, Math.max(1, parseInt(args[0], 10) || 1));
    const r = [...Array(n)].map(() => rnd(sides) + 1);
    return `🎲 d${sides} ×${n}: *${r.join(", ")}*${n > 1 ? `\nTotal: *${r.reduce((a, b) => a + b, 0)}*` : ""}`;
  }));
}

const RPS = ["rock", "paper", "scissors"], RPS_E = { rock: "🪨", paper: "📄", scissors: "✂️" };
add(
  cmd("rps", "🎲 Dice & Games", ({ args, config }) => {
    const me = (args[0] || "").toLowerCase();
    if (!RPS.includes(me)) return ex(config, "rps", "rock | paper | scissors");
    const bot = pick(RPS);
    const win = me === bot ? "🤝 Draw!" : (me === "rock" && bot === "scissors") || (me === "paper" && bot === "rock") || (me === "scissors" && bot === "paper") ? "🏆 Aap jeet gaye!" : "🤖 Main jeet gaya!";
    return `${RPS_E[me]} vs ${RPS_E[bot]}\n${win}`;
  }),
  cmd("slots", "🎲 Dice & Games", () => {
    const S = ["🍒", "🍋", "🔔", "⭐", "💎", "7️⃣"]; const r = [pick(S), pick(S), pick(S)];
    return `🎰 | ${r.join(" | ")} |\n${r[0] === r[1] && r[1] === r[2] ? "🎉 JACKPOT!" : r[0] === r[1] || r[1] === r[2] || r[0] === r[2] ? "✨ Do match — chhota inaam!" : "😅 Agli dafa better luck!"}`;
  }),
  cmd("tosscoin", "🎲 Dice & Games", () => `🪙 *${pick(["HEADS", "TAILS"])}*`),
  cmd("flipmany", "🎲 Dice & Games", ({ args }) => { const n = Math.min(50, Math.max(1, parseInt(args[0], 10) || 10)); const r = [...Array(n)].map(() => pick(["H", "T"])); return `🪙 ${r.join(" ")}\nHeads: ${r.filter((x) => x === "H").length} | Tails: ${r.filter((x) => x === "T").length}`; }),
  cmd("choose", "🎲 Dice & Games", ({ text, config }) => { const o = text.split(/\s*[,|]\s*/).filter(Boolean); if (o.length < 2) return ex(config, "choose", "pizza, burger, biryani"); return `🎯 Main ne chuna: *${pick(o)}*`; }),
  cmd("shufflelist", "🎲 Dice & Games", ({ text, config }) => { const o = text.split(/\s*[,|]\s*/).filter(Boolean); if (o.length < 2) return ex(config, "shufflelist", "ali, ahmed, sara, zain"); return shuffle(o).map((x, i) => `${i + 1}. ${x}`).join("\n"); }),
  cmd("teams", "🎲 Dice & Games", ({ text, config }) => { const o = text.split(/\s*[,|]\s*/).filter(Boolean); if (o.length < 2) return ex(config, "teams", "ali, ahmed, sara, zain"); const s = shuffle(o), h = Math.ceil(s.length / 2); return `👥 *Team A:* ${s.slice(0, h).join(", ")}\n👥 *Team B:* ${s.slice(h).join(", ")}`; }),
  cmd("randnum", "🎲 Dice & Games", ({ args, config }) => { const a = parseInt(args[0], 10), b = parseInt(args[1], 10); if (Number.isNaN(a) || Number.isNaN(b) || b < a) return ex(config, "randnum", "1 100"); return `🔢 *${a + rnd(b - a + 1)}*`; }),
  cmd("lottery", "🎲 Dice & Games", () => `🎟️ Lucky numbers: *${shuffle([...Array(49)].map((_, i) => i + 1)).slice(0, 6).sort((a, b) => a - b).join(" - ")}*`),
  cmd("luckynumber", "🎲 Dice & Games", () => `🍀 Aaj ka lucky number: *${rnd(100) + 1}*`),
  cmd("lovecalc", "🎲 Dice & Games", ({ text, config }) => {
    const [a, b] = text.split(/\s*[&,+|]\s*|\s+and\s+/i); if (!a || !b) return ex(config, "lovecalc", "Ali & Sara");
    const h = crypto.createHash("md5").update([a, b].map((x) => x.trim().toLowerCase()).sort().join("|")).digest()[0]; const p = 40 + (h % 61);
    return `💘 *${a.trim()}* ❤️ *${b.trim()}*\n[${"💗".repeat(Math.round(p / 10))}${"🤍".repeat(10 - Math.round(p / 10))}] *${p}%*`;
  }),
  cmd("friendship", "🎲 Dice & Games", ({ text, config }) => {
    const [a, b] = text.split(/\s*[&,+|]\s*|\s+and\s+/i); if (!a || !b) return ex(config, "friendship", "Ali & Ahmed");
    const h = crypto.createHash("md5").update("f" + [a, b].map((x) => x.trim().toLowerCase()).sort().join("|")).digest()[0]; return `🤝 *${a.trim()}* & *${b.trim()}* — dosti: *${50 + (h % 51)}%*`;
  }),
  cmd("iq", "🎲 Dice & Games", ({ text, config, sender }) => { const n = text || digitsOf(sender); const h = crypto.createHash("md5").update("iq" + n.toLowerCase()).digest()[0]; return `🧠 *${n}* ka (mazaaq wala) IQ: *${70 + (h % 80)}*`; }),
  cmd("handsome", "🎲 Dice & Games", ({ text, sender }) => { const n = text || digitsOf(sender); const h = crypto.createHash("md5").update("hs" + n.toLowerCase()).digest()[0]; return `😎 *${n}* handsome/beautiful meter: *${60 + (h % 41)}%*`; }),
  cmd("fortune", "🎲 Dice & Games", () => pick(["🔮 Aaj ek acchi khabar aane wali hai.", "🔮 Sabr ka phal meetha hota hai — thora aur intezar.", "🔮 Kisi purane dost se rabta hoga.", "🔮 Paisa aayega, lekin kharch bhi sambhal kar.", "🔮 Aaj naya kaam shuru karne ka acha din hai.", "🔮 Ek chhota safar aap ka intezar kar raha hai.", "🔮 Apni sehat ka khayal rakhein, aaj thori thakan ho sakti hai."])),
  cmd("wouldyourather", "🎲 Dice & Games", () => pick(["Hamesha garmi ya hamesha sardi?", "Sirf biryani ya sirf pizza zindagi bhar?", "Mind reading ya udna?", "Bohat paisa lekin dost nahi, ya kam paisa aur acche dost?", "Past mein jana ya future dekhna?", "Kabhi sona nahi ya kabhi khana nahi?", "Har language bolna ya har instrument bajana?"])),
  cmd("neverhaveiever", "🎲 Dice & Games", () => "🙈 Never have I ever... " + pick(["...class mein soya?", "...raat bhar phone chalaya?", "...galat number par message kiya?", "...exam mein cheating ki?", "...kisi ka status chupke se dekha?", "...train/bus miss ki?", "...dost ka khana kha liya?"])),
);

// ======================= CONTENT PACKS =======================
const PACKS = {
  "💬 Quotes": {
    motivation: ["Girne se mat dar, ruk jane se dar.", "Aaj ki mehnat kal ki izzat banti hai.", "Chhote qadam bhi manzil tak le jaate hain.", "Jo shuru karta hai wohi jeetna seekhta hai.", "Mushkil raaste hi acchi manzil tak jaate hain.", "Khud par yaqeen sab se bari quwwat hai.", "Haar tab hoti hai jab aap koshish chhor dete hain.", "Aaj ka din dobara nahi aayega — isay khoob istemal karein."],
    success: ["Success ek din ka kaam nahi, rozana ki aadat hai.", "Focus karein, shor ko ignore karein.", "Jo waqt ki qadar karta hai, waqt uski qadar karta hai.", "Bari kamyabi chhoti chhoti discipline se banti hai.", "Plan banayein, phir us par amal bhi karein.", "Kamyabi unko milti hai jo ruk kar bhi dobara uth jaate hain.", "Seekhte rahein — ilm kabhi purana nahi hota."],
    life: ["Zindagi mushkil nahi, hum usay complicated bana dete hain.", "Jo hai us par shukar karein, jo nahi us par sabr.", "Waqt sab se bara ustaad hai.", "Har din ek naya mauqa hai.", "Zindagi ek safar hai, manzil nahi.", "Log badalte hain, yaadein reh jaati hain.", "Sukoon wahan hai jahan dikhawa nahi."],
    friendquote: ["Sacha dost woh jo bina kahe samajh jaye.", "Dost wohi jo bure waqt mein bhi saath rahe.", "Acche dost qismat se milte hain, qadar karein.", "Dosti mein hisaab nahi hota.", "Ek sacha dost hazaar logon se behtar hai.", "Dost woh aaina hai jo sach dikhata hai.", "Dosti ka rishta khoon ke rishton se kam nahi."],
    love: ["Mohabbat izzat se shuru hoti hai.", "Sacha pyar parwah karta hai, hukm nahi.", "Jahan bharosa nahi wahan mohabbat nahi.", "Pyar lafzon se nahi, aamal se dikhta hai.", "Jo dil se chahe, door reh kar bhi apna rehta hai.", "Mohabbat sabr aur samajh ka naam hai.", "Dil ki baat dil se samjhi jaati hai."],
    sad: ["Kuch dukh ke liye lafz nahi hote.", "Khamoshi bhi bohat kuch keh jaati hai.", "Jo apne hote hain woh chhoray nahi jaate… par kabhi kabhi door ho jaate hain.", "Mushkil waqt guzar jaata hai, bas hausla rakhein.", "Har andhera sehar se pehle hota hai.", "Rona kamzori nahi, dil ka bojh halka karna hai.", "Sab theek ho jayega — bas waqt do."],
    funny: ["Main diet par hoon — biryani ke bina.", "Mera sab se bara masla: subah jaldi uthna.", "Exam se pehle: padhai. Exam ke baad: kaash padhta.", "Wi-Fi ka password yaad rakhna, behtar hai rishtedaron se.", "Neend meri pehli mohabbat hai.", "Phone ki battery aur meri himmat — dono 1% par.", "Mujhe meetings se zyada chai pasand hai."],
    study: ["Aaj padh lo, kal fakhr karo.", "Notes banao, yaad rakho, dohrao.", "25 minute padhai, 5 minute break — try karein.", "Phone door, kitaab qareeb.", "Roz thora thora, bohat bana deta hai.", "Samajh kar padhein, ratta kam karein.", "Raat ko jaldi sona behtar yaadasht deta hai."],
    morning: ["Subah bakhair! Aaj ka din shandar ho. ☀️", "Naya din, nayi umeed. Bismillah karein.", "Utho, chai piyo, kamyab ho jao! ☕", "Aaj kisi ko muskurahat dein. 😊", "Subah ki taazgi dil khush kar deti hai. 🌅", "Allah aap ka aaj ka din aasaan kare. 🤲", "Dua ke saath din shuru karein."],
    night: ["Shab bakhair! Meethi neend aaye. 🌙", "Aaj ka din guzar gaya, kal naya hai.", "Sab fikrein Allah par chhor kar so jayein.", "Phone rakhein, aankhein band karein. 😴", "Sitaron bhari raat aap ke liye sukoon laaye. ✨", "Acche khwab aayein, aamin.", "Kal phir ek nayi kahani hogi."],
    patience: ["Sabr ka phal meetha hota hai.", "Jaldi ka kaam shaitan ka hota hai — sabr behtar.", "Jo sabr karta hai woh kabhi haarta nahi.", "Waqt se pehle kuch nahi milta, waqt ke baad kuch nahi rukta.", "Sabr woh sawari hai jo kabhi girti nahi.", "Intezar bhi ibadat ban sakta hai.", "Har cheez apne waqt par hoti hai."],
    gratitude: ["Alhamdulillah har haal mein.", "Jo mila uska shukar, jo nahi mila uska sabr.", "Shukar guzar dil hamesha ameer hota hai.", "Chhoti nemat ka bhi shukar karein.", "Sehat sab se bari daulat hai.", "Maa baap ki dua sab se bari taqat hai.", "Shukar karne se nemat barhti hai."],
  },
  "😂 Jokes & Riddles": {
    jokeurdu: ["Teacher: Tum late kyun ho? Student: Sir, sign board par likha tha 'School ahead, go slow'.", "Doctor: Aap ko aaram chahiye. Patient: Doctor sahab, phir fees bhi aaram se doon?", "Bhai: Mera phone kho gaya. Dost: Call karta hoon. Bhai: Silent par hai!", "Ammi: Beta, kitni der phone chalayega? Beta: Bas 5 minute. (3 ghante baad)", "Student: Sir, 50 marks de dein. Teacher: Kyun? Student: Itna to mera haq hai, mehnat ki hai... sochi hai.", "Dukandar: Yeh sasta hai. Customer: Phir mehnga kyun likha? Dukandar: Taa ke aap sasta samjhein.", "Wife: Mujhe taareef chahiye. Husband: Chai achi thi. Wife: Aur? Husband: Pichli bhi."],
    dadjoke: ["Why don't eggs tell jokes? They'd crack each other up.", "I only know 25 letters of the alphabet. I don't know y.", "Why did the scarecrow win an award? He was outstanding in his field.", "I used to hate facial hair, but then it grew on me.", "What do you call fake spaghetti? An impasta.", "Why can't you trust stairs? They're always up to something.", "I'm reading a book on anti-gravity. It's impossible to put down."],
    riddle: ["Kaun si cheez jitni zyada len, utni kam hoti? — *Jawab: Andhera/Raasta (jitna chalo)*", "Mere paas chaabi hai magar taala nahi, jagah hai magar kamra nahi. Main kya hoon? — *Jawab: Keyboard*", "Jitna khaao utna barhta hai, jitna dekho utna kam hota hai. — *Jawab: Aankhon ka andhera*", "Main bolta nahi par jawab deta hoon, mujh mein aap ki shakal hai. — *Jawab: Aaina*", "Din mein soti hai, raat ko jagti hai, bina pairon ke chalti hai. — *Jawab: Ghari ki sui (clock) ya Chand*", "Jo cheez aap ki hai magar dusre zyada istemal karte hain. — *Jawab: Aap ka naam*", "Jitna zyada sukhao utna geela hota hai. — *Jawab: Tauliya (towel)*"],
    tongue: ["Peter Piper picked a peck of pickled peppers.", "She sells seashells by the seashore.", "Red lorry, yellow lorry.", "How much wood would a woodchuck chuck?", "Unique New York, you know you need unique New York.", "Fresh fried fish, fish fresh fried.", "Six slippery snails slid slowly seaward."],
    pickup: ["Kya aap ke paas map hai? Main aap ki aankhon mein kho gaya hoon. 😄", "Aap WiFi ho kya? Kyunki mujhe connection mehsoos ho raha hai.", "Kya aap ki thakan jannat se aayi hai? Kyunki aap bilkul angel lagti hain. (just kidding!)", "Aap chai ho? Kyunki aap ke bina subah adhoori hai. ☕", "Charger ho kya? Aap ke bina 1% par aa jata hoon. 🔋", "Aap Google ho? Kyunki mujhe sab kuch aap mein mil jata hai.", "Kya aap ke paas band-aid hai? Kyunki main aap ke aage gir gaya."],
  },
  "🧠 Facts": {
    spacefact: ["Venus par ek din uske saal se bara hota hai.", "Suraj hamare solar system ke 99.8% mass ka hissa hai.", "Space mein awaaz nahi sunai deti kyunki wahan hawa nahi hoti.", "Mars ka aasman din mein butterscotch-rang ka hota hai.", "Ek teaspoon neutron star ka mawad arbon ton ka hoga.", "Chand har saal zameen se lagbhag 3.8 cm door ja raha hai.", "Jupiter par Great Red Spot sadiyon se jaari toofan hai."],
    animalfact: ["Octopus ke 3 dil hote hain.", "Hathi aaina mein khud ko pehchan sakta hai.", "Shehed ki makkhi dance ke zariye raasta batati hai.", "Dolphins ek dusre ko naam se pukarte hain (signature whistles).", "Kachhua apne khol se bahar nikal kar saans leta hai — khol uski haddi se juda hota hai.", "Giraffe ki zuban kaali-neeli hoti hai.", "Ek chitaa 3 second mein 100 km/h tak pohonch sakta hai."],
    bodyfact: ["Insaani dil roz taqreeban 1 lakh dafa dhadakta hai.", "Hamari haddiyan wazan ke hisaab se steel se mazboot hoti hain.", "Insaan ki aankh lagbhag 1 crore rang pehchan sakti hai.", "Dimaagh ka 75% hissa paani hai.", "Pet ka acid blade ko gala sakta hai.", "Hum ek din mein taqreeban 20,000 dafa saans lete hain.", "Naak 50,000 tarah ki khushbuein yaad rakh sakti hai."],
    sciencefact: ["Paani 100°C par ubalta hai (samundar ki sath par).", "Bijli ki raftaar roshni se bohat kam hoti hai.", "Hawa mein taqreeban 78% nitrogen hai.", "Sound ki raftaar hawa mein lagbhag 343 m/s hoti hai.", "Diamond aur pencil ka lead dono carbon se bane hain.", "Honey kabhi kharab nahi hota.", "Zameen ka core Suraj ki sath jitna garam ho sakta hai."],
    historyfact: ["Great Wall of China kai sadiyon mein banai gayi.", "Pehli dafa sone ke sikke Lydia mein bane.", "Printing press 1440 ke qareeb Gutenberg ne banaya.", "Moen-jo-daro Pakistan mein Indus Valley tehzeeb ka mashhoor shehar tha.", "Pehli olympics Yunan mein hoti thi.", "Kaghaz sab se pehle China mein bana.", "Pyramids of Giza qadeem Misr ki nishani hain."],
    foodfact: ["Tamatar technically phal hai.", "Chocolate pehle sirf drink ke taur par piya jata tha.", "Kaju apple ke bahar lagta hai.", "Kele berries hain, strawberries nahi.", "Shehed lambi muddat tak surakshit reh sakta hai.", "Chai duniya mein sab se zyada piye jaane walay mashrubaat mein hai.", "Adrak sadiyon se dawa ke taur par istemal hota hai."],
    techfact: ["Pehla computer bug asal mein ek patanga tha.", "Pehli email 1971 mein bheji gayi.", "QWERTY keyboard 1870s mein design hua.", "Internet 1960s ke ARPANET se shuru hua.", "Pehla iPhone 2007 mein aaya.", "Aaj duniya mein arbon smartphones hain.", "WhatsApp 2009 mein shuru hua."],
  },
  "🎭 Truth, Dare & Fun": {
    truthp: ["Aap ka sab se bara darr kya hai?", "Aap ne aakhri jhoot kab bola?", "Aap ka sab se sharminda karne wala lamha?", "Aap kis ki tarah banna chahte hain?", "Aap ki koi chhupi hui aadat?", "Aap ka sab se purana dost kaun hai?", "Aap sab se zyada kis cheez par paisa kharch karte hain?"],
    darep: ["Apni sab se funny selfie bhejein.", "Group mein 'Main sab se handsome/beautiful hoon' likhein.", "Dost ko voice note mein gana gaa kar sunayein.", "Agle 5 minute sirf emojis mein baat karein.", "Apna sab se purana photo share karein.", "10 pushups karein aur video bhejein.", "Apne favourite insaan ko tareef ka message bhejein."],
    compliment2: ["Aap ki muskurahat din ban deti hai. 😊", "Aap bohat kind aur samajhdaar hain.", "Aap ke saath waqt guzarna acha lagta hai.", "Aap ka sense of humor kamaal ka hai.", "Aap bohat mehnati hain, aur yeh nazar aata hai.", "Aap jahan hotay hain wahan positivity hoti hai.", "Aap ki soch bohat achi hai."],
    roastlight: ["Aap itne slow hain ke loading screen bhi aap se tez hai. 😄", "Aap ka WiFi signal aap se zyada stable hai. 😂", "Aap ki planning aur mere diet — dono sirf Monday ko shuru hote hain.", "Aap alarm ko snooze kar ke bhi late hotay hain. ⏰", "Aap ki battery aur sabr — dono 5% par. 🔋", "Aap itne relaxed hain ke Monday bhi Sunday lagta hai.", "Aap ki neend ke saamne kumbhkaran bhi haar jaye. 😴"],
    advice: ["Roz thora paani zyada piyein.", "Phone kam, kitaab zyada.", "Subah ki 10 minute ki sair karein.", "Sone se 1 ghanta pehle screen band karein.", "Jo kaam 2 minute ka ho abhi kar lein.", "Maa baap se rozana baat karein.", "Hafte mein ek naya kuch seekhein."],
    proverb: ["Jaisi karni waisi bharni.", "Nau din chale adhai kos.", "Ek anar sau bimar.", "Jo garajte hain woh barasate nahi.", "Sau sunar ki, ek lohar ki.", "Dair aaye durust aaye.", "Naach na jaane aangan tera."],
    wish: ["🎂 Janamdin mubarak! Allah aap ko lambi umar aur sehat de.", "🎉 Eid Mubarak! Khushiyan aap ke ghar aayein.", "💍 Shaadi mubarak! Aap ki jodi salamat rahe.", "🎓 Degree mubarak! Aap ki mehnat rang laayi.", "🌙 Ramzan Mubarak! Allah qubool farmaye.", "🏆 Mubarak ho kamyabi! Aap isi ke haqdaar thay.", "🕋 Safar-e-Hajj mubarak, Allah qubool kare."],
  },
};

for (const [category, packs] of Object.entries(PACKS)) {
  for (const [name, items] of Object.entries(packs)) {
    add(cmd(name, category, () => `${category.split(" ")[0]} ${pick(items)}`, { aliases: [] }));
  }
}

// ======================= NOTES / TODO / REMINDERS =======================
const key = (sender, what) => `${what}_${digitsOf(sender)}`;
add(
  cmd("note", "📒 Notes & Planner", ({ text, config, premium, ownerKey, sender }) => {
    if (!text) return ex(config, "note", "kal 5 baje meeting");
    const k = key(sender, "notes"); const list = premium.getData(ownerKey, k, []);
    if (list.length >= 50) return "❌ 50 notes ho chuke hain. Pehle koi delete karein: .delnote <number>";
    list.push({ t: text.slice(0, 500), at: Date.now() }); premium.setData(ownerKey, k, list);
    return `📒 Note #${list.length} save ho gaya.`;
  }),
  cmd("notes", "📒 Notes & Planner", ({ premium, ownerKey, sender }) => {
    const list = premium.getData(ownerKey, key(sender, "notes"), []);
    return list.length ? `📒 *Aap ke notes*\n\n${list.map((n, i) => `${i + 1}. ${n.t}`).join("\n")}` : "📒 Koi note nahi.";
  }),
  cmd("delnote", "📒 Notes & Planner", ({ args, config, premium, ownerKey, sender }) => {
    const k = key(sender, "notes"); const list = premium.getData(ownerKey, k, []); const i = parseInt(args[0], 10) - 1;
    if (args[0] === "all") { premium.setData(ownerKey, k, []); return "🗑️ Saare notes delete."; }
    if (!(i >= 0 && i < list.length)) return ex(config, "delnote", "2   (ya: all)");
    list.splice(i, 1); premium.setData(ownerKey, k, list); return "🗑️ Note delete ho gaya.";
  }),
  cmd("todo", "📒 Notes & Planner", ({ text, config, premium, ownerKey, sender }) => {
    if (!text) return ex(config, "todo", "assignment complete karna");
    const k = key(sender, "todos"); const list = premium.getData(ownerKey, k, []);
    if (list.length >= 50) return "❌ 50 tasks ho chuke hain.";
    list.push({ t: text.slice(0, 200), done: false }); premium.setData(ownerKey, k, list); return `✅ Task #${list.length} add ho gaya.`;
  }),
  cmd("todos", "📒 Notes & Planner", ({ premium, ownerKey, sender }) => {
    const list = premium.getData(ownerKey, key(sender, "todos"), []);
    return list.length ? `📋 *To-Do*\n\n${list.map((n, i) => `${n.done ? "☑️" : "⬜"} ${i + 1}. ${n.t}`).join("\n")}` : "📋 Koi task nahi.";
  }),
  cmd("done", "📒 Notes & Planner", ({ args, config, premium, ownerKey, sender }) => {
    const k = key(sender, "todos"); const list = premium.getData(ownerKey, k, []); const i = parseInt(args[0], 10) - 1;
    if (!(i >= 0 && i < list.length)) return ex(config, "done", "1");
    list[i].done = true; premium.setData(ownerKey, k, list); return `☑️ Task #${i + 1} mukammal! 🎉`;
  }),
  cmd("deltodo", "📒 Notes & Planner", ({ args, config, premium, ownerKey, sender }) => {
    const k = key(sender, "todos"); const list = premium.getData(ownerKey, k, []); const i = parseInt(args[0], 10) - 1;
    if (args[0] === "all") { premium.setData(ownerKey, k, []); return "🗑️ Saare tasks delete."; }
    if (!(i >= 0 && i < list.length)) return ex(config, "deltodo", "1   (ya: all)");
    list.splice(i, 1); premium.setData(ownerKey, k, list); return "🗑️ Task delete.";
  }),
  cmd("remind", "📒 Notes & Planner", async ({ args, config, sock, from, msg }) => {
    // .remind 10m kapre dhona   (s / m / h / d)
    const m = (args[0] || "").match(/^(\d+)(s|m|h|d)$/i);
    const what = args.slice(1).join(" ");
    if (!m || !what) return ex(config, "remind", "10m chai peeni hai   (s=second m=minute h=hour d=day)");
    const ms = Number(m[1]) * { s: 1000, m: 60000, h: 3600000, d: 86400000 }[m[2].toLowerCase()];
    if (ms < 1000 || ms > 7 * 86400000) return "❌ 1 second se 7 din tak ka reminder lagayein.";
    setTimeout(() => sock.sendMessage(from, { text: `⏰ *Reminder:* ${what}` }, { quoted: msg }).catch(() => {}), ms);
    return `⏰ Theek hai! *${m[1]}${m[2]}* baad yaad dilaunga.\n(Note: bot restart hone par reminders reset ho jaate hain.)`;
  }),
  cmd("timer", "📒 Notes & Planner", ({ args, config, sock, from, msg }) => {
    const m = (args[0] || "").match(/^(\d+)(s|m|h)$/i);
    if (!m) return ex(config, "timer", "5m   (s / m / h)");
    const ms = Number(m[1]) * { s: 1000, m: 60000, h: 3600000 }[m[2].toLowerCase()];
    if (ms < 1000 || ms > 6 * 3600000) return "❌ 1 second se 6 ghante tak ka timer lagayein.";
    setTimeout(() => sock.sendMessage(from, { text: `⏱️ *Timer khatam!* (${m[1]}${m[2]})` }, { quoted: msg }).catch(() => {}), ms);
    return `⏱️ Timer start: *${m[1]}${m[2]}*`;
  }),
  cmd("stopwatchinfo", "📒 Notes & Planner", () => `🕐 Abhi ka waqt: *${new Date().toLocaleTimeString()}*\nStart/stop ka waqt note kar ke *.daysbetween* ya *.calc2* se farq nikaalein.`),
);

module.exports = commands;
