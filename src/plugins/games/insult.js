const INSULTS = [
  'Your WiFi password is probably your pet\'s name.',
  'You are the human equivalent of a Monday morning.',
  'Your cooking could make a fire alarm cry tears of boredom.',
  'If brains were petrol, you couldn\'t power a toy car.',
  'You have the energy of a dying phone battery — always at 2%.',
  'You are the reason tutorials have a "for beginners" section.',
  'Your fashion sense called — it said it quit.',
  'You could trip over a wireless connection.',
  'Your search history is braver than you will ever be.',
  'You once got lost in a one-room apartment.',
  'You are the plot twist nobody asked for.',
  'Your password is probably "password123".',
  'You take 45 minutes to make instant noodles.',
  'You read "end of queue" and got in line.',
  'You charged your phone with a prayer once and it worked.'
];

module.exports = {
  command: 'insult',
  aliases: ['diss', 'draghim'],
  category: 'arena',
  description: 'Get a fun, light insult for someone. Mention to target them.',
  execute: async ({ msg, sender, reply }) => {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      msg.message?.extendedTextMessage?.contextInfo?.participant;

    const label = target ? `+${target.split('@')[0]}` : `+${sender.split('@')[0]}`;
    const insult = INSULTS[Math.floor(Math.random() * INSULTS.length)];

    reply(
      `😂 *Insult Drop*\n\n` +
      `🎯 *${label}*\n\n` +
      `_${insult}_\n\n` +
      `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`,
      target ? [target] : []
    );
  }
};
