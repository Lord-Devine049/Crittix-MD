module.exports = {
  command: 'whois',
  aliases: [ 'userinfo'],
  category: 'abysscommands',
  description: 'View a user\'s WhatsApp profile. Mention or reply to them.',
  execute: async ({ sock, msg, sender, chatId, reply }) => {

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const user = mentioned || quoted;

    if (!user) {
      return reply('❌ Mention or reply to someone to view their profile.');
    }

    let pp = 'https://files.catbox.moe/1ntiwc.jpg';
    try {
      pp = await sock.profilePictureUrl(user, 'image');
    } catch {}

    let status = 'No bio';
    try {
      const s = await sock.fetchStatus(user);
      if (s?.status) status = s.status;
    } catch {}

    let name = msg.message?.extendedTextMessage?.contextInfo?.pushName
      || user.split('@')[0];

    await sock.sendMessage(chatId, {
      image: { url: pp },
      caption:
        `👤 *User Profile*\n\n` +
        `📛 *Name:* ${name}\n` +
        `📱 *Number:* +${user.split('@')[0]}\n` +
        `📝 *Bio:* ${status}\n` +
        `🆔 *JID:* ${user}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
    }, { quoted: msg });
  }
};