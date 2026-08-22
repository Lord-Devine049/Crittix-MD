const p = require('../../lib/phrases');


const ANIMALS = {
  cow: [
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||'
  ],
  cat: [
    '       \\',
    '        \\ /\\_____/\\',
    '          /o o  \\',
    '         |  ><   |',
    '          \\ === /',
    '      /|    |_|    |\\',
    '     / |    | |    | \\'
  ],
  ghost: [
    '         \\',
    '          \\  .-.',
    '             | |',
    '             | |',
    '             | |',
    '         .---\' \'---.',
    '        /   0   0   \\',
    '        |     ^     |',
    '         \\.  (-)  ./',
    '           \'-----\''
  ]
};

function bubble(text) {
  const lines = text.match(/.{1,40}/g) || [text];
  const maxLen = Math.max(...lines.map(l => l.length));
  const top = ` ${'_'.repeat(maxLen + 2)}`;
  const bottom = ` ${'-'.repeat(maxLen + 2)}`;
  const body = lines.map((l, i) => {
    const left = lines.length === 1 ? '<' : i === 0 ? '/' : i === lines.length - 1 ? '\\' : '|';
    const right = lines.length === 1 ? '>' : i === 0 ? '\\' : i === lines.length - 1 ? '/' : '|';
    return `${left} ${l.padEnd(maxLen)} ${right}`;
  });
  return [top, ...body, bottom].join('\n');
}

module.exports = {
  command: 'cowsay',
  aliases: ['catsay', 'ghostsay', 'ascii-art'],
  category: 'soultools',
  description: 'Generate ASCII art speech bubble. Usage: cowsay your text | cowsay cat hello',
  execute: async ({ args, text, reply, command }) => {
    let animal = 'cow';
    let msg = text;

    if (command === 'catsay') animal = 'cat';
    else if (command === 'ghostsay') animal = 'ghost';
    else if (args[0] && ANIMALS[args[0].toLowerCase()]) {
      animal = args[0].toLowerCase();
      msg = args.slice(1).join(' ');
    }

    if (!msg) return reply(p.phrases.wrongUsage('type your message after the command. example! .cowsay moo. optional animals! cow cat ghost.'));

    const art = `\`\`\`\n${bubble(msg)}\n${(ANIMALS[animal] || ANIMALS.cow).join('\n')}\n\`\`\``;
    reply(`${art}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
  }
};
