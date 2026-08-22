/*
 * CARBON-TRUTHDETECTOR.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: carbon, truthdetector
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


const TRUTH_VERDICTS = [
  "🔴 *CERTIFIED LIE* — that's the most fake thing I've read today.",
  "🟢 *PROBABLY TRUE* — or you got lucky guessing. Either way.",
  "🟡 *SUSPICIOUS* — 60% chance you're delusional, 40% chance you're right.",
  "🔴 *DEBUNKED* — my ancestors are rolling their eyes.",
  "🟢 *PLAUSIBLE* — I mean, stranger things have happened. Barely.",
  "🔴 *CAP* — full cap. Extra large cap. Factory-direct cap.",
  "🟡 *NEEDS INVESTIGATION* — which means probably false but I'm being diplomatic.",
  "🟢 *TRUE-ISH* — technically accurate if you squint and ignore most of it.",
  "🔴 *PROPAGANDA* — someone paid you to say this.",
  "🟡 *MIXED SIGNALS* — even my AI brain is confused by this one.",
  "🔴 *BLATANT FICTION* — beautiful story though, 10/10 imagination.",
  "🟢 *BASED ON FACTS* — reluctantly confirmed. Don't let it get to your head.",
];

module.exports = [

  {
    command: 'carbon',
    aliases: ['codeimg', 'codesnap'],
    category: 'soultools',
    description: 'Render a code snippet as a styled syntax-highlighted image. Usage: .carbon <code>',
    execute: async ({ sock, msg, chatId, text, args, reply }) => {
      const code = text || args.join(' ');
      if (!code) return reply(p.phrases.wrongUsage('paste your code after the command. example! .carbon console.log("hello world")'));
      try {
        const { createCanvas } = require('canvas');
        const lines = code.split('\n');
        const lineHeight = 20;
        const padding = { top: 48, bottom: 24, left: 24, right: 24 };
        const headerH = 36;
        const fontSize = 13;
        const W = Math.min(900, Math.max(400, Math.max(...lines.map(l => l.length)) * 8 + padding.left + padding.right + 20));
        const H = lines.length * lineHeight + padding.top + padding.bottom + headerH;

        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#1e1e2e';
        ctx.roundRect ? ctx.beginPath() : null;
        ctx.fillRect(0, 0, W, H);

        // Window chrome
        ctx.fillStyle = '#2a2a3d';
        ctx.fillRect(0, 0, W, headerH);

        // Traffic light dots
        [['#ff5f57', 12], ['#ffbd2e', 28], ['#28ca41', 44]].forEach(([color, x]) => {
          ctx.beginPath();
          ctx.arc(x, headerH / 2, 6, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });

        // Filename label
        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText('snippet.js — Crittix MD', W / 2, headerH / 2 + 4);
        ctx.textAlign = 'left';

        // Code area
        ctx.font = `${fontSize}px monospace`;

        // Simple keyword highlighter
        const keywords = /\b(const|let|var|function|return|if|else|for|while|async|await|class|import|export|from|new|this|try|catch|throw|typeof|null|undefined|true|false)\b/g;
        const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
        const comments = /(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)/g;
        const numbers = /\b(\d+\.?\d*)\b/g;

        const highlightLine = (ctx, line, x, y) => {
          // Simple left-to-right highlighting — tokenize roughly
          let col = x;
          let remaining = line;

          // Build segments
          const segments = [];
          let i = 0;
          while (i < line.length) {
            // Comment
            if (line.slice(i).startsWith('//')) {
              segments.push({ text: line.slice(i), color: '#6a9955' });
              break;
            }
            // String
            if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
              const q = line[i];
              let j = i + 1;
              while (j < line.length && line[j] !== q) { if (line[j] === '\\') j++; j++; }
              segments.push({ text: line.slice(i, j + 1), color: '#ce9178' });
              i = j + 1;
              continue;
            }
            // Number
            const numMatch = line.slice(i).match(/^\d+\.?\d*/);
            if (numMatch && (i === 0 || !/\w/.test(line[i-1]))) {
              segments.push({ text: numMatch[0], color: '#b5cea8' });
              i += numMatch[0].length;
              continue;
            }
            // Word/keyword
            const wordMatch = line.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
            if (wordMatch) {
              const kws = ['const','let','var','function','return','if','else','for','while','async','await','class','import','export','from','new','this','try','catch','throw','typeof','null','undefined','true','false'];
              const color = kws.includes(wordMatch[0]) ? '#569cd6' : /^[A-Z]/.test(wordMatch[0]) ? '#4ec9b0' : '#9cdcfe';
              segments.push({ text: wordMatch[0], color });
              i += wordMatch[0].length;
              continue;
            }
            // Punctuation
            const punct = line[i];
            const punctColor = /[{}[\]();,]/.test(punct) ? '#d4d4d4' : /[=+\-*/<>!&|^%]/.test(punct) ? '#d4d4d4' : '#d4d4d4';
            segments.push({ text: punct, color: punctColor });
            i++;
          }

          for (const seg of segments) {
            ctx.fillStyle = seg.color;
            ctx.fillText(seg.text, col, y);
            col += ctx.measureText(seg.text).width;
          }
        };

        lines.forEach((line, i) => {
          const y = padding.top + headerH + i * lineHeight + fontSize;
          // Line number
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.font = `${fontSize}px monospace`;
          ctx.fillText(String(i + 1).padStart(2, ' '), padding.left, y);
          // Code
          highlightLine(ctx, line, padding.left + 30, y);
        });

        const buf = canvas.toBuffer('image/png');
        const tmpPath = path.join(process.cwd(), 'tmp', `carbon_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, buf);
        await sock.sendMessage(chatId, {
          image: { url: tmpPath },
          caption: `💻 *Code Snapshot*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) {
        reply(p.phrases.error(`Carbon render failed: ${e.message}`));
      }
    }
  },

  {
    command: 'truthdetector',
    aliases: ['factcheck2', 'liedetector'],
    category: 'soultools',
    description: 'Get a sarcastic verdict on whether a claim is true. Usage: .truthdetector <your claim>',
    execute: async ({ text, args, reply }) => {
      const claim = text || args.join(' ');
      if (!claim) return reply(p.phrases.wrongUsage('type your claim after the command and i\'ll judge it. example! .truthdetector the earth is flat'));
      const verdict = TRUTH_VERDICTS[Math.floor(Math.random() * TRUTH_VERDICTS.length)];
      const confidence = Math.floor(Math.random() * 40) + 55;
      reply(
        `🔍 *CRITTIX TRUTH DETECTOR*\n\n` +
        `📝 *Claim:* _"${claim.substring(0, 200)}"_\n\n` +
        `${verdict}\n\n` +
        `📊 Confidence: ${confidence}%\n` +
        `⚙️ Algorithm: Pure vibes + zero research\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }

];
