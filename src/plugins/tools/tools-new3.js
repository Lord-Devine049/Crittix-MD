/*
 * TOOLS-NEW3.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: compressimg, resizeimg, watermark, exifremove, filehash,
 *           base32, rot13, caesarcipher, figlet, urlencode, htmlencode
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const p = require('../../lib/phrases');


module.exports = [

  {
    command: 'compressimg',
    aliases: ['imgcompress', 'shrinkimg'],
    category: 'soultools',
    description: 'Compress an uploaded image. Reply to an image with: compressimg [quality 1-100]',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
      if (!imgMsg) return reply(p.phrases.wrongUsage('reply to an image to compress it.'));
      const quality = Math.min(100, Math.max(1, parseInt(args[0]) || 60));
      try {
        const Jimp = require('jimp');
        const buffer = await sock.downloadMediaMessage(msg);
        const jimg = await Jimp.read(buffer);
        jimg.quality(quality);
        const compressed = await jimg.getBufferAsync(Jimp.MIME_JPEG);
        const reduction = (((buffer.length - compressed.length) / buffer.length) * 100).toFixed(1);
        const tmpPath = path.join(process.cwd(), 'tmp', `compressed_${Date.now()}.jpg`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, compressed);
        await sock.sendMessage(chatId, {
          image: { url: tmpPath },
          caption: `🗜️ *Image Compressed*\n\nQuality: ${quality}%\nOriginal: ${(buffer.length / 1024).toFixed(1)}KB\nCompressed: ${(compressed.length / 1024).toFixed(1)}KB\nSaved: ${reduction}% 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(p.phrases.error(`compression failed — ${e.message}`)); }
    }
  },

  {
    command: 'resizeimg',
    aliases: ['imgsize', 'scaleimg'],
    category: 'soultools',
    description: 'Resize an image to given dimensions. Reply to image: resizeimg 800x600',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
      if (!imgMsg) return reply(p.phrases.error('reply to an image to resize it'));
      const sizeArg = args[0] || '800x600';
      const [w, h2] = sizeArg.toLowerCase().split('x').map(Number);
      if (!w || !h2 || w > 5000 || h2 > 5000) return reply(p.phrases.wrongUsage('reply to an image and provide the size. example! .resizeimg 800x600'));
      try {
        const Jimp = require('jimp');
        const buffer = await sock.downloadMediaMessage(msg);
        const jimg2 = await Jimp.read(buffer);
        jimg2.contain(w, h2);
        const resized = await jimg2.getBufferAsync(Jimp.MIME_PNG);
        const tmpPath = path.join(process.cwd(), 'tmp', `resized_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, resized);
        await sock.sendMessage(chatId, {
          image: { url: tmpPath },
          caption: `📐 *Image Resized*\n\nDimensions: *${w} × ${h2}px*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(p.phrases.error(`resize failed — ${e.message}`)); }
    }
  },

  {
    command: 'watermark',
    aliases: ['addwatermark', 'wmark'],
    category: 'soultools',
    description: 'Add text watermark to an image. Reply to image: watermark My Text',
    execute: async ({ sock, msg, chatId, args, text, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
      if (!imgMsg) return reply(p.phrases.error('reply to an image to watermark it'));
      const wmText = args.join(' ') || 'Crittix MD';
      try {
        const Jimp = require('jimp');
        const JimpFont = Jimp;
        const buffer = await sock.downloadMediaMessage(msg);
        const jimg3 = await Jimp.read(buffer);
        const w = jimg3.getWidth(), h2 = jimg3.getHeight();
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        jimg3.print(font, 10, h2 - 60, { text: wmText, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, w - 20, 50);
        const out = await jimg3.getBufferAsync(Jimp.MIME_PNG);
        const tmpPath = path.join(process.cwd(), 'tmp', `wm_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, out);
        await sock.sendMessage(chatId, { image: { url: tmpPath }, caption: `💧 *Watermarked*\n\nText: "${wmText}"\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(p.phrases.error(`watermark failed — ${e.message}`)); }
    }
  },

  {
    command: 'exifremove',
    aliases: ['stripexif', 'exifclean'],
    category: 'soultools',
    description: 'Strip EXIF metadata from an image. Reply to image: exifremove',
    execute: async ({ sock, msg, chatId, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imgMsg = quoted?.imageMessage || msg.message?.imageMessage;
      if (!imgMsg) return reply(p.phrases.error('reply to an image to strip its EXIF data'));
      try {
        const Jimp = require('jimp');
        const buffer = await sock.downloadMediaMessage(msg);
        const jimg4 = await Jimp.read(buffer);
        const clean = await jimg4.getBufferAsync(Jimp.MIME_JPEG);
        const tmpPath = path.join(process.cwd(), 'tmp', `exif_${Date.now()}.jpg`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, clean);
        await sock.sendMessage(chatId, { image: { url: tmpPath }, caption: `🧹 *EXIF Stripped*\n\nAll metadata removed. Your privacy game is now slightly less embarrassing.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` }, { quoted: msg });
        fs.removeSync(tmpPath);
      } catch (e) { reply(p.phrases.error(`EXIF strip failed — ${e.message}`)); }
    }
  },

  {
    command: 'filehash',
    aliases: [ 'checksum'],
    category: 'soultools',
    description: 'Get MD5/SHA256 hash of a file. Reply to any file/image/video: filehash',
    execute: async ({ sock, msg, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const hasMedia = quoted?.imageMessage || quoted?.videoMessage || quoted?.documentMessage || quoted?.audioMessage ||
                       msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.documentMessage || msg.message?.audioMessage;
      if (!hasMedia) return reply(p.phrases.error('reply to a file/image/video to hash it'));
      try {
        const buffer = await sock.downloadMediaMessage(msg);
        const md5 = crypto.createHash('md5').update(buffer).digest('hex');
        const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');
        const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
        reply(
          `🔐 *FILE HASH*\n\n` +
          `📦 Size: ${(buffer.length / 1024).toFixed(2)} KB\n\n` +
          `🔑 MD5:\n\`${md5}\`\n\n` +
          `🔑 SHA1:\n\`${sha1}\`\n\n` +
          `🔑 SHA256:\n\`${sha256}\`\n\n` +
          `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) { reply(p.phrases.error(`hashing failed — ${e.message}`)); }
    }
  },

  {
    command: 'base32',
    aliases: ['b32', 'encode32'],
    category: 'soultools',
    description: 'Encode or decode base32. Usage: base32 encode Hello | base32 decode JBSWY3DP',
    execute: async ({ args, reply }) => {
      const mode = args[0]?.toLowerCase();
      const input = args.slice(1).join(' ');
      if (!mode || !input) return reply(p.phrases.wrongUsage('use encode or decode then your text. example! .base32 encode hello world'));
      const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      try {
        if (mode === 'encode') {
          let bits = 0, value = 0, output = '';
          for (let i = 0; i < input.length; i++) {
            value = (value << 8) | input.charCodeAt(i);
            bits += 8;
            while (bits >= 5) { output += ALPHABET[(value >>> (bits - 5)) & 31]; bits -= 5; }
          }
          if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
          while (output.length % 8 !== 0) output += '=';
          reply(`🔐 *Base32 Encode*\n\n📥 Input: ${input}\n📤 Output:\n\`${output}\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        } else if (mode === 'decode') {
          const clean = input.replace(/=/g, '').toUpperCase();
          let bits = 0, value = 0, output = '';
          for (const char of clean) {
            const idx = ALPHABET.indexOf(char);
            if (idx === -1) throw new Error(`invalid character: ${char}`);
            value = (value << 5) | idx;
            bits += 5;
            if (bits >= 8) { output += String.fromCharCode((value >>> (bits - 8)) & 255); bits -= 8; }
          }
          reply(`🔓 *Base32 Decode*\n\n📥 Input: ${input.substring(0, 50)}\n📤 Output:\n${output}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        } else {
          reply('❌ Use: base32 encode [text] | base32 decode [base32]');
        }
      } catch (e) { reply(p.phrases.error(`base32 failed — ${e.message}`)); }
    }
  },

  {
    command: 'rot13',
    aliases: ['rot', 'rot13cipher'],
    category: 'soultools',
    description: 'ROT13 encode/decode text. Usage: rot13 Hello World',
    execute: async ({ args, text, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('type the text you want rot13 encoded. example! .rot13 hello world'));
      const result = input.replace(/[a-zA-Z]/g, c => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
      reply(`🔄 *ROT13*\n\n📥 Input: ${input}\n📤 Output: ${result}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'caesarcipher',
    aliases: ['caesar', 'shift'],
    category: 'soultools',
    description: 'Caesar cipher encode/decode. Usage: caesarcipher encode Hello 3 | caesarcipher decode Khoor 3',
    execute: async ({ args, reply }) => {
      const mode = args[0]?.toLowerCase();
      const shift = parseInt(args[args.length - 1]) || 3;
      const input = args.slice(1, -1).join(' ');
      if (!mode || !input) return reply(p.phrases.wrongUsage('use encode or decode with your text and shift number. example! .caesarcipher encode hello 3'));
      const s = mode === 'decode' ? (26 - (shift % 26)) % 26 : shift % 26;
      const result = input.replace(/[a-zA-Z]/g, c => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
      });
      reply(`🗝️ *Caesar Cipher (shift ${shift})*\n\n📥 ${mode === 'encode' ? 'Plaintext' : 'Ciphertext'}: ${input}\n📤 ${mode === 'encode' ? 'Ciphertext' : 'Plaintext'}: *${result}*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'figlet',
    aliases: [ 'bigtext'],
    category: 'soultools',
    description: 'Convert text to ASCII art. Usage: figlet Hello',
    execute: async ({ args, text, reply }) => {
      const input = (text || args.join(' ')).toUpperCase().substring(0, 10);
      if (!input) return reply(p.phrases.wrongUsage('type the text you want as ascii art. max 10 characters. example! .figlet crittix'));
      // Simple 5-line ASCII font
      const chars = {
        A:'  █  \n ███ \n█   █\n█████\n█   █',B:'████ \n█   █\n████ \n█   █\n████ ',
        C:' ████\n█    \n█    \n█    \n ████',D:'████ \n█   █\n█   █\n█   █\n████ ',
        E:'█████\n█    \n████ \n█    \n█████',F:'█████\n█    \n████ \n█    \n█    ',
        G:' ████\n█    \n█  ██\n█   █\n ████',H:'█   █\n█   █\n█████\n█   █\n█   █',
        I:'█████\n  █  \n  █  \n  █  \n█████',J:'█████\n    █\n    █\n█   █\n ███ ',
        K:'█   █\n█  █ \n███  \n█  █ \n█   █',L:'█    \n█    \n█    \n█    \n█████',
        M:'█   █\n██ ██\n█ █ █\n█   █\n█   █',N:'█   █\n██  █\n█ █ █\n█  ██\n█   █',
        O:' ███ \n█   █\n█   █\n█   █\n ███ ',P:'████ \n█   █\n████ \n█    \n█    ',
        Q:' ███ \n█   █\n█ █ █\n█  ██\n ████',R:'████ \n█   █\n████ \n█ █  \n█  ██',
        S:' ████\n█    \n ███ \n    █\n████ ',T:'█████\n  █  \n  █  \n  █  \n  █  ',
        U:'█   █\n█   █\n█   █\n█   █\n ███ ',V:'█   █\n█   █\n █ █ \n  █  \n  █  ',
        W:'█   █\n█   █\n█ █ █\n██ ██\n█   █',X:'█   █\n █ █ \n  █  \n █ █ \n█   █',
        Y:'█   █\n █ █ \n  █  \n  █  \n  █  ',Z:'█████\n   █ \n  █  \n █   \n█████',
        ' ':'     \n     \n     \n     \n     ',
      };
      const lines = ['','','','',''];
      for (const c of input) {
        const char = chars[c] || chars[' '];
        const rows = char.split('\n');
        for (let i = 0; i < 5; i++) lines[i] += (rows[i] || '     ') + ' ';
      }
      reply(`🔠 *ASCII ART*\n\n\`\`\`\n${lines.join('\n')}\`\`\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'urlencode',
    aliases: ['urldecode', 'urlenc'],
    category: 'soultools',
    description: 'URL encode or decode text. Usage: urlencode encode hello world | urlencode decode hello%20world',
    execute: async ({ args, reply }) => {
      const mode = args[0]?.toLowerCase();
      const input = args.slice(1).join(' ');
      if (!mode || !input) return reply(p.phrases.wrongUsage('use encode or decode then your text. example! .urlencode encode hello world'));
      try {
        const result = mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input);
        reply(`🔗 *URL ${mode === 'encode' ? 'Encode' : 'Decode'}*\n\n📥 Input: ${input}\n📤 Output:\n\`${result}\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`URL encode/decode failed — ${e.message}`)); }
    }
  },

  {
    command: 'htmlencode',
    aliases: ['htmldecode', 'htmlentity'],
    category: 'soultools',
    description: 'HTML entity encode/decode. Usage: htmlencode encode <html> | htmlencode decode &lt;html&gt;',
    execute: async ({ args, reply }) => {
      const mode = args[0]?.toLowerCase();
      const input = args.slice(1).join(' ');
      if (!mode || !input) return reply(p.phrases.wrongUsage('use encode or decode then your text. example! .htmlencode encode <b>hello</b>'));
      const encodeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      const decodeMap = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
      const result = mode === 'encode'
        ? input.replace(/[&<>"']/g, c => encodeMap[c])
        : input.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, e => decodeMap[e] || e);
      reply(`🌐 *HTML ${mode === 'encode' ? 'Encode' : 'Decode'}*\n\n📥 Input: ${input}\n📤 Output:\n\`${result}\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'markdowntohtml',
    aliases: ['md2html', 'mdhtml'],
    category: 'soultools',
    description: 'Convert markdown to HTML. Usage: markdowntohtml # Hello **bold** _italic_',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('paste your markdown text after the command. example! .markdowntohtml # hello world'));
      let html = input
        .replace(/^### (.+)/gm, '<h3>$1</h3>')
        .replace(/^## (.+)/gm, '<h2>$1</h2>')
        .replace(/^# (.+)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.+?)__/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        .replace(/^- (.+)/gm, '<li>$1</li>')
        .replace(/\n/g, '<br>');
      reply(`🌐 *Markdown → HTML*\n\n📥 Input:\n${input}\n\n📤 HTML:\n\`\`\`\n${html}\n\`\`\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },

  {
    command: 'readingtime',
    aliases: ['readtime', 'wpm'],
    category: 'soultools',
    description: 'Estimate reading time of text (200 wpm). Usage: readingtime <text>',
    execute: async ({ text, args, reply }) => {
      const input = text || args.join(' ');
      if (!input) return reply(p.phrases.wrongUsage('paste your text after the command and i\'ll estimate reading time. example! .readingtime paste your article here'));
      const words = input.trim().split(/\s+/).length;
      const minutes = words / 200;
      const mins = Math.floor(minutes);
      const secs = Math.round((minutes - mins) * 60);
      reply(
        `⏱️ *READING TIME*\n\n` +
        `📝 Words: *${words.toLocaleString()}*\n` +
        `📖 Reading time: *${mins > 0 ? mins + ' min' : ''}${secs > 0 ? ' ' + secs + ' sec' : mins === 0 ? 'Under 1 min' : ''}*\n` +
        `📊 Characters: *${input.length.toLocaleString()}*\n\n` +
        `_(Based on 200 words per minute)_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }

];
