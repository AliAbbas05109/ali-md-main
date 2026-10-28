// 💎 Premium: world clock (100+ cities), country info (100 countries), zodiac signs
const { cmd } = require("../lib/h");

// ---------- WORLD CLOCK: .tzlondon  .tztokyo  .tznewyork ... ----------
const ZONES = {
  karachi: "Asia/Karachi", dubai: "Asia/Dubai", riyadh: "Asia/Riyadh", doha: "Asia/Qatar", kuwait: "Asia/Kuwait", muscat: "Asia/Muscat",
  bahrain: "Asia/Bahrain", baghdad: "Asia/Baghdad", tehran: "Asia/Tehran", kabul: "Asia/Kabul", tashkent: "Asia/Tashkent", almaty: "Asia/Almaty",
  bishkek: "Asia/Bishkek", baku: "Asia/Baku", tbilisi: "Asia/Tbilisi", yerevan: "Asia/Yerevan", amman: "Asia/Amman", beirut: "Asia/Beirut",
  damascus: "Asia/Damascus", istanbul: "Europe/Istanbul", delhi: "Asia/Kolkata", mumbai: "Asia/Kolkata", dhaka: "Asia/Dhaka",
  kathmandu: "Asia/Kathmandu", colombo: "Asia/Colombo", yangon: "Asia/Yangon", bangkok: "Asia/Bangkok", hanoi: "Asia/Ho_Chi_Minh",
  jakarta: "Asia/Jakarta", singapore: "Asia/Singapore", kualalumpur: "Asia/Kuala_Lumpur", manila: "Asia/Manila", hongkong: "Asia/Hong_Kong",
  beijing: "Asia/Shanghai", shanghai: "Asia/Shanghai", taipei: "Asia/Taipei", seoul: "Asia/Seoul", tokyo: "Asia/Tokyo", ulaanbaatar: "Asia/Ulaanbaatar",
  phnompenh: "Asia/Phnom_Penh", london: "Europe/London", dublin: "Europe/Dublin", lisbon: "Europe/Lisbon", madrid: "Europe/Madrid",
  paris: "Europe/Paris", berlin: "Europe/Berlin", rome: "Europe/Rome", amsterdam: "Europe/Amsterdam", brussels: "Europe/Brussels",
  zurich: "Europe/Zurich", vienna: "Europe/Vienna", stockholm: "Europe/Stockholm", oslo: "Europe/Oslo", copenhagen: "Europe/Copenhagen",
  helsinki: "Europe/Helsinki", warsaw: "Europe/Warsaw", prague: "Europe/Prague", budapest: "Europe/Budapest", athens: "Europe/Athens",
  bucharest: "Europe/Bucharest", kyiv: "Europe/Kyiv", moscow: "Europe/Moscow", minsk: "Europe/Minsk", reykjavik: "Atlantic/Reykjavik",
  cairo: "Africa/Cairo", lagos: "Africa/Lagos", nairobi: "Africa/Nairobi", johannesburg: "Africa/Johannesburg", casablanca: "Africa/Casablanca",
  algiers: "Africa/Algiers", tunis: "Africa/Tunis", addisababa: "Africa/Addis_Ababa", accra: "Africa/Accra", daressalaam: "Africa/Dar_es_Salaam",
  khartoum: "Africa/Khartoum", tripoli: "Africa/Tripoli", kampala: "Africa/Kampala", harare: "Africa/Harare", luanda: "Africa/Luanda",
  newyork: "America/New_York", chicago: "America/Chicago", denver: "America/Denver", losangeles: "America/Los_Angeles", anchorage: "America/Anchorage",
  phoenix: "America/Phoenix", toronto: "America/Toronto", vancouver: "America/Vancouver", mexicocity: "America/Mexico_City", bogota: "America/Bogota",
  lima: "America/Lima", santiago: "America/Santiago", saopaulo: "America/Sao_Paulo", buenosaires: "America/Argentina/Buenos_Aires",
  caracas: "America/Caracas", havana: "America/Havana", panama: "America/Panama", honolulu: "Pacific/Honolulu", sydney: "Australia/Sydney",
  melbourne: "Australia/Melbourne", perth: "Australia/Perth", brisbane: "Australia/Brisbane", adelaide: "Australia/Adelaide",
  auckland: "Pacific/Auckland", fiji: "Pacific/Fiji", utc: "UTC",
};

function clock(zone) {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: zone, weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: zone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
  const time12 = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit", hour12: true }).format(now);
  let off = "";
  try { off = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" }).formatToParts(now).find((p) => p.type === "timeZoneName")?.value || ""; } catch {}
  return { date, time, time12, off };
}

const commands = [];
for (const [city, zone] of Object.entries(ZONES)) {
  commands.push(cmd(`tz${city}`, "🌍 World Clock", () => {
    const c = clock(zone);
    return `🌍 *${city.toUpperCase()}* (${zone})\n🕐 ${c.time}  (${c.time12})\n📅 ${c.date}\n🧭 ${c.off}`;
  }));
}
commands.push(
  cmd("worldclock", "🌍 World Clock", () => {
    const main = ["karachi", "dubai", "riyadh", "london", "paris", "newyork", "losangeles", "tokyo", "sydney", "beijing", "moscow", "cairo"];
    return `🌍 *World Clock*\n\n` + main.map((c) => `${c.padEnd(12)} ${clock(ZONES[c]).time12}`).join("\n") + `\n\n(.tz<city> — ${Object.keys(ZONES).length} cities, e.g. .tzparis)`;
  }, { aliases: ["wc"] }),
  cmd("timein", "🌍 World Clock", ({ args, config }) => {
    const q = args.join("").toLowerCase().replace(/[^a-z]/g, "");
    if (!q) return `Example: ${config.prefix}timein new york`;
    const key = Object.keys(ZONES).find((k) => k === q) || Object.keys(ZONES).find((k) => k.includes(q));
    if (!key) return `❌ City nahi mili. ${config.prefix}pmenu world — list dekhein.`;
    const c = clock(ZONES[key]);
    return `🌍 *${key.toUpperCase()}*\n🕐 ${c.time12}\n📅 ${c.date}\n🧭 ${c.off}`;
  }),
);

// ---------- COUNTRIES: .infopakistan  .infoegypt ... ----------
// [name, capital, calling code, currency, continent]
const COUNTRIES = [
  ["Pakistan", "Islamabad", "+92", "PKR", "Asia"], ["India", "New Delhi", "+91", "INR", "Asia"], ["Bangladesh", "Dhaka", "+880", "BDT", "Asia"],
  ["Afghanistan", "Kabul", "+93", "AFN", "Asia"], ["Iran", "Tehran", "+98", "IRR", "Asia"], ["Iraq", "Baghdad", "+964", "IQD", "Asia"],
  ["Saudi Arabia", "Riyadh", "+966", "SAR", "Asia"], ["UAE", "Abu Dhabi", "+971", "AED", "Asia"], ["Qatar", "Doha", "+974", "QAR", "Asia"],
  ["Kuwait", "Kuwait City", "+965", "KWD", "Asia"], ["Oman", "Muscat", "+968", "OMR", "Asia"], ["Bahrain", "Manama", "+973", "BHD", "Asia"],
  ["Yemen", "Sana'a", "+967", "YER", "Asia"], ["Jordan", "Amman", "+962", "JOD", "Asia"], ["Lebanon", "Beirut", "+961", "LBP", "Asia"],
  ["Syria", "Damascus", "+963", "SYP", "Asia"], ["Turkey", "Ankara", "+90", "TRY", "Asia/Europe"], ["China", "Beijing", "+86", "CNY", "Asia"],
  ["Japan", "Tokyo", "+81", "JPY", "Asia"], ["South Korea", "Seoul", "+82", "KRW", "Asia"], ["Indonesia", "Jakarta", "+62", "IDR", "Asia"],
  ["Malaysia", "Kuala Lumpur", "+60", "MYR", "Asia"], ["Singapore", "Singapore", "+65", "SGD", "Asia"], ["Thailand", "Bangkok", "+66", "THB", "Asia"],
  ["Vietnam", "Hanoi", "+84", "VND", "Asia"], ["Philippines", "Manila", "+63", "PHP", "Asia"], ["Myanmar", "Naypyidaw", "+95", "MMK", "Asia"],
  ["Cambodia", "Phnom Penh", "+855", "KHR", "Asia"], ["Laos", "Vientiane", "+856", "LAK", "Asia"], ["Nepal", "Kathmandu", "+977", "NPR", "Asia"],
  ["Sri Lanka", "Sri Jayawardenepura Kotte", "+94", "LKR", "Asia"], ["Bhutan", "Thimphu", "+975", "BTN", "Asia"], ["Maldives", "Malé", "+960", "MVR", "Asia"],
  ["Mongolia", "Ulaanbaatar", "+976", "MNT", "Asia"], ["Kazakhstan", "Astana", "+7", "KZT", "Asia"], ["Uzbekistan", "Tashkent", "+998", "UZS", "Asia"],
  ["Turkmenistan", "Ashgabat", "+993", "TMT", "Asia"], ["Kyrgyzstan", "Bishkek", "+996", "KGS", "Asia"], ["Tajikistan", "Dushanbe", "+992", "TJS", "Asia"],
  ["Azerbaijan", "Baku", "+994", "AZN", "Asia"], ["Georgia", "Tbilisi", "+995", "GEL", "Asia"], ["Armenia", "Yerevan", "+374", "AMD", "Asia"],
  ["Brunei", "Bandar Seri Begawan", "+673", "BND", "Asia"],
  ["Egypt", "Cairo", "+20", "EGP", "Africa"], ["Libya", "Tripoli", "+218", "LYD", "Africa"], ["Tunisia", "Tunis", "+216", "TND", "Africa"],
  ["Algeria", "Algiers", "+213", "DZD", "Africa"], ["Morocco", "Rabat", "+212", "MAD", "Africa"], ["Sudan", "Khartoum", "+249", "SDG", "Africa"],
  ["Somalia", "Mogadishu", "+252", "SOS", "Africa"], ["Ethiopia", "Addis Ababa", "+251", "ETB", "Africa"], ["Kenya", "Nairobi", "+254", "KES", "Africa"],
  ["Tanzania", "Dodoma", "+255", "TZS", "Africa"], ["Uganda", "Kampala", "+256", "UGX", "Africa"], ["Nigeria", "Abuja", "+234", "NGN", "Africa"],
  ["Ghana", "Accra", "+233", "GHS", "Africa"], ["Senegal", "Dakar", "+221", "XOF", "Africa"], ["South Africa", "Pretoria", "+27", "ZAR", "Africa"],
  ["Zimbabwe", "Harare", "+263", "ZWL", "Africa"], ["Zambia", "Lusaka", "+260", "ZMW", "Africa"], ["Angola", "Luanda", "+244", "AOA", "Africa"],
  ["Mali", "Bamako", "+223", "XOF", "Africa"], ["Niger", "Niamey", "+227", "XOF", "Africa"], ["Chad", "N'Djamena", "+235", "XAF", "Africa"],
  ["Cameroon", "Yaoundé", "+237", "XAF", "Africa"], ["DR Congo", "Kinshasa", "+243", "CDF", "Africa"],
  ["UK", "London", "+44", "GBP", "Europe"], ["Ireland", "Dublin", "+353", "EUR", "Europe"], ["France", "Paris", "+33", "EUR", "Europe"],
  ["Germany", "Berlin", "+49", "EUR", "Europe"], ["Italy", "Rome", "+39", "EUR", "Europe"], ["Spain", "Madrid", "+34", "EUR", "Europe"],
  ["Portugal", "Lisbon", "+351", "EUR", "Europe"], ["Netherlands", "Amsterdam", "+31", "EUR", "Europe"], ["Belgium", "Brussels", "+32", "EUR", "Europe"],
  ["Switzerland", "Bern", "+41", "CHF", "Europe"], ["Austria", "Vienna", "+43", "EUR", "Europe"], ["Sweden", "Stockholm", "+46", "SEK", "Europe"],
  ["Norway", "Oslo", "+47", "NOK", "Europe"], ["Denmark", "Copenhagen", "+45", "DKK", "Europe"], ["Finland", "Helsinki", "+358", "EUR", "Europe"],
  ["Iceland", "Reykjavik", "+354", "ISK", "Europe"], ["Poland", "Warsaw", "+48", "PLN", "Europe"], ["Czech Republic", "Prague", "+420", "CZK", "Europe"],
  ["Hungary", "Budapest", "+36", "HUF", "Europe"], ["Romania", "Bucharest", "+40", "RON", "Europe"], ["Greece", "Athens", "+30", "EUR", "Europe"],
  ["Ukraine", "Kyiv", "+380", "UAH", "Europe"], ["Russia", "Moscow", "+7", "RUB", "Europe/Asia"], ["Serbia", "Belgrade", "+381", "RSD", "Europe"],
  ["Croatia", "Zagreb", "+385", "EUR", "Europe"], ["Bosnia", "Sarajevo", "+387", "BAM", "Europe"], ["Albania", "Tirana", "+355", "ALL", "Europe"],
  ["Belarus", "Minsk", "+375", "BYN", "Europe"],
  ["USA", "Washington, D.C.", "+1", "USD", "North America"], ["Canada", "Ottawa", "+1", "CAD", "North America"], ["Mexico", "Mexico City", "+52", "MXN", "North America"],
  ["Cuba", "Havana", "+53", "CUP", "North America"], ["Jamaica", "Kingston", "+1-876", "JMD", "North America"],
  ["Brazil", "Brasília", "+55", "BRL", "South America"], ["Argentina", "Buenos Aires", "+54", "ARS", "South America"], ["Chile", "Santiago", "+56", "CLP", "South America"],
  ["Colombia", "Bogotá", "+57", "COP", "South America"], ["Peru", "Lima", "+51", "PEN", "South America"], ["Venezuela", "Caracas", "+58", "VES", "South America"],
  ["Ecuador", "Quito", "+593", "USD", "South America"], ["Bolivia", "Sucre", "+591", "BOB", "South America"], ["Uruguay", "Montevideo", "+598", "UYU", "South America"],
  ["Paraguay", "Asunción", "+595", "PYG", "South America"],
  ["Australia", "Canberra", "+61", "AUD", "Oceania"], ["New Zealand", "Wellington", "+64", "NZD", "Oceania"], ["Fiji", "Suva", "+679", "FJD", "Oceania"],
];

const slug = (s) => s.toLowerCase().replace(/[^a-z]/g, "");
const countryText = ([n, cap, code, cur, cont]) => `🏳️ *${n}*\n🏛️ Capital: ${cap}\n📞 Calling code: ${code}\n💰 Currency: ${cur}\n🌐 Continent: ${cont}`;

for (const c of COUNTRIES) {
  commands.push(cmd(`info${slug(c[0])}`, "🏳️ Country Info", () => countryText(c)));
}
commands.push(
  cmd("country", "🏳️ Country Info", ({ args, config }) => {
    const q = slug(args.join(""));
    if (!q) return `Example: ${config.prefix}country pakistan`;
    const c = COUNTRIES.find((x) => slug(x[0]) === q) || COUNTRIES.find((x) => slug(x[0]).includes(q));
    return c ? countryText(c) : "❌ Yeh country list mein nahi hai.";
  }),
  cmd("capital", "🏳️ Country Info", ({ args, config }) => {
    const q = slug(args.join(""));
    if (!q) return `Example: ${config.prefix}capital japan`;
    const c = COUNTRIES.find((x) => slug(x[0]).includes(q));
    return c ? `🏛️ ${c[0]} ki capital: *${c[1]}*` : "❌ Yeh country list mein nahi hai.";
  }),
  cmd("callcode", "🏳️ Country Info", ({ args, config }) => {
    const q = slug(args.join(""));
    if (!q) return `Example: ${config.prefix}callcode uk`;
    const c = COUNTRIES.find((x) => slug(x[0]).includes(q));
    return c ? `📞 ${c[0]}: *${c[2]}*` : "❌ Yeh country list mein nahi hai.";
  }),
  cmd("currencycode", "🏳️ Country Info", ({ args, config }) => {
    const q = slug(args.join(""));
    if (!q) return `Example: ${config.prefix}currencycode turkey`;
    const c = COUNTRIES.find((x) => slug(x[0]).includes(q));
    return c ? `💰 ${c[0]}: *${c[3]}*` : "❌ Yeh country list mein nahi hai.";
  }),
);

// ---------- ZODIAC ----------
const SIGNS = [
  ["aries", "♈ Aries", "21 Mar – 19 Apr", "Fire", "Courageous, energetic, confident, sometimes impatient."],
  ["taurus", "♉ Taurus", "20 Apr – 20 May", "Earth", "Reliable, patient, practical, can be stubborn."],
  ["gemini", "♊ Gemini", "21 May – 20 Jun", "Air", "Curious, witty, adaptable, can be restless."],
  ["cancer", "♋ Cancer", "21 Jun – 22 Jul", "Water", "Caring, intuitive, protective, can be moody."],
  ["leo", "♌ Leo", "23 Jul – 22 Aug", "Fire", "Generous, warm, a natural leader, loves attention."],
  ["virgo", "♍ Virgo", "23 Aug – 22 Sep", "Earth", "Analytical, hardworking, kind, can be critical."],
  ["libra", "♎ Libra", "23 Sep – 22 Oct", "Air", "Fair, social, diplomatic, can be indecisive."],
  ["scorpio", "♏ Scorpio", "23 Oct – 21 Nov", "Water", "Passionate, determined, loyal, can be secretive."],
  ["sagittarius", "♐ Sagittarius", "22 Nov – 21 Dec", "Fire", "Adventurous, optimistic, honest, can be blunt."],
  ["capricorn", "♑ Capricorn", "22 Dec – 19 Jan", "Earth", "Disciplined, ambitious, responsible, can be strict."],
  ["aquarius", "♒ Aquarius", "20 Jan – 18 Feb", "Air", "Original, independent, humanitarian, can be distant."],
  ["pisces", "♓ Pisces", "19 Feb – 20 Mar", "Water", "Creative, gentle, empathetic, can be dreamy."],
];
for (const [k, name, dates, el, traits] of SIGNS) {
  commands.push(cmd(`sign${k}`, "🔮 Zodiac", () => `${name}\n📅 ${dates}\n🜂 Element: ${el}\n✨ ${traits}`));
}
commands.push(
  cmd("zodiac", "🔮 Zodiac", ({ args, config }) => {
    // usage: .zodiac 15 8   (day month)
    const d = parseInt(args[0], 10), m = parseInt(args[1], 10);
    if (!(d >= 1 && d <= 31 && m >= 1 && m <= 12)) return `Example: ${config.prefix}zodiac 15 8   (din mahina)`;
    // [month, first day of the sign that STARTS in that month, sign that starts, sign before it]
    const starts = [[1, 20, "aquarius", "capricorn"], [2, 19, "pisces", "aquarius"], [3, 21, "aries", "pisces"], [4, 20, "taurus", "aries"], [5, 21, "gemini", "taurus"], [6, 21, "cancer", "gemini"], [7, 23, "leo", "cancer"], [8, 23, "virgo", "leo"], [9, 23, "libra", "virgo"], [10, 23, "scorpio", "libra"], [11, 22, "sagittarius", "scorpio"], [12, 22, "capricorn", "sagittarius"]];
    const [, cut, after, before] = starts[m - 1];
    const key = d >= cut ? after : before;
    const s = SIGNS.find((x) => x[0] === key);
    return `${s[1]}\n📅 ${s[2]}\n🜂 ${s[3]}\n✨ ${s[4]}`;
  }),
);

module.exports = commands;
