/*
 * TOURL.JS - Crittix-MD
 * Upload replied media to litterbox.catbox.moe (72h link) using native fetch
 */
const h = require('../../lib/helpers');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const p = require('../../lib/phrases');


const MIME_EXT = [
  [/image\/png/,               'png'],
  [/image\/gif/,               'gif'],
  [/image\/webp/,              'webp'],
  [/image\//,                  'jpg'],
  [/video\/mp4/,               'mp4'],
  [/video\//,                  'mp4'],
  [/audio\/ogg|audio\/opus/,   'ogg'],
  [/audio\/mpeg|audio\/mp3/,   'mp3'],
  [/audio\//,                  'mp3'],
];

const MEDIA_MAP = {
  imageMessage:    { dlType: 'image',    ext: 'jpg',  mime: 'image/jpeg' },
  videoMessage:    { dlType: 'video',    ext: 'mp4',  mime: 'video/mp4'  },
  audioMessage:    { dlType: 'audio',    ext: 'mp3',  mime: 'audio/mpeg' },
  stickerMessage:  { dlType: 'sticker',  ext: 'webp', mime: 'image/webp' },
  documentMessage: { dlType: 'document', ext: 'bin',  mime: 'application/octet-stream' },
};

function resolveExt(mimetype, fallbackExt) {
  if (mimetype) {
    for (const [rx, ext] of MIME_EXT) {
      if (rx.test(mimetype)) return ext;
    }
  }
  return fallbackExt;
}

async function uploadToLitterbox(buf, ext, mime) {
  const fd = new FormData();
  fd.append('reqtype', 'fileupload');
  fd.append('time', '72h');
  fd.append('fileToUpload', new Blob([buf], { type: mime }), `file.${ext}`);

  const res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
    method: 'POST',
    body: fd,
    signal: AbortSignal.timeout(60000)
  });

  const text = (await res.text()).trim();
  if (!res.ok) throw new Error(`Litterbox returned ${res.status}: ${text.slice(0, 100)}`);
  if (!text.startsWith('https://')) throw new Error(`Unexpected response: ${text.slice(0, 100)}`);
  return text;
}

module.exports = {
  command: ['tourl', 'url', 'uploadmedia'],
  category: 'soultools',
  description: 'Upload replied image/video/audio/sticker to catbox and get a public URL',
  execute: async ({ sock, msg, chatId, reply }) => {

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg)
      return reply(p.phrases.wrongUsage('reply to an image video audio or sticker to upload it and get a url.'));

    let mediaKey = null;
    for (const key of Object.keys(MEDIA_MAP)) {
      if (quotedMsg[key]) { mediaKey = key; break; }
    }
    if (!mediaKey)
      return reply(p.phrases.wrongUsage('the message you replied to has no supported media. try an image video audio or sticker.'));

    const { dlType, ext: defaultExt, mime: defaultMime } = MEDIA_MAP[mediaKey];
    const mediaDef = quotedMsg[mediaKey];
    const ext  = resolveExt(mediaDef.mimetype, defaultExt);
    const mime = mediaDef.mimetype || defaultMime;

    await sock.sendMessage(chatId, { react: { text: '⏳', key: msg.key } }).catch(() => {});

    try {
      const stream = await downloadContentFromMessage(mediaDef, dlType);
      let buf = Buffer.from([]);
      for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);

      if (!buf || buf.length === 0)
        return reply(p.phrases.error('Failed to download the media. It may have expired.'));

      await reply('⏳ *Uploading to catbox...*');

      const url = await uploadToLitterbox(buf, ext, mime);

      await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } }).catch(() => {});
      await reply(
        `✅ *Uploaded successfully!*\n\n` +
        `🔗 *URL:* ${url}\n\n` +
        `📦 *Size:* ${(buf.length / 1024).toFixed(1)} KB\n` +
        `🗂️ *Type:* ${ext.toUpperCase()} • ⏰ *Expires:* 72 hours\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    } catch (e) {
      await sock.sendMessage(chatId, { react: { text: '❌', key: msg.key } }).catch(() => {});
      reply(p.phrases.error('upload failed. ' + e.message.slice(0, 200)));
    }
  }
};
