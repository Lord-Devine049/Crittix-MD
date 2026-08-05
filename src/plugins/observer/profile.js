/*
 * PROFILE.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Generates a profile card image using @napi-rs/canvas
 */

const { createCanvas, loadImage } = require('canvas');
const { registerFont: _rf } = require('canvas'); const GlobalFonts = { registerFromPath: (p, n) => { try { _rf(p, { family: n }); } catch(e){} } };
const path        = require('path');
const globalXP    = require('../../lib/global-xp');
const crittixAura = require('../../lib/crittix-aura');
const vault       = require('../../lib/vault');
const crittixAura2 = require('../../lib/crittix-aura');

// ── Color palette (from the reference image) ──────
const COLORS = {
  bg:         '#0e0e0e',      // near black
  bgCard:     '#161616',      // card inner
  border:     '#8b0000',      // deep blood red
  accent:     '#c0392b',      // crimson red
  accentSoft: '#7f1d1d',      // muted red
  text:       '#e8e8e8',      // off-white
  textDim:    '#888888',      // grey
  textMuted:  '#444444',      // dark grey
  bar:        '#2a0a0a',      // bar background
  barFill:    '#c0392b',      // bar fill red
};

const W = 800;
const H = 440;

// ── Rounded rect helper ────────────────────────────
const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
};

// ── Draw progress bar ──────────────────────────────
const drawBar = (ctx, x, y, w, h, pct, label, value) => {
  // label
  ctx.fillStyle = COLORS.textDim;
  ctx.font = '13px sans-serif';
  ctx.fillText(label, x, y - 6);

  // background
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = COLORS.bar;
  ctx.fill();

  // fill
  const fillW = Math.max(h, (pct / 100) * w);
  roundRect(ctx, x, y, fillW, h, h / 2);
  ctx.fillStyle = COLORS.barFill;
  ctx.fill();

  // value text
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(value, x + w, y - 6);
  ctx.textAlign = 'left';
};

// ── Stat row ───────────────────────────────────────
const drawStat = (ctx, x, y, emoji, label, value) => {
  ctx.font = '15px sans-serif';
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText(`${emoji}  ${label}`, x, y);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(value, x + 280, y);
  ctx.textAlign = 'left';
};

module.exports = {
  command: ['profile', 'card'],
  category: 'groupanalytics',
  description: 'View your profile card',
  execute: async ({ sock, msg, sender, senderNumber, chatId, reply }) => {
    try {
      // ── Gather data ──
      const xpData   = globalXP.getUserXP(sender);
      const auraData = crittixAura.getUserAura(sender);
      const vaultBal = (() => { try { return vault.getBalance(sender); } catch (_) { return { balance: 0, level: 1 }; } })();
      const { rank: xpRank, total: xpTotal } = xpData ? globalXP.getUserRank(sender) : { rank: '?', total: '?' };

      const xp     = xpData?.xp    || 0;
      const games  = xpData?.games || 0;
      const aura   = auraData?.aura || 0;
      const auraRankInfo = crittixAura.getRank(aura);
      const coins  = vaultBal?.balance || 0;
      const level  = vaultBal?.level   || 1;
      const name   = msg.pushName || senderNumber;

      // ── Canvas ──────────────────────────────────
      const canvas = createCanvas(W, H);
      const ctx    = canvas.getContext('2d');

      // Background
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, W, H);

      // Red top bar
      ctx.fillStyle = COLORS.accent;
      ctx.fillRect(0, 0, W, 5);

      // Card body
      roundRect(ctx, 20, 20, W - 40, H - 40, 16);
      ctx.fillStyle = COLORS.bgCard;
      ctx.fill();

      // Red left accent bar
      ctx.fillStyle = COLORS.accent;
      ctx.fillRect(20, 20, 4, H - 40);

      // ── Avatar circle (left) ─────────────────────
      const AX = 90, AY = H / 2, AR = 56;
      ctx.save();
      ctx.beginPath();
      ctx.arc(AX, AY, AR, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.accent;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Try to load profile picture
      let ppUrl = null;
      try { ppUrl = await sock.profilePictureUrl(sender, 'image'); } catch (_) {}

      if (ppUrl) {
        try {
          const img = await loadImage(ppUrl);
          ctx.clip();
          ctx.drawImage(img, AX - AR, AY - AR, AR * 2, AR * 2);
        } catch (_) {
          ctx.fillStyle = COLORS.accentSoft;
          ctx.fill();
        }
      } else {
        ctx.fillStyle = COLORS.accentSoft;
        ctx.fill();
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name[0]?.toUpperCase() || '?', AX, AY);
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';
      }
      ctx.restore();

      // ── Name & number ────────────────────────────
      const TX = 170;
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(name.length > 18 ? name.slice(0, 18) + '…' : name, TX, 80);

      ctx.fillStyle = COLORS.textDim;
      ctx.font = '14px sans-serif';
      ctx.fillText(`@${senderNumber}`, TX, 102);

      // Global XP rank badge
      ctx.fillStyle = COLORS.accent;
      roundRect(ctx, TX, 112, 130, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`🌍 Rank #${xpRank} of ${xpTotal}`, TX + 8, 130);

      // Aura rank badge
      ctx.fillStyle = COLORS.accentSoft;
      roundRect(ctx, TX + 140, 112, 130, 26, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '13px sans-serif';
      ctx.fillText(`${auraRankInfo.title}`, TX + 148, 130);

      // ── Divider ──────────────────────────────────
      ctx.strokeStyle = COLORS.accentSoft;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 158);
      ctx.lineTo(W - 40, 158);
      ctx.stroke();

      // ── Stats (left column) ──────────────────────
      const SX = 50, SY = 185, SG = 32;
      drawStat(ctx, SX, SY,        '⚡', 'Global XP',   `${xp} XP`);
      drawStat(ctx, SX, SY + SG,   '🎮', 'Games Played', `${games}`);
      drawStat(ctx, SX, SY + SG*2, '🪙', 'Vault Balance', `${coins.toLocaleString()}`);
      drawStat(ctx, SX, SY + SG*3, '⭐', 'Vault Level',   `Lv${level}`);

      // ── Stats (right column) ─────────────────────
      const RX = 410;
      drawStat(ctx, RX, SY,        '🔮', 'Aura',          `${aura}`);
      drawStat(ctx, RX, SY + SG,   '🏆', 'Aura Rank',     auraRankInfo.title);
      drawStat(ctx, RX, SY + SG*2, '📊', 'Aura Progress', `${auraRankInfo.progress}%`);
      drawStat(ctx, RX, SY + SG*3, '🌍', 'XP Rank',       `#${xpRank}`);

      // ── Aura progress bar ────────────────────────
      drawBar(ctx, 50, 330, W - 100, 14, auraRankInfo.progress,
        'Aura Progress', `${aura} → ${auraRankInfo.nextRank || 'MAX'}`);

      // ── XP progress hint ─────────────────────────
      ctx.fillStyle = COLORS.textMuted;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('𝐂𝐑𝐈𝐓𝐓𝐈𝐗 𝐌𝐃 • LORD DEVINE', W / 2, H - 26);
      ctx.textAlign = 'left';

      // ── Bottom red bar ───────────────────────────
      ctx.fillStyle = COLORS.accent;
      ctx.fillRect(0, H - 5, W, 5);

      // ── Send ─────────────────────────────────────
      const buf = canvas.toBuffer('image/png');
      await sock.sendMessage(chatId, { image: buf, caption: `⚡ *${name}'s Profile*` }, { quoted: msg });

    } catch (e) {
      console.error('[PROFILE]', e.message);
      reply('failed to generate profile card — ' + e.message);
    }
  }
};
