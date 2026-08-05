module.exports = {
  command: 'leave',
  aliases: ['left', 'kickbot'],
  category: 'abysscommands',
  description: 'Make the bot leave this group. Owner only.',
  groupOnly: true,
  ownerOnly: true,
  execute: async ({ sock, chatId, reply }) => {
    await reply('👋 *Goodbye, leaving this group...*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_');
    await new Promise(r => setTimeout(r, 1500));
    try {
      await sock.groupLeave(chatId);
    } catch (e) {
      // Already left or error — silently ignore
    }
  }
};
