const TRUTHS = [
  'What is the most embarrassing thing you have ever done in public?',
  'Have you ever lied to get out of trouble? What was it?',
  'What is your biggest fear that nobody knows about?',
  'Who was your first crush and did they ever find out?',
  'What is the most childish thing you still do?',
  'What is something you have never told your parents?',
  'Have you ever cheated on a test?',
  'What is the worst gift you have ever received?',
  'Have you ever pretended to be sick to avoid something?',
  'What is something you are secretly really proud of?',
  'What habit do you have that you are embarrassed by?',
  'Have you ever eavesdropped on someone\'s conversation?',
  'What is the most ridiculous lie you ever believed?',
  'If you could be invisible for one day, what would you do?',
  'What is your most irrational fear?'
];

const DARES = [
  'Send a voice note singing for 10 seconds.',
  'Send the last photo in your gallery right now.',
  'Write a short love poem for the group.',
  'Send a funny face selfie — no filter allowed.',
  'Type a message with your elbows only.',
  'Do an impression of someone in the group.',
  'Say something nice about every person in the group.',
  'Let the group choose your profile picture for 24 hours.',
  'Send your most recent message to the last person you texted.',
  'Tell us your honest opinion of this group.',
  'Change your WhatsApp status to "I lost a dare" for 1 hour.',
  'Describe yourself in three words — be honest.',
  'Send the oldest photo in your gallery.',
  'Share your most used emoji in the past week.',
  'Roast yourself in 2 sentences.'
];

module.exports = {
  command: ['truthdare', 'truth', 'dare'],
  aliases: ['tod', 'truthordare', 'tod2', 'todgame'],
  category: 'arena',
  description: 'Truth or Dare — use: truthdare truth / truthdare dare',
  execute: async ({ args, reply, command }) => {
    const cmd    = (command || 'truthdare').toLowerCase();
    const forced = cmd === 'truth' ? 'truth' : cmd === 'dare' ? 'dare' : '';
    const choice = forced || (args[0] || '').toLowerCase();

    const isTruth = choice === 'truth' || choice === 't';
    const isDare  = choice === 'dare'  || choice === 'd';

    if (!isTruth && !isDare) {
      return reply(
        `🎭 *Truth or Dare*\n\n` +
        `Choose:\n` +
        `▸ .truth  — get a truth question\n` +
        `▸ .dare   — get a dare challenge\n` +
        `▸ .truthdare truth\n` +
        `▸ .truthdare dare\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }

    if (isTruth) {
      const q = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
      reply(`🔍 *TRUTH*\n\n_${q}_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    } else {
      const q = DARES[Math.floor(Math.random() * DARES.length)];
      reply(`🎯 *DARE*\n\n_${q}_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  }
};
