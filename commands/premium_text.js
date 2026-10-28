// 💎 Premium: fancy fonts, ciphers, encoders, text tools, hashes, kaomoji
const crypto = require("crypto");
const { cmd, pick, shuffle } = require("../lib/h");

const commands = [];
const add = (...c) => commands.push(...c);
const need = (config, name, ex) => `Example: ${config.prefix}${name} ${ex}`;

// ======================= FANCY FONTS =======================
const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", a = "abcdefghijklmnopqrstuvwxyz", D = "0123456789";
const cp = (n) => String.fromCodePoint(n);

function mathAlpha(upStart, loStart, digitStart, exceptions = {}) {
  const map = {};
  [...A].forEach((ch, i) => (map[ch] = cp(upStart + i)));
  [...a].forEach((ch, i) => (map[ch] = cp(loStart + i)));
  if (digitStart) [...D].forEach((ch, i) => (map[ch] = cp(digitStart + i)));
  for (const [k, v] of Object.entries(exceptions)) map[k] = cp(v);
  return map;
}
function listMap(from, to) { const m = {}; const t = [...to]; [...from].forEach((ch, i) => { if (t[i]) m[ch] = t[i]; }); return m; }

const FONT_MAPS = {
  bold: mathAlpha(0x1D400, 0x1D41A, 0x1D7CE),
  italic: mathAlpha(0x1D434, 0x1D44E, 0, { h: 0x210E }),
  bolditalic: mathAlpha(0x1D468, 0x1D482),
  script: mathAlpha(0x1D49C, 0x1D4B6, 0, { B: 0x212C, E: 0x2130, F: 0x2131, H: 0x210B, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211B, e: 0x212F, g: 0x210A, o: 0x2134 }),
  boldscript: mathAlpha(0x1D4D0, 0x1D4EA),
  fraktur: mathAlpha(0x1D504, 0x1D51E, 0, { C: 0x212D, H: 0x210C, I: 0x2111, R: 0x211C, Z: 0x2128 }),
  boldfraktur: mathAlpha(0x1D56C, 0x1D586),
  doublestruck: mathAlpha(0x1D538, 0x1D552, 0x1D7D8, { C: 0x2102, H: 0x210D, N: 0x2115, P: 0x2119, Q: 0x211A, R: 0x211D, Z: 0x2124 }),
  sans: mathAlpha(0x1D5A0, 0x1D5BA, 0x1D7E2),
  sansbold: mathAlpha(0x1D5D4, 0x1D5EE, 0x1D7EC),
  sansitalic: mathAlpha(0x1D608, 0x1D622),
  sansbolditalic: mathAlpha(0x1D63C, 0x1D656),
  mono: mathAlpha(0x1D670, 0x1D68A, 0x1D7F6),
  circled: { ...listMap(A, [...A].map((_, i) => cp(0x24B6 + i)).join("")), ...listMap(a, [...a].map((_, i) => cp(0x24D0 + i)).join("")), ...listMap("123456789", [..."123456789"].map((_, i) => cp(0x2460 + i)).join("")), 0: "⓪" },
  blackcircled: { ...listMap(A, [...A].map((_, i) => cp(0x1F150 + i)).join("")), ...listMap(a, [...a].map((_, i) => cp(0x1F150 + i)).join("")) },
  squared: { ...listMap(A, [...A].map((_, i) => cp(0x1F130 + i)).join("")), ...listMap(a, [...a].map((_, i) => cp(0x1F130 + i)).join("")) },
  blacksquared: { ...listMap(A, [...A].map((_, i) => cp(0x1F170 + i)).join("")), ...listMap(a, [...a].map((_, i) => cp(0x1F170 + i)).join("")) },
  parenthesized: listMap(a, [...a].map((_, i) => cp(0x249C + i)).join("")),
  fullwidth: Object.fromEntries([...Array(94)].map((_, i) => [String.fromCharCode(33 + i), String.fromCharCode(0xFF01 + i)])),
  smallcaps: listMap(a, "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ"),
  superscript: listMap(a + D, "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹"),
  subscript: listMap(a + D, "ₐbcdₑfgₕᵢⱼₖₗₘₙₒₚqᵣₛₜᵤᵥwₓyz₀₁₂₃₄₅₆₇₈₉"),
};
FONT_MAPS.fullwidth[" "] = "　";
const FLIP = listMap(a, "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz");

const mapText = (text, map) => [...text].map((ch) => map[ch] ?? ch).join("");
const combine = (mark) => (t) => [...t].map((ch) => (ch === " " ? ch : ch + mark)).join("");
const ZALGO = [...Array(48)].map((_, i) => cp(0x300 + i));

const FONTS = {
  ...Object.fromEntries(Object.entries(FONT_MAPS).map(([k, m]) => [k, (t) => mapText(t, m)])),
  upsidedown: (t) => [...mapText(t.toLowerCase(), FLIP)].reverse().join(""),
  strike: combine("\u0336"),
  underline: combine("\u0332"),
  doubleunderline: combine("\u0333"),
  overline: combine("\u0305"),
  slash: combine("\u0338"),
  dotted: combine("\u0323"),
  wavy: combine("\u0330"),
  tilde: combine("\u0303"),
  arrow: combine("\u0362"),
  zalgo: (t) => [...t].map((ch) => (ch === " " ? ch : ch + [...Array(4)].map(() => pick(ZALGO)).join(""))).join(""),
  spaced: (t) => [...t].join(" "),
  dotsep: (t) => [...t].join("•"),
  starsep: (t) => [...t].join("★"),
  heartsep: (t) => [...t].join("♥"),
  bubblesep: (t) => [...t].join("๏"),
  wide: (t) => [...t].join(" ").toUpperCase(),
  bracket: (t) => `【${t}】`,
  cornerbracket: (t) => `「${t}」`,
  fancyline: (t) => `═══ ${t} ═══`,
  sparkle: (t) => `✨ ${t} ✨`,
  crown: (t) => `👑 ${t} 👑`,
  flower: (t) => `🌸 ${t} 🌸`,
  fire: (t) => `🔥 ${t} 🔥`,
  clap: (t) => t.split(/\s+/).join(" 👏 "),
};
for (const [name, fn] of Object.entries(FONTS)) {
  add(cmd(`font${name}`, "🔤 Fancy Fonts", ({ text, config }) => (text ? fn(text) : need(config, `font${name}`, "Ali Khan"))));
}
add(
  cmd("fonts", "🔤 Fancy Fonts", ({ text, config }) => {
    if (!text) return need(config, "fonts", "Ali") + `\n\nSaare styles ek saath. Single: ${config.prefix}fontbold <text>`;
    const t = text.slice(0, 40);
    return `🔤 *Fonts for:* ${t}\n\n` + Object.entries(FONTS).filter(([k]) => k !== "zalgo").map(([k, fn]) => `*${k}*: ${fn(t)}`).join("\n");
  }, { aliases: ["allfonts", "stylish"] }),
  cmd("fontlist", "🔤 Fancy Fonts", ({ config }) => `🔤 *${Object.keys(FONTS).length} fonts*\n\n` + Object.keys(FONTS).map((k) => config.prefix + "font" + k).join("\n")),
);

// ======================= CIPHERS =======================
const shift = (t, n) => [...t].map((ch) => {
  if (ch >= "a" && ch <= "z") return String.fromCharCode(((ch.charCodeAt(0) - 97 + n + 26) % 26) + 97);
  if (ch >= "A" && ch <= "Z") return String.fromCharCode(((ch.charCodeAt(0) - 65 + n + 26) % 26) + 65);
  return ch;
}).join("");
for (let n = 1; n <= 25; n++) {
  add(cmd(`caesar${n}`, "🔐 Ciphers", ({ text, config }) => (text ? `🔐 Caesar +${n}:\n${shift(text, n)}` : need(config, `caesar${n}`, "hello"))));
  add(cmd(`decaesar${n}`, "🔐 Ciphers", ({ text, config }) => (text ? `🔓 Caesar -${n}:\n${shift(text, -n)}` : need(config, `decaesar${n}`, "khoor"))));
}
const MORSE = { a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..", 0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----." };
const UNMORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
const ATBASH = (t) => [...t].map((ch) => (/[a-z]/.test(ch) ? String.fromCharCode(219 - ch.charCodeAt(0)) : /[A-Z]/.test(ch) ? String.fromCharCode(155 - ch.charCodeAt(0)) : ch)).join("");
const LEET = { a: "4", e: "3", i: "1", o: "0", s: "5", t: "7", b: "8", g: "9", l: "1" };

add(
  cmd("morse", "🔐 Ciphers", ({ text, config }) => (text ? [...text.toLowerCase()].map((c) => (c === " " ? "/" : MORSE[c] || c)).join(" ") : need(config, "morse", "sos"))),
  cmd("unmorse", "🔐 Ciphers", ({ text, config }) => (text ? text.trim().split(/\s+/).map((c) => (c === "/" ? " " : UNMORSE[c] || "?")).join("") : need(config, "unmorse", "... --- ..."))),
  cmd("rot13", "🔐 Ciphers", ({ text, config }) => (text ? shift(text, 13) : need(config, "rot13", "hello"))),
  cmd("rot47", "🔐 Ciphers", ({ text, config }) => (text ? [...text].map((c) => { const n = c.charCodeAt(0); return n >= 33 && n <= 126 ? String.fromCharCode(33 + ((n + 14) % 94)) : c; }).join("") : need(config, "rot47", "hello"))),
  cmd("atbash", "🔐 Ciphers", ({ text, config }) => (text ? ATBASH(text) : need(config, "atbash", "hello"))),
  cmd("leet", "🔐 Ciphers", ({ text, config }) => (text ? [...text].map((c) => LEET[c.toLowerCase()] || c).join("") : need(config, "leet", "elite hacker"))),
  cmd("tohex", "🔐 Ciphers", ({ text, config }) => (text ? Buffer.from(text).toString("hex") : need(config, "tohex", "hello"))),
  cmd("fromhex", "🔐 Ciphers", ({ text, config }) => { if (!text) return need(config, "fromhex", "68656c6c6f"); try { return Buffer.from(text.replace(/\s/g, ""), "hex").toString("utf8"); } catch { return "❌ Invalid hex"; } }),
  cmd("tobinary8", "🔐 Ciphers", ({ text, config }) => (text ? [...Buffer.from(text)].map((b) => b.toString(2).padStart(8, "0")).join(" ") : need(config, "tobinary8", "hi"))),
  cmd("frombinary8", "🔐 Ciphers", ({ text, config }) => (text ? Buffer.from(text.trim().split(/\s+/).map((b) => parseInt(b, 2))).toString("utf8") : need(config, "frombinary8", "01101000 01101001"))),
  cmd("tooctal", "🔐 Ciphers", ({ text, config }) => (text ? [...Buffer.from(text)].map((b) => b.toString(8)).join(" ") : need(config, "tooctal", "hi"))),
  cmd("toascii", "🔐 Ciphers", ({ text, config }) => (text ? [...text].map((c) => c.codePointAt(0)).join(" ") : need(config, "toascii", "Hi"))),
  cmd("fromascii", "🔐 Ciphers", ({ text, config }) => (text ? text.trim().split(/\s+/).map((n) => String.fromCodePoint(Number(n))).join("") : need(config, "fromascii", "72 105"))),
  cmd("base32", "🔐 Ciphers", ({ text, config }) => {
    if (!text) return need(config, "base32", "hello");
    const al = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; let bits = "", out = "";
    for (const b of Buffer.from(text)) bits += b.toString(2).padStart(8, "0");
    for (let i = 0; i < bits.length; i += 5) out += al[parseInt(bits.slice(i, i + 5).padEnd(5, "0"), 2)];
    return out + "=".repeat((8 - (out.length % 8)) % 8);
  }),
  cmd("unicodeesc", "🔐 Ciphers", ({ text, config }) => (text ? [...text].map((c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")).join("") : need(config, "unicodeesc", "hi"))),
);

// ======================= HASHES =======================
for (const algo of ["md5", "sha1", "sha224", "sha256", "sha384", "sha512"]) {
  add(cmd(`hash${algo}`, "🔑 Hashes & Generators", ({ text, config }) => (text ? `🔑 ${algo.toUpperCase()}:\n${crypto.createHash(algo).update(text).digest("hex")}` : need(config, `hash${algo}`, "hello"))));
}
add(
  cmd("hashes", "🔑 Hashes & Generators", ({ text, config }) => (text ? ["md5", "sha1", "sha256", "sha512"].map((h) => `*${h}*: ${crypto.createHash(h).update(text).digest("hex")}`).join("\n\n") : need(config, "hashes", "hello"))),
  cmd("uuid", "🔑 Hashes & Generators", () => `🆔 ${crypto.randomUUID()}`),
  cmd("uuid5", "🔑 Hashes & Generators", () => [...Array(5)].map(() => crypto.randomUUID()).join("\n")),
  cmd("token16", "🔑 Hashes & Generators", () => crypto.randomBytes(8).toString("hex")),
  cmd("token32", "🔑 Hashes & Generators", () => crypto.randomBytes(16).toString("hex")),
  cmd("token64", "🔑 Hashes & Generators", () => crypto.randomBytes(32).toString("hex")),
  cmd("apikey", "🔑 Hashes & Generators", () => "sk_" + crypto.randomBytes(24).toString("base64url")),
  cmd("pin4", "🔑 Hashes & Generators", () => String(crypto.randomInt(0, 10000)).padStart(4, "0")),
  cmd("pin6", "🔑 Hashes & Generators", () => String(crypto.randomInt(0, 1000000)).padStart(6, "0")),
);
const PASS_SET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?";
for (const n of [8, 10, 12, 16, 20, 24, 32, 48, 64]) {
  add(cmd(`pass${n}`, "🔑 Hashes & Generators", () => `🔐 ${[...Array(n)].map(() => PASS_SET[crypto.randomInt(PASS_SET.length)]).join("")}`));
}

// ======================= TEXT TOOLS =======================
const words = (t) => t.trim().split(/\s+/).filter(Boolean);
const TT = {
  upper: (t) => t.toUpperCase(),
  lower: (t) => t.toLowerCase(),
  title: (t) => t.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
  sentence: (t) => t.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()),
  swapcase: (t) => [...t].map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join(""),
  altcase: (t) => [...t].map((c, i) => (i % 2 ? c.toLowerCase() : c.toUpperCase())).join(""),
  spongebob: (t) => { let i = 0; return [...t].map((c) => (/[a-z]/i.test(c) ? (i++ % 2 ? c.toUpperCase() : c.toLowerCase()) : c)).join(""); },
  camel: (t) => words(t.toLowerCase()).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w)).join(""),
  pascal: (t) => words(t.toLowerCase()).map((w) => w[0].toUpperCase() + w.slice(1)).join(""),
  snake: (t) => words(t.toLowerCase()).join("_"),
  kebab: (t) => words(t.toLowerCase()).join("-"),
  constant: (t) => words(t.toUpperCase()).join("_"),
  slug: (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  reversetext: (t) => [...t].reverse().join(""),
  reversewords: (t) => words(t).reverse().join(" "),
  reverseeach: (t) => words(t).map((w) => [...w].reverse().join("")).join(" "),
  sortwords: (t) => words(t).sort((x, y) => x.localeCompare(y)).join(" "),
  sortletters: (t) => [...t.replace(/\s/g, "")].sort().join(""),
  shufflewords: (t) => shuffle(words(t)).join(" "),
  shuffleletters: (t) => shuffle([...t]).join(""),
  uniquewords: (t) => [...new Set(words(t))].join(" "),
  removespaces: (t) => t.replace(/\s+/g, ""),
  singlespace: (t) => t.replace(/\s+/g, " ").trim(),
  removevowels: (t) => t.replace(/[aeiou]/gi, ""),
  removedigits: (t) => t.replace(/\d/g, ""),
  removepunct: (t) => t.replace(/[^\p{L}\p{N}\s]/gu, ""),
  onlydigits: (t) => t.replace(/\D/g, ""),
  onlyletters: (t) => t.replace(/[^\p{L}]/gu, ""),
  acronym: (t) => words(t).map((w) => w[0].toUpperCase()).join(""),
  initials: (t) => words(t).map((w) => w[0].toUpperCase() + ".").join(" "),
  longestword: (t) => words(t).sort((x, y) => y.length - x.length)[0],
  shortestword: (t) => words(t).sort((x, y) => x.length - y.length)[0],
  numberlines: (t) => t.split(/\s*\|\s*|\n/).map((l, i) => `${i + 1}. ${l}`).join("\n"),
  bulletlist: (t) => t.split(/\s*\|\s*|\n/).map((l) => `• ${l}`).join("\n"),
  piglatin: (t) => words(t).map((w) => (/^[aeiou]/i.test(w) ? w + "way" : w.replace(/^([^aeiou]+)(.*)$/i, "$2$1ay"))).join(" "),
  doubleletters: (t) => [...t].map((c) => c + c).join(""),
  emojiletters: (t) => [...t.toLowerCase()].map((c) => (/[a-z]/.test(c) ? cp(0x1F1E6 + c.charCodeAt(0) - 97) : c)).join(" "),
  hashtag: (t) => words(t).map((w) => "#" + w.replace(/[^\p{L}\p{N}]/gu, "")).join(" "),
  mention: (t) => words(t).map((w) => "@" + w).join(" "),
  quoteit: (t) => `❝ ${t} ❞`,
  centerline: (t) => `${"─".repeat(Math.min(t.length + 4, 30))}\n  ${t}\n${"─".repeat(Math.min(t.length + 4, 30))}`,
  box: (t) => { const w = Math.min(t.length, 40); return `┏${"━".repeat(w + 2)}┓\n┃ ${t.slice(0, 40).padEnd(w)} ┃\n┗${"━".repeat(w + 2)}┛`; },
  mirrortext: (t) => t + " | " + [...t].reverse().join(""),
  ispalindrome: (t) => { const c = t.toLowerCase().replace(/[^a-z0-9]/g, ""); return c && c === [...c].reverse().join("") ? "✅ Palindrome hai" : "❌ Palindrome nahi hai"; },
  isanagram: (t) => { const [x, y] = t.split(/\s*[,|]\s*/); if (!y) return "Example: .isanagram listen, silent"; const n = (s) => [...s.toLowerCase().replace(/[^a-z]/g, "")].sort().join(""); return n(x) === n(y) ? "✅ Anagram hain" : "❌ Anagram nahi hain"; },
};
for (const [name, fn] of Object.entries(TT)) {
  add(cmd(name, "📝 Text Tools", ({ text, config }) => (text ? String(fn(text)) : need(config, name, "hello world from ali"))));
}

const countCmd = (name, label, fn) => add(cmd(name, "📝 Text Tools", ({ text, config }) => (text ? `${label}: *${fn(text)}*` : need(config, name, "hello world"))));
countCmd("wordcount", "🔢 Words", (t) => words(t).length);
countCmd("charcount", "🔢 Characters", (t) => [...t].length);
countCmd("charcountnospace", "🔢 Characters (no spaces)", (t) => [...t.replace(/\s/g, "")].length);
countCmd("vowelcount", "🔢 Vowels", (t) => (t.match(/[aeiou]/gi) || []).length);
countCmd("consonantcount", "🔢 Consonants", (t) => (t.match(/[b-df-hj-np-tv-z]/gi) || []).length);
countCmd("digitcount", "🔢 Digits", (t) => (t.match(/\d/g) || []).length);
countCmd("sentencecount", "🔢 Sentences", (t) => (t.match(/[^.!?]+[.!?]*/g) || []).filter((s) => s.trim()).length);
countCmd("bytecount", "🔢 Bytes (UTF-8)", (t) => Buffer.byteLength(t));
countCmd("readtime", "📖 Reading time (min)", (t) => Math.max(1, Math.ceil(words(t).length / 200)));

add(
  cmd("wordfreq", "📝 Text Tools", ({ text, config }) => {
    if (!text) return need(config, "wordfreq", "to be or not to be");
    const f = {}; for (const w of words(text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ""))) f[w] = (f[w] || 0) + 1;
    return "📊 *Word frequency*\n" + Object.entries(f).sort((x, y) => y[1] - x[1]).slice(0, 20).map(([w, n]) => `${w}: ${n}`).join("\n");
  }),
  cmd("countsub", "📝 Text Tools", ({ text, config }) => { const [sub, ...rest] = text.split(" "); if (!sub || !rest.length) return need(config, "countsub", "an banana"); return `🔎 "${sub}" → *${rest.join(" ").split(sub).length - 1}* dafa`; }),
  cmd("replace", "📝 Text Tools", ({ text, config }) => { const m = text.match(/^(\S+)=(\S*)\s+([\s\S]+)$/); if (!m) return need(config, "replace", "a=b banana"); return m[3].split(m[1]).join(m[2]); }),
  cmd("repeat", "📝 Text Tools", ({ args, config }) => { const n = parseInt(args[0], 10); const t = args.slice(1).join(" "); if (!(n > 0) || !t) return need(config, "repeat", "3 hello"); return Array(Math.min(n, 50)).fill(t).join("\n"); }),
  cmd("extractnumbers", "📝 Text Tools", ({ text, config }) => (text ? (text.match(/-?\d+(\.\d+)?/g) || ["(koi number nahi)"]).join(", ") : need(config, "extractnumbers", "abc 12 def 3.5"))),
  cmd("extractemails", "📝 Text Tools", ({ text, config }) => (text ? (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || ["(koi email nahi)"]).join("\n") : need(config, "extractemails", "mail me at a@b.com"))),
  cmd("extractlinks", "📝 Text Tools", ({ text, config }) => (text ? (text.match(/https?:\/\/[^\s]+/g) || ["(koi link nahi)"]).join("\n") : need(config, "extractlinks", "see https://example.com"))),
  cmd("extracthashtags", "📝 Text Tools", ({ text, config }) => (text ? (text.match(/#[\p{L}\p{N}_]+/gu) || ["(koi hashtag nahi)"]).join(" ") : need(config, "extracthashtags", "love #life #fun"))),
  cmd("isemail", "📝 Text Tools", ({ text, config }) => (text ? (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(text.trim()) ? "✅ Valid email format" : "❌ Invalid email") : need(config, "isemail", "a@b.com"))),
  cmd("isurl", "📝 Text Tools", ({ text, config }) => { if (!text) return need(config, "isurl", "https://example.com"); try { new URL(text.trim()); return "✅ Valid URL"; } catch { return "❌ Invalid URL"; } }),
  cmd("jsonformat", "📝 Text Tools", ({ text, config }) => { if (!text) return need(config, "jsonformat", '{"a":1}'); try { return JSON.stringify(JSON.parse(text), null, 2); } catch (e) { return "❌ Invalid JSON: " + e.message; } }),
  cmd("jsonminify", "📝 Text Tools", ({ text, config }) => { if (!text) return need(config, "jsonminify", '{ "a": 1 }'); try { return JSON.stringify(JSON.parse(text)); } catch (e) { return "❌ Invalid JSON: " + e.message; } }),
  cmd("lorem", "📝 Text Tools", ({ args }) => {
    const L = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat".split(" ");
    const n = Math.min(300, Math.max(5, parseInt(args[0], 10) || 40));
    const w = [...Array(n)].map((_, i) => L[i % L.length]); const s = w.join(" "); return s[0].toUpperCase() + s.slice(1) + ".";
  }),
  cmd("randcolor", "🎨 Colors", () => { const h = [...Array(3)].map(() => crypto.randomInt(256)); const hex = "#" + h.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase(); return `🎨 ${hex}\nRGB(${h.join(", ")})`; }),
  cmd("hex2rgb", "🎨 Colors", ({ text, config }) => { const m = text.replace("#", "").match(/^([0-9a-f]{6})$/i); if (!m) return need(config, "hex2rgb", "#ff8800"); const n = parseInt(m[1], 16); return `🎨 #${m[1].toUpperCase()} = RGB(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; }),
  cmd("rgb2hex", "🎨 Colors", ({ args, config }) => { const v = args.map((x) => parseInt(x, 10)); if (v.length < 3 || v.some((x) => !(x >= 0 && x <= 255))) return need(config, "rgb2hex", "255 136 0"); return "🎨 #" + v.slice(0, 3).map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase(); }),
  cmd("palette", "🎨 Colors", () => [...Array(5)].map(() => { const h = [...Array(3)].map(() => crypto.randomInt(256)); return "🎨 #" + h.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase(); }).join("\n")),
);

// ======================= KAOMOJI / TEXT ART =======================
const KAO = {
  shrug: "¯\\_(ツ)_/¯", lenny: "( ͡° ͜ʖ ͡°)", tableflip: "(╯°□°)╯︵ ┻━┻", unflip: "┬─┬ ノ( ゜-゜ノ)", disapprove: "ಠ_ಠ", happy: "(◕‿◕)", cry: "(╥﹏╥)",
  love: "(♥‿♥)", angry: "(ಠ益ಠ)", shy: "(⁄ ⁄•⁄ω⁄•⁄ ⁄)", bear: "ʕ•ᴥ•ʔ", cat: "=^.^=", sparkle: "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧", dance: "ヽ(⌐■_■)ノ♪♬", cool: "(⌐■_■)",
  wink: "(^_~)", kiss: "(づ￣ ³￣)づ", hug: "(つ≧▽≦)つ", sleepy: "(－_－) zzZ", surprised: "(°o°)", worried: "(；一_一)", tired: "(´-ω-`)", evil: "ψ(｀∇´)ψ",
  smug: "(¬‿¬)", cute: "(≧◡≦)", sad: "(︶︹︶)", laugh: "(≧▽≦)", pout: "(｡•́︿•̀｡)", salute: "(｀･ω･´)ゞ", thumbsup: "(b ᵔ▽ᵔ)b", highfive: "(ᵔᴥᵔ)人(ᵔᴥᵔ)",
  run: "ε=ε=ε=┌(;*´Д`)ﾉ", peace: "(✌ﾟ∀ﾟ)☞", bow: "m(_ _)m", confused: "(⊙_⊙)?", fight: "(ง'̀-'́)ง", magic: "(∩｀-´)⊃━☆ﾟ.*･｡ﾟ", rose: "(◕‿◕)♡ ✿", dog: "U・ᴥ・U",
  rabbit: "(\\_/)\n(•ᴗ•)\n/ >🥕", heartart: "♡♡♡\n♡ ♡\n ♡", star: "★彡 ☆彡 ★彡", butterfly: "Ƹ̵̡Ӝ̵̨̄Ʒ", flower: "(✿◠‿◠)", music: "♪┏(・o･)┛♪┗ ( ･o･) ┓♪", sword: "o()xxxx[{::::::::::::::::::>", gun: "︻デ═一",
};
for (const [name, face] of Object.entries(KAO)) {
  add(cmd(`art${name}`, "😀 Kaomoji & Art", ({ text }) => (text ? `${face}\n${text}` : face)));
}
add(cmd("randomkaomoji", "😀 Kaomoji & Art", () => pick(Object.values(KAO))));

module.exports = commands;
