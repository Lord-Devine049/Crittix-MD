/* REDDIT.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const axios = require('axios');
const p = require('../../lib/phrases');

module.exports = {
  command: 'reddit',
  category: 'soultools',
  description: 'Get top posts from any subreddit',
  execute: async ({ sock, msg, args, chatId, prefix, reply }) => {
    const subreddit = args[0]?.replace('r/','').trim();
    const sort = ['hot','new','top','rising'].includes(args[1]?.toLowerCase()) ? args[1].toLowerCase() : 'hot';
    if (!subreddit) return reply(p.phrases.wrongUsage('provide a subreddit name. example! .reddit memes. optional sort! hot new top.'));
    try {
      await reply(`🔍 ${h.toBoldItalic(`Fetching r/${subreddit}...`)} ${h.demonEmoji()}`);
      const res = await axios.get(`https://www.reddit.com/r/${subreddit}/${sort}.json?limit=5`, { headers: { 'User-Agent': 'CrittixMD/2.0 (whatsapp-bot)', 'Accept': 'application/json' }, timeout: 15000 });
      const posts = res.data?.data?.children;
      if (!posts || posts.length === 0) throw new Error('No posts found');
      const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
      let txt = `╔═══════════════════════════════╗\n║ 🤖 𝐑𝐄𝐃𝐃𝐈𝐓\n╚═══════════════════════════════╝\n\n`;
      txt += `📌 ${h.toBoldItalic(`r/${subreddit}`)} — ${h.toBoldItalic(sort.toUpperCase())}\n\n`;
      const topPost = posts[0]?.data;
      const hasImage = topPost?.url && (topPost.url.endsWith('.jpg') || topPost.url.endsWith('.png') || topPost.url.includes('i.redd.it'));
      posts.slice(0, 5).forEach((p, i) => {
        const post = p.data;
        const upvotes = post.ups >= 1000 ? `${(post.ups/1000).toFixed(1)}K` : post.ups;
        const comments = post.num_comments >= 1000 ? `${(post.num_comments/1000).toFixed(1)}K` : post.num_comments;
        txt += `${medals[i]} ${post.title}\n   ⬆️ ${upvotes} | 💬 ${comments} | 👤 u/${post.author}\n   🔗 reddit.com${post.permalink}\n\n`;
      });
      txt += `💀 ${h.toBoldItalic('Powered by Reddit Public API')} ${h.demonEmoji()}`;
      if (hasImage) {
        try {
          const imgBuffer = await axios.get(topPost.url, { responseType: 'arraybuffer', timeout: 10000 });
          await sock.sendMessage(chatId, { image: Buffer.from(imgBuffer.data), caption: txt, mimetype: 'image/jpeg' }, { quoted: msg });
        } catch { await sock.sendMessage(chatId, { text: txt }, { quoted: msg }); }
      } else {
        await sock.sendMessage(chatId, { text: txt }, { quoted: msg });
      }
    } catch (err) {
      const errMsg = err.response?.status === 404 ? `Subreddit r/${subreddit} not found` : err.response?.status === 403 ? `r/${subreddit} is private` : 'Reddit fetch failed';
      return reply(`✘ ${h.toBoldItalic(errMsg)} ${h.demonEmoji()}`);
    }
  }
};
