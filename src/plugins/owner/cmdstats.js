/*
 * CMDSTATS.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Tracks which commands are used most per group
 */
const fs   = require('fs-extra');
const path = require('path');

const STATS_PATH = path.join(process.cwd(), 'database', 'cmd-stats.json');
const load = () => { try { return fs.existsSync(STATS_PATH)?JSON.parse(fs.readFileSync(STATS_PATH,'utf8')):{};} catch(_){return {};} };
const save = d => { try { fs.ensureDirSync(path.dirname(STATS_PATH)); fs.writeFileSync(STATS_PATH,JSON.stringify(d,null,2)); } catch(_){} };

const trackCmd = (chatId, cmd) => {
  const db=load();
  if(!db[chatId]) db[chatId]={};
  db[chatId][cmd]=(db[chatId][cmd]||0)+1;
  save(db);
};

module.exports = {
  command:['cmdstats'], category: 'voidsystem', description:'Most used commands in this group', ownerOnly:true,
  trackCmd,
  execute: async({ chatId, reply }) => {
    const db  = load();
    const raw = db[chatId];
    if(!raw||!Object.keys(raw).length) return reply(`📊 no command stats yet for this group`);
    const sorted = Object.entries(raw).sort((a,b)=>b[1]-a[1]).slice(0,10);
    let txt = `╔════════════════════════么\n║ 📊 *CMD STATS*\n╚════════════════════════么\n\n`;
    sorted.forEach(([cmd,count],i)=>{ txt+=`${i+1}. *${cmd}* — ${count} uses\n`; });
    txt += `\n么════════════════════════么`;
    reply(txt);
  }
};
