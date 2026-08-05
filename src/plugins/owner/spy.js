/*
 * SPY.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Owner secretly monitors a group — all messages forwarded to owner DM
 */
const fs   = require('fs-extra');
const path = require('path');
const h    = require('../../lib/helpers');

const SPY_PATH = path.join(process.cwd(), 'database', 'spy.json');
const load = () => { try { return fs.existsSync(SPY_PATH)?JSON.parse(fs.readFileSync(SPY_PATH,'utf8')):[]; } catch(_){ return []; } };
const save = d => { try { fs.ensureDirSync(path.dirname(SPY_PATH)); fs.writeFileSync(SPY_PATH,JSON.stringify(d,null,2)); } catch(_){} };

// Export for devine.js to check
const isSpied = (chatId) => load().includes(chatId);

module.exports = [
  {
    command:['spy'], category: 'voidsystem', description:'Silently monitor a group to owner DM', groupOnly:true, ownerOnly:true,
    execute: async({ chatId, reply }) => {
      const list = load();
      if(list.includes(chatId)) return reply(`👁️ already spying on this group\nUse *.spystop* to stop`);
      list.push(chatId); save(list);
      reply(`👁️ *SPY MODE ON*\n\nAll messages from this group will be forwarded to your DM silently`);
    }
  },
  {
    command:['spystop','unspy'], category: 'voidsystem', description:'Stop spying on a group', groupOnly:true, ownerOnly:true,
    execute: async({ chatId, reply }) => {
      const list = load().filter(c=>c!==chatId); save(list);
      reply(`👁️ spy mode disabled for this group`);
    }
  },
  { isSpied }
];
