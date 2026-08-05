const db = require('../../lib/db');
const h  = require('../../lib/helpers');

module.exports = {
  command: 'antinsfw',
  category: 'darkprotection',
  description: 'Enable/disable NSFW content auto-detection in groups',
  groupOnly: true,

  execute: async ({ sock, msg, args, sender, chatId, isOwner, isSudo, reply }) => {
    const sub = (args[0] || '').toLowerCase();

    // ── No sub-command: show current status ──
    if (!sub) {
      const current = db.getAnti(chatId, 'antinsfw');
      return reply(
        `╔══════════════════════════════╗\n` +
        `║ 🔞 𝗔𝗡𝗧𝗜𝗡𝗦𝗙𝗪 𝗦𝗧𝗔𝗧𝗨𝗦\n` +
        `╚══════════════════════════════╝\n\n` +
        `Status: ${current ? `*ON* ✅` : '*OFF* ❌'}\n\n` +
        `➩ *.antinsfw on*  — enable detection\n` +
        `➩ *.antinsfw off* — disable detection\n\n` +
        `ᴡʜᴀᴛ ɪᴛ ᴄᴀᴛᴄʜᴇs:\n` +
        `• Porn/hentai images & stickers (AI)\n` +
        `• NSFW video thumbnails (AI)\n` +
        `• Known porn site links\n` +
        `• 3 strikes = auto-kick`
      );
    }

    if (!['on', 'off'].includes(sub)) {
      return reply(`ᴜsᴀɢᴇ: *.antinsfw on* ᴏʀ *.antinsfw off*, ʏᴏᴜ sᴛᴜᴘɪᴅ ғᴏᴏʟ.`);
    }

    // ── Only group admins can toggle; connected user must also be admin ──
    if (!await h.isSenderAdmin(sock, chatId, sender))
      return reply(`ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴛᴏɢɢʟᴇ ᴀɴᴛɪɴsғᴡ, ʏᴏᴜ sᴛᴜᴘɪᴅ ɴᴏɴ-ᴀᴅᴍɪɴ ᴛʀʏɪɴɢ ᴛᴏ ᴜsᴇ ᴀᴅᴍɪɴ ᴄᴏᴍᴍᴀɴᴅs.`);
    if (!await h.isBotAdmin(sock, chatId))
      return reply(h.demonFail('Make my Lord Admin'));

    if (sub === 'on') {
      db.setAnti(chatId, 'antinsfw', 'warn');
      return reply(
        `╔══════════════════════════════╗\n` +
        `║ 🔞 𝗔𝗡𝗧𝗜𝗡𝗦𝗙𝗪 𝗘𝗡𝗔𝗕𝗟𝗘𝗗 ✅\n` +
        `╚══════════════════════════════╝\n\n` +
        `ɴsғᴡ ᴅᴇᴛᴇᴄᴛɪᴏɴ ɪs ɴᴏᴡ *ON*\n\n` +
        `➩ Porn/hentai images, stickers & videos → deleted\n` +
        `➩ Known NSFW site links → deleted\n` +
        `➩ 3 warnings = permanent kick\n` +
        `➩ Admins are exempt`
      );
    }

    if (sub === 'off') {
      db.setAnti(chatId, 'antinsfw', false);
      return reply(
        `╔══════════════════════════════╗\n` +
        `║ 🔞 𝗔𝗡𝗧𝗜𝗡𝗦𝗙𝗪 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗 ❌\n` +
        `╚══════════════════════════════╝\n\n` +
        `ɴsғᴡ ᴅᴇᴛᴇᴄᴛɪᴏɴ ɪs ɴᴏᴡ *OFF*`
      );
    }
  }
};
