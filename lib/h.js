// Small helpers shared by the premium command files
// cmd(name, category, fn, extra) -> a premium command. fn gets { args, text, ...ctx } and returns the reply text.
function cmd(name, category, fn, extra = {}) {
  return {
    name,
    premium: true,
    category,
    ...extra,
    run: async (ctx) => {
      const out = await fn({ ...ctx, text: ctx.args.join(" ") });
      if (out === undefined || out === null || out === "") return;
      await ctx.sock.sendMessage(ctx.from, { text: String(out) }, { quoted: ctx.msg });
    },
  };
}

// pretty number: up to 8 significant digits, no trailing zeros
function fmt(n) {
  if (!isFinite(n)) return String(n);
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a >= 1e12 || a < 1e-5) return n.toExponential(5).replace(/\.?0+e/, "e");
  return String(parseFloat(n.toPrecision(10))).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

// parse "1,000.5" / "12" -> number or NaN
const num = (s) => Number(String(s ?? "").replace(/,/g, ""));
const nums = (args) => args.map(num).filter((n) => !Number.isNaN(n));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

module.exports = { cmd, fmt, num, nums, pick, shuffle };
