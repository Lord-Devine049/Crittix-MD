/*
 * DOWNLOADER-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: facebookreel, fbstory, twittervid2, mp3convert, m3u8dl,
 *           torrentsearch, megadl, gofiledl, drivedl2, dropboxdl, vimeodl, bilibilidl
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


module.exports = [

  {
    command: 'facebookreel',
    aliases: ['fbreel', 'fbreeldl'],
    category: 'darkweb',
    description: 'Download a Facebook Reel. Usage: facebookreel <url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('facebook') && !url.includes('fb.watch')) return reply(p.phrases.wrongUsage('provide the facebook reel url. example! .facebookreel https://fb.watch/xxx'));
      await reply('⬇️ downloading reel...');
      try {
        const { data } = await axios.get(`https://api.nexoracle.com/downloader/facebook?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 25000 });
        const dlUrl = data?.result?.hd || data?.result?.sd || data?.result?.video;
        if (dlUrl) {
          await sock.sendMessage(chatId, { video: { url: dlUrl }, caption: `📱 *Facebook Reel*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        } else { reply(p.phrases.error('could not get download link — try a direct reel URL')); }
      } catch (e) { reply(p.phrases.error(`Facebook Reel DL failed — ${e.message}`)); }
    }
  },

  {
    command: 'fbstory',
    aliases: ['facebookstoredl', 'fbs'],
    category: 'darkweb',
    description: 'Download a public Facebook Story. Usage: fbstory <url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('facebook') && !url.includes('fb.')) return reply(p.phrases.wrongUsage('provide the public facebook story url. example! .fbstory https://facebook.com/stories/xxx'));
      await reply('⬇️ downloading story...');
      try {
        const { data } = await axios.get(`https://api.nexoracle.com/downloader/facebook?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 25000 });
        const dlUrl = data?.result?.video || data?.result?.image;
        if (dlUrl) {
          const isVideo = data?.result?.video;
          await sock.sendMessage(chatId, isVideo ? { video: { url: dlUrl }, caption: '📱 *Facebook Story*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_' } : { image: { url: dlUrl }, caption: '📱 *Facebook Story*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_' }, { quoted: msg });
        } else { reply(p.phrases.error('no media found — stories must be public')); }
      } catch (e) { reply(p.phrases.error(`Facebook Story DL failed — ${e.message}`)); }
    }
  },


  {
    command: 'mp3convert',
    aliases: ['video2mp3'],
    category: 'darkweb',
    description: 'Convert an uploaded video to MP3. Reply to a video: mp3convert',
    execute: async ({ sock, msg, chatId, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const videoMsg = quoted?.videoMessage || msg.message?.videoMessage;
      if (!videoMsg) return reply(p.phrases.error('reply to a video to convert it to MP3'));
      await reply('🎵 converting to MP3...');
      try {
        const buffer = await sock.downloadMediaMessage(msg);
        const ffmpeg = require('fluent-ffmpeg');
        const tmpIn = path.join(process.cwd(), 'tmp', `vin_${Date.now()}.mp4`);
        const tmpOut = path.join(process.cwd(), 'tmp', `vout_${Date.now()}.mp3`);
        fs.ensureDirSync(path.dirname(tmpIn));
        fs.writeFileSync(tmpIn, buffer);
        await new Promise((resolve, reject) => {
          ffmpeg(tmpIn).noVideo().audioCodec('libmp3lame').audioBitrate(128).save(tmpOut).on('end', resolve).on('error', reject);
        });
        const mp3Buffer = fs.readFileSync(tmpOut);
        await sock.sendMessage(chatId, { audio: mp3Buffer, mimetype: 'audio/mp3' }, { quoted: msg });
        fs.removeSync(tmpIn);
        fs.removeSync(tmpOut);
      } catch (e) { reply(p.phrases.error(`MP3 conversion failed — ${e.message}`)); }
    }
  },

  {
    command: 'm3u8dl',
    aliases: ['m3u8', 'streamdl'],
    category: 'darkweb',
    description: 'Download from an M3U8 stream URL. Usage: m3u8dl <m3u8 url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('.m3u8')) return reply(p.phrases.wrongUsage('provide the m3u8 stream url. example! .m3u8dl https://stream.example.com/index.m3u8'));
      await reply('📡 processing stream — this might take a minute...');
      try {
        const ffmpeg = require('fluent-ffmpeg');
        const tmpOut = path.join(process.cwd(), 'tmp', `stream_${Date.now()}.mp4`);
        fs.ensureDirSync(path.dirname(tmpOut));
        await new Promise((resolve, reject) => {
          ffmpeg(url).inputOptions(['-protocol_whitelist', 'file,http,https,tcp,tls,crypto']).videoCodec('copy').audioCodec('copy').duration(60).save(tmpOut).on('end', resolve).on('error', reject);
        });
        const size = fs.statSync(tmpOut).size;
        if (size > 50 * 1024 * 1024) { fs.removeSync(tmpOut); return reply(p.phrases.error('output too large to send (>50MB)')); }
        const buf = fs.readFileSync(tmpOut);
        await sock.sendMessage(chatId, { video: buf, caption: `📡 *M3U8 Stream Download*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        fs.removeSync(tmpOut);
      } catch (e) { reply(p.phrases.error(`M3U8 download failed — ${e.message}`)); }
    }
  },

  {
    command: 'torrentsearch',
    aliases: ['torrent', 'torrentfind'],
    category: 'darkweb',
    description: 'Search public torrent indexes for a title (listing only, no downloading). Usage: torrentsearch ubuntu 22.04',
    execute: async ({ text, args, reply }) => {
      const query = text || args.join(' ');
      if (!query) return reply(p.phrases.wrongUsage('type what you want to search for. example! .torrentsearch ubuntu 22.04'));
      await reply('🔍 searching torrent indexes...');
      try {
        const { data } = await axios.get(`https://apibay.org/q.php?q=${encodeURIComponent(query)}&cat=0`, { timeout: 15000 });
        if (!data?.length || data[0]?.name === 'No results returned') return reply(p.phrases.error(`no torrents found for "${query}"`));
        const results = data.slice(0, 5);
        let txt = `🌊 *TORRENT SEARCH: ${query}*\n\n`;
        results.forEach((t, i) => {
          const size = (parseInt(t.size) / 1024 / 1024 / 1024).toFixed(2);
          txt += `${i + 1}. *${t.name.substring(0, 50)}*\n   📦 ${size}GB | 🌱 ${t.seeders}S ${t.leechers}L\n   🔗 magnet:?xt=urn:btih:${t.info_hash}\n\n`;
        });
        txt += `⚠️ _Listing only. Download responsibly and respect copyright laws._\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;
        reply(txt);
      } catch (e) { reply(p.phrases.error(`torrent search failed — ${e.message}`)); }
    }
  },

  {
    command: 'megadl',
    aliases: ['mega', 'megadownload'],
    category: 'darkweb',
    description: 'Get info/link for a public Mega.nz file. Usage: megadl <mega link>',
    execute: async ({ args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('mega.nz')) return reply(p.phrases.wrongUsage('provide the mega.nz link. example! .megadl https://mega.nz/file/xxx'));
      reply(
        `💾 *MEGA DOWNLOAD*\n\n🔗 Link: ${url}\n\n⚠️ _Mega.nz requires authentication for large files. Direct browser download:_\n\n1. Open the link in browser\n2. Click "Download" \n3. Use MEGAsync app for large files\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'gofiledl',
    aliases: ['gofile', 'gfdl'],
    category: 'darkweb',
    description: 'Download from a Gofile.io link. Usage: gofiledl <gofile url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('gofile')) return reply(p.phrases.wrongUsage('provide the gofile.io link. example! .gofiledl https://gofile.io/d/xxx'));
      await reply('⬇️ fetching Gofile link...');
      try {
        // Extract file ID
        const fileId = url.split('/').pop();
        const { data: tokenData } = await axios.get('https://api.gofile.io/accounts', { timeout: 10000 });
        const token = tokenData?.data?.token;
        const { data } = await axios.get(`https://api.gofile.io/contents/${fileId}?wt=4fd6sg89d7s6&cache=300`, {
          headers: { 'Authorization': `Bearer ${token || 'free'}` },
          timeout: 15000
        });
        const files = data?.data?.children;
        if (!files) return reply(p.phrases.error('could not access Gofile link — may be password protected or expired'));
        const fileList = Object.values(files).slice(0, 5).map((f, i) => `${i+1}. ${f.name} (${((f.size||0)/1024/1024).toFixed(2)}MB)\n   🔗 ${f.link || f.downloadPage}`).join('\n\n');
        reply(`📦 *GOFILE CONTENTS*\n\n${fileList}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`Gofile fetch failed — ${e.message}`)); }
    }
  },


  {
    command: 'dropboxdl',
    aliases: ['dropbox', 'dbdl'],
    category: 'darkweb',
    description: 'Download from a Dropbox share link. Usage: dropboxdl <dropbox url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('dropbox')) return reply(p.phrases.wrongUsage('provide the dropbox share link. example! .dropboxdl https://dropbox.com/s/xxx'));
      await reply('⬇️ fetching Dropbox file...');
      try {
        const dlUrl = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '?dl=1').replace('dl=0', 'dl=1');
        const { headers } = await axios.head(dlUrl, { timeout: 10000 });
        const size = parseInt(headers['content-length'] || 0);
        const type = headers['content-type'] || '';
        if (size > 50 * 1024 * 1024) return reply(p.phrases.error(`file too large (${(size/1024/1024).toFixed(1)}MB) to send through WhatsApp`));
        if (type.startsWith('image/')) {
          await sock.sendMessage(chatId, { image: { url: dlUrl }, caption: `📦 *Dropbox Download*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        } else if (type.startsWith('video/')) {
          await sock.sendMessage(chatId, { video: { url: dlUrl }, caption: `📦 *Dropbox Download*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        } else {
          await sock.sendMessage(chatId, { document: { url: dlUrl }, mimetype: type || 'application/octet-stream', fileName: dlUrl.split('/').pop().split('?')[0] || 'dropbox_file', caption: `📦 *Dropbox Download*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        }
      } catch (e) { reply(p.phrases.error(`Dropbox DL failed — ${e.message}`)); }
    }
  },

  {
    command: 'vimeodl',
    aliases: ['vimeo', 'vimeovideo'],
    category: 'darkweb',
    description: 'Download a public Vimeo video. Usage: vimeodl <vimeo url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('vimeo')) return reply(p.phrases.wrongUsage('provide the vimeo video url. example! .vimeodl https://vimeo.com/123456789'));
      await reply('⬇️ fetching Vimeo video...');
      try {
        const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
        if (!videoId) return reply(p.phrases.error('could not extract Vimeo video ID'));
        const { data } = await axios.get(`https://api.vimeo.com/videos/${videoId}`, {
          headers: { Authorization: `bearer ${process.env.VIMEO_TOKEN || ''}` },
          timeout: 15000
        });
        const title = data?.name || 'Vimeo Video';
        const dlLink = data?.download?.[0]?.link;
        if (dlLink) {
          await sock.sendMessage(chatId, { video: { url: dlLink }, caption: `🎬 *${title}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        } else {
          reply(`🎬 *${title}*\n\n⚠️ _Vimeo requires a Bearer token for direct download. Set VIMEO_TOKEN in .env._\n\nAlternative: use a browser video downloader extension on this URL.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
      } catch (e) { reply(p.phrases.error(`Vimeo DL failed — ${e.message}`)); }
    }
  },

  {
    command: 'bilibilidl',
    aliases: ['bilibili', 'bbdl'],
    category: 'darkweb',
    description: 'Download a public Bilibili video. Usage: bilibilidl <bilibili url>',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('bilibili')) return reply(p.phrases.wrongUsage('provide the bilibili video url. example! .bilibilidl https://bilibili.com/video/xxx'));
      await reply('⬇️ fetching Bilibili video...');
      try {
        const { data } = await axios.get(`https://api.nexoracle.com/downloader/bilibili?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 30000 });
        const dlUrl = data?.result?.video || data?.result?.url || data?.result?.download;
        if (dlUrl) {
          await sock.sendMessage(chatId, { video: { url: dlUrl }, caption: `📺 *Bilibili Download*\n\n${data?.result?.title || ''}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        } else { reply(p.phrases.error('Bilibili download link not available — try a direct video URL')); }
      } catch (e) { reply(p.phrases.error(`Bilibili DL failed — ${e.message}`)); }
    }
  }

];
