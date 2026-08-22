/*
 * LOAN.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Borrow coins with interest — repay within 24h or get penalized
 */
const fs    = require('fs-extra');
const path  = require('path');
const vault = require('../../lib/vault');
const h     = require('../../lib/helpers');
const p = require('../../lib/phrases');


const LOAN_PATH  = path.join(process.cwd(), 'database', 'loans.json');
const MAX_LOAN   = 5000;
const INTEREST   = 0.20; // 20%
const DURATION   = 24 * 60 * 60 * 1000;

const load = () => { try { return fs.existsSync(LOAN_PATH) ? JSON.parse(fs.readFileSync(LOAN_PATH,'utf8')) : {}; } catch(_) { return {}; } };
const save = d => { try { fs.ensureDirSync(path.dirname(LOAN_PATH)); fs.writeFileSync(LOAN_PATH, JSON.stringify(d,null,2)); } catch(_) {} };

module.exports = {
  command: ['loan'],
  category: 'arena',
  description: 'Borrow coins — repay with 20% interest within 24h',
  execute: async ({ sender, args, reply }) => {
    const loans  = load();
    const key    = sender.replace(/:\d+@/,'@');
    const action = args[0]?.toLowerCase();

    // Check status
    if (!action || action === 'status') {
      const loan = loans[key];
      if (!loan) return reply(`💸 No active loan\n\nUse *.loan <amount>* to borrow up to 🪙 ${MAX_LOAN.toLocaleString()}`);
      const due     = loan.dueAt - Date.now();
      const hrs     = Math.max(0, Math.floor(due/(60*60*1000)));
      const mins    = Math.max(0, Math.floor((due%(60*60*1000))/(60*1000)));
      const overdue = due <= 0;
      return reply(
        `╔════════════════════════么\n║ 💳 *ACTIVE LOAN*\n╚════════════════════════么\n\n` +
        `💸 Borrowed: 🪙 ${loan.amount.toLocaleString()}\n` +
        `💰 Owe: 🪙 ${loan.repay.toLocaleString()} (+20% interest)\n` +
        `⏰ Due: ${overdue ? '❌ OVERDUE' : `${hrs}h ${mins}m`}\n\n` +
        `Use *.loan repay* to pay back\n么════════════════════════么`
      );
    }

    // Take a loan
    if (!isNaN(parseInt(action))) {
      const amount = parseInt(action);
      if (loans[key]) return reply(`😑 you already have an active loan. use *.loan repay* first`);
      if (amount <= 0 || amount > MAX_LOAN) return reply(`😑 loan must be between 🪙 1 and 🪙 ${MAX_LOAN.toLocaleString()}`);

      const repay = Math.ceil(amount * (1 + INTEREST));
      loans[key] = { amount, repay, takenAt: Date.now(), dueAt: Date.now() + DURATION };
      save(loans);
      vault.updateBalance(sender, amount, 0);

      return reply(
        `╔════════════════════════么\n║ 💳 *LOAN APPROVED*\n╚════════════════════════么\n\n` +
        `💸 Borrowed: 🪙 ${amount.toLocaleString()}\n` +
        `💰 Repay: 🪙 ${repay.toLocaleString()} (20% interest)\n` +
        `⏰ Due in: *24 hours*\n\n` +
        `Use *.loan repay* when ready\n么════════════════════════么`
      );
    }

    // Repay
    if (action === 'repay') {
      const loan = loans[key];
      if (!loan) return reply(`😑 no active loan to repay`);

      const bal = vault.getBalance(sender);
      let repay = loan.repay;

      // Overdue penalty +10%
      if (Date.now() > loan.dueAt) {
        repay = Math.ceil(repay * 1.1);
        reply(`⚠️ overdue penalty applied — now owe 🪙 ${repay.toLocaleString()}`);
      }

      if (!bal || bal.balance < repay)
        return reply(`😑 need 🪙 ${repay.toLocaleString()} to repay — you have 🪙 ${bal?.balance || 0}`);

      vault.updateBalance(sender, -repay, 0);
      delete loans[key];
      save(loans);

      return reply(
        `╔════════════════════════么\n║ ✅ *LOAN REPAID*\n╚════════════════════════么\n\n` +
        `💰 Paid: 🪙 ${repay.toLocaleString()}\n💰 Balance: 🪙 ${(bal.balance-repay).toLocaleString()}\n\n` +
        `Debt cleared 🔓\n么════════════════════════么`
      );
    }

    reply(p.phrases.wrongUsage('use .loan amount to borrow. or .loan status to check. or .loan repay to pay back.'));
  }
};
