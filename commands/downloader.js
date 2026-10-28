// Downloader commands — TikTok, Facebook, YouTube, Pinterest, Song search
// Note: TikTok/Facebook/Pinterest use free public third-party APIs that
// can go down at any time because they are not official APIs.
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const yts = require("yt-search");

// ---- YouTube helper: uses yt-dlp (put yt-dlp.exe in the bot folder) ----
const BOT_DIR = path.join(__dirname, "..");
const YTDLP = fs.existsSync(path.join(BOT_DIR, "yt-dlp.exe")) ? path.join(BOT_DIR, "yt-dlp.exe")
  : fs.existsSync(path.join(BOT_DIR, "yt-dlp")) ? path.join(BOT_DIR, "yt-dlp") : "yt-dlp";
const MAX_BYTES = 90 * 1024 * 1024; // WhatsApp-friendly size limit

const isYtUrl = (u) => /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]{11}/i.test(String(u || ""));

function runYtdlp(args, asBuffer = false) {
  return new Promise((resolve, reject) => {
    execFile(YTDLP, args, { encoding: asBuffer ? "buffer" : "utf8", maxBuffer: MAX_BYTES, windowsHide: true, timeout: 180000 }, (err, stdout, stderr) => {
      if (err) {
        if (err.code === "ENOENT") return reject(new Error("YTDLP_MISSING"));
        return reject(new Error(String(stderr || err.message).slice(0, 300)));
      }
      resolve(stdout);
    });
  });
}
const ytTitle = async (url) => (await runYtdlp(["--no-playlist", "--no-warnings", "--print", "title", url])).trim();
const ytAudio = (url) => runYtdlp(["--no-playlist", "--no-warnings", "-f", "bestaudio[ext=m4a]/bestaudio", "-o", "-", url], true);
const ytVideo = (url) => runYtdlp(["--no-playlist", "--no-warnings", "-f", "18/best[ext=mp4][height<=480]/best[height<=480]", "-o", "-", url], true);
const ytError = (err) => err.message === "YTDLP_MISSING"
  ? "❌ yt-dlp is not installed. Download yt-dlp.exe from github.com/yt-dlp/yt-dlp/releases/latest and put it in the bot folder."
  : "❌ Download failed (video may be too long or restricted).";

module.exports = [
  {
    name: "tiktok",
    aliases: ["tt", "ttdl"],
    run: async ({ sock, from, msg, args }) => {
      const url = args[0];
      if (!url) return sock.sendMessage(from, { text: "Example: .tiktok https://vt.tiktok.com/xxxx" }, { quoted: msg });

      try {
        const { data } = await axios.post("https://www.tikwm.com/api/", null, { params: { url } });
        if (!data?.data?.play) return sock.sendMessage(from, { text: "❌ Video not found. Check the link." }, { quoted: msg });

        await sock.sendMessage(
          from,
          { video: { url: data.data.play }, caption: `🎵 ${data.data.title || "TikTok Video"}` },
          { quoted: msg }
        );
      } catch (err) {
        console.error(".tiktok error:", err);
        await sock.sendMessage(from, { text: "❌ Download failed." }, { quoted: msg });
      }
    },
  },
  {
    name: "facebook",
    aliases: ["fb", "fbdl"],
    run: async ({ sock, from, msg, args }) => {
      const url = args[0];
      if (!url) return sock.sendMessage(from, { text: "Example: .facebook https://www.facebook.com/watch?v=xxxx" }, { quoted: msg });

      try {
        // Public Facebook video pages usually carry an og:video meta tag.
        const { data: html } = await axios.get(url, {
          maxRedirects: 5,
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        });
        const match =
          html.match(/<meta property="og:video:secure_url" content="([^"]+)"/) ||
          html.match(/<meta property="og:video" content="([^"]+)"/);

        if (!match) {
          return sock.sendMessage(
            from,
            { text: "❌ Video not found. Only PUBLIC Facebook videos work (not private/group videos)." },
            { quoted: msg }
          );
        }

        const videoUrl = match[1].replace(/&amp;/g, "&");
        await sock.sendMessage(from, { video: { url: videoUrl }, caption: "📘 Facebook Video" }, { quoted: msg });
      } catch (err) {
        console.error(".facebook error:", err);
        await sock.sendMessage(from, { text: "❌ Download failed." }, { quoted: msg });
      }
    },
  },
  {
    name: "ytmp3",
    run: async ({ sock, from, msg, args }) => {
      const url = args[0];
      if (!url || !isYtUrl(url)) {
        return sock.sendMessage(from, { text: "Example: .ytmp3 https://youtube.com/watch?v=xxxx" }, { quoted: msg });
      }
      try {
        const title = await ytTitle(url);
        const buffer = await ytAudio(url);
        await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mp4", fileName: `${title}.m4a` }, { quoted: msg });
      } catch (err) {
        console.error(".ytmp3 error:", err.message);
        await sock.sendMessage(from, { text: ytError(err) }, { quoted: msg });
      }
    },
  },
  {
    name: "ytmp4",
    aliases: ["video"],
    run: async ({ sock, from, msg, args }) => {
      const url = args[0];
      if (!url || !isYtUrl(url)) {
        return sock.sendMessage(from, { text: "Example: .ytmp4 https://youtube.com/watch?v=xxxx" }, { quoted: msg });
      }
      try {
        const title = await ytTitle(url);
        const buffer = await ytVideo(url);
        await sock.sendMessage(from, { video: buffer, caption: title }, { quoted: msg });
      } catch (err) {
        console.error(".ytmp4 error:", err.message);
        await sock.sendMessage(from, { text: ytError(err) }, { quoted: msg });
      }
    },
  },
  {
    // .song <name> or .song <link> — both work
    name: "song",
    aliases: ["play", "music"],
    run: async ({ sock, from, msg, args }) => {
      const query = args.join(" ");
      if (!query) return sock.sendMessage(from, { text: "Example: .play Tum Hi Ho\nor: .play https://youtube.com/watch?v=xxxx" }, { quoted: msg });

      try {
        let videoUrl = query;
        let title = "";

        if (!isYtUrl(query)) {
          await sock.sendMessage(from, { text: `🔎 Searching "${query}"...` }, { quoted: msg });
          const { videos } = await yts(query);
          if (!videos || !videos.length) {
            return sock.sendMessage(from, { text: "❌ Nothing found." }, { quoted: msg });
          }
          videoUrl = videos[0].url;
          title = videos[0].title;
        } else {
          title = await ytTitle(videoUrl);
        }

        await sock.sendMessage(from, { text: `⬇️ Downloading: ${title}` }, { quoted: msg });
        const buffer = await ytAudio(videoUrl);
        await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mp4", fileName: `${title}.m4a` }, { quoted: msg });
      } catch (err) {
        console.error(".song error:", err.message);
        await sock.sendMessage(from, { text: ytError(err) }, { quoted: msg });
      }
    },
  },
  {
    name: "pinterest",
    aliases: ["pin"],
    run: async ({ sock, from, msg, args }) => {
      const url = args[0];
      if (!url) return sock.sendMessage(from, { text: "Example: .pinterest https://pin.it/xxxx" }, { quoted: msg });
      try {
        const { data: html } = await axios.get(url, { maxRedirects: 5 });
        const match = html.match(/<meta property="og:image" content="([^"]+)"/);
        if (!match) return sock.sendMessage(from, { text: "❌ Image not found." }, { quoted: msg });
        await sock.sendMessage(from, { image: { url: match[1] } }, { quoted: msg });
      } catch (err) {
        console.error(".pinterest error:", err);
        await sock.sendMessage(from, { text: "❌ Download failed." }, { quoted: msg });
      }
    },
  },
];
