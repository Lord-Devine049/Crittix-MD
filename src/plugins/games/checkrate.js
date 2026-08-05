const CHECKS = [
  'stupidcheck','hotcheck','smartcheck','greatcheck','evilcheck',
  'dogcheck','coolcheck','gaycheck','waifucheck','uncleancheck',
  'nerdcheck','simpcheck','crackheadcheck','goatcheck','villacheck'
];

const LABELS = {
  stupidcheck:    { emoji: '🤪', label: 'Stupidity' },
  hotcheck:       { emoji: '🔥', label: 'Hotness' },
  smartcheck:     { emoji: '🧠', label: 'Smartness' },
  greatcheck:     { emoji: '💪', label: 'Greatness' },
  evilcheck:      { emoji: '😈', label: 'Evilness' },
  dogcheck:       { emoji: '🐶', label: 'Dog Energy' },
  coolcheck:      { emoji: '😎', label: 'Coolness' },
  gaycheck:       { emoji: '🌈', label: 'Gay Percentage' },
  waifucheck:     { emoji: '💝', label: 'Waifu Rating' },
  uncleancheck:   { emoji: '🗑️', label: 'Unclean Level' },
  nerdcheck:      { emoji: '🤓', label: 'Nerd Level' },
  simpcheck:      { emoji: '🥺', label: 'Simp Level' },
  crackheadcheck: { emoji: '💀', label: 'Crackhead Energy' },
  goatcheck:      { emoji: '🐐', label: 'GOAT Rating' },
  villacheck:     { emoji: '🦹', label: 'Villain Score' }
};

function buildBar(pct) {
  const filled = Math.round(pct / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

module.exports = {
  command: CHECKS,
  aliases: [],
  category: 'arena',
  description: 'Check your percentage for silly personality traits. E.g. hotcheck, smartcheck',
  execute: async ({ msg, sender, reply, command }) => {
    const target =
      msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      sender;

    const num = target.split('@')[0];
    const seed = parseInt(num.slice(-4)) + command.length;
    const pct = (seed % 100) + 1;

    const { emoji, label } = LABELS[command] || { emoji: '📊', label: command };
    const bar = buildBar(pct);

    let grade = '⭐';
    if (pct >= 90) grade = '🏆 S';
    else if (pct >= 70) grade = '🥇 A';
    else if (pct >= 50) grade = '🥈 B';
    else if (pct >= 30) grade = '🥉 C';
    else grade = '💩 F';

    reply(
      `${emoji} *${label} Check*\n\n` +
      `👤 +${num}\n` +
      `📊 ${bar} *${pct}%*\n` +
      `🏅 Grade: ${grade}\n\n` +
      `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
    );
  }
};
