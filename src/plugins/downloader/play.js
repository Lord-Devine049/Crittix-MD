const axios = require('axios');
const p = require('../../lib/phrases');


module.exports = {
  command: 'play',
  aliases: ['song', 'music'],
  category: 'darkweb',
  description: 'Search and download a song',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const query = args.join(' ');
    if (!query) return reply(p.phrases.wrongUsage('type the song name after the command. example! .play blinding lights weeknd'));

    await reply('🔍 ˢᵉᵃʀᶜʰⁱⁿᵍ: ' + query);

    try {
      const { data } = await axios.get('https://apis.davidcyril.name.ng/song', {
        params: { query },
        timeout: 20000
      });

      if (!data?.status || !data?.result?.audio?.download_url)
        return reply('❌ nothing found for: ' + query);

      const r = data.result;

      const caption =
        `╔═════════════════════么\n` +
        `║ 闇 *${r.title}*\n` +
        `║ 闇 ᴅᴜʀᴀᴛɪᴏɴ: ${r.duration}\n` +
        `║ 闇 ᴠɪᴇᴡs: ${Number(r.views).toLocaleString()}\n` +
        `║ 闇 ᴜᴘʟᴏᴀᴅᴇᴅ: ${r.published}\n` +
        `╚═════════════════════么\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`;

      await sock.sendMessage(chatId, {
        audio: { url: r.audio.download_url },
        mimetype: 'audio/mpeg',
        fileName: (r.title || 'audio') + '.mp3',
        caption
      }, { quoted: msg });

    } catch (e) {
      console.error('[PLAY] Error:', e.message);
      reply('❌ download failed — ' + e.message);
    }
  }
};
