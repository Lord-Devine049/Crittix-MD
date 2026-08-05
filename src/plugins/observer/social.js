/*
 * SOCIAL.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Profile/social: bio, title, badge, rep, streak, achievements, giftbadge
 */
const fs   = require('fs-extra');
const path = require('path');
const h    = require('../../lib/helpers');

const SOC_PATH = path.join(process.cwd(), 'database', 'social.json');
const REP_CD   = 24*60*60*1000;

const load = () => { try { return fs.existsSync(SOC_PATH)?JSON.parse(fs.readFileSync(SOC_PATH,'utf8')):{};} catch(_){return {};} };
const save = d => { try { fs.ensureDirSync(path.dirname(SOC_PATH)); fs.writeFileSync(SOC_PATH,JSON.stringify(d,null,2)); } catch(_){} };

const getUser = (jid) => { const db=load(); const k=jid.replace(/:\d+@/,'@'); if(!db[k]) db[k]={ bio:null,title:null,badges:[],rep:0,streak:0,lastSeen:0,lastRep:{} }; return { db, k, user:db[k] }; };
const BADGES = { active:'🔥 Active','1st':'⭐ First Timer', streak7:'📅 7-Day Streak', rep10:'💎 Rep Legend', gamer:'🎮 Gamer', rich:'💰 Vault King' };

module.exports = [
  {
    command:['bio'], category: 'groupanalytics', description:'Set your profile bio',
    execute: async({ sender,args,reply }) => {
      const bio=args.join(' '); if(!bio||bio.length>100) return reply(h.demonError('.bio','.bio <your bio> (max 100 chars)'));
      const { db,k,user }=getUser(sender); user.bio=bio; save(db);
      reply(`✅ bio set:\n_${bio}_`);
    }
  },
  {
    command:['title','settitle'], category: 'groupanalytics', description:'Set a custom title shown on your profile',
    execute: async({ sender,args,reply }) => {
      const title=args.join(' '); if(!title||title.length>30) return reply(h.demonError('.title','.title <title> (max 30 chars)'));
      const { db,k,user }=getUser(sender); user.title=title; save(db);
      reply(`✅ title set: *${title}*`);
    }
  },
  {
    command:['mybadges','badges'], category: 'groupanalytics', description:'See your earned badges',
    execute: async({ sender,senderNumber,reply }) => {
      const { user }=getUser(sender);
      if(!user.badges.length) return reply(`😑 no badges yet\n\nEarn them by being active, getting rep, and grinding`);
      let txt=`╔════════════════════════么\n║ 🏅 *YOUR BADGES*\n╚════════════════════════么\n\n`;
      user.badges.forEach(b=>{ txt+=`${BADGES[b]||b}\n`; });
      txt+=`\n么════════════════════════么`;
      reply(txt);
    }
  },
  {
    command:['rep','giverep'], category: 'groupanalytics', description:'Give someone reputation once per day',
    execute: async({ sock,msg,sender,senderNumber,chatId,reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target=h.getTarget(msg, _gtP)?.[0];
      if(!target) return reply(h.demonError('.rep','Reply to or tag someone'));
      if(target.replace(/:\d+@/,'@')===sender.replace(/:\d+@/,'@')) return reply(`😑 can't rep yourself`);

      const { db:sdb,k:sk,user:su }=getUser(sender);
      const last=su.lastRep?.[target.replace(/:\d+@/,'@')]||0;
      if(Date.now()-last<REP_CD){ const left=REP_CD-(Date.now()-last); const h2=Math.floor(left/(60*60*1000)),m2=Math.floor((left%(60*60*1000))/(60*1000)); return reply(`⏳ already repped them — wait ${h2}h ${m2}m`); }

      const { db,k,user }=getUser(target);
      user.rep=(user.rep||0)+1;
      if(user.rep>=10&&!user.badges.includes('rep10')) user.badges.push('rep10');
      su.lastRep[target.replace(/:\d+@/,'@')]=Date.now();
      save(db); save(sdb);

      await sock.sendMessage(chatId,{
        text:`⭐ @${senderNumber} gave rep to @${target.split('@')[0]}!\nThey now have *${user.rep} rep* ⭐`,
        mentions:[sender,target],
      },{ quoted:msg });
    }
  },
  {
    command:['streak'], category: 'groupanalytics', description:'Check your daily activity streak',
    execute: async({ sender,reply }) => {
      const { user }=getUser(sender);
      reply(`🔥 *YOUR STREAK*\n\n📅 Current streak: *${user.streak||0} days*\n\nSend at least one message per day to keep it going`);
    }
  },
  {
    command:['achievements'], category: 'groupanalytics', description:'See all your badges and achievements',
    execute: async({ sender,reply }) => {
      const { user }=getUser(sender);
      const earned=user.badges.map(b=>BADGES[b]||b);
      const all=Object.values(BADGES);
      let txt=`╔════════════════════════么\n║ 🏆 *ACHIEVEMENTS*\n╚════════════════════════么\n\n`;
      txt+=`✅ *Earned (${earned.length}/${all.length}):*\n${earned.length?earned.join('\n'):'None yet'}\n\n`;
      const unearned=Object.entries(BADGES).filter(([k])=>!user.badges.includes(k)).map(([,v])=>v);
      txt+=`🔒 *Locked:*\n${unearned.join('\n')}\n\n么════════════════════════么`;
      reply(txt);
    }
  },
  {
    command:['giftbadge'], category: 'voidsystem', description:'Gift a special badge to any user', ownerOnly:true,
    execute: async({ sock,msg,chatId,args,reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const target=h.getTarget(msg, _gtP)?.[0];
      const badge=args.find(a=>!a.includes('@'));
      if(!target||!badge) return reply(h.demonError('.giftbadge','.giftbadge @user <badge_id>\nBadge IDs: '+Object.keys(BADGES).join(', ')));
      if(!BADGES[badge]) return reply(`😑 unknown badge. Available: ${Object.keys(BADGES).join(', ')}`);
      const { db,user }=getUser(target);
      if(user.badges.includes(badge)) return reply(`😑 they already have that badge`);
      user.badges.push(badge); save(db);
      await sock.sendMessage(chatId,{
        text:`🎁 *BADGE GIFTED*\n\n@${target.split('@')[0]} received the *${BADGES[badge]}* badge from Lord Devine!`,
        mentions:[target],
      },{ quoted:msg });
    }
  },
  { getSocialUser: getUser, BADGES },
];
