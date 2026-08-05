/*
 * HEIST.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Group robbery — multiple people join, split the loot
 */
const fs       = require('fs-extra');
const path     = require('path');
const vault    = require('../../lib/vault');
const globalXP = require('../../lib/global-xp');
const h        = require('../../lib/helpers');

const HEIST_PATH = path.join(process.cwd(), 'database', 'heist.json');
const JOIN_TIME  = 60 * 1000; // 60 seconds to join
const MIN_LOOT   = 2000;
const MAX_LOOT   = 10000;
const FAIL_CHANCE = 30; // 30% chance heist fails

const load = () => { try { return fs.existsSync(HEIST_PATH) ? JSON.parse(fs.readFileSync(HEIST_PATH,'utf8')) : {}; } catch(_) { return {}; } };
const save = d => { try { fs.ensureDirSync(path.dirname(HEIST_PATH)); fs.writeFileSync(HEIST_PATH,JSON.stringify(d,null,2)); } catch(_) {} };

module.exports = {
  command: ['heist'],
  category: 'arena',
  description: 'Start a group heist — multiple people rob a vault together',
  groupOnly: true,
  execute: async ({ sock, msg, sender, senderNumber, chatId, reply }) => {
    const heists = load();
    const action = 'start'; // always start/join based on state

    if (heists[chatId]?.status === 'running')
      return reply(`😑 heist already in progress in this group`);

    // JOIN phase
    if (heists[chatId]?.status === 'open') {
      const heist = heists[chatId];
      if (heist.crew.find(c => c.jid === sender))
        return reply(`😑 you're already in the crew`);

      const bal = vault.getBalance(sender);
      if (!bal || bal.balance < heist.entry)
        return reply(`😑 need 🪙 ${heist.entry} entry fee to join`);

      vault.updateBalance(sender, -heist.entry, 0);
      heist.crew.push({ jid: sender, name: senderNumber, entry: heist.entry });
      save(heists);

      await sock.sendMessage(chatId, {
        text: `🦹 @${senderNumber} joined the heist! (${heist.crew.length} crew members)\n\nType *.heist* to join!`,
        mentions: [sender],
      }, { quoted: msg });
      return;
    }

    // START phase — initiate heist
    const entry = 200;
    const bal   = vault.getBalance(sender);
    if (!bal || bal.balance < entry)
      return reply(`😑 need 🪙 ${entry} entry fee to start a heist`);

    vault.updateBalance(sender, -entry, 0);
    heists[chatId] = {
      status: 'open',
      leader: sender,
      entry,
      crew:   [{ jid: sender, name: senderNumber, entry }],
      startedAt: Date.now(),
    };
    save(heists);

    await sock.sendMessage(chatId, {
      text:
        `╔════════════════════════么\n║ 🦹 *HEIST STARTING*\n╚════════════════════════么\n\n` +
        `👤 Leader: @${senderNumber}\n💸 Entry fee: 🪙 ${entry}\n⏰ 60 seconds to join!\n\n` +
        `Type *.heist* to join the crew!\n么════════════════════════么`,
      mentions: [sender],
    }, { quoted: msg });

    // Execute heist after 60s
    setTimeout(async () => {
      const h2    = load();
      const heist = h2[chatId];
      if (!heist || heist.status !== 'open') return;
      heist.status = 'running';
      save(h2);

      const failed   = Math.random() * 100 < FAIL_CHANCE;
      const crew     = heist.crew;
      const mentions = crew.map(c => c.jid);
      const pot      = crew.reduce((s,c) => s + c.entry, 0);

      if (failed || crew.length < 1) {
        delete h2[chatId]; save(h2);
        await sock.sendMessage(chatId, {
          text:
            `╔════════════════════════么\n║ 💀 *HEIST FAILED*\n╚════════════════════════么\n\n` +
            `🚨 Police ambushed the crew!\n💸 Entry fees lost: 🪙 ${pot.toLocaleString()}\n\n` +
            crew.map(c => `@${c.jid.split('@')[0]}`).join(' ') + ` — better luck next time`,
          mentions,
        });
        return;
      }

      const loot    = Math.floor(Math.random() * (MAX_LOOT - MIN_LOOT) + MIN_LOOT) + pot;
      const cut     = Math.floor(loot / crew.length);

      for (const c of crew) {
        vault.updateBalance(c.jid, cut, 0);
        globalXP.addXP(c.jid, c.name);
      }

      delete h2[chatId]; save(h2);

      await sock.sendMessage(chatId, {
        text:
          `╔════════════════════════么\n║ 🎉 *HEIST SUCCESS*\n╚════════════════════════么\n\n` +
          `💰 Total loot: 🪙 ${loot.toLocaleString()}\n👥 Crew: ${crew.length}\n💸 Each cut: 🪙 ${cut.toLocaleString()}\n\n` +
          crew.map(c => `✅ @${c.jid.split('@')[0]}`).join('\n') + `\n\n么════════════════════════么`,
        mentions,
      });
    }, JOIN_TIME);
  }
};
