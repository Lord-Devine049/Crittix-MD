const ZODIAC = {
  aries:       { range: 'Mar 21 – Apr 19', emoji: '♈', element: 'Fire',  trait: 'Brave, confident, impulsive' },
  taurus:      { range: 'Apr 20 – May 20', emoji: '♉', element: 'Earth', trait: 'Reliable, patient, stubborn' },
  gemini:      { range: 'May 21 – Jun 20', emoji: '♊', element: 'Air',   trait: 'Curious, adaptable, indecisive' },
  cancer:      { range: 'Jun 21 – Jul 22', emoji: '♋', element: 'Water', trait: 'Intuitive, loyal, moody' },
  leo:         { range: 'Jul 23 – Aug 22', emoji: '♌', element: 'Fire',  trait: 'Creative, dramatic, generous' },
  virgo:       { range: 'Aug 23 – Sep 22', emoji: '♍', element: 'Earth', trait: 'Analytical, practical, critical' },
  libra:       { range: 'Sep 23 – Oct 22', emoji: '♎', element: 'Air',   trait: 'Diplomatic, fair, indecisive' },
  scorpio:     { range: 'Oct 23 – Nov 21', emoji: '♏', element: 'Water', trait: 'Passionate, intense, secretive' },
  sagittarius: { range: 'Nov 22 – Dec 21', emoji: '♐', element: 'Fire',  trait: 'Optimistic, restless, honest' },
  capricorn:   { range: 'Dec 22 – Jan 19', emoji: '♑', element: 'Earth', trait: 'Ambitious, disciplined, pessimistic' },
  aquarius:    { range: 'Jan 20 – Feb 18', emoji: '♒', element: 'Air',   trait: 'Progressive, eccentric, aloof' },
  pisces:      { range: 'Feb 19 – Mar 20', emoji: '♓', element: 'Water', trait: 'Imaginative, compassionate, escapist' }
};

const READINGS = [
  'Today brings clarity. Trust your gut.',
  'Energy is high — use it to tackle what you have been avoiding.',
  'A connection will surprise you with their loyalty.',
  'Step back and observe before committing.',
  'Your intuition is your strongest tool today.',
  'Financial decisions made today require careful thought.',
  'Creative flow is strong. Express yourself freely.',
  'Communicate openly — silence will not serve you now.',
  'Rest is productive too. Recharge without guilt.',
  'Something unexpected will turn into a blessing in disguise.'
];

module.exports = {
  command: 'zodiac',
  aliases: ['horoscope2', 'starsign', 'mysign'],
  category: 'arena',
  description: 'Get your zodiac info and daily reading. Usage: zodiac leo',
  execute: async ({ args, reply }) => {
    const sign = (args[0] || '').toLowerCase().trim();

    if (!sign || !ZODIAC[sign]) {
      const list = Object.entries(ZODIAC)
        .map(([k, v]) => `${v.emoji} ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v.range}`)
        .join('\n');
      return reply(`🔭 *Zodiac Signs*\n\n${list}\n\n_Usage:_ zodiac leo\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }

    const z = ZODIAC[sign];
    const reading = READINGS[new Date().getDate() % READINGS.length];

    reply(
      `${z.emoji} *${sign.charAt(0).toUpperCase() + sign.slice(1)}*\n\n` +
      `📅 Dates: ${z.range}\n` +
      `🌊 Element: ${z.element}\n` +
      `✨ Traits: ${z.trait}\n\n` +
      `🔮 *Today's Reading:*\n_${reading}_\n\n` +
      `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
    );
  }
};
