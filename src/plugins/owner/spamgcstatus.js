/*
 * SPAMGCSTATUS.JS — Crittix-MD
 * Created by: LORD DEVINE
 *
 * Works from anywhere (DM, group, anywhere).
 * Reply to any message/media + .spamgcstatus [N]
 * → Posts that content as group status to EVERY group the bot is in, N times each.
 * Default N = 1. Max N = 100.
 */
'use strict';

const { downloadContentFromMessage, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


const genId = () => '3EB0' + Math.random().toString(36).slice(2, 13) + Math.random().toString(36).slice(2, 13);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

module.exports = {
  command: 'spamgcstatus',
  aliases: ['gcstatusspam', 'spamgst', 'statusspam', 'spamstatus'],
  category: 'forbiddenarts',
  description: 'Post replied media/text as group status to all groups. .spamgcstatus [N]',
  ownerOnly: true,

  execute: async ({ sock, msg, args, reply }) => {

    // ── Parse count + optional caption ──────────────────
    const numArg  = parseInt(args[0]) || 0;
    const times   = numArg > 0 ? Math.min(Math.max(numArg, 1), 100) : 1;
    const caption = (numArg > 0 ? args.slice(1) : args).join(' ').trim();

    // ── Quoted message ───────────────────────────────────
    const ctx       = msg.message?.extendedTextMessage?.contextInfo
                   || msg.message?.imageMessage?.contextInfo
                   || msg.message?.videoMessage?.contextInfo
                   || null;
    const quoted    = ctx?.quotedMessage || null;

    const imageMsg  = quoted?.imageMessage  || null;
    const videoMsg  = quoted?.videoMessage  || null;
    const audioMsg  = quoted?.audioMessage  || null;
    const hasMedia  = Boolean(imageMsg || videoMsg || audioMsg);
    const quotedTxt = quoted?.conversation || quoted?.extendedTextMessage?.text || '';
    const finalText = caption || quotedTxt;

    if (!quoted && !finalText) {
      return reply(
        `❌ *Nothing to post.*\n\n` +
        `Reply to a message or media with *.spamgcstatus [count]*\n\n` +
        `*Examples:*\n` +
        `• *.spamgcstatus* — sends once per group\n` +
        `• *.spamgcstatus 10* — sends 10× per group\n` +
        `• *.spamgcstatus 3 check this* — sends text 3× per group`
      );
    }

    // ── Fetch all groups ─────────────────────────────────
    let groups, groupIds;
    try {
      groups   = await sock.groupFetchAllParticipating();
      groupIds = Object.keys(groups);
    } catch (e) {
      return reply(p.phrases.error('failed to fetch groups. ' + e.message));
    }

    if (!groupIds.length) return reply(p.phrases.error('Bot is not in any groups.'));

    await reply(
      `🚀 *Spam GC Status Starting*\n` +
      `📦 Groups: *${groupIds.length}*\n` +
      `🔁 Times each: *${times}*\n` +
      `📊 Total sends: *${groupIds.length * times}*\n\n` +
      `_This may take a while — sit tight_ 💀`
    );

    // ── Download & prepare media ONCE ───────────────────
    let preparedMedia = null;

    if (hasMedia) {
      try {
        let stream, mediaType;
        if      (imageMsg) { stream = await downloadContentFromMessage(imageMsg, 'image'); mediaType = 'image'; }
        else if (videoMsg) { stream = await downloadContentFromMessage(videoMsg, 'video'); mediaType = 'video'; }
        else if (audioMsg) { stream = await downloadContentFromMessage(audioMsg, 'audio'); mediaType = 'audio'; }

        let buf = Buffer.alloc(0);
        for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
        if (!buf.length) return reply('❌ Failed to download media.');

        const mediaInput = mediaType === 'image' ? { image: buf }
                         : mediaType === 'video' ? { video: buf }
                         : { audio: buf };

        preparedMedia = await prepareWAMessageMedia(mediaInput, { upload: sock.waUploadToServer });

        // Attach caption to media if given
        if (finalText) {
          if (mediaType === 'image' && preparedMedia.imageMessage) preparedMedia.imageMessage.caption = finalText;
          if (mediaType === 'video' && preparedMedia.videoMessage) preparedMedia.videoMessage.caption = finalText;
        }
      } catch (e) {
        return reply(p.phrases.error('media prep failed. ' + e.message));
      }
    }

    // ── Build text-only WA payload ───────────────────────
    const textPayload = {
      groupStatusMessageV2: {
        message: {
          extendedTextMessage: {
            text: finalText,
            backgroundArgb: 0xFF000000,
            textArgb: 0xFFFFFFFF,
            font: 1,
            contextInfo: { mentionedJid: [], isGroupStatus: true }
          }
        }
      }
    };

    const mediaPayload = preparedMedia
      ? { groupStatusMessageV2: { message: preparedMedia } }
      : null;

    // ── Fire ─────────────────────────────────────────────
    let successGroups = 0, failGroups = 0, totalSent = 0, totalFailed = 0;

    for (const gid of groupIds) {
      let groupHadError = false;

      for (let i = 0; i < times; i++) {
        try {
          await sock.relayMessage(gid, mediaPayload || textPayload, { messageId: genId() });
          totalSent++;
        } catch (_) {
          groupHadError = true;
          totalFailed++;
        }
        // Space out sends to avoid WA rate-limiting
        await sleep(700);
      }

      if (groupHadError) failGroups++; else successGroups++;
      // Small pause between groups
      await sleep(300);
    }

    return reply(
      `╔═══════════════════════════════╗\n` +
      `║ ✅ 𝐒𝐏𝐀𝐌 𝐆𝐂 𝐒𝐓𝐀𝐓𝐔𝐒 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄\n` +
      `╚═══════════════════════════════╝\n\n` +
      `📦 Groups targeted: *${groupIds.length}*\n` +
      `✅ Fully succeeded: *${successGroups}*\n` +
      `⚠️  Had errors: *${failGroups}*\n` +
      `📨 Total posted: *${totalSent}*\n` +
      `❌ Total failed: *${totalFailed}*\n\n` +
      `💀 _Forbidden arts executed_ 🩸`
    );
  }
};
