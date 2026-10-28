// 💎 Premium: 700+ unit converters (every unit -> every other unit in its group)
// Example: .km2mi 10   .kg2lb 70   .c2f 37   .convert 10 km mi
const { cmd, fmt, num } = require("../lib/h");

// [code, factor to base unit, label]
const GROUPS = {
  "📏 Length": { base: "m", units: [
    ["mm", 0.001, "millimeter"], ["cm", 0.01, "centimeter"], ["dm", 0.1, "decimeter"], ["m", 1, "meter"], ["km", 1000, "kilometer"],
    ["in", 0.0254, "inch"], ["ft", 0.3048, "foot"], ["yd", 0.9144, "yard"], ["mi", 1609.344, "mile"], ["nmi", 1852, "nautical mile"], ["um", 1e-6, "micrometer"],
  ] },
  "⚖️ Mass": { base: "kg", units: [
    ["mg", 1e-6, "milligram"], ["g", 0.001, "gram"], ["kg", 1, "kilogram"], ["t", 1000, "tonne"], ["oz", 0.028349523125, "ounce"],
    ["lb", 0.45359237, "pound"], ["st", 6.35029318, "stone"], ["tola", 0.01166380, "tola"], ["seer", 0.9331, "seer"], ["maund", 37.3242, "maund"],
  ] },
  "🧪 Volume": { base: "L", units: [
    ["ml", 0.001, "milliliter"], ["cl", 0.01, "centiliter"], ["l", 1, "liter"], ["cum", 1000, "cubic meter"], ["tsp", 0.00492892159375, "teaspoon (US)"],
    ["tbsp", 0.01478676478125, "tablespoon (US)"], ["floz", 0.0295735295625, "fluid ounce (US)"], ["cup", 0.2365882365, "cup (US)"],
    ["pint", 0.473176473, "pint (US)"], ["quart", 0.946352946, "quart (US)"], ["gal", 3.785411784, "gallon (US)"], ["igal", 4.54609, "gallon (UK)"],
  ] },
  "🗺️ Area": { base: "sqm", units: [
    ["sqm", 1, "square meter"], ["sqkm", 1e6, "square km"], ["sqcm", 1e-4, "square cm"], ["ha", 1e4, "hectare"], ["acre", 4046.8564224, "acre"],
    ["sqft", 0.09290304, "square foot"], ["sqin", 0.00064516, "square inch"], ["sqyd", 0.83612736, "square yard"], ["sqmi", 2589988.110336, "square mile"],
    ["marla", 25.2929538, "marla"], ["kanal", 505.857, "kanal"],
  ] },
  "🚗 Speed": { base: "mps", units: [
    ["mps", 1, "m/s"], ["kmh", 1 / 3.6, "km/h"], ["mph", 0.44704, "mph"], ["knot", 0.514444444, "knot"], ["fps", 0.3048, "ft/s"], ["mach", 340.29, "mach"],
  ] },
  "⏱️ Time": { base: "sec", units: [
    ["ms", 0.001, "millisecond"], ["sec", 1, "second"], ["min", 60, "minute"], ["hr", 3600, "hour"], ["day", 86400, "day"],
    ["week", 604800, "week"], ["month", 2629800, "month (avg)"], ["year", 31557600, "year"],
  ] },
  "💾 Data": { base: "byte", units: [
    ["bit", 0.125, "bit"], ["byte", 1, "byte"], ["kb", 1024, "KB"], ["mb", 1024 ** 2, "MB"], ["gb", 1024 ** 3, "GB"], ["tb", 1024 ** 4, "TB"], ["pb", 1024 ** 5, "PB"],
  ] },
  "🔋 Energy": { base: "j", units: [
    ["j", 1, "joule"], ["kj", 1000, "kilojoule"], ["cal", 4.184, "calorie"], ["kcal", 4184, "kilocalorie"], ["wh", 3600, "watt-hour"],
    ["kwh", 3.6e6, "kilowatt-hour"], ["btu", 1055.056, "BTU"],
  ] },
  "🌡️ Pressure": { base: "pa", units: [
    ["pa", 1, "pascal"], ["kpa", 1000, "kilopascal"], ["bar", 1e5, "bar"], ["mbar", 100, "millibar"], ["atm", 101325, "atmosphere"],
    ["psi", 6894.757293, "psi"], ["mmhg", 133.322387, "mmHg"], ["torr", 133.322368, "torr"],
  ] },
  "⚡ Power": { base: "w", units: [
    ["w", 1, "watt"], ["kw", 1000, "kilowatt"], ["hp", 745.699872, "horsepower"], ["btuh", 0.29307107, "BTU/hour"],
  ] },
  "📐 Angle": { base: "deg", units: [
    ["deg", 1, "degree"], ["rad", 180 / Math.PI, "radian"], ["grad", 0.9, "gradian"],
  ] },
  "📡 Frequency": { base: "hz", units: [
    ["hz", 1, "hertz"], ["khz", 1e3, "kilohertz"], ["mhz", 1e6, "megahertz"], ["ghz", 1e9, "gigahertz"],
  ] },
};

// non-linear groups: convert to a base and back with functions
const SPECIAL = {
  "🌡️ Temperature": {
    units: [["c", "Celsius", "°C"], ["f", "Fahrenheit", "°F"], ["k", "Kelvin", "K"], ["r", "Rankine", "°R"]],
    toBase: { c: (v) => v, f: (v) => (v - 32) * 5 / 9, k: (v) => v - 273.15, r: (v) => (v - 491.67) * 5 / 9 },
    fromBase: { c: (v) => v, f: (v) => v * 9 / 5 + 32, k: (v) => v + 273.15, r: (v) => (v + 273.15) * 9 / 5 },
  },
  "⛽ Fuel Economy": {
    units: [["mpg", "miles per gallon (US)", "mpg"], ["kpl", "km per liter", "km/L"], ["l100", "liters per 100 km", "L/100km"]],
    toBase: { mpg: (v) => v * 0.425143707, kpl: (v) => v, l100: (v) => 100 / v }, // base = km/L
    fromBase: { mpg: (v) => v / 0.425143707, kpl: (v) => v, l100: (v) => 100 / v },
  },
};

const commands = [];
const registry = new Map(); // code -> { cat, convert(value, toCode) , label, sym }
const nameSeen = new Set();

for (const [cat, g] of Object.entries(GROUPS)) {
  for (const [a, fa, la] of g.units) {
    for (const [b, fb, lb] of g.units) {
      if (a === b) continue;
      const name = `${a}2${b}`;
      if (nameSeen.has(name)) continue;
      nameSeen.add(name);
      commands.push(cmd(name, `🔁 Convert ${cat}`, ({ args, config }) => {
        const v = num(args[0]);
        if (Number.isNaN(v)) return `Example: ${config.prefix}${name} 10\n(${la} → ${lb})`;
        return `${cat.split(" ")[0]} *${fmt(v)} ${a}* = *${fmt((v * fa) / fb)} ${b}*\n_(${la} → ${lb})_`;
      }));
    }
  }
}
for (const [cat, g] of Object.entries(SPECIAL)) {
  for (const [a, la] of g.units) {
    for (const [b, lb] of g.units) {
      if (a === b) continue;
      const name = `${a}2${b}`;
      if (nameSeen.has(name)) continue;
      nameSeen.add(name);
      commands.push(cmd(name, `🔁 Convert ${cat}`, ({ args, config }) => {
        const v = num(args[0]);
        if (Number.isNaN(v)) return `Example: ${config.prefix}${name} 37\n(${la} → ${lb})`;
        return `${cat.split(" ")[0]} *${fmt(v)} ${a.toUpperCase()}* = *${fmt(g.fromBase[b](g.toBase[a](v)))} ${b.toUpperCase()}*\n_(${la} → ${lb})_`;
      }));
    }
  }
}

// generic: .convert 10 km mi  (finds the right group by itself)
function genericConvert(v, a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  for (const g of Object.values(GROUPS)) {
    const ua = g.units.find((u) => u[0] === a), ub = g.units.find((u) => u[0] === b);
    if (ua && ub) return (v * ua[1]) / ub[1];
  }
  for (const g of Object.values(SPECIAL)) {
    if (g.toBase[a] && g.fromBase[b]) return g.fromBase[b](g.toBase[a](v));
  }
  return null;
}

commands.push(
  cmd("convert", "🔁 Convert Tools", ({ args, config }) => {
    const v = num(args[0]);
    if (Number.isNaN(v) || args.length < 3) return `Example: ${config.prefix}convert 10 km mi\n${config.prefix}units — saari units dekhein`;
    const r = genericConvert(v, args[1], args[2]);
    if (r === null) return `❌ Yeh units aapas mein convert nahi ho sakti. ${config.prefix}units dekhein.`;
    return `🔁 *${fmt(v)} ${args[1]}* = *${fmt(r)} ${args[2]}*`;
  }, { aliases: ["conv"] }),
  cmd("units", "🔁 Convert Tools", ({ config }) => {
    const lines = [
      ...Object.entries(GROUPS).map(([cat, g]) => `*${cat}*\n${g.units.map((u) => u[0]).join(", ")}`),
      ...Object.entries(SPECIAL).map(([cat, g]) => `*${cat}*\n${g.units.map((u) => u[0]).join(", ")}`),
    ];
    return `📚 *Supported units*\n\n${lines.join("\n\n")}\n\nUse: ${config.prefix}convert 10 km mi\nYa seedha: ${config.prefix}km2mi 10`;
  }),
);

module.exports = commands;
