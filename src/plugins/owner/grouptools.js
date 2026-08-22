/*
 * GROUPTOOLS.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Owner/admin group tools: softban, antiflood, pinned, invitelink, groupage,
 * filterword, blacklist/whitelist, autokick, setprefix2, grouplock/unlock
 */
const fs    = require('fs-extra');
const path  = require('path');
const h     = require('../../lib/helpers');
const p = require('../../lib/phrases');


const DB_PATH    = path.join(process.cwd(), 'database', 'grouptools.json');
const FLOOD_PATH = path.join(process.cwd(), 'database', 'antiflood.json');
const BL_PATH    = path.join(process.cwd(), 'database', 'blacklist.json');

const load   = (p) => { try { return fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):{};} catch(_){return {};} };
const saveDB = (p,d) => { try { fs.ensureDirSync(path.dirname(p)); fs.writeFileSync(p,JSON.stringify(d,null,2)); } catch(_){} };

// flood tracker: chatId -> { userId -> [timestamps] }
const floodTrack = {};

const isBlacklisted  = (jid) => { const db=load(BL_PATH); return !!(db.users||[]).includes(jid.replace(/:\d+@/,'@')); };
const isGroupLocked  = (chatId, cmd) => { const db=load(DB_PATH); return (db[chatId]?.locked||[]).includes(cmd); };
const getFilterWords = (chatId) => { const db=load(DB_PATH); return db[chatId]?.filterWords||[]; };
const getAntiflood   = (chatId) => { const db=load(DB_PATH); return db[chatId]?.antiflood||null; };
const getPrefix      = (chatId) => { const db=load(DB_PATH); return db[chatId]?.prefix||null; };

module.exports = [
  // ── SOFTBAN ────────────────────────────────────────
  {
    command:['softban'], category: 'abysscommands', description:'Kick then re-invite a member', groupOnly:true,
    execute: async({ sock,msg,chatId,sender,isOwner,isSudo,reply }) => {
      const s=msg.key.participant||msg.key.remoteJid;
      if(!await h.isSenderAdmin(sock,chatId,s)) return reply(p.phrases.adminOnly());
      if(!await h.isBotAdmin(sock,chatId)) return reply(p.phrases.adminOnly());
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target=h.getTarget(msg, _gtP)?.[0];
      if(!target) return reply(p.phrases.wrongUsage('reply to or tag the person you want to softban. example! .softban @user'));
      try {
        const link=await sock.groupInviteCode(chatId);
        await sock.groupParticipantsUpdate(chatId,[target],'remove');
        await new Promise(r=>setTimeout(r,1500));
        await sock.groupParticipantsUpdate(chatId,[target],'add').catch(()=>{});
        await sock.sendMessage(chatId,{ text:`🔄 @${target.split('@')[0]} was softbanned and re-added`,mentions:[target] },{ quoted:msg });
      } catch(e){ reply('failed — '+e.message); }
    }
  },
  // ── ANTIFLOOD ──────────────────────────────────────
  {
    command:['antiflood'], category: 'darkprotection', description:'Auto-kick flood spammers — .antiflood 5/10s', groupOnly:true,
    execute: async({ sock,msg,chatId,sender,isOwner,isSudo,args,reply }) => {
      const s=msg.key.participant||msg.key.remoteJid;
      if(!await h.isSenderAdmin(sock,chatId,s)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      if(args[0]==='off'){ const db=load(DB_PATH); if(db[chatId]) delete db[chatId].antiflood; saveDB(DB_PATH,db); return reply(p.phrases.success('antiflood disabled.')); }
      const match=args[0]?.match(/(\d+)\/(\d+)([sm])/);
      if(!match) return reply(p.phrases.wrongUsage('format it correctly. example! .antiflood 5/10s'));
      const [,msgs,time,unit]=match;
      const ms=unit==='m'?parseInt(time)*60000:parseInt(time)*1000;
      const db=load(DB_PATH); if(!db[chatId]) db[chatId]={};
      db[chatId].antiflood={ msgs:parseInt(msgs), ms }; saveDB(DB_PATH,db);
      reply(p.phrases.success(`antiflood set. max ${msgs} messages per ${time}${unit}.`));
    }
  },
  // ── PINNED ─────────────────────────────────────────
  {
    command:['pinned'], category: 'abysscommands', description:'Show all pinned messages in this group', groupOnly:true,
    execute: async({ sock,msg,chatId,reply }) => {
      try {
        const meta=await sock.groupMetadata(chatId);
        if(!meta.desc) return reply(`📌 no pinned messages / description found`);
        reply(`📌 *GROUP INFO*\n\n${meta.desc}`);
      } catch(e){ reply('failed — '+e.message); }
    }
  },
  // ── FILTERWORD ─────────────────────────────────────
  {
    command:['filterword','addfilter'], category: 'abysscommands', description:'Auto-delete messages containing a word', groupOnly:true,
    execute: async({ msg,chatId,sender,isOwner,isSudo,args,sock,reply }) => {
      const s=msg.key.participant||msg.key.remoteJid;
      if(!await h.isSenderAdmin(sock,chatId,s)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const word=args.join(' ').toLowerCase().trim();
      if(!word) return reply(p.phrases.wrongUsage('provide the word to filter. example! .filterword badword'));
      const db=load(DB_PATH); if(!db[chatId]) db[chatId]={}; if(!db[chatId].filterWords) db[chatId].filterWords=[];
      if(db[chatId].filterWords.includes(word)) return reply(`😑 *${word}* already filtered`);
      db[chatId].filterWords.push(word); saveDB(DB_PATH,db);
      reply(p.phrases.success(`"${word}" added to the filter list.`));
    }
  },
  {
    command:['unfilterword','removefilter'], category: 'abysscommands', description:'Remove a word from filter list', groupOnly:true,
    execute: async({ msg,chatId,sender,isOwner,isSudo,args,sock,reply }) => {
      const s=msg.key.participant||msg.key.remoteJid;
      if(!await h.isSenderAdmin(sock,chatId,s)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      const word=args.join(' ').toLowerCase().trim();
      const db=load(DB_PATH); if(!db[chatId]?.filterWords?.length) return reply(`😑 no filter words set`);
      db[chatId].filterWords=db[chatId].filterWords.filter(w=>w!==word); saveDB(DB_PATH,db);
      reply(p.phrases.success(`"${word}" removed from the filter list.`));
    }
  },
  // ── BLACKLIST / WHITELIST ──────────────────────────
  {
    command:['blacklist'], category: 'voidsystem', description:'Block a user from using bot globally', ownerOnly:true,
    execute: async({ sock,msg,chatId,args,reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target=h.getTarget(msg, _gtP)?.[0]||args[0];
      if(!target) return reply(p.phrases.wrongUsage('tag the user to blacklist. example! .blacklist @user'));
      const db=load(BL_PATH); if(!db.users) db.users=[];
      const jid=target.replace(/:\d+@/,'@');
      if(db.users.includes(jid)) return reply(`😑 already blacklisted`);
      db.users.push(jid); saveDB(BL_PATH,db);
      reply(`🚫 @${jid.split('@')[0]} blacklisted — bot will ignore them globally`);
    }
  },
  {
    command:['whitelist','unblacklist'], category: 'voidsystem', description:'Remove user from global blacklist', ownerOnly:true,
    execute: async({ sock,msg,chatId,args,reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target=h.getTarget(msg, _gtP)?.[0]||args[0];
      if(!target) return reply(p.phrases.wrongUsage('tag the user to whitelist. example! .whitelist @user'));
      const db=load(BL_PATH);
      const jid=target.replace(/:\d+@/,'@');
      db.users=(db.users||[]).filter(u=>u!==jid); saveDB(BL_PATH,db);
      reply(p.phrases.success(`@${jid.split('@')[0]} removed from blacklist.`));
    }
  },
  // ── AUTOKICK ───────────────────────────────────────
  {
    command:['autokick'], category: 'darkprotection', description:'Auto-kick anyone who joins matching a pattern', groupOnly:true,
    execute: async({ msg,chatId,sender,isOwner,isSudo,args,sock,reply }) => {
      const s=msg.key.participant||msg.key.remoteJid;
      if(!await h.isSenderAdmin(sock,chatId,s)) return reply(p.phrases.adminOnly());
      if (!await h.isBotAdmin(sock, chatId)) return reply(p.phrases.adminOnly());
      if(args[0]==='off'){ const db=load(DB_PATH); if(db[chatId]) delete db[chatId].autokick; saveDB(DB_PATH,db); return reply(p.phrases.success('autokick disabled.'); }
      const pattern=args.join(' ');
      if(!pattern) return reply(p.phrases.wrongUsage('provide a number pattern to autokick. example! .autokick +233. or .autokick off to disable.'));
      const db=load(DB_PATH); if(!db[chatId]) db[chatId]={};
      db[chatId].autokick=pattern; saveDB(DB_PATH,db);
      reply(p.phrases.success(`autokick set. members matching ${pattern} will be removed.`));
    }
  },
  // ── SETPREFIX2 ─────────────────────────────────────
  {
    command:['setprefix2','gprefix'], category: 'voidsystem', description:'Set a custom prefix for this group only', groupOnly:true, ownerOnly:true,
    execute: async({ chatId,args,reply }) => {
      const prefix=args[0];
      if(!prefix||prefix.length>3) return reply(p.phrases.wrongUsage('provide the new prefix. max 3 characters. example! .setprefix2 !'));
      const db=load(DB_PATH); if(!db[chatId]) db[chatId]={};
      db[chatId].prefix=prefix; saveDB(DB_PATH,db);
      reply(p.phrases.success(`prefix for this group set to ${prefix}.`));
    }
  },
  // ── GROUPLOCK / UNLOCK ─────────────────────────────
  {
    command:['grouplock'], category: 'voidsystem', description:'Lock specific commands in this group', groupOnly:true, ownerOnly:true,
    execute: async({ chatId,args,reply }) => {
      const cmd=args[0];
      if(!cmd) return reply(p.phrases.wrongUsage('provide the command name to lock. example! .grouplock play'));
      const db=load(DB_PATH); if(!db[chatId]) db[chatId]={}; if(!db[chatId].locked) db[chatId].locked=[];
      if(db[chatId].locked.includes(cmd)) return reply(`😑 *.${cmd}* already locked`);
      db[chatId].locked.push(cmd); saveDB(DB_PATH,db);
      reply(`🔒 *.${cmd}* locked in this group`);
    }
  },
  {
    command:['groupunlock'], category: 'voidsystem', description:'Unlock a command in this group', groupOnly:true, ownerOnly:true,
    execute: async({ chatId,args,reply }) => {
      const cmd=args[0];
      if(!cmd) return reply(p.phrases.wrongUsage('provide the command name to unlock. example! .groupunlock play'));
      const db=load(DB_PATH); if(!db[chatId]?.locked) return reply(`😑 *.${cmd}* is not locked`);
      db[chatId].locked=db[chatId].locked.filter(c=>c!==cmd); saveDB(DB_PATH,db);
      reply(`🔓 *.${cmd}* unlocked`);
    }
  },

  // Export helpers for devine.js
  { isBlacklisted, isGroupLocked, getFilterWords, getAntiflood, getPrefix, floodTrack },
];
