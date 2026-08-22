const axios = require('axios');
const crypto = require('crypto');
const exif = require('../../lib/exif');
const crittixStickers = require('../../lib/crittix-stickers');
const p = require('../../lib/phrases');


const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const BASE      = `https://api.telegram.org/bot${TG_BOT_TOKEN}`;
const FILE_BASE = `https://api.telegram.org/file/bot${TG_BOT_TOKEN}`;

const MAX_STICKERS = 20; // cap to avoid flooding

module.exports = {
  command: 'tgstickers',
  aliases: ['tgsticker', 'tgstickerpack'],
  category: 'shadowutilities',
  description: 'Download a Telegram sticker pack and send as WhatsApp stickers. Usage: .tgstickers https://t.me/addstickers/PackName',
  execute: async ({ sock, msg, text, chatId, reply }) => {
    if (!text) return reply(p.phrases.wrongUsage('provide the telegram sticker pack link. example! .tgstickers https://t.me/addstickers/animepack'));

    const link = text.trim();
    if (!link.includes('t.me/addstickers/')) {
      return reply('❌ *Invalid link* — must be a t.me/addstickers/ URL');
    }

    const packName = link.split('/addstickers/')[1].split(/[?#]/)[0].trim();

    try {
      await reply(`⏳ *Fetching sticker pack:* ${packName}...`);

      const { data } = await axios.get(`${BASE}/getStickerSet?name=${packName}`, { timeout: 10000 });
      if (!data.ok) return reply('❌ *Sticker pack not found or private*');

      const allStickers = data.result.stickers;

      // WhatsApp only supports static WebP stickers — filter out animated TGS & WEBM
      const staticStickers = allStickers.filter(s => !s.is_animated && !s.is_video);

      if (!staticStickers.length) {
        return reply(
          `❌ *No static stickers in this pack*\n\n_All ${allStickers.length} stickers are animated (TGS/WEBM) which WhatsApp doesn't support._\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }

      const toSend = staticStickers.slice(0, MAX_STICKERS);
      await reply(
        `✅ *Found ${staticStickers.length} static sticker(s)* (${allStickers.length - staticStickers.length} animated skipped)\n📦 Sending ${toSend.length} as a grouped WA pack...\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );

      // Stable pack ID so all stickers appear in the same WA tray group
      const packId  = crypto.createHash('md5').update(`tg:${packName}`).digest('hex');
      const waPack  = data.result.title || packName;
      const waAuthor = 'Crittix MD';

      let sent = 0;
      for (const s of toSend) {
        try {
          // Get file path from Telegram
          const fileRes = await axios.get(`${BASE}/getFile?file_id=${s.file_id}`, { timeout: 8000 });
          if (!fileRes.data.ok) continue;

          const filePath = fileRes.data.result.file_path;
          if (!filePath) continue;

          // Download the WebP buffer
          const dlRes = await axios.get(`${FILE_BASE}/${filePath}`, {
            responseType: 'arraybuffer',
            timeout: 20000
          });
          const webpBuf = Buffer.from(dlRes.data);

          // Stamp WA sticker pack metadata with consistent pack ID
          const stickerBuf = await exif.addExif(webpBuf, waPack, waAuthor, [''], {
            'sticker-pack-id': packId
          });

          await sock.sendMessage(chatId, { sticker: stickerBuf }, { quoted: msg });

          // Also save to bot collection
          crittixStickers.saveSticker(stickerBuf).catch(() => {});

          sent++;
          // Small delay to avoid WhatsApp rate limits
          await new Promise(r => setTimeout(r, 800));
        } catch (innerErr) {
          // Skip individual broken stickers, don't abort the whole pack
          console.error(`[tgstickers] failed sticker ${s.file_id}: ${innerErr.message}`);
        }
      }

      reply(
        `✅ *Done! Sent ${sent}/${toSend.length} stickers*\nAll grouped under pack *"${waPack}"* in your WA sticker tray 📦\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    } catch (e) {
      reply(`❌ *Failed* — ${e.message}`);
    }
  }
};
