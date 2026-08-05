/* LEVEL.JS - Crittix-MD / Created by: LORD DEVINE */
const h = require('../../lib/helpers');
const vault = require('../../lib/vault');
const observer = require('../../lib/observer');
module.exports = {
  command: ['level', 'lvl', 'xp'],
  aliases: ['lvl', 'xp'],
  category: 'groupanalytics',
  description: 'Show your XP level and progress',
  execute: async ({ msg, sender, senderNumber, reply }) => {
    try {
      const name = msg.pushName || senderNumber;
      const vaultData = vault.getBalance(sender);
      const levelInfo = observer.getLevel(sender);
      const level = levelInfo.level || 0;
      const msgs = levelInfo.messages || 0;
      const progress = levelInfo.progress || 0;
      const progressBar = levelInfo.progressBar || '░░░░░░░░░░';
      const nextLevel = levelInfo.nextLevel || 50;
      const levelTitles = [[25000,'☠️ CRITTIX LEGEND'],[8000,'👿 DEMON LORD'],[3000,'😈 SHADOW PRINCE'],[1200,'💀 DARK KNIGHT'],[500,'🔥 FLAME WARRIOR'],[150,'⚔️ WARRIOR'],[50,'🗡️ FIGHTER'],[0,'🌑 NEWCOMER']];
      const [,currentTitle] = levelTitles.find(([t]) => msgs >= t) || [0,'🌑 NEWCOMER'];
      const [nextThreshold, nextTitle] = levelTitles.slice().reverse().find(([t]) => msgs < t) || [null, null];
      let txt = `╔═══════════════════════════════╗\n║ ⭐ 𝐋𝐄𝐕𝐄𝐋 𝐒𝐓𝐀𝐓𝐒\n╚═══════════════════════════════╝\n\n`;
      txt += `👤 ${h.toBoldItalic(name)}\n${currentTitle}\n\n`;
      txt += `⭐ ${h.toBoldItalic('Level')}: ${level}\n`;
      txt += `🔮 ${h.toBoldItalic('XP Progress')}: ${progressBar} ${progress * 10}%\n`;
      txt += `💬 ${h.toBoldItalic('Messages')}: ${msgs.toLocaleString()} / ${nextLevel.toLocaleString()}\n`;
      txt += `💰 ${h.toBoldItalic('Wallet')}: 🪙 ${vault.formatBalance(vaultData.balance)}\n`;
      if (nextTitle) txt += `\n🎯 ${h.toBoldItalic('Next Title')}: ${nextTitle} (at ${nextThreshold?.toLocaleString()} msgs)`;
      txt += `\n\n💀 ${h.toBoldItalic('Keep active to level up!')} ${h.demonEmoji()}`;
      return reply(txt);
    } catch (err) { return reply(`✘ ${h.toBoldItalic('Failed to load level data')} ${h.demonEmoji()}`); }
  }
};
