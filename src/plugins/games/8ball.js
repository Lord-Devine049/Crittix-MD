/*
 * 8BALL.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


module.exports = {
  command: '8ball',
  category: 'arena',
  description: 'Ask the magic 8 ball',
  execute: async ({ sock, msg, args, text, sender, senderNumber, chatId, isGroupMsg, groupMetadata, isOwner, isSudo, cfg, prefix, reply, font }) => {
    
    const answers = ['Yes definitely','It is certain','Without a doubt','Yes','Most likely','Signs point to yes','Reply hazy try again','Ask again later','Better not tell you now','Cannot predict now','Don\'t count on it','My reply is no','My sources say no','Outlook not so good','Very doubtful'];
    const q = args.join(' ');
    if (!q) return reply(p.phrases.wrongUsage('ask me a yes or no question. example! .8ball will i be rich'));
    reply('🎱 *' + answers[Math.floor(Math.random()*answers.length)] + '*');
  }
};
