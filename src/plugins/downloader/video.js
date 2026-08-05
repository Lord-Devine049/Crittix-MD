
const axios = require('axios');
const yts = require('yt-search');

module.exports = {
  command: 'video',
  category: 'darkweb',
  description: 'Download YouTube videos',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const text = args.join(' ');
    if (!text) return reply('usage: .video <video name or YouTube URL>');

    let videoUrl = '';
    let videoTitle = '';
    let videoThumbnail = '';

    try {
      if (text.startsWith('http://') || text.startsWith('https://')) {
        videoUrl = text;
      } else {
        const { videos } = await yts(text);
        if (!videos?.length) return reply('⚠️ no videos found for your search');
        videoUrl      = videos[0].url;
        videoTitle    = videos[0].title;
        videoThumbnail = videos[0].thumbnail;
      }

      const ytRegex = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/)?)([a-zA-Z0-9_-]{11})/gi;
      if (!ytRegex.test(videoUrl)) return reply('❌ invalid YouTube link');

      const apiRes = await axios.get(
        `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`,
        { headers: { 'Accept': 'application/json' }, timeout: 30000 }
      );

      if (apiRes.status !== 200 || !apiRes.data?.status) return reply('❌ API error — try again');

      const data      = apiRes.data;
      const title     = data.title || videoTitle || 'YouTube Video';
      const thumbnail = data.thumbnail || videoThumbnail;
      const videoDownloadUrl = data.videos?.['360'];
      const filename  = title.replace(/[^a-zA-Z0-9\-_\.]/g, '_') + '.mp4';

      if (!videoDownloadUrl) return reply('❌ 360p format not available');

      // Send thumbnail preview
      await sock.sendMessage(chatId, {
        image: { url: thumbnail },
        caption: `🎬 *${title}*\n\n⬇️ downloading video...\n🎥 quality: 360p`
      }, { quoted: msg });

      // Send video exactly as Hector's reference does
      await sock.sendMessage(chatId, {
        video: { url: videoDownloadUrl },
        mimetype: 'video/mp4',
        fileName: filename,
        caption: `╭─────── ⛧ VIDEO ⛧ ───────╮\n│ ➜ ${title}\n╰─────────────────────────────╯`
      }, { quoted: msg });

    } catch (e) {
      console.error('[VIDEO] Error:', e.message);
      reply('❌ download failed — ' + e.message);
    }
  }
};
