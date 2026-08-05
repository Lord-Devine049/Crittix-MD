const axios = require('axios');
const h = require('../../lib/helpers');

const tempMailStore = {};

module.exports = {
  command: ['tempmail', 'checkmail', 'readmail', 'delmail'],
  aliases: ['tmpmail', 'inbox'],
  category: 'soultools',
  description: 'Generate and manage a temporary email',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, command }) => {
    const cmd = command?.toLowerCase() || 'tempmail';

    if (cmd === 'tempmail') {
      try {
        const domains = ['1secmail.com', '1secmail.net', '1secmail.org'];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        const login = Math.random().toString(36).substring(2, 12);
        const email = `${login}@${domain}`;

        tempMailStore[sender] = { email, login, domain };

        reply(
          `📧 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗧𝗲𝗺𝗽𝗠𝗮𝗶𝗹*\n\n` +
          `Email: \`${email}\`\n\n` +
          `Use *${prefix}checkmail* to check inbox\n` +
          `Use *${prefix}readmail <id>* to read a message\n` +
          `Use *${prefix}delmail* to delete`
        );
      } catch {
        reply(h.demonFail('Failed to create temp email. Try again.'));
      }

    } else if (cmd === 'checkmail' || cmd === 'inbox') {
      const userMail = tempMailStore[sender];
      if (!userMail) return reply(h.demonFail(`No email found. Use ${prefix}tempmail first`));

      try {
        const res = await axios.get(
          `https://www.1secmail.com/api/v1/?action=getMessages&login=${userMail.login}&domain=${userMail.domain}`,
          { timeout: 10000 }
        );

        if (!res.data || res.data.length === 0)
          return reply(`📭 *Inbox Empty*\n\n${userMail.email} has no messages yet.`);

        const msgs = res.data
          .map((m, i) =>
            `${i + 1}. 📧 *From:* ${m.from}\n   📝 ${m.subject}\n   🆔 ID: \`${m.id}\``
          )
          .join('\n\n');

        reply(`📬 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗜𝗻𝗯𝗼𝘅*\n\n${msgs}\n\n_Use ${prefix}readmail <id> to read_`);
      } catch {
        reply(h.demonFail('Failed to check inbox. Try again.'));
      }

    } else if (cmd === 'readmail') {
      const userMail = tempMailStore[sender];
      if (!userMail) return reply(h.demonFail(`No email found. Use ${prefix}tempmail first`));

      const messageId = args[0];
      if (!messageId) return reply(h.demonError('.readmail', '.readmail <message id>'));

      try {
        const res = await axios.get(
          `https://www.1secmail.com/api/v1/?action=readMessage&login=${userMail.login}&domain=${userMail.domain}&id=${messageId}`,
          { timeout: 10000 }
        );

        const message = res.data;
        if (!message?.id) return reply(h.demonFail(`Message ID ${messageId} not found`));

        const body = message.textBody
          ? message.textBody.substring(0, 800) + (message.textBody.length > 800 ? '...' : '')
          : '[No text content]';

        reply(
          `📧 *𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗮𝗶𝗹*\n\n` +
          `*From:* ${message.from}\n` +
          `*Subject:* ${message.subject}\n` +
          `*Date:* ${message.date}\n\n` +
          `${body}`
        );
      } catch {
        reply(h.demonFail('Failed to read message. Try again.'));
      }

    } else if (cmd === 'delmail') {
      if (!tempMailStore[sender])
        return reply(h.demonFail('No temp email to delete'));

      delete tempMailStore[sender];
      reply(h.demonSuccess('Temp email deleted successfully'));
    }
  }
};
