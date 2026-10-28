// Islamic menu commands — reminders, duas, zikr

module.exports = [
  {
    name: "duamorning",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "🌅 *Dua for Morning:*\n\nاَصْبَحْنَا وَاَصْبَحَ الْمُلْكُ لِلّٰهِ\n\n(We have entered the morning and with it all dominion belongs to Allah)" }, { quoted: msg });
    },
  },
  {
    name: "duaevening",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "🌇 *Dua for Evening:*\n\nاَمْسَيْنَا وَاَمْسَى الْمُلْكُ لِلّٰهِ\n\n(We have entered the evening and with it all dominion belongs to Allah)" }, { quoted: msg });
    },
  },
  {
    name: "duasleep",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "😴 *Dua before Sleep:*\n\nبِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا\n\n(In Your name, O Allah, I die and I live)" }, { quoted: msg });
    },
  },
  {
    name: "duawakeup",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "☀️ *Dua upon Waking:*\n\nالْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ" }, { quoted: msg });
    },
  },
  {
    name: "duaeating",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "🍽️ *Dua before Eating:*\n\nبِسْمِ اللَّهِ" }, { quoted: msg });
    },
  },
  {
    name: "ayatulkursi",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, {
        text: "📖 *Ayatul Kursi (2:255)*\n\nاللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...\n\n(Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence...)\n\nYou can read the full text in a Quran app or on Quran.com.",
      }, { quoted: msg });
    },
  },
  {
    name: "kalima",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "🤲 *Kalima Tayyiba:*\n\nلَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ" }, { quoted: msg });
    },
  },
  {
    name: "bismillah",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" }, { quoted: msg });
    },
  },
  {
    name: "islamicquote",
    aliases: ["quranreminder"],
    run: async ({ sock, from, msg }) => {
      const quotes = [
        "\"Indeed, with hardship comes ease.\" - Quran 94:6",
        "\"And whoever relies upon Allah - then He is sufficient for him.\" - Quran 65:3",
        "\"Verily, in the remembrance of Allah do hearts find rest.\" - Quran 13:28",
        "\"So remember Me; I will remember you.\" - Quran 2:152",
      ];
      const pick = quotes[Math.floor(Math.random() * quotes.length)];
      await sock.sendMessage(from, { text: `☪️ ${pick}` }, { quoted: msg });
    },
  },
  {
    name: "pillarsislam",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, {
        text: "☪️ *5 Pillars of Islam:*\n1. Shahada (Faith)\n2. Salah (Prayer)\n3. Zakat (Charity)\n4. Sawm (Fasting)\n5. Hajj (Pilgrimage)",
      }, { quoted: msg });
    },
  },
  {
    name: "pillarsiman",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, {
        text: "☪️ *6 Pillars of Iman:*\n1. Belief in Allah\n2. Belief in Angels\n3. Belief in Books\n4. Belief in Prophets\n5. Belief in Day of Judgment\n6. Belief in Qadr (Divine Decree)",
      }, { quoted: msg });
    },
  },
  {
    name: "astaghfirullah",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "أَسْتَغْفِرُ اللَّهَ" }, { quoted: msg });
    },
  },
  {
    name: "alhamdulillah",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "الْحَمْدُ لِلَّهِ" }, { quoted: msg });
    },
  },
  {
    name: "subhanallah",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "سُبْحَانَ اللَّهِ" }, { quoted: msg });
    },
  },
  {
    name: "allahuakbar",
    run: async ({ sock, from, msg }) => {
      await sock.sendMessage(from, { text: "اللَّهُ أَكْبَرُ" }, { quoted: msg });
    },
  },
];
