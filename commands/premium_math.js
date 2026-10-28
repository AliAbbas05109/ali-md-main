// 💎 Premium: math, geometry, finance, health, date & time calculators
const { cmd, fmt, nums } = require("../lib/h");

const commands = [];
const add = (...c) => commands.push(...c);
const ex = (config, name, e) => `Example: ${config.prefix}${name} ${e}`;

// helper: command taking N numbers
function calc(name, cat, example, min, fn) {
  add(cmd(name, cat, ({ args, config }) => {
    const n = nums(args);
    if (n.length < min) return ex(config, name, example);
    const r = fn(...n);
    return r === null || r === undefined ? "❌ Invalid input" : String(r);
  }));
}
const out = (label, v, unit = "") => `${label}: *${fmt(v)}${unit ? " " + unit : ""}*`;

// ---------------- safe expression calculator ----------------
function safeEval(expr) {
  const e = expr.toLowerCase().replace(/\^/g, "**").replace(/×/g, "*").replace(/÷/g, "/").replace(/\bpi\b/g, "Math.PI").replace(/\be\b/g, "Math.E");
  const fns = ["sqrt", "cbrt", "sin", "cos", "tan", "asin", "acos", "atan", "log10", "log2", "log", "ln", "abs", "round", "floor", "ceil", "min", "max", "pow", "exp"];
  let code = e.replace(/\b(ln)\b/g, "log");
  code = code.replace(new RegExp(`\\b(${fns.filter((f) => f !== "ln").join("|")})\\b`, "g"), (m) => `Math.${m}`);
  const stripped = code.replace(/Math\.(PI|E|sqrt|cbrt|sin|cos|tan|asin|acos|atan|log10|log2|log|abs|round|floor|ceil|min|max|pow|exp)/g, "");
  if (!/^[0-9+\-*/%().,\s]*$/.test(stripped)) throw new Error("invalid characters");
  const v = Function(`"use strict";return (${code})`)();
  if (typeof v !== "number") throw new Error("not a number");
  return v;
}

add(
  cmd("calc2", "🧮 Math", ({ text, config }) => {
    if (!text) return ex(config, "calc2", "sqrt(16)+2^3*pi");
    try { return `🧮 ${text} = *${fmt(safeEval(text))}*`; } catch { return "❌ Invalid expression. Allowed: + - * / % ^ ( ) sqrt sin cos tan log ln abs round pi e"; }
  }, { aliases: ["scalc", "eval"] }),
);

// ---------------- basic math ----------------
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const isPrime = (n) => { if (n < 2 || !Number.isInteger(n)) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const factorsOf = (n) => { const f = []; for (let i = 2; n > 1 && i * i <= n; i++) while (n % i === 0) { f.push(i); n /= i; } if (n > 1) f.push(n); return f; };
const divisorsOf = (n) => { const d = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) { d.push(i); if (i !== n / i) d.push(n / i); } return d.sort((a, b) => a - b); };
const fact = (n) => { let r = 1n; for (let i = 2n; i <= BigInt(n); i++) r *= i; return r; };

calc("factorial", "🧮 Math", "10", 1, (n) => (n < 0 || n > 500 || !Number.isInteger(n) ? null : `🧮 ${n}! = *${fact(n)}*`));
calc("fibonacci", "🧮 Math", "10", 1, (n) => { if (n < 1 || n > 200) return null; let a = 0n, b = 1n; const l = []; for (let i = 0; i < n; i++) { l.push(a); [a, b] = [b, a + b]; } return `🔢 Fibonacci (${n}): ${l.join(", ")}`; });
calc("isprime", "🧮 Math", "97", 1, (n) => `${n} ${isPrime(n) ? "✅ prime number hai" : "❌ prime nahi hai"}`);
calc("primesupto", "🧮 Math", "50", 1, (n) => { if (n < 2 || n > 5000) return null; const p = []; for (let i = 2; i <= n; i++) if (isPrime(i)) p.push(i); return `🔢 Primes ≤ ${n} (${p.length}): ${p.join(", ")}`; });
calc("nextprime", "🧮 Math", "100", 1, (n) => { let i = Math.floor(n) + 1; while (!isPrime(i)) i++; return `➡️ Next prime after ${n}: *${i}*`; });
calc("primefactors", "🧮 Math", "360", 1, (n) => (n < 2 || n > 1e12 ? null : `🔢 ${n} = ${factorsOf(n).join(" × ")}`));
calc("divisors", "🧮 Math", "36", 1, (n) => (n < 1 || n > 1e9 ? null : `🔢 Divisors of ${n}: ${divisorsOf(n).join(", ")}`));
calc("gcd", "🧮 Math", "12 18", 2, (...n) => out("GCD", n.reduce(gcd)));
calc("lcm", "🧮 Math", "4 6", 2, (...n) => out("LCM", n.reduce((a, b) => (a * b) / gcd(a, b))));
calc("sqrt", "🧮 Math", "144", 1, (n) => (n < 0 ? null : out(`√${fmt(n)}`, Math.sqrt(n))));
calc("cbrt", "🧮 Math", "27", 1, (n) => out(`∛${fmt(n)}`, Math.cbrt(n)));
calc("square", "🧮 Math", "12", 1, (n) => out(`${fmt(n)}²`, n * n));
calc("cube", "🧮 Math", "5", 1, (n) => out(`${fmt(n)}³`, n ** 3));
calc("power", "🧮 Math", "2 10", 2, (a, b) => out(`${fmt(a)}^${fmt(b)}`, a ** b));
calc("nthroot", "🧮 Math", "3 27", 2, (n, x) => out(`${fmt(n)}-th root of ${fmt(x)}`, x ** (1 / n)));
calc("absolute", "🧮 Math", "-7", 1, (n) => out("Absolute", Math.abs(n)));
calc("reciprocal", "🧮 Math", "8", 1, (n) => (n === 0 ? null : out("1/x", 1 / n)));
calc("logten", "🧮 Math", "1000", 1, (n) => (n <= 0 ? null : out("log10", Math.log10(n))));
calc("logtwo", "🧮 Math", "8", 1, (n) => (n <= 0 ? null : out("log2", Math.log2(n))));
calc("lognat", "🧮 Math", "10", 1, (n) => (n <= 0 ? null : out("ln", Math.log(n))));
calc("logbase", "🧮 Math", "2 64", 2, (b, x) => (b <= 0 || b === 1 || x <= 0 ? null : out(`log base ${fmt(b)} of ${fmt(x)}`, Math.log(x) / Math.log(b))));
calc("expo", "🧮 Math", "2", 1, (n) => out("e^x", Math.exp(n)));
calc("roundto", "🧮 Math", "3.14159 2", 2, (n, d) => out("Rounded", Math.round(n * 10 ** d) / 10 ** d));
calc("floorof", "🧮 Math", "3.7", 1, (n) => out("Floor", Math.floor(n)));
calc("ceilof", "🧮 Math", "3.2", 1, (n) => out("Ceil", Math.ceil(n)));
calc("modulo", "🧮 Math", "17 5", 2, (a, b) => (b === 0 ? null : out(`${fmt(a)} mod ${fmt(b)}`, a % b)));
calc("average", "🧮 Statistics", "4 8 15 16 23 42", 1, (...n) => out("Average", n.reduce((a, b) => a + b, 0) / n.length));
calc("sumof", "🧮 Statistics", "1 2 3 4", 1, (...n) => out("Sum", n.reduce((a, b) => a + b, 0)));
calc("productof", "🧮 Statistics", "2 3 4", 1, (...n) => out("Product", n.reduce((a, b) => a * b, 1)));
calc("maxof", "🧮 Statistics", "3 9 2", 1, (...n) => out("Max", Math.max(...n)));
calc("minof", "🧮 Statistics", "3 9 2", 1, (...n) => out("Min", Math.min(...n)));
calc("rangeof", "🧮 Statistics", "3 9 2", 1, (...n) => out("Range", Math.max(...n) - Math.min(...n)));
calc("median", "🧮 Statistics", "3 1 9 5", 1, (...n) => { const s = [...n].sort((a, b) => a - b), m = Math.floor(s.length / 2); return out("Median", s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2); });
calc("modeof", "🧮 Statistics", "1 2 2 3 3 3", 1, (...n) => { const f = {}; n.forEach((v) => (f[v] = (f[v] || 0) + 1)); const mx = Math.max(...Object.values(f)); return `Mode: *${Object.keys(f).filter((k) => f[k] === mx).join(", ")}* (${mx}x)`; });
calc("variance", "🧮 Statistics", "2 4 4 4 5 5 7 9", 2, (...n) => { const m = n.reduce((a, b) => a + b, 0) / n.length; return out("Variance", n.reduce((a, b) => a + (b - m) ** 2, 0) / n.length); });
calc("stddev", "🧮 Statistics", "2 4 4 4 5 5 7 9", 2, (...n) => { const m = n.reduce((a, b) => a + b, 0) / n.length; return out("Std deviation", Math.sqrt(n.reduce((a, b) => a + (b - m) ** 2, 0) / n.length)); });
calc("sortnums", "🧮 Statistics", "5 3 9 1", 1, (...n) => `🔢 ${[...n].sort((a, b) => a - b).join(", ")}`);
calc("digitsum", "🧮 Math", "12345", 1, (n) => out("Digit sum", String(Math.abs(Math.trunc(n))).split("").reduce((a, b) => a + Number(b), 0)));
calc("reversenum", "🧮 Math", "12345", 1, (n) => out("Reversed", Number(String(Math.abs(Math.trunc(n))).split("").reverse().join("")) * Math.sign(n || 1)));
calc("isarmstrong", "🧮 Math", "153", 1, (n) => { const d = String(Math.trunc(n)).split(""); return d.reduce((a, b) => a + Number(b) ** d.length, 0) === n ? `✅ ${n} Armstrong number hai` : `❌ ${n} Armstrong nahi hai`; });
calc("isperfect", "🧮 Math", "28", 1, (n) => (n > 1 && divisorsOf(n).slice(0, -1).reduce((a, b) => a + b, 0) === n ? `✅ ${n} perfect number hai` : `❌ ${n} perfect number nahi hai`));
calc("iseven", "🧮 Math", "42", 1, (n) => `${n} ${n % 2 === 0 ? "✅ even" : "❌ odd"} hai`);
calc("collatz", "🧮 Math", "27", 1, (n) => { if (n < 1 || n > 1e6) return null; const s = [n]; while (n !== 1 && s.length < 500) { n = n % 2 ? 3 * n + 1 : n / 2; s.push(n); } return `🔁 Collatz (${s.length - 1} steps): ${s.slice(0, 40).join(" → ")}${s.length > 40 ? " …" : ""}`; });
calc("ncr", "🧮 Math", "10 3", 2, (n, r) => (r > n || n > 500 || r < 0 ? null : out(`C(${n},${r})`, Number(fact(n) / (fact(r) * fact(n - r))))));
calc("npr", "🧮 Math", "10 3", 2, (n, r) => (r > n || n > 500 || r < 0 ? null : out(`P(${n},${r})`, Number(fact(n) / fact(n - r)))));
calc("quadratic", "🧮 Math", "1 -3 2   (ax²+bx+c)", 3, (a, b, c) => { if (!a) return null; const d = b * b - 4 * a * c; if (d >= 0) return `📐 ${fmt(a)}x² + ${fmt(b)}x + ${fmt(c)} = 0\nx₁ = *${fmt((-b + Math.sqrt(d)) / (2 * a))}*\nx₂ = *${fmt((-b - Math.sqrt(d)) / (2 * a))}*`; return `📐 Complex roots:\nx = ${fmt(-b / (2 * a))} ± ${fmt(Math.sqrt(-d) / (2 * a))}i`; });
calc("percentof", "🧮 Percentage", "15 200   (15% of 200)", 2, (p, n) => out(`${fmt(p)}% of ${fmt(n)}`, (p / 100) * n));
calc("whatpercent", "🧮 Percentage", "30 200   (30 is what % of 200)", 2, (a, b) => (b === 0 ? null : out(`${fmt(a)} is`, (a / b) * 100, "% of " + fmt(b))));
calc("percentchange", "🧮 Percentage", "100 125", 2, (a, b) => (a === 0 ? null : `📈 Change: *${fmt(((b - a) / Math.abs(a)) * 100)}%* (${fmt(a)} → ${fmt(b)})`));
calc("addpercent", "🧮 Percentage", "200 15", 2, (n, p) => out(`${fmt(n)} + ${fmt(p)}%`, n * (1 + p / 100)));
calc("subpercent", "🧮 Percentage", "200 15", 2, (n, p) => out(`${fmt(n)} − ${fmt(p)}%`, n * (1 - p / 100)));
calc("ratio", "🧮 Math", "8 12", 2, (a, b) => { const g = gcd(a, b); return g ? `⚖️ ${fmt(a)}:${fmt(b)} = *${fmt(a / g)}:${fmt(b / g)}*` : null; });
calc("fraction", "🧮 Math", "12 18", 2, (a, b) => { const g = gcd(a, b); return b && g ? `➗ ${fmt(a)}/${fmt(b)} = *${fmt(a / g)}/${fmt(b / g)}* = ${fmt(a / b)}` : null; });

// ---------------- trigonometry (degrees) ----------------
for (const [name, fn] of [["sine", Math.sin], ["cosine", Math.cos], ["tangent", Math.tan]]) {
  calc(name, "📐 Trigonometry", "30   (degrees)", 1, (d) => out(`${name}(${fmt(d)}°)`, fn((d * Math.PI) / 180)));
}
calc("asine", "📐 Trigonometry", "0.5", 1, (v) => (Math.abs(v) > 1 ? null : out("asin (deg)", (Math.asin(v) * 180) / Math.PI, "°")));
calc("acosine", "📐 Trigonometry", "0.5", 1, (v) => (Math.abs(v) > 1 ? null : out("acos (deg)", (Math.acos(v) * 180) / Math.PI, "°")));
calc("atangent", "📐 Trigonometry", "1", 1, (v) => out("atan (deg)", (Math.atan(v) * 180) / Math.PI, "°"));
calc("hypotenuse", "📐 Trigonometry", "3 4", 2, (a, b) => out("Hypotenuse", Math.hypot(a, b)));

// ---------------- geometry ----------------
const PI = Math.PI;
calc("circlearea", "📐 Geometry", "7   (radius)", 1, (r) => out("Area", PI * r * r));
calc("circlecirc", "📐 Geometry", "7   (radius)", 1, (r) => out("Circumference", 2 * PI * r));
calc("circlefromdiameter", "📐 Geometry", "14   (diameter)", 1, (d) => `⭕ Area: *${fmt(PI * (d / 2) ** 2)}*\nCircumference: *${fmt(PI * d)}*`);
calc("spherevol", "📐 Geometry", "5   (radius)", 1, (r) => out("Volume", (4 / 3) * PI * r ** 3));
calc("spherearea", "📐 Geometry", "5   (radius)", 1, (r) => out("Surface area", 4 * PI * r * r));
calc("cylindervol", "📐 Geometry", "3 10   (radius height)", 2, (r, h) => out("Volume", PI * r * r * h));
calc("cylinderarea", "📐 Geometry", "3 10   (radius height)", 2, (r, h) => out("Surface area", 2 * PI * r * (r + h)));
calc("conevol", "📐 Geometry", "3 10   (radius height)", 2, (r, h) => out("Volume", (PI * r * r * h) / 3));
calc("rectarea", "📐 Geometry", "5 8", 2, (l, w) => out("Area", l * w));
calc("rectperimeter", "📐 Geometry", "5 8", 2, (l, w) => out("Perimeter", 2 * (l + w)));
calc("squarearea", "📐 Geometry", "6   (side)", 1, (s) => out("Area", s * s));
calc("squareperimeter", "📐 Geometry", "6   (side)", 1, (s) => out("Perimeter", 4 * s));
calc("trianglearea", "📐 Geometry", "6 4   (base height)", 2, (b, h) => out("Area", (b * h) / 2));
calc("heron", "📐 Geometry", "3 4 5   (3 sides)", 3, (a, b, c) => { const s = (a + b + c) / 2, v = s * (s - a) * (s - b) * (s - c); return v < 0 ? null : out("Triangle area", Math.sqrt(v)); });
calc("trapezoidarea", "📐 Geometry", "4 6 5   (a b height)", 3, (a, b, h) => out("Area", ((a + b) / 2) * h));
calc("cubevol", "📐 Geometry", "4   (side)", 1, (s) => out("Volume", s ** 3));
calc("cubearea", "📐 Geometry", "4   (side)", 1, (s) => out("Surface area", 6 * s * s));
calc("boxvol", "📐 Geometry", "2 3 4", 3, (l, w, h) => out("Volume", l * w * h));
calc("polygonangle", "📐 Geometry", "6   (sides)", 1, (n) => (n < 3 ? null : `🔷 ${fmt(n)}-sided polygon\nAngle sum: *${fmt((n - 2) * 180)}°*\nEach angle (regular): *${fmt(((n - 2) * 180) / n)}°*`));
calc("distance2d", "📐 Geometry", "0 0 3 4   (x1 y1 x2 y2)", 4, (a, b, c, d) => out("Distance", Math.hypot(c - a, d - b)));
calc("slope", "📐 Geometry", "1 2 3 8   (x1 y1 x2 y2)", 4, (a, b, c, d) => (c === a ? null : out("Slope", (d - b) / (c - a))));
calc("midpoint", "📐 Geometry", "0 0 4 6   (x1 y1 x2 y2)", 4, (a, b, c, d) => `📍 Midpoint: *(${fmt((a + c) / 2)}, ${fmt((b + d) / 2)})*`);

// ---------------- finance ----------------
calc("simpleinterest", "💰 Finance", "10000 5 3   (principal rate% years)", 3, (p, r, t) => `💰 Interest: *${fmt((p * r * t) / 100)}*\nTotal: *${fmt(p + (p * r * t) / 100)}*`);
calc("compoundinterest", "💰 Finance", "10000 5 3   (principal rate% years)", 3, (p, r, t) => `💰 Total: *${fmt(p * (1 + r / 100) ** t)}*\nInterest: *${fmt(p * (1 + r / 100) ** t - p)}*`);
calc("emi", "💰 Finance", "500000 12 36   (loan, rate% yearly, months)", 3, (p, r, m) => { const i = r / 1200; const e = i === 0 ? p / m : (p * i * (1 + i) ** m) / ((1 + i) ** m - 1); return `🏦 Monthly EMI: *${fmt(e)}*\nTotal pay: *${fmt(e * m)}*\nTotal interest: *${fmt(e * m - p)}*`; });
calc("discount", "💰 Finance", "2000 25   (price discount%)", 2, (p, d) => `🏷️ Discount: *${fmt((p * d) / 100)}*\nFinal price: *${fmt(p - (p * d) / 100)}*`);
calc("tax", "💰 Finance", "1000 17   (amount tax%)", 2, (a, t) => `🧾 Tax: *${fmt((a * t) / 100)}*\nTotal: *${fmt(a + (a * t) / 100)}*`);
calc("removetax", "💰 Finance", "1170 17   (total tax%)", 2, (a, t) => `🧾 Original: *${fmt(a / (1 + t / 100))}*\nTax: *${fmt(a - a / (1 + t / 100))}*`);
calc("tip", "💰 Finance", "2500 10   (bill tip%)", 2, (b, t) => `🍽️ Tip: *${fmt((b * t) / 100)}*\nTotal: *${fmt(b + (b * t) / 100)}*`);
calc("splitbill", "💰 Finance", "4500 5   (bill people)", 2, (b, n) => (n <= 0 ? null : out("Per person", b / n)));
calc("profit", "💰 Finance", "800 1000   (cost sell)", 2, (c, s) => `${s >= c ? "📈 Profit" : "📉 Loss"}: *${fmt(Math.abs(s - c))}*\nPercent: *${fmt((Math.abs(s - c) / c) * 100)}%*`);
calc("sellingprice", "💰 Finance", "800 20   (cost profit%)", 2, (c, p) => out("Selling price", c * (1 + p / 100)));
calc("markup", "💰 Finance", "800 1000   (cost sell)", 2, (c, s) => (c === 0 ? null : out("Markup", ((s - c) / c) * 100, "%")));
calc("margin", "💰 Finance", "800 1000   (cost sell)", 2, (c, s) => (s === 0 ? null : out("Margin", ((s - c) / s) * 100, "%")));
calc("savinggoal", "💰 Finance", "100000 12   (goal months)", 2, (g, m) => (m <= 0 ? null : out("Monthly saving needed", g / m)));
calc("salaryperday", "💰 Finance", "60000 26   (monthly working-days)", 2, (s, d) => (d <= 0 ? null : `💵 Per day: *${fmt(s / d)}*\nPer hour (8h): *${fmt(s / d / 8)}*`));
calc("zakat", "💰 Finance", "1000000   (savings value)", 1, (n) => `🕌 Zakat (2.5%): *${fmt(n * 0.025)}*`);
calc("inflation", "💰 Finance", "1000 8 5   (amount rate% years)", 3, (a, r, y) => `📉 ${fmt(a)} aaj = ${fmt(a / (1 + r / 100) ** y)} (${fmt(y)} saal baad ki purchasing power)`);
calc("doubletime", "💰 Finance", "8   (rate%)", 1, (r) => (r <= 0 ? null : out("Paisa double hone mein (Rule of 72)", 72 / r, "saal")));
calc("fdreturn", "💰 Finance", "100000 10 2   (principal rate% years)", 3, (p, r, y) => `🏦 Maturity: *${fmt(p * (1 + r / 100) ** y)}*\nProfit: *${fmt(p * (1 + r / 100) ** y - p)}*`);
calc("currencyx", "💰 Finance", "100 280   (amount rate)", 2, (a, r) => out("Converted", a * r));

// ---------------- health ----------------
calc("bmi", "❤️ Health", "70 175   (kg cm)", 2, (kg, cm) => { const b = kg / (cm / 100) ** 2; const c = b < 18.5 ? "Underweight" : b < 25 ? "Normal ✅" : b < 30 ? "Overweight" : "Obese"; return `⚖️ BMI: *${fmt(b)}* — ${c}`; });
calc("idealweight", "❤️ Health", "175   (cm)", 1, (cm) => `⚖️ Healthy range: *${fmt(18.5 * (cm / 100) ** 2)} – ${fmt(24.9 * (cm / 100) ** 2)} kg*`);
calc("bmrmale", "❤️ Health", "70 175 25   (kg cm age)", 3, (w, h, a) => out("BMR (male)", 10 * w + 6.25 * h - 5 * a + 5, "kcal/day"));
calc("bmrfemale", "❤️ Health", "60 165 25   (kg cm age)", 3, (w, h, a) => out("BMR (female)", 10 * w + 6.25 * h - 5 * a - 161, "kcal/day"));
calc("waterintake", "❤️ Health", "70   (kg)", 1, (kg) => out("Daily water", kg * 0.033, "liters"));
calc("heartratemax", "❤️ Health", "25   (age)", 1, (a) => out("Max heart rate", 220 - a, "bpm"));
calc("caloriesburn", "❤️ Health", "70 30 8   (kg minutes MET)", 3, (kg, min, met) => out("Calories burned", (met * 3.5 * kg * min) / 200, "kcal"));
calc("stepstokm", "❤️ Health", "10000", 1, (s) => out(`${fmt(s)} steps`, s * 0.000762, "km (approx)"));
calc("pacecalc", "❤️ Health", "5 30   (km minutes)", 2, (km, min) => (km <= 0 ? null : out("Pace", min / km, "min/km")));

// ---------------- physics / misc ----------------
calc("speedcalc", "🔬 Science", "120 2   (distance time)", 2, (d, t) => (t === 0 ? null : out("Speed", d / t)));
calc("distancecalc", "🔬 Science", "60 2.5   (speed time)", 2, (s, t) => out("Distance", s * t));
calc("timecalc", "🔬 Science", "120 60   (distance speed)", 2, (d, s) => (s === 0 ? null : out("Time", d / s)));
calc("force", "🔬 Science", "10 9.8   (mass accel)", 2, (m, a) => out("Force", m * a, "N"));
calc("kineticenergy", "🔬 Science", "10 5   (mass velocity)", 2, (m, v) => out("Kinetic energy", 0.5 * m * v * v, "J"));
calc("potentialenergy", "🔬 Science", "10 5   (mass height)", 2, (m, h) => out("Potential energy", m * 9.81 * h, "J"));
calc("ohmlaw", "🔬 Science", "12 4   (volts ohms)", 2, (v, r) => (r === 0 ? null : `⚡ Current: *${fmt(v / r)} A*\nPower: *${fmt((v * v) / r)} W*`));
calc("density", "🔬 Science", "500 2   (mass volume)", 2, (m, v) => (v === 0 ? null : out("Density", m / v)));
calc("freefall", "🔬 Science", "20   (height m)", 1, (h) => `🍎 Fall time: *${fmt(Math.sqrt((2 * h) / 9.81))} s*\nImpact speed: *${fmt(Math.sqrt(2 * 9.81 * h))} m/s*`);
calc("lightyears", "🔬 Science", "4.2   (light-years)", 1, (ly) => out(`${fmt(ly)} ly`, ly * 9.4607e12, "km"));
calc("fuelcost", "🔬 Science", "200 12 280   (km km/L price/L)", 3, (km, kpl, p) => `⛽ Fuel: *${fmt(km / kpl)} L*\nCost: *${fmt((km / kpl) * p)}*`);

// ---------------- number systems ----------------
const BASES = { bin: 2, oct: 8, dec: 10, hex: 16 };
for (const [a, ba] of Object.entries(BASES)) {
  for (const [b, bb] of Object.entries(BASES)) {
    if (a === b) continue;
    add(cmd(`${a}2${b}`, "🔢 Number Systems", ({ text, config }) => {
      const t = text.trim().replace(/^0[xbo]/i, "");
      if (!t) return ex(config, `${a}2${b}`, a === "bin" ? "1010" : a === "hex" ? "ff" : "255");
      const v = parseInt(t, ba);
      if (Number.isNaN(v) || v.toString(ba).toLowerCase() !== t.toLowerCase().replace(/^0+(?=.)/, "")) return `❌ Invalid ${a} number`;
      return `🔢 ${a.toUpperCase()} ${t} = ${b.toUpperCase()} *${v.toString(bb).toUpperCase()}*`;
    }));
  }
}
const ROMAN = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function words(n) {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + words(n % 100) : "");
  for (const [v, w] of [[1e9, "billion"], [1e6, "million"], [1e3, "thousand"]]) if (n >= v) return words(Math.floor(n / v)) + " " + w + (n % v ? " " + words(n % v) : "");
}
add(
  cmd("toroman", "🔢 Number Systems", ({ args, config }) => { let n = parseInt(args[0], 10); if (!(n > 0 && n < 4000)) return ex(config, "toroman", "2026   (1-3999)"); let r = ""; for (const [v, s] of ROMAN) while (n >= v) { r += s; n -= v; } return `🏛️ ${args[0]} = *${r}*`; }),
  cmd("fromroman", "🔢 Number Systems", ({ text, config }) => { const t = text.toUpperCase().trim(); if (!/^[MDCLXVI]+$/.test(t)) return ex(config, "fromroman", "MMXXVI"); let n = 0; for (let i = 0; i < t.length; i++) { const v = ROMAN.find((x) => x[1] === t[i])[0], nx = (ROMAN.find((x) => x[1] === t[i + 1]) || [0])[0]; n += v < nx ? -v : v; } return `🏛️ ${t} = *${n}*`; }),
  cmd("numwords", "🔢 Number Systems", ({ args, config }) => { const n = Math.trunc(Number(String(args[0]).replace(/,/g, ""))); if (Number.isNaN(n) || n < 0 || n > 999999999999) return ex(config, "numwords", "12345"); return `🔤 ${n} = *${words(n)}*`; }),
  cmd("ordinal", "🔢 Number Systems", ({ args, config }) => { const n = parseInt(args[0], 10); if (Number.isNaN(n)) return ex(config, "ordinal", "22"); const s = ["th", "st", "nd", "rd"], v = n % 100; return `🔢 *${n}${s[(v - 20) % 10] || s[v] || s[0]}*`; }),
  cmd("commas", "🔢 Number Systems", ({ args, config }) => { const n = Number(String(args[0]).replace(/,/g, "")); if (Number.isNaN(n)) return ex(config, "commas", "1234567.89"); return `🔢 ${n.toLocaleString("en-US")}\n🇮🇳🇵🇰 ${n.toLocaleString("en-IN")} (lakh/crore style)`; }),
  cmd("sci", "🔢 Number Systems", ({ args, config }) => { const n = Number(String(args[0]).replace(/,/g, "")); if (Number.isNaN(n)) return ex(config, "sci", "123456"); return `🔬 ${n.toExponential()}`; }),
);

// ---------------- date & time ----------------
const parseDate = (s) => { const d = new Date(s); return Number.isNaN(d.getTime()) ? null : d; };
const DAYMS = 86400000;
add(
  cmd("age", "📅 Date & Time", ({ args, config }) => {
    const d = parseDate(args[0]); if (!d) return ex(config, "age", "2000-05-17   (YYYY-MM-DD)");
    const now = new Date(); let y = now.getFullYear() - d.getFullYear(), m = now.getMonth() - d.getMonth(), dd = now.getDate() - d.getDate();
    if (dd < 0) { m--; dd += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); } if (m < 0) { y--; m += 12; }
    const days = Math.floor((now - d) / DAYMS);
    return `🎂 *Umar:* ${y} saal, ${m} mahine, ${dd} din\n📆 Total din: ${days.toLocaleString()}\n⏳ Total ghante: ${(days * 24).toLocaleString()}`;
  }),
  cmd("nextbirthday", "📅 Date & Time", ({ args, config }) => {
    const d = parseDate(args[0]); if (!d) return ex(config, "nextbirthday", "2000-05-17");
    const now = new Date(); let nb = new Date(now.getFullYear(), d.getMonth(), d.getDate()); if (nb < new Date(now.getFullYear(), now.getMonth(), now.getDate())) nb = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
    return `🎉 Agli birthday mein *${Math.ceil((nb - now) / DAYMS)} din* baaki hain (${nb.toDateString()})`;
  }),
  cmd("daysbetween", "📅 Date & Time", ({ args, config }) => { const a = parseDate(args[0]), b = parseDate(args[1]); if (!a || !b) return ex(config, "daysbetween", "2026-01-01 2026-12-31"); const n = Math.round(Math.abs(b - a) / DAYMS); return `📆 *${n} din* (${Math.floor(n / 7)} hafte ${n % 7} din)`; }),
  cmd("daysuntil", "📅 Date & Time", ({ args, config }) => { const d = parseDate(args[0]); if (!d) return ex(config, "daysuntil", "2027-01-01"); const n = Math.ceil((d - new Date()) / DAYMS); return n >= 0 ? `⏳ *${n} din* baaki hain` : `⌛ Yeh date *${-n} din pehle* guzar chuki hai`; }),
  cmd("dayofweek", "📅 Date & Time", ({ args, config }) => { const d = parseDate(args[0]); if (!d) return ex(config, "dayofweek", "2026-08-14"); return `📅 ${args[0]} = *${d.toLocaleDateString("en-US", { weekday: "long" })}*`; }),
  cmd("adddays", "📅 Date & Time", ({ args, config }) => { const d = parseDate(args[0]), n = Number(args[1]); if (!d || Number.isNaN(n)) return ex(config, "adddays", "2026-10-27 45"); return `📅 ${args[0]} + ${n} din = *${new Date(d.getTime() + n * DAYMS).toDateString()}*`; }),
  cmd("leapyear", "📅 Date & Time", ({ args, config }) => { const y = parseInt(args[0], 10); if (!y) return ex(config, "leapyear", "2028"); return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? `✅ ${y} leap year hai` : `❌ ${y} leap year nahi hai`; }),
  cmd("weeknumber", "📅 Date & Time", ({ args }) => { const d = parseDate(args[0]) || new Date(); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return `📅 ISO week: *${Math.ceil(((t - y0) / DAYMS + 1) / 7)}*`; }),
  cmd("dayofyear", "📅 Date & Time", ({ args }) => { const d = parseDate(args[0]) || new Date(); return `📅 Saal ka *${Math.floor((d - new Date(d.getFullYear(), 0, 0)) / DAYMS)}* wa din`; }),
  cmd("daysinmonth", "📅 Date & Time", ({ args, config }) => { const y = parseInt(args[0], 10), m = parseInt(args[1], 10); if (!y || !(m >= 1 && m <= 12)) return ex(config, "daysinmonth", "2026 2"); return `📅 *${new Date(y, m, 0).getDate()}* din`; }),
  cmd("timestamp", "📅 Date & Time", () => `🕐 Unix: *${Math.floor(Date.now() / 1000)}*\nISO: ${new Date().toISOString()}`),
  cmd("fromunix", "📅 Date & Time", ({ args, config }) => { const n = Number(args[0]); if (Number.isNaN(n)) return ex(config, "fromunix", "1700000000"); return `🕐 ${new Date(n * 1000).toUTCString()}`; }),
  cmd("tounix", "📅 Date & Time", ({ text, config }) => { const d = parseDate(text); if (!d) return ex(config, "tounix", "2026-10-27 12:00"); return `🕐 *${Math.floor(d.getTime() / 1000)}*`; }),
  cmd("yearprogress", "📅 Date & Time", () => { const n = new Date(), s = new Date(n.getFullYear(), 0, 1), e = new Date(n.getFullYear() + 1, 0, 1); const p = ((n - s) / (e - s)) * 100; return `📅 ${n.getFullYear()}: [${"█".repeat(Math.round(p / 5))}${"░".repeat(20 - Math.round(p / 5))}] *${p.toFixed(1)}%*`; }),
  cmd("countdownnewyear", "📅 Date & Time", () => { const n = new Date(), ny = new Date(n.getFullYear() + 1, 0, 1); const ms = ny - n; return `🎆 Naye saal mein: *${Math.floor(ms / DAYMS)} din ${Math.floor((ms % DAYMS) / 3600000)} ghante*`; }),
  cmd("hijriapprox", "📅 Date & Time", () => { try { return `🌙 ${new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(new Date())} (approx.)`; } catch { return "❌ Hijri calendar is not supported on this server."; } }),
);

module.exports = commands;
