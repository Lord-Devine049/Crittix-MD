/*
 * SETBOTPIC.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');

module.exports = {
  command: 'setbotpic',
  category: 'voidsystem',
  description: 'Set bot menu picture',
  ownerOnly: true,
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const { set } = require('../../lib/config');
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const path = require('path');
    const fs = require('fs');
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imgUrl = args[0];
    if (!quoted?.imageMessage && !imgUrl) return reply(h.demonError('.setbotpic', 'Reply to image or .setbotpic <url>'));
    if (imgUrl) { set({ BOT_PIC: imgUrl, BOT_PIC_TYPE: 'image' }); return reply('✓ Bot pic set from URL'); }
    try {
      const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
      let buf = Buffer.from([]);
      for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
      const picPath = path.join(process.cwd(), 'database', 'bot-pic.jpg');
      fs.writeFileSync(picPath, buf);
      set({ BOT_PIC: picPath, BOT_PIC_TYPE: 'image' });
      reply('✓ Bot pic saved! Use .menu to preview');
    } catch(e) { reply(h.demonFail('Failed: ' + e.message)); }
  }
};
