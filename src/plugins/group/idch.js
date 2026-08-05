module.exports = {
  command: 'idch',
  aliases: ['channelid', 'getchannelid'],
  category: 'abysscommands',
  description: 'Get the channel JID from a forwarded newsletter/channel message',
  execute: async ({ msg, reply }) => {
    const ctx =
      msg.message?.extendedTextMessage?.contextInfo ||
      msg.message?.imageMessage?.contextInfo ||
      msg.message?.videoMessage?.contextInfo ||
      null;

    const newsletterJid =
      ctx?.forwardedNewsletterMessageInfo?.newsletterJid ||
      ctx?.remoteJid;

    if (!newsletterJid || !newsletterJid.includes('@newsletter')) {
      return reply(
        `📡 *Channel ID Fetcher*\n\n` +
        `Forward a message from a WhatsApp channel here,\nthen use this command while replying to it.\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }

    const name = ctx?.forwardedNewsletterMessageInfo?.newsletterName || 'Unknown';

    reply(
      `📡 *Channel Info*\n\n` +
      `📛 *Name:* ${name}\n` +
      `🆔 *JID:* ${newsletterJid}\n` +
      `🔢 *ID:* ${newsletterJid.split('@')[0]}\n\n` +
      `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
    );
  }
};
