/* AUDIODL.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
module.exports = {
  command: 'audiodl',
  aliases: ['mp3dl'],
  category: 'soultools',
  description: 'Download audio from YouTube as MP3',
  execute: async ({ sock, msg, text, chatId, prefix, reply }) => {
    const query = text.replace(/^[^\s]+\s*/, '').trim();
    if (!query) return reply(`✘ ${h.toBoldItalic('Usage')}: ${prefix}audiodl <youtube url or search query>\n\n${h.toBoldItalic('Examples')}:\n${prefix}audiodl https://youtu.be/dQw4w9WgXcQ\n${prefix}audiodl Kendrick HUMBLE`);
    try {
      await reply(`⬇️ ${h.toBoldItalic('Downloading audio...')} ${h.demonEmoji()}`);
      const ytdl = require('ytdl-core');
      const yts = require('yt-search');
      let videoUrl = query;
      if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
        const searchResult = await yts(query);
        const video = searchResult.videos?.[0];
        if (!video) return reply(`✘ ${h.toBoldItalic('No results found')} ${h.demonEmoji()}`);
        videoUrl = video.url;
      }
      if (!ytdl.validateURL(videoUrl)) return reply(`✘ ${h.toBoldItalic('Invalid YouTube URL')} ${h.demonEmoji()}`);
      const info = await ytdl.getInfo(videoUrl);
      const title = info.videoDetails.title;
      const duration = info.videoDetails.lengthSeconds;
      const durationStr = `${Math.floor(duration/60)}:${String(duration%60).padStart(2,'0')}`;
      const author = info.videoDetails.author.name;
      if (parseInt(duration) > 600) return reply(`✘ ${h.toBoldItalic('Video too long (max 10 minutes)')} ${h.demonEmoji()}\n\n⏱️ ${h.toBoldItalic('Duration')}: ${durationStr}`);
      const audioStream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });
      const chunks = [];
      await new Promise((resolve, reject) => { audioStream.on('data', chunk => chunks.push(chunk)); audioStream.on('end', resolve); audioStream.on('error', reject); });
      const audioBuffer = Buffer.concat(chunks);
      await sock.sendMessage(chatId, { audio: audioBuffer, mimetype: 'audio/mp4', fileName: `${title.slice(0,50)}.mp3` }, { quoted: msg });
      await sock.sendMessage(chatId, { text: `✅ ${h.toBoldItalic('Downloaded!')} ${h.demonEmoji()}\n\n🎵 ${h.toBoldItalic(title)}\n🎤 ${h.toBoldItalic(author)}\n⏱️ ${durationStr}` }, { quoted: msg });
    } catch (err) {
      return reply(`✘ ${h.toBoldItalic('Download failed')} ${h.demonEmoji()}\n\n${err.message?.includes('age') ? 'Age-restricted video' : err.message?.includes('private') ? 'Private video' : 'Try a different video'}`);
    }
  }
};
