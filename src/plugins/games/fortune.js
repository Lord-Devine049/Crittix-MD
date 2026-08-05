const FORTUNES = [
  '🌟 A great opportunity is approaching. Stay alert and ready.',
  '💡 Your creativity will solve a problem others gave up on.',
  '🤝 An unexpected alliance will bring you unexpected success.',
  '⚠️ Patience is your power today — resist the urge to rush.',
  '🔮 The stars align in your favour this week. Push forward.',
  '💸 Financial improvement is on the horizon. Stay disciplined.',
  '❤️ Love is near — open your heart to the possibility.',
  '🧘 Inner peace will unlock the answer you have been seeking.',
  '🏆 Your hard work is being noticed. Recognition is coming.',
  '🌈 After every storm comes calm — brighter days ahead.',
  '🎯 Focus on one goal today. Scatter energy and lose the prize.',
  '🦁 Be bold. The timid version of you never wins.',
  '📚 Knowledge you gained in the past will save you soon.',
  '🌙 Trust your instincts — they are sharper than you think.',
  '🔥 Your energy is infectious. Use it to inspire others today.',
  '🎭 Not everything is as it appears. Look deeper before deciding.',
  '💎 Your value is greater than what others have told you.',
  '🌱 Small consistent actions today will yield massive results.',
  '🗺️ An unexpected journey will change your perspective forever.',
  '⚡ A sudden idea will strike — write it down immediately.'
];

module.exports = {
  command: 'fortune',
  aliases: ['dailyfortune', 'myfortune'],
  category: 'arena',
  description: 'Get your daily fortune reading',
  execute: async ({ sender, reply }) => {
    const num = parseInt(sender.split('@')[0].slice(-4));
    const day = new Date().getDate() + new Date().getMonth();
    const idx = (num + day) % FORTUNES.length;

    reply(
      `🔮 *Daily Fortune*\n\n` +
      `${FORTUNES[idx]}\n\n` +
      `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
    );
  }
};
