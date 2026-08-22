
const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = [
  {
    command: 'mediafire',
    aliases: ['mfdl', 'mediafiredl'],
    category: 'soultools',
    description: 'Download from MediaFire link. Usage: mediafire [link]',
    execute: async ({ args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('mediafire.com')) return reply(p.phrases.wrongUsage('provide the full mediafire link. example! .mediafire https://mediafire.com/yourfile'));
      try {
        const r = await axios.get(`https://api.nexoracle.com/downloader/mediafire?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 15000 });
        const data = r.data?.result || r.data;
        if (data?.download) {
          reply(`📥 *MediaFire Download*\n\n📄 File: ${data.filename || 'Unknown'}\n📦 Size: ${data.size || 'Unknown'}\n\n🔗 ${data.download}`);
        } else {
          reply(`📥 *MediaFire Downloader*\n\nLink: ${url}\n\n_Direct download: ${url}_`);
        }
      } catch(e) { reply(`❌ *Download failed:* ${e.message}\n\nMake sure the link is a valid MediaFire URL.`); }
    }
  },
  {
    command: 'telegraph',
    aliases: ['telegrappost', 'ivpost'],
    category: 'soultools',
    description: 'Post text to Telegraph (Telegra.ph). Usage: telegraph Title | Content',
    execute: async ({ text, reply }) => {
      if (!text || !text.includes('|')) return reply(p.phrases.wrongUsage('format it correctly. example! .telegraph my title "my content here"'));
      const [title, ...contentParts] = text.split('|');
      const content = contentParts.join('|').trim();
      try {
        const createRes = await axios.post('https://api.telegra.ph/createAccount', {
          short_name: 'CrittixMD', author_name: 'Crittix-MD'
        }, { timeout: 10000 });
        const token = createRes.data.result.access_token;
        const pageRes = await axios.post('https://api.telegra.ph/createPage', {
          access_token: token,
          title: title.trim(),
          content: [{ tag: 'p', children: [content] }],
          return_content: false
        }, { timeout: 10000 });
        const url = pageRes.data.result.url;
        reply(`📝 *Posted to Telegraph!*\n\n📌 Title: ${title.trim()}\n🔗 Link: ${url}`);
      } catch(e) { reply(`❌ *Telegraph post failed:* ${e.message}`); }
    }
  },
  {
    command: 'imgurls',
    aliases: ['imageurl', 'fetchimage'],
    category: 'soultools',
    description: 'Fetch and send an image from URL. Usage: imgurls https://example.com/img.jpg',
    execute: async ({ args, sock, chatId, msg, reply }) => {
      const url = args[0];
      if (!url || !url.startsWith('http')) return reply(p.phrases.wrongUsage('provide the full image url. example! .imgurls https://example.com/image.jpg'));
      try {
        await sock.sendMessage(chatId, {
          image: { url },
          caption: `🖼️ *Image from URL*\n\n🔗 ${url}`
        }, { quoted: msg });
      } catch(e) { reply(`❌ *Failed to fetch image:* ${e.message}`); }
    }
  },
  {
    command: 'randomuser',
    aliases: ['fakeuser', 'fakeperson'],
    category: 'soultools',
    description: 'Generate a random fake user profile',
    execute: async ({ reply }) => {
      try {
        const r = await axios.get('https://randomuser.me/api/', { timeout: 8000 });
        const u = r.data.results[0];
        reply(
          `👤 *Random User Profile*\n\n` +
          `🪪 Name: *${u.name.first} ${u.name.last}*\n` +
          `⚧️ Gender: ${u.gender}\n` +
          `📅 DOB: ${new Date(u.dob.date).toDateString()} (${u.dob.age}y)\n` +
          `📧 Email: ${u.email}\n` +
          `📱 Phone: ${u.phone}\n` +
          `🌍 Country: ${u.location.country}\n` +
          `🏙️ City: ${u.location.city}\n` +
          `🔑 Username: ${u.login.username}`
        );
      } catch { reply('⚠️ *Random user API unavailable*'); }
    }
  },
  {
    command: 'soundcloudinfo',
    aliases: ['scinfo', 'soundcloudtrack'],
    category: 'soultools',
    description: 'Get SoundCloud track info. Usage: soundcloudinfo [url]',
    execute: async ({ args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('soundcloud.com')) return reply(p.phrases.wrongUsage('provide the full soundcloud link. example! .soundcloudinfo https://soundcloud.com/artist/track'));
      try {
        const r = await axios.get(`https://api.nexoracle.com/downloader/soundcloud?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 15000 });
        const d = r.data?.result || r.data;
        reply(
          `🎵 *SoundCloud Track*\n\n` +
          `🎤 Title: ${d.title || 'Unknown'}\n` +
          `👤 Artist: ${d.artist || 'Unknown'}\n` +
          `⏱️ Duration: ${d.duration || 'Unknown'}\n` +
          `🔗 URL: ${url}`
        );
      } catch { reply(`🎵 *SoundCloud info unavailable*\n\nURL: ${url}`); }
    }
  },
  {
    command: 'twitterdl',
    aliases: ['twdl2', 'twittervideo'],
    category: 'soultools',
    description: 'Download Twitter/X video. Usage: twitterdl [url]',
    execute: async ({ args, reply }) => {
      const url = args[0];
      if (!url || (!url.includes('twitter.com') && !url.includes('x.com')))
        return reply(p.phrases.wrongUsage('provide the full twitter video link. example! .twitterdl https://twitter.com/user/status/123'));
      try {
        const r = await axios.get(`https://api.nexoracle.com/downloader/twitter?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 20000 });
        const data = r.data?.result || r.data;
        if (data?.url) {
          reply(`🐦 *Twitter Video*\n\n🔗 Download: ${data.url}`);
        } else {
          reply(`🐦 *Twitter Downloader*\n\n_Could not extract video from:_\n${url}`);
        }
      } catch(e) { reply(`❌ *Twitter download failed:* ${e.message}`); }
    }
  },
  {
    command: 'capcut',
    aliases: ['capcutdl', 'capcutvideo'],
    category: 'soultools',
    description: 'Download CapCut template/video. Usage: capcut [url]',
    execute: async ({ args, reply }) => {
      const url = args[0];
      if (!url || !url.includes('capcut')) return reply(p.phrases.wrongUsage('provide the full capcut link. example! .capcut https://www.capcut.com/yourlink'));
      try {
        const r = await axios.get(`https://api.nexoracle.com/downloader/capcut?url=${encodeURIComponent(url)}&apikey=free@nexoracle`, { timeout: 15000 });
        const d = r.data?.result || r.data;
        if (d?.download) reply(`🎬 *CapCut Video*\n\n🔗 ${d.download}`);
        else reply(`🎬 *CapCut downloader unavailable*\n\nURL: ${url}`);
      } catch(e) { reply(`❌ *CapCut download failed:* ${e.message}`); }
    }
  },
  {
    command: 'gdrive',
    aliases: ['googledrive', 'gdrivedl'],
    category: 'soultools',
    description: 'Get direct download link for Google Drive file. Usage: gdrive [file-id or url]',
    execute: async ({ args, reply }) => {
      const input = args[0];
      if (!input) return reply(p.phrases.wrongUsage('provide the google drive link or just the file id. example! .gdrive https://drive.google.com/file/d/FILEID/view'));
      const idMatch = input.match(/\/d\/([a-zA-Z0-9_-]+)/) || input.match(/^([a-zA-Z0-9_-]{25,})$/);
      if (!idMatch) return reply('❌ *Invalid Google Drive URL or File ID*');
      const fileId = idMatch[1];
      const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const viewLink = `https://drive.google.com/file/d/${fileId}/view`;
      reply(`📁 *Google Drive File*\n\n🔑 File ID: \`${fileId}\`\n\n👁️ View: ${viewLink}\n📥 Direct Download: ${directLink}`);
    }
  },
  {
    command: 'paste',
    aliases: ['pastetext', 'createpaste'],
    category: 'soultools',
    description: 'Paste text online and get a shareable link. Usage: paste your text here',
    execute: async ({ text, reply }) => {
      if (!text) return reply(p.phrases.wrongUsage('type or paste your text after the command. example! .paste your code here'));
      try {
        const r = await axios.post('https://hastebin.com/documents', text, {
          headers: { 'Content-Type': 'text/plain' },
          timeout: 10000
        });
        reply(`📋 *Pasted!*\n\n🔗 https://hastebin.com/${r.data.key}`);
      } catch {
        try {
          const r2 = await axios.post('https://paste.rs/', text, {
            headers: { 'Content-Type': 'text/plain' },
            timeout: 10000
          });
          reply(`📋 *Pasted!*\n\n🔗 ${r2.data}`);
        } catch {
          reply('❌ *Paste service unavailable* — try https://pastebin.com manually');
        }
      }
    }
  },
];
