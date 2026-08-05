/*
 * STICKERS-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: stickerpack, stickersearch, stickerrandom, stickeranimate, stickerexport, packinfo
 */
const axios = require('axios');
const crypto = require('crypto');
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const exif = require('../../lib/exif');
const crittixStickers = require('../../lib/crittix-stickers');

// Pack DB — stores pack name/author per sender number
const PACK_DB = path.join(process.cwd(), 'database', 'sticker-packs.json');
const loadPackDB = () => { try { return JSON.parse(fs.readFileSync(PACK_DB, 'utf8')); } catch { return {}; } };
const savePackDB = (db) => fs.writeFileSync(PACK_DB, JSON.stringify(db, null, 2));

// Stream → Buffer
const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

// Derive a stable pack ID from user key + pack name so all stickers group in the tray
const stablePackId = (key, packname) =>
  crypto.createHash('md5').update(`${key}:${packname}`).digest('hex');

module.exports = [

  // ── stickerpack ──────────────────────────────────────────────────────────
  {
    command: 'stickerpack',
    aliases: ['makepack', 'packsticker'],
    category: 'shadowutilities',
    description: 'Add a replied sticker/image to your personal pack. Usage: reply to sticker/image: .stickerpack [packname]',
    execute: async ({ sock, msg, chatId, senderNumber, args, reply }) => {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const quoted = ctx?.quotedMessage;
      const stickerMsg = quoted?.stickerMessage || msg.message?.stickerMessage;
      const imageMsg  = quoted?.imageMessage  || msg.message?.imageMessage;

      if (!stickerMsg && !imageMsg) {
        return reply(h.demonFail('reply to a *sticker* (or image) to add it to your pack'));
      }

      const db  = loadPackDB();
      const key = senderNumber || chatId;

      if (args.length) {
        db[key] = { packname: args.join(' '), author: 'Crittix MD' };
        savePackDB(db);
      }
      if (!db[key]) {
        db[key] = { packname: 'Crittix Pack', author: 'Crittix MD' };
        savePackDB(db);
      }

      const { packname, author } = db[key];
      // Stable pack ID — same user+packname always maps to the same WhatsApp tray group
      const packId = stablePackId(key, packname);

      await reply(`🎨 Adding to *${packname}* pack...`);

      try {
        let rawBuf;

        if (stickerMsg) {
          const stream = await downloadContentFromMessage(stickerMsg, 'sticker');
          rawBuf = await streamToBuffer(stream);
        } else {
          const stream = await downloadContentFromMessage(imageMsg, 'image');
          rawBuf = await streamToBuffer(stream);
          // Convert image → WebP first via writeExifImg, then read back
          const tmpPath = await exif.writeExifImg(rawBuf, { packname, author });
          rawBuf = fs.readFileSync(tmpPath);
          fs.unlinkSync(tmpPath);
          // rawBuf is now a proper WebP sticker — stamp the stable pack ID below
        }

        // Stamp consistent pack metadata so all stickers group in the same WA tray section
        const stickerBuf = await exif.addExif(rawBuf, packname, author, [''], {
          'sticker-pack-id': packId
        });

        await sock.sendMessage(chatId, { sticker: stickerBuf }, { quoted: msg });

        // Save to local collection so .stickerrandom can pick from it
        await crittixStickers.saveSticker(stickerBuf);

        reply(`✅ *Added to pack "${packname}"*\nAll stickers with this pack name appear together in your WA sticker tray ✨\n\nTip: *.stickerpack New Name* to rename your pack\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) {
        reply(h.demonFail(`sticker creation failed — ${e.message}`));
      }
    }
  },

  // ── stickersearch ────────────────────────────────────────────────────────
  {
    command: 'stickersearch',
    aliases: ['findsitcker', 'searchsticker'],
    category: 'shadowutilities',
    description: 'Search for a GIF/sticker by keyword. Usage: .stickersearch cat',
    execute: async ({ text, args, reply }) => {
      const query = text || args.join(' ');
      if (!query) return reply(h.demonError('.stickersearch', '.stickersearch <keyword>'));
      try {
        const { data } = await axios.get(
          `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=LIVDSRZULELA096&limit=5&media_filter=gif`,
          { timeout: 15000 }
        );
        const results = data?.results;
        if (!results?.length) return reply(h.demonFail(`no stickers/GIFs found for "${query}"`));
        const items = results.map((r, i) =>
          `${i + 1}. 🔗 ${r.media_formats?.gif?.url || r.url || ''}`
        ).join('\n');
        reply(
          `🔍 *STICKER SEARCH: ${query}*\n\n_GIF results — send the URL then use .sticker to convert:_\n\n${items}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      } catch (e) {
        reply(h.demonFail(`sticker search failed — ${e.message}`));
      }
    }
  },

  // ── stickerrandom ────────────────────────────────────────────────────────
  {
    command: 'stickerrandom',
    aliases: ['randomsticker', 'randstick'],
    category: 'shadowutilities',
    description: 'Send a random sticker from the bot\'s saved collection. Usage: .stickerrandom',
    execute: async ({ sock, chatId, msg, reply }) => {
      try {
        const result = crittixStickers.getRandomSticker();
        if (!result) {
          return reply(
            `📦 *No stickers in the collection yet!*\n\nUse *.stickerpack* (reply to any sticker) to start adding stickers to the bot's collection. Each one added becomes available for *.stickerrandom*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
          );
        }
        const buffer = fs.readFileSync(result.filepath);
        await sock.sendMessage(chatId, { sticker: buffer }, { quoted: msg });
      } catch (e) {
        reply(h.demonFail(`random sticker failed — ${e.message}`));
      }
    }
  },

  // ── stickeranimate ───────────────────────────────────────────────────────
  {
    command: 'stickeranimate',
    aliases: ['animatesticker', 'gifsticker'],
    category: 'shadowutilities',
    description: 'Convert a GIF/video reply to animated sticker. Usage: reply to GIF/video: .stickeranimate',
    execute: async ({ sock, msg, chatId, reply }) => {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const quoted = ctx?.quotedMessage;
      const media = quoted?.videoMessage || quoted?.imageMessage
                 || msg.message?.videoMessage || msg.message?.imageMessage;
      if (!media) return reply(h.demonFail('reply to a GIF or short video to animate it as a sticker'));
      await reply('🎨 converting to animated sticker...');
      try {
        const isVideo = !!(quoted?.videoMessage || msg.message?.videoMessage);
        const type = isVideo ? 'video' : 'image';
        const stream = await downloadContentFromMessage(media, type);
        const buffer = await streamToBuffer(stream);
        let stickerBuf;
        if (isVideo) {
          const p = await exif.writeExifVid(buffer, { packname: 'Crittix Animated', author: 'LORD DIVINE' });
          stickerBuf = fs.readFileSync(p); fs.unlinkSync(p);
        } else {
          const p = await exif.writeExifImg(buffer, { packname: 'Crittix Animated', author: 'LORD DIVINE' });
          stickerBuf = fs.readFileSync(p); fs.unlinkSync(p);
        }
        await sock.sendMessage(chatId, { sticker: stickerBuf }, { quoted: msg });
      } catch (e) {
        reply(h.demonFail(`animated sticker failed — ${e.message}`));
      }
    }
  },

  // ── stickerexport ────────────────────────────────────────────────────────
  {
    command: 'stickerexport',
    aliases: ['stickertoimg', 'extractsticker'],
    category: 'shadowutilities',
    description: 'Convert a sticker back to image. Usage: reply to sticker: .stickerexport',
    execute: async ({ sock, msg, chatId, reply }) => {
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const quoted = ctx?.quotedMessage;
      const stickerMsg = quoted?.stickerMessage || msg.message?.stickerMessage;
      if (!stickerMsg) return reply(h.demonFail('reply to a sticker to export it as an image'));
      await reply('🖼️ exporting sticker...');
      try {
        const Jimp = require('jimp');
        const stream = await downloadContentFromMessage(stickerMsg, 'sticker');
        const buffer = await streamToBuffer(stream);
        const jimg = await Jimp.read(buffer);
        const png = await jimg.getBufferAsync(Jimp.MIME_PNG);
        const tmpPath = path.join(process.cwd(), 'tmp', `sticker_export_${Date.now()}.png`);
        fs.ensureDirSync(path.dirname(tmpPath));
        fs.writeFileSync(tmpPath, png);
        await sock.sendMessage(chatId,
          { image: { url: tmpPath }, caption: `🖼️ *Sticker Exported*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_` },
          { quoted: msg }
        );
        fs.removeSync(tmpPath);
      } catch (e) {
        reply(h.demonFail(`sticker export failed — ${e.message}`));
      }
    }
  },

  // ── packinfo ─────────────────────────────────────────────────────────────
  {
    command: 'packinfo',
    aliases: ['mypack', 'packname'],
    category: 'shadowutilities',
    description: 'Show your current sticker pack name. Usage: .packinfo',
    execute: async ({ senderNumber, chatId, reply }) => {
      const db   = loadPackDB();
      const key  = senderNumber || chatId;
      const info = db[key];
      const stats = crittixStickers.getStickerStats();
      if (!info) {
        return reply(
          `📦 *No pack set yet*\n\nUse *.stickerpack <name>* (reply to a sticker) to create your pack.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
        );
      }
      reply(
        `╔════════════════▣\n┊✺┌────     ──⊷\n╠✤│ 📦 *YOUR STICKER PACK*\n╠✤│\n╠✤│ 🏷️ *Name:* ${info.packname}\n╠✤│ ✍️ *Author:* ${info.author}\n╠✤│ 🎴 *Bot collection:* ${stats.totalStickers} sticker(s)\n┊✺└────••••────⊷\n╚════════════════▣\n\nTip: reply to sticker + *.stickerpack* to add to your pack\nTo rename: *.stickerpack New Name*\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  }

];
