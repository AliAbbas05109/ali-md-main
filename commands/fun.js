// Fun / entertainment commands (all safe, no harassment tools)

module.exports = [
  {
    name: "8ball",
    run: async ({ sock, from, msg, args }) => {
      if (!args.length) return sock.sendMessage(from, { text: "Example: .8ball will I pass my exam?" }, { quoted: msg });
      const answers = ["Yes definitely", "No way", "Maybe", "Ask again later", "Most likely", "Very doubtful", "Without a doubt"];
      const pick = answers[Math.floor(Math.random() * answers.length)];
      await sock.sendMessage(from, { text: `🎱 ${pick}` }, { quoted: msg });
    },
  },
  {
    name: "quote",
    run: async ({ sock, from, msg }) => {
      const quotes = [
        "Believe you can and you're halfway there.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "The only way to do great work is to love what you do.",
        "Don't watch the clock; do what it does. Keep going.",
      ];
      await sock.sendMessage(from, { text: `💬 ${quotes[Math.floor(Math.random() * quotes.length)]}` }, { quoted: msg });
    },
  },
  {
    name: "joke",
    run: async ({ sock, from, msg }) => {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "Why did the computer go to therapy? It had too many unresolved issues.",
        "I told my computer I needed a break, and it said 'no problem — I'll go to sleep.'",
      ];
      await sock.sendMessage(from, { text: `😂 ${jokes[Math.floor(Math.random() * jokes.length)]}` }, { quoted: msg });
    },
  },
  {
    name: "compliment",
    run: async ({ sock, from, msg }) => {
      const lines = ["You're doing better than you think!", "Your hard work will pay off.", "You have great potential!"];
      await sock.sendMessage(from, { text: `✨ ${lines[Math.floor(Math.random() * lines.length)]}` }, { quoted: msg });
    },
  },
  {
    name: "flip",
    aliases: ["coinflip"],
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: `🪙 ${Math.random() < 0.5 ? "Heads" : "Tails"}` }, { quoted: msg });
    },
  },
  {
    name: "roll",
    aliases: ["dice"],
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: `🎲 You rolled: ${Math.floor(Math.random() * 6) + 1}` }, { quoted: msg });
    },
  },
  {
    name: "motivate",
    run: async ({ sock, from, msg }) => {
      const lines = [
        "Every expert was once a beginner. Keep learning!",
        "Small daily progress adds up to big results.",
        "You didn't come this far to only come this far.",
      ];
      await sock.sendMessage(from, { text: `🔥 ${lines[Math.floor(Math.random() * lines.length)]}` }, { quoted: msg });
    },
  },
];
