/*
 * FUN-CMDS.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h     = require('../../lib/helpers');
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL    = 'llama-3.3-70b-versatile';
const CRITTIX_BASE = `You are CRITTIX, created by LORD DEVINE. Savage, toxic, unfiltered. Cuss freely. Under 8 sentences. Start with 𓆘.`;

const ai = async (system, user, temp=1.3, tokens=250) => {
  const res = await axios.post(GROQ_URL, {
    model: MODEL,
    messages:[{ role:'system',content:system },{ role:'user',content:user }],
    temperature:temp, max_tokens:tokens,
  },{ headers:{ Authorization:`Bearer ${GROQ_API_KEY}`,'Content-Type':'application/json' },timeout:20000 });
  return res.data.choices[0].message.content.trim();
};

const CURSED_FACTS = [
  "A group of flamingos is called a flamboyance. You are not in one.",
  "Cleopatra lived closer in time to the Moon landing than to the Great Pyramid.",
  "Your body replaces itself every 7 years. You're already a different broke person.",
  "Hot water freezes faster than cold water sometimes. Science is as chaotic as your finances.",
  "Sharks are older than trees. The ocean had apex predators before trees existed.",
  "You share 60% of your DNA with a banana. The banana is winning.",
  "There are more stars in the universe than grains of sand on Earth. None of them care about you.",
  "Butterflies taste with their feet. You eat with your emotions and still lose.",
  "The Great Wall of China is not visible from space. Like your potential.",
  "A day on Venus is longer than a year on Venus. Time is a lie and so is your grind.",
];

const NPC_LINES = [
  "Have you tried turning it off and on again?","Warm weather we're having.",
  "I used to be an adventurer like you, then I took an arrow to the knee.",
  "Buy something or leave.","I heard there's trouble at the mill.",
  "Hmm, what is it?","Have you seen my sweetroll?","I got nothing for you, stranger.",
];

const npcTimers = new Map();
const isNpcActive = (chatId) => npcTimers.has(chatId);
const getNpcLine  = () => NPC_LINES[Math.floor(Math.random()*NPC_LINES.length)];

const cmds = [
  {
    command:['thisorthat','tot'], category: 'darkintelligence', description:'Crittix gives two options — group debates',
    execute: async({ sock,msg,chatId,reply }) => {
      try {
        const ans = await ai(`Generate a spicy "this or that" debate. Format: "*Option A* vs *Option B*" then a one-line savage comment.`,'Give me a this or that',1.4,100);
        await sock.sendMessage(chatId,{ text:`⚡ *THIS OR THAT*\n\n${ans}\n\nWhich side are you on?` },{ quoted:msg });
      } catch(e){ reply('AI failed — '+e.message); }
    }
  },
  {
    command:['npc'], category: 'darkintelligence', description:'Bot acts like an NPC for 5 minutes', groupOnly:true,
    execute: async({ sock,chatId,reply }) => {
      if(isNpcActive(chatId)) return reply(`😑 NPC mode already active`);
      npcTimers.set(chatId,true);
      reply(`🤖 *NPC MODE ACTIVATED* — responding like a background NPC for 5 minutes`);
      setTimeout(()=>{ npcTimers.delete(chatId); sock.sendMessage(chatId,{ text:`🤖 NPC mode deactivated. Back to destroying lives.` }); },5*60*1000);
    }
  },
  {
    command:['vibe'], category: 'darkintelligence', description:'Crittix reads the group energy', groupOnly:true,
    execute: async({ reply }) => {
      const v = ['𓆘 this group has the energy of a waiting room at the DMV','𓆘 y\'all are giving main character energy but you\'re clearly extras','𓆘 the vibe is off. somebody in here is faking','𓆘 this group smells like ambition mixed with broke','𓆘 certified 3AM energy. only losers and legends up this late','𓆘 the aura here is negative. someone needs to leave','𓆘 chaotic neutral energy. i respect it','𓆘 dead chat energy. y\'all need to be jumpstarted','𓆘 dangerous energy in here. i like it'];
      reply(v[Math.floor(Math.random()*v.length)]);
    }
  },
  {
    command:['cursed'], category: 'darkintelligence', description:'Crittix sends a cursed random fact',
    execute: async({ reply }) => { reply(`🌑 *CURSED FACT*\n\n${CURSED_FACTS[Math.floor(Math.random()*CURSED_FACTS.length)]}`); }
  },
  {
    command:['impostor','sus'], category: 'darkintelligence', description:'Crittix randomly accuses someone', groupOnly:true,
    execute: async({ sock,msg,chatId,reply }) => {
      try {
        const meta=await sock.groupMetadata(chatId); const members=meta.participants.filter(p=>!p.admin);
        if(members.length<2) return reply(`😑 not enough members`);
        const v=members[Math.floor(Math.random()*members.length)];
        await sock.sendMessage(chatId,{ text:`🔴 *IMPOSTOR DETECTED*\n\n@${v.id.split('@')[0]} is acting sus 👀\n\n${['Vote them out 🗳️','They\'ve been venting all day 😤','I saw them sabotage the vault 💀','Running patterns like a snitch 👁️'][Math.floor(Math.random()*4)]}`,mentions:[v.id] },{ quoted:msg });
      } catch(e){ reply('failed — '+e.message); }
    }
  },
  {
    command:['ranking'], category: 'darkintelligence', description:'Crittix power ranks tagged people',
    execute: async({ sock,msg,chatId,args,reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const targets=h.getTarget(msg, _gtP); const cat=args.filter(a=>!a.includes('@')).join(' ')||'overall aura';
      if(targets.length<2) return reply(h.demonError('.ranking','Tag at least 2 people\nExample: .ranking @a @b richness'));
      try {
        const ans=await ai(`${CRITTIX_BASE} Power rank these people by the category. Savage, biased, brutal. Number them.`,`Rank by ${cat}: ${targets.map(t=>`@${t.split('@')[0]}`).join(', ')}`,1.5,400);
        await sock.sendMessage(chatId,{ text:`📊 *RANKING: ${cat.toUpperCase()}*\n\n${ans}`,mentions:targets },{ quoted:msg });
      } catch(e){ reply('AI failed — '+e.message); }
    }
  },
  {
    command:['compatibility'], category: 'darkintelligence', description:'Full compatibility report for two people',
    execute: async({ sock,msg,chatId,reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const t=h.getTarget(msg, _gtP); if(t.length<2) return reply(h.demonError('.compatibility','Tag two people'));
      try {
        const ans=await ai(`${CRITTIX_BASE} Compatibility report: friendship, romance, business, chaos potential. Rate each /100. Brutal.`,`Compatibility: @${t[0].split('@')[0]} and @${t[1].split('@')[0]}`,1.4,400);
        await sock.sendMessage(chatId,{ text:`💘 *COMPATIBILITY REPORT*\n\n${ans}`,mentions:t },{ quoted:msg });
      } catch(e){ reply('AI failed — '+e.message); }
    }
  },
  {
    command:['catchphrase'], category: 'darkintelligence', description:'Crittix generates a personal catchphrase',
    execute: async({ sock,msg,chatId,args,reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const t=h.getTarget(msg, _gtP)?.[0]; const name=t?.split('@')[0]||args.join(' ')||'this person';
      try {
        const ans=await ai(`${CRITTIX_BASE} Generate 3 personal catchphrases. Dramatic, dark, fitting. Numbered 1-3.`,`Catchphrases for: @${name}`,1.6,200);
        await sock.sendMessage(chatId,{ text:`🗣️ *CATCHPHRASES*\n\n${ans}`,mentions:t?[t]:[] },{ quoted:msg });
      } catch(e){ reply('AI failed — '+e.message); }
    }
  },
  {
    command:['trait'], category: 'darkintelligence', description:'Crittix assigns personality traits',
    execute: async({ sock,msg,chatId,args,reply }) => {
      let _gtP = [];
      if (chatId?.endsWith('@g.us')) { try { _gtP = (await sock.groupMetadata(chatId)).participants; } catch (_) {} }
      const t=h.getTarget(msg, _gtP)?.[0]; const name=t?.split('@')[0]||args.join(' ')||'this person';
      try {
        const ans=await ai(`${CRITTIX_BASE} Assign 3 savage personality traits. One sentence explanation per trait.`,`Traits for: @${name}`,1.5,200);
        await sock.sendMessage(chatId,{ text:`🧬 *PERSONALITY TRAITS*\n\n${ans}`,mentions:t?[t]:[] },{ quoted:msg });
      } catch(e){ reply('AI failed — '+e.message); }
    }
  },
];

cmds.isNpcActive = isNpcActive;
cmds.getNpcLine  = getNpcLine;
module.exports   = cmds;
