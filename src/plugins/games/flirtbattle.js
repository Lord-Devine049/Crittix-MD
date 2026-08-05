const PAPTT_TYPES = [
  { label: 'Kind soul', desc: 'You have a heart of gold and lift others up 💛' },
  { label: 'Mischievous', desc: 'You are sneaky in the best way — always plotting something fun 😏' },
  { label: 'Dreamer', desc: 'Your head is in the clouds... but that\'s a superpower 🌙' },
  { label: 'Fighter', desc: 'You never give up — you were built different 🔥' },
  { label: 'Peacemaker', desc: 'You keep the group sane — unsung hero 🕊️' },
  { label: 'Comedian', desc: 'If laughter is medicine, you\'re the whole pharmacy 😂' },
  { label: 'Overthinker', desc: 'Your brain has no off switch — and that\'s lowkey your gift 💭' },
  { label: 'Protector', desc: 'You\'d fight anyone who messes with the people you love 🛡️' },
  { label: 'Wanderer', desc: 'Free spirit — you live on your own terms 🌍' },
  { label: 'Genius', desc: 'Your brain operates on a different frequency 🧠' }
];

module.exports = [
  {
    command: 'paptt',
    aliases: ['personalitytype', 'mytype', 'soultype'],
    category: 'arena',
    description: 'Discover your soul type or personality label for today',
    execute: async ({ sender, reply }) => {
      const num = parseInt(sender.split('@')[0].slice(-3));
      const today = new Date().getDate();
      const idx = (num + today) % PAPTT_TYPES.length;
      const type = PAPTT_TYPES[idx];

      reply(
        `🎴 *Soul Type*\n\n` +
        `✨ *${type.label}*\n\n` +
        `${type.desc}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }
];
