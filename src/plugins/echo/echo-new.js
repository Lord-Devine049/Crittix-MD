/*
 * ECHO-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: ytshorts, snapchatdl, threadsdl, pinterestdl, applemusic,
 *           telegramsticker, twitchclip, redditpost, mediumarticle, newsfeed
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = [

  {
    command: 'ytshorts',
    aliases: ['ytshort'],
    category: 'soultools',
    description: 'Download a YouTube Shorts video. Usage: ytshorts <url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('youtube') && !url.includes('youtu.be')) return reply(p.phrases.wrongUsage('provide the youtube shorts url. example! .ytshorts https://youtube.com/shorts/xxx'));
      await reply('⬇️ grabbing the short...');
      try {
        const { data } = await axios.get(`https://apis.davidcyril.name.ng/download/aiov2?url=${encodeURIComponent(url)}`, { timeout: 30000 });
        if (!data?.result?.length) throw new Error('no result');
        const item = data.result[0];
        if (item?.video_download) {
          await sock.sendMessage(chatId, { video: { url: item.video_download }, caption: `🎬 *YouTube Short*\n\n${item.title || 'Downloaded'}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        } else { reply(p.phrases.error('no video link found')); }
      } catch (e) { reply(p.phrases.error(`YT Shorts download failed — ${e.message}`)); }
    }
  },

  {
    command: 'snapchatdl',
    aliases: ['snapdl', 'snap'],
    category: 'soultools',
    description: 'Download public Snapchat content. Usage: snapchatdl <url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('snap')) return reply(p.phrases.wrongUsage('provide the snapchat url. example! .snapchatdl https://snapchat.com/add/xxx'));
      await reply('⬇️ fetching snap...');
      try {
        const { data } = await axios.get(`https://api.nexoracle.com/downloader/snapchat?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 20000 });
        if (data?.result?.video || data?.result?.url) {
          const mediaUrl = data.result.video || data.result.url;
          await sock.sendMessage(chatId, { video: { url: mediaUrl }, caption: '📸 *Snapchat Download*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_' }, { quoted: msg });
        } else { reply(p.phrases.error('failed to get download link — make sure the content is public')); }
      } catch (e) { reply(p.phrases.error(`Snapchat DL failed — ${e.message}`)); }
    }
  },

  {
    command: 'threadsdl',
    aliases: [ 'tdl'],
    category: 'soultools',
    description: 'Download a Threads post. Usage: threadsdl <threads url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('threads')) return reply(p.phrases.wrongUsage('provide the threads.net post url. example! .threadsdl https://threads.net/@user/post/xxx'));
      await reply('⬇️ fetching threads post...');
      try {
        const { data } = await axios.get(`https://api.nexoracle.com/downloader/threads?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 20000 });
        const media = data?.result?.video || data?.result?.image || data?.result?.media;
        if (media) {
          const isVideo = data?.result?.video ? true : false;
          await sock.sendMessage(chatId, isVideo ? { video: { url: media }, caption: '🧵 *Threads Download*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_' } : { image: { url: media }, caption: '🧵 *Threads Post*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_' }, { quoted: msg });
        } else { reply(p.phrases.error('no downloadable media found')); }
      } catch (e) { reply(p.phrases.error(`Threads DL failed — ${e.message}`)); }
    }
  },

  {
    command: 'pinterestdl',
    aliases: ['pinterest2', 'pindl'],
    category: 'soultools',
    description: 'Download a Pinterest image/video. Usage: pinterestdl <pinterest url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('pin')) return reply(p.phrases.wrongUsage('provide the pinterest url. example! .pinterestdl https://pinterest.com/pin/xxx'));
      await reply('📌 fetching pin...');
      try {
        const { data } = await axios.get(`https://api.nexoracle.com/downloader/pinterest?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 20000 });
        const media = data?.result?.video || data?.result?.image;
        if (media) {
          const isVideo = !!data?.result?.video;
          await sock.sendMessage(chatId, isVideo ? { video: { url: media }, caption: '📌 *Pinterest Download*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_' } : { image: { url: media }, caption: '📌 *Pinterest Pin*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_' }, { quoted: msg });
        } else { reply(p.phrases.error('no downloadable media in that pin')); }
      } catch (e) { reply(p.phrases.error(`Pinterest DL failed — ${e.message}`)); }
    }
  },

  {
    command: 'applemusic',
    aliases: ['amusic', 'itunes'],
    category: 'soultools',
    description: 'Get Apple Music track info by search. Usage: applemusic Blinding Lights',
    execute: async ({ text, args, reply }) => {
      const query = text || args.join(' ');
      if (!query) return reply(p.phrases.wrongUsage('type the song name or artist. example! .applemusic blinding lights weeknd'));
      try {
        const { data } = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=3`, { timeout: 10000 });
        const results = data?.results;
        if (!results?.length) return reply(p.phrases.error(`no results for "${query}" on Apple Music`));
        const tracks = results.map(r =>
          `🎵 *${r.trackName}* — ${r.artistName}\n` +
          `💿 Album: ${r.collectionName}\n` +
          `📅 Released: ${r.releaseDate?.split('T')[0] || 'N/A'}\n` +
          `⏱️ Duration: ${Math.floor((r.trackTimeMillis || 0) / 60000)}:${String(Math.floor(((r.trackTimeMillis || 0) % 60000) / 1000)).padStart(2, '0')}\n` +
          `🔗 ${r.trackViewUrl || ''}`
        ).join('\n\n');
        reply(`🍎 *APPLE MUSIC — ${query.toUpperCase()}*\n\n${tracks}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`Apple Music search failed — ${e.message}`)); }
    }
  },

  {
    command: 'telegramsticker',
    aliases: [ 'tgdl'],
    category: 'soultools',
    description: 'Download a Telegram sticker pack link info. Usage: telegramsticker <t.me/addstickers/...>',
    execute: async ({ args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('t.me')) return reply(p.phrases.wrongUsage('provide the telegram sticker pack link. example! .telegramsticker https://t.me/addstickers/packname'));
      const packName = url.split('/').pop();
      try {
        reply(
          `📦 *TELEGRAM STICKER PACK*\n\n` +
          `🔗 Pack: *${packName}*\n\n` +
          `⚠️ _Direct download requires Telegram Bot API token. To download this pack:_\n\n` +
          `1. Open Telegram\n2. Visit: ${url}\n3. Click "Add Stickers"\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(p.phrases.error(`Telegram sticker info failed — ${e.message}`)); }
    }
  },

  {
    command: 'twitchclip',
    aliases: ['twitch', 'twitchdl'],
    category: 'soultools',
    description: 'Download a Twitch clip. Usage: twitchclip <twitch clip url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('twitch')) return reply(p.phrases.wrongUsage('provide the twitch clip url. example! .twitchclip https://clips.twitch.tv/xxx'));
      await reply('⬇️ fetching Twitch clip...');
      try {
        const { data } = await axios.get(`https://api.nexoracle.com/downloader/twitch?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 25000 });
        const dlUrl = data?.result?.download || data?.result?.video;
        if (dlUrl) {
          await sock.sendMessage(chatId, { video: { url: dlUrl }, caption: `🎮 *Twitch Clip*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        } else { reply(p.phrases.error('clip download unavailable — Twitch restricts many clips')); }
      } catch (e) { reply(p.phrases.error(`Twitch clip DL failed — ${e.message}`)); }
    }
  },

  {
    command: 'redditpost',
    aliases: [ 'rdl'],
    category: 'soultools',
    description: 'Fetch a Reddit post by URL. Usage: redditpost <reddit url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('reddit')) return reply(p.phrases.wrongUsage('provide the reddit post url. example! .redditpost https://reddit.com/r/memes/xxx'));
      try {
        const jsonUrl = url.replace(/\/$/, '') + '.json';
        const { data } = await axios.get(jsonUrl, { headers: { 'User-Agent': 'CrittixBot/1.0' }, timeout: 15000 });
        const post = data?.[0]?.data?.children?.[0]?.data;
        if (!post) return reply(p.phrases.error('could not parse Reddit post'));
        const text = `📬 *REDDIT POST*\n\n📌 *${post.title}*\n👤 u/${post.author} | r/${post.subreddit}\n⬆️ ${post.score} upvotes | 💬 ${post.num_comments} comments\n\n${post.selftext ? post.selftext.substring(0, 500) : '_(no text body)_'}\n\n🔗 reddit.com${post.permalink}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
        if (post.url_overridden_by_dest && (post.url_overridden_by_dest.includes('.jpg') || post.url_overridden_by_dest.includes('.png'))) {
          await sock.sendMessage(chatId, { image: { url: post.url_overridden_by_dest }, caption: text }, { quoted: msg });
        } else { reply(text); }
      } catch (e) { reply(p.phrases.error(`Reddit fetch failed — ${e.message}`)); }
    }
  },

  {
    command: 'mediumarticle',
    aliases: ['medium', 'mdl'],
    category: 'soultools',
    description: 'Get a Medium article summary. Usage: mediumarticle <medium url>',
    execute: async ({ args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('medium')) return reply(p.phrases.wrongUsage('provide the medium article url. example! .mediumarticle https://medium.com/@user/article'));
      try {
        const { data } = await axios.get(url, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CrittixBot/1.0)', Accept: 'text/html' }
        });
        const cheerio = require('cheerio');
        const $ = cheerio.load(data);
        const title = $('h1').first().text().trim() || $('title').text().trim();
        const desc = $('meta[name="description"]').attr('content') || $('p').first().text().trim();
        const author = $('[rel="author"]').first().text().trim() || 'Unknown';
        reply(
          `📰 *MEDIUM ARTICLE*\n\n` +
          `📌 *${title.substring(0, 100)}*\n` +
          `✍️ By: ${author}\n\n` +
          `📝 Summary:\n${desc?.substring(0, 400) || 'No summary available.'}\n\n` +
          `🔗 ${url}\n\n` +
          `⚠️ _Summary only — full article at the link above_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(p.phrases.error(`Medium fetch failed — ${e.message}`)); }
    }
  },

  {
    command: 'newsfeed',
    aliases: ['news', 'headlines'],
    category: 'soultools',
    description: 'Get latest top news headlines. Usage: newsfeed | newsfeed tech | newsfeed sports',
    execute: async ({ args, reply }) => {
      const category = args[0]?.toLowerCase() || 'general';
      try {
        const { data } = await axios.get(`https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=8&apikey=free`, { timeout: 15000 });
        if (data?.articles?.length) {
          const headlines = data.articles.map((a, i) => `${i + 1}. *${a.title}*\n   _${a.source?.name || 'Unknown'}_`).join('\n\n');
          return reply(`📰 *TOP HEADLINES (${category.toUpperCase()})*\n\n${headlines}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
        // Fallback: BBC RSS
        const { data: rssData } = await axios.get('https://feeds.bbci.co.uk/news/rss.xml', { timeout: 15000 });
        const cheerio = require('cheerio');
        const $ = cheerio.load(rssData, { xmlMode: true });
        const items = [];
        $('item').slice(0, 8).each((i, el) => { items.push(`${i+1}. *${$(el).find('title').text()}*\n   _BBC News_`); });
        reply(`📰 *TOP HEADLINES*\n\n${items.join('\n\n')}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`news feed failed — ${e.message}`)); }
    }
  }

];
