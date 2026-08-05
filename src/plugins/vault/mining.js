/*
 * MINING.JS - Crittix-MD (mine + collect)
 * Created by: LORD DEVINE
 * Passive coin generation — mine every 4h, collect anytime
 */
const fs    = require('fs-extra');
const path  = require('path');
const vault = require('../../lib/vault');
const h     = require('../../lib/helpers');

const MINE_PATH   = path.join(process.cwd(), 'database', 'mining.json');
const MINE_CD     = 4 * 60 * 60 * 1000;  // 4h cooldown
const MINE_RATE   = 5;                    // coins per minute while mining
const MAX_COLLECT = 500;                  // cap before you must collect

const load = () => { try { return fs.existsSync(MINE_PATH) ? JSON.parse(fs.readFileSync(MINE_PATH,'utf8')) : {}; } catch(_) { return {}; } };
const save = d => { try { fs.ensureDirSync(path.dirname(MINE_PATH)); fs.writeFileSync(MINE_PATH,JSON.stringify(d,null,2)); } catch(_) {} };

module.exports = [
  {
    command: 'mine',
    category: 'arena',
    description: 'Start mining — passive coins over time',
    execute: async ({ sender, reply }) => {
      const db  = load();
      const key = sender.replace(/:\d+@/,'@');
      const now = Date.now();

      if (db[key]?.mining) {
        const elapsed = Math.floor((now - db[key].startedAt) / 60000);
        const earned  = Math.min(elapsed * MINE_RATE, MAX_COLLECT);
        const hrs     = Math.floor(elapsed/60), mins = elapsed%60;
        return reply(
          `⛏️ *Mining in progress*\n\n` +
          `⏱️ Time: ${hrs > 0 ? hrs+'h ' : ''}${mins}m\n` +
          `💰 Pending: 🪙 ${earned.toLocaleString()}\n\n` +
          `Use *.collect* to claim your coins`
        );
      }

      const last = db[key]?.lastMine || 0;
      const wait = MINE_CD - (now - last);
      if (wait > 0) {
        const h2 = Math.floor(wait/(60*60*1000)), m2 = Math.floor((wait%(60*60*1000))/(60*1000));
        return reply(`⏳ mine cooldown: ${h2}h ${m2}m remaining`);
      }

      if (!db[key]) db[key] = {};
      db[key].mining    = true;
      db[key].startedAt = now;
      db[key].lastMine  = now;
      save(db);

      reply(
        `╔════════════════════════么\n║ ⛏️ *MINING STARTED*\n╚════════════════════════么\n\n` +
        `💰 Rate: 🪙 ${MINE_RATE}/minute\n📦 Max: 🪙 ${MAX_COLLECT}\n\n` +
        `Use *.collect* anytime to claim\n么════════════════════════么`
      );
    }
  },
  {
    command: 'collect',
    category: 'arena',
    description: 'Collect your mining earnings',
    execute: async ({ sender, reply }) => {
      const db  = load();
      const key = sender.replace(/:\d+@/,'@');
      const now = Date.now();

      if (!db[key]?.mining)
        return reply(`😑 not mining\n\nuse *.mine* to start`);

      const elapsed = Math.floor((now - db[key].startedAt) / 60000);
      const earned  = Math.min(elapsed * MINE_RATE, MAX_COLLECT);

      if (earned <= 0)
        return reply(`😑 nothing to collect yet — mine for at least 1 minute`);

      vault.updateBalance(sender, earned, 0);
      db[key].mining    = false;
      db[key].startedAt = null;
      save(db);

      reply(
        `╔════════════════════════么\n║ 💰 *COLLECTED*\n╚════════════════════════么\n\n` +
        `⛏️ Mined for: ${Math.floor(elapsed/60)}h ${elapsed%60}m\n` +
        `💰 Earned: 🪙 ${earned.toLocaleString()}\n\n` +
        `Use *.mine* again after cooldown\n么════════════════════════么`
      );
    }
  }
];
