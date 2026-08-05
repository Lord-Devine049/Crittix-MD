/*
 * BOUNTY.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Put a bounty on someone — whoever robs them claims it
 */
const fs    = require('fs-extra');
const path  = require('path');
const vault = require('../../lib/vault');
const h     = require('../../lib/helpers');

const BNT_PATH = path.join(process.cwd(), 'database', 'bounties.json');
const MIN_BOUNTY = 100;

const load = () => { try { return fs.existsSync(BNT_PATH) ? JSON.parse(fs.readFileSync(BNT_PATH,'utf8')) : {}; } catch(_) { return {}; } };
const save = d => { try { fs.ensureDirSync(path.dirname(BNT_PATH)); fs.writeFileSync(BNT_PATH, JSON.stringify(d,null,2)); } catch(_) {} };

const setBounty = (targetJid, amount, placedBy) => {
  const db = load();
  const key = targetJid.replace(/:\d+@/,'@');
  if (!db[key]) db[key] = { total: 0, placedBy: [] };
  db[key].total     += amount;
  db[key].placedBy.push({ jid: placedBy, amount });
  save(db);
};

const getBounty = (targetJid) => {
  const db  = load();
  const key = targetJid.replace(/:\d+@/,'@');
  return db[key] || null;
};

const claimBounty = (targetJid, claimerJid) => {
  const db  = load();
  const key = targetJid.replace(/:\d+@/,'@');
  if (!db[key]) return 0;
  const amount = db[key].total;
  delete db[key];
  save(db);
  vault.updateBalance(claimerJid, amount, 0);
  return amount;
};

module.exports = { setBounty, getBounty, claimBounty };

// Command export
module.exports.command = ['bounty'];
module.exports.category = 'vault';
module.exports.description = 'Place a bounty on someone';
module.exports.execute = async ({ sock, msg, sender, args, chatId, reply }) => {
  let _gtP = [];
  if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
  const target = h.getTarget(msg, _gtP)?.[0];
  const amount = parseInt(args.find(a => /^\d+$/.test(a)));

  if (!target || !amount)
    return reply(h.demonError('.bounty', '.bounty @person <amount> — place a bounty on someone'));

  if (amount < MIN_BOUNTY) return reply(`😑 minimum bounty is 🪙 ${MIN_BOUNTY}`);

  const bal = vault.getBalance(sender);
  if (!bal || bal.balance < amount)
    return reply(`😑 you're broke. you need 🪙 ${amount.toLocaleString()}`);

  vault.updateBalance(sender, -amount, 0);
  setBounty(target, amount, sender);

  const targetNum  = target.split('@')[0];
  const existing   = getBounty(target);

  await sock.sendMessage(chatId, {
    text:
      `╔════════════════════════么\n║ 💀 *BOUNTY PLACED*\n╚════════════════════════么\n\n` +
      `🎯 Target: @${targetNum}\n` +
      `💰 Your bid: 🪙 ${amount.toLocaleString()}\n` +
      `🏆 Total bounty: 🪙 ${existing.total.toLocaleString()}\n\n` +
      `Whoever robs @${targetNum} claims the bounty\n么════════════════════════么`,
    mentions: [target, sender],
  }, { quoted: msg });
};
