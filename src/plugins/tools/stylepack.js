/*
 * STYLEPACK.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: neonlight, neontext, pubgtext, pubglogo, valorant, codtext, amongus, angeltext,
 *           galaxywallpaper, glittertext, watercolortext, metaltext, woodtext, sketchtext,
 *           hackertext, scifitext, gamingtext, matrixtext, logomaker, papercutstyle,
 *           graffititext, tattootext, signtext, lighttext, sandtext, typography
 * Built natively with @napi-rs/canvas + sharp — no headless browser, no scraping
 */
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');

const renderStyle = async (text, preset) => {
  const { createCanvas } = require('canvas');
const { registerFont: _rf } = require('canvas'); const GlobalFonts = { registerFromPath: (p, n) => { try { _rf(p, { family: n }); } catch(e){} } };
const p = require('../../lib/phrases');

  

  const W = preset.width || 800;
  const H = preset.height || 220;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background
  if (preset.bgGradient) {
    const g = ctx.createLinearGradient(0, 0, preset.bgGradient.horizontal ? W : 0, H);
    preset.bgGradient.stops.forEach(([pos, col]) => g.addColorStop(pos, col));
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = preset.bg || '#000000';
  }
  ctx.fillRect(0, 0, W, H);

  // Optional grid/pattern overlay
  if (preset.grid) {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }

  // Optional scanlines
  if (preset.scanlines) {
    for (let y = 0; y < H; y += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, y, W, 2);
    }
  }

  const fontSize = Math.max(28, Math.min(preset.maxFontSize || 80, Math.floor(W * 0.14 / Math.max(1, text.length / 8))));
  ctx.font = `${preset.fontStyle || 'bold'} ${fontSize}px ${preset.font || 'Arial'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cx = W / 2, cy = H / 2;

  // Shadow / glow layers
  if (preset.glowColor) {
    ctx.shadowBlur = preset.glowBlur || 20;
    ctx.shadowColor = preset.glowColor;
    // draw multiple glow passes
    for (let i = 0; i < (preset.glowPasses || 3); i++) {
      ctx.fillStyle = preset.glowColor;
      ctx.fillText(text, cx, cy);
    }
    ctx.shadowBlur = 0;
  }

  // Outline
  if (preset.stroke) {
    ctx.strokeStyle = preset.stroke;
    ctx.lineWidth = preset.strokeWidth || 3;
    ctx.strokeText(text, cx, cy);
  }

  // Main text fill
  if (preset.textGradient) {
    const tg = ctx.createLinearGradient(cx - fontSize * text.length / 2, 0, cx + fontSize * text.length / 2, H);
    preset.textGradient.forEach(([pos, col]) => tg.addColorStop(pos, col));
    ctx.fillStyle = tg;
  } else {
    ctx.fillStyle = preset.color || '#ffffff';
  }
  ctx.fillText(text, cx, cy);

  // Glitter dots
  if (preset.glitter) {
    for (let i = 0; i < 80; i++) {
      const gx = Math.random() * W, gy = Math.random() * H;
      const gr = Math.random() * 2.5 + 0.5;
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fillStyle = ['#fff', '#ffd700', '#00ffff', '#ff69b4', '#7fff00'][Math.floor(Math.random() * 5)];
      ctx.fill();
    }
  }

  // Watercolor blotch overlay
  if (preset.watercolor) {
    const wColors = ['rgba(255,100,100,0.08)', 'rgba(100,100,255,0.08)', 'rgba(100,255,100,0.06)'];
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 80 + 30, 0, Math.PI * 2);
      ctx.fillStyle = wColors[Math.floor(Math.random() * wColors.length)];
      ctx.fill();
    }
  }

  // Branding
  ctx.font = '11px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.textAlign = 'right';
  ctx.fillText('𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗', W - 10, H - 10);

  return canvas.toBuffer('image/png');
};

const presets = {
  neonlight: {
    bg: '#0a0a0a', glowColor: '#00ffff', glowBlur: 30, glowPasses: 4,
    color: '#e0ffff', stroke: '#00ffff', strokeWidth: 1,
    caption: '💡 *NEON LIGHT*', maxFontSize: 90
  },
  neontext: {
    bgGradient: { stops: [[0,'#0d0d1a'],[1,'#1a0d2e']], horizontal: false },
    glowColor: '#ff00ff', glowBlur: 25, glowPasses: 3,
    color: '#ffb3ff', stroke: '#ff00ff', strokeWidth: 1,
    caption: '🌈 *NEON TEXT*', maxFontSize: 88
  },
  pubgtext: {
    bgGradient: { stops: [[0,'#1a0d00'],[0.5,'#3d1c00'],[1,'#0d0900']], horizontal: true },
    color: '#f5a623', stroke: '#ff8c00', strokeWidth: 2,
    glowColor: '#ff6600', glowBlur: 15, glowPasses: 2,
    fontStyle: 'bold', grid: true,
    caption: '🔫 *PUBG TEXT*', maxFontSize: 82
  },
  pubglogo: {
    bg: '#0f0a00', width: 800, height: 260,
    textGradient: [[0,'#ffd700'],[0.5,'#ff8c00'],[1,'#ffd700']],
    stroke: '#ff6600', strokeWidth: 3,
    glowColor: '#ff8800', glowBlur: 20, glowPasses: 2,
    fontStyle: 'bold', grid: true,
    caption: '🏆 *PUBG LOGO*', maxFontSize: 100
  },
  valorant: {
    bg: '#0f0000', glowColor: '#ff4655', glowBlur: 20, glowPasses: 3,
    textGradient: [[0,'#ff4655'],[0.5,'#ffffff'],[1,'#ff4655']],
    stroke: '#ff4655', strokeWidth: 2, grid: true,
    caption: '⚔️ *VALORANT STYLE*', maxFontSize: 90
  },
  codtext: {
    bgGradient: { stops: [[0,'#0a0a0a'],[1,'#1a1a1a']], horizontal: false },
    color: '#33ff33', stroke: '#1aff1a', strokeWidth: 1,
    glowColor: '#00ff00', glowBlur: 12, glowPasses: 2, scanlines: true,
    fontStyle: 'bold', caption: '🎮 *COD TEXT*', maxFontSize: 80
  },
  amongus: {
    bgGradient: { stops: [[0,'#1a0533'],[1,'#0d021a']], horizontal: false },
    textGradient: [[0,'#ff3cac'],[0.5,'#784ba0'],[1,'#2b86c5']],
    glowColor: '#ff3cac', glowBlur: 18, glowPasses: 2,
    stroke: '#ff3cac', strokeWidth: 1,
    caption: '🔴 *AMONG US STYLE*', maxFontSize: 80
  },
  angeltext: {
    bgGradient: { stops: [[0,'#fff5f5'],[1,'#ffe0f0']], horizontal: false },
    textGradient: [[0,'#ff69b4'],[0.5,'#ffb6c1'],[1,'#ff69b4']],
    glowColor: '#ffb6c1', glowBlur: 15, glowPasses: 2,
    stroke: '#ff69b4', strokeWidth: 1,
    caption: '👼 *ANGEL TEXT*', maxFontSize: 82
  },
  glittertext: {
    bg: '#1a001a',
    textGradient: [[0,'#ffd700'],[0.3,'#ff69b4'],[0.6,'#00ffff'],[1,'#ffd700']],
    glowColor: '#ffd700', glowBlur: 10, glowPasses: 2, glitter: true,
    caption: '✨ *GLITTER TEXT*', maxFontSize: 85
  },
  metaltext: {
    bg: '#1a1a1a',
    textGradient: [[0,'#b8b8b8'],[0.3,'#ffffff'],[0.5,'#c0c0c0'],[0.7,'#ffffff'],[1,'#b8b8b8']],
    stroke: '#888888', strokeWidth: 2,
    glowColor: '#ffffff', glowBlur: 8, glowPasses: 1,
    fontStyle: 'bold', caption: '⚙️ *METAL TEXT*', maxFontSize: 88
  },
  woodtext: {
    bgGradient: { stops: [[0,'#3d2000'],[1,'#5c3500']], horizontal: true },
    textGradient: [[0,'#c68642'],[0.5,'#deb887'],[1,'#c68642']],
    stroke: '#8b4513', strokeWidth: 2,
    caption: '🪵 *WOOD TEXT*', maxFontSize: 85
  },
  sketchtext: {
    bg: '#fffef0',
    color: '#2c2c2c', stroke: '#444444', strokeWidth: 2,
    fontStyle: 'bold', caption: '✏️ *SKETCH TEXT*', maxFontSize: 85
  },
  hackertext: {
    bg: '#000000', color: '#00ff00',
    glowColor: '#00ff00', glowBlur: 8, glowPasses: 2,
    scanlines: true, grid: true,
    fontStyle: 'bold', caption: '💻 *HACKER TEXT*', maxFontSize: 80
  },
  scifitext: {
    bgGradient: { stops: [[0,'#000022'],[1,'#001133']], horizontal: false },
    textGradient: [[0,'#00d4ff'],[0.5,'#0080ff'],[1,'#00d4ff']],
    glowColor: '#00aaff', glowBlur: 20, glowPasses: 3, grid: true,
    stroke: '#00d4ff', strokeWidth: 1,
    caption: '🚀 *SCI-FI TEXT*', maxFontSize: 82
  },
  gamingtext: {
    bgGradient: { stops: [[0,'#0d001a'],[1,'#1a000d']], horizontal: true },
    textGradient: [[0,'#ff0080'],[0.5,'#7700ff'],[1,'#ff0080']],
    glowColor: '#ff0080', glowBlur: 18, glowPasses: 3,
    stroke: '#7700ff', strokeWidth: 2,
    caption: '🎮 *GAMING TEXT*', maxFontSize: 85
  },
  matrixtext: {
    bg: '#000000', color: '#00ff41',
    glowColor: '#00ff41', glowBlur: 10, glowPasses: 3,
    scanlines: true, fontStyle: 'bold',
    caption: '🟩 *MATRIX TEXT*', maxFontSize: 82
  },
  graffititext: {
    bgGradient: { stops: [[0,'#1c1c1c'],[1,'#2d2d2d']], horizontal: false },
    textGradient: [[0,'#ff6b35'],[0.3,'#f7c59f'],[0.6,'#efefd0'],[1,'#004e89']],
    stroke: '#ffffff', strokeWidth: 3,
    glowColor: '#ff6b35', glowBlur: 8, glowPasses: 1,
    caption: '🎨 *GRAFFITI TEXT*', maxFontSize: 88
  },
  tattootext: {
    bg: '#0a0a0a',
    textGradient: [[0,'#555555'],[0.3,'#cccccc'],[0.7,'#555555'],[1,'#cccccc']],
    stroke: '#ffffff', strokeWidth: 1,
    fontStyle: 'bold italic', caption: '⚜️ *TATTOO TEXT*', maxFontSize: 82
  },
  signtext: {
    bgGradient: { stops: [[0,'#003366'],[1,'#005599']], horizontal: false },
    color: '#ffffff', stroke: '#ffcc00', strokeWidth: 3,
    glowColor: '#ffcc00', glowBlur: 12, glowPasses: 2,
    caption: '🪧 *SIGN TEXT*', maxFontSize: 85
  },
  lighttext: {
    bg: '#f0f8ff',
    textGradient: [[0,'#ffd700'],[0.5,'#fff9c4'],[1,'#ffd700']],
    glowColor: '#ffd700', glowBlur: 25, glowPasses: 4,
    stroke: '#ffa500', strokeWidth: 1,
    caption: '💡 *LIGHT TEXT*', maxFontSize: 85
  },
  sandtext: {
    bgGradient: { stops: [[0,'#c4a35a'],[1,'#8b6914']], horizontal: false },
    textGradient: [[0,'#ffe4b5'],[0.5,'#ffdead'],[1,'#deb887']],
    stroke: '#8b4513', strokeWidth: 2,
    caption: '🏖️ *SAND TEXT*', maxFontSize: 82
  },
  typography: {
    bg: '#fafafa',
    textGradient: [[0,'#2c3e50'],[0.5,'#3498db'],[1,'#2c3e50']],
    stroke: '#2c3e50', strokeWidth: 1,
    fontStyle: 'bold', caption: '🖋️ *TYPOGRAPHY*', maxFontSize: 90
  }
};

const cmdList = Object.keys(presets);

module.exports = {
  command: cmdList,
  aliases: [],
  category: 'creativetools',
  description: 'Generate styled text images natively with canvas. Usage: .<style> <your text>',
  execute: async ({ sock, msg, chatId, args, text, command, reply }) => {
    const cmd = (command || cmdList[0]).toLowerCase();
    const inputText = text || args.join(' ');
    if (!inputText) return reply(p.phrases.wrongUsage(`type your text after the command. example! .${cmd} crittix md`));
    const preset = presets[cmd];
    if (!preset) return reply(p.phrases.notFound(`unknown style "${cmd}".`));
    try {
      await reply(`🎨 *Generating ${preset.caption.replace(/[*]/g, '')} ...*`);
      const buf = await renderStyle(inputText.substring(0, 40), preset);
      const tmpPath = path.join(process.cwd(), 'tmp', `style_${Date.now()}.png`);
      fs.ensureDirSync(path.dirname(tmpPath));
      fs.writeFileSync(tmpPath, buf);
      await sock.sendMessage(chatId, {
        image: { url: tmpPath },
        caption: `${preset.caption}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      }, { quoted: msg });
      fs.removeSync(tmpPath);
    } catch (e) {
      reply(p.phrases.error(`Style render failed: ${e.message}`));
    }
  }
};
