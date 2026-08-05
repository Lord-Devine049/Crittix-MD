/*
 * TEXTSTYLES.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['textstyles', 'styles'],
  category: 'soultools',
  description: 'Generate 35+ fancy text styles from your text',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const text = args.join(' ').trim();
    if (!text) return reply('usage: .styles <text>\nexample: .styles Crittix MD');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/tools/allstyles?text=${encodeURIComponent(text)}`,
        { timeout: 15000 }
      );

      if (!data?.status || !data?.styles?.length) return reply('❌ failed to generate styles');

      let txt = `✨ *Text Styles*\n📝 _${data.original_text}_\n🎨 ${data.total_styles} styles\n\n`;
      data.styles.forEach(s => {
        txt += `*${s.style_name}*\n${s.styled_text}\n\n`;
      });
      txt += '_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_';

      // long message — send as text (WhatsApp handles it)
      await sock.sendMessage(chatId, { text: txt.slice(0, 65000) }, { quoted: msg });

    } catch (e) {
      reply('❌ failed — ' + e.message);
    }
  }
};
