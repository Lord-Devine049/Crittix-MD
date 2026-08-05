/*
 * HOSTCHECK.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');

module.exports = {
  command: ['hostcheck', 'host'],
  category: 'soultools',
  description: 'Get detailed hosting info for a domain',
  execute: async ({ sock, msg, args, chatId, reply }) => {
    const domain = args[0]?.replace(/https?:\/\//, '').trim();
    if (!domain) return reply('usage: .host <domain>\nexample: .host google.com');

    try {
      const { data } = await axios.get(
        `https://prexzyapis.com/tools/hostcheck?domain=${encodeURIComponent(domain)}`,
        { timeout: 15000 }
      );

      if (!data?.status) return reply('❌ failed to check domain');

      const ipv6 = data.ipv6_support || {};
      const ws   = data.web_servers  || {};

      await sock.sendMessage(chatId, {
        text:
          `🖥️ *Host Check*\n\n` +
          `🌐 Domain: *${data.domain}*\n` +
          `🔢 IPv6 Web: ${ipv6.web ? '✅' : '❌'}\n` +
          `🔢 IPv6 NS: ${ipv6.nameserver ? '✅' : '❌'}\n` +
          `📡 Web Servers: ${ws.total_ips || 'N/A'}\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });

    } catch (e) {
      reply('❌ host check failed — ' + e.message);
    }
  }
};
