/*
 * ============================================
 * CRITTIX-STICKERS.JS - Sticker Management
 * Created by: 𝐋 𝐎 𝐑 𝐃 ♰ 𝔻 𝐄 𝐕 𝐈 𝐍 𝐄
 * ============================================
 */

const fs = require('fs-extra');
const path = require('path');

const STICKER_DIR = path.join(__dirname, '..', 'stickers', 'crittix');

// ============================================
// INITIALIZATION
// ============================================

/**
 * Ensure sticker directory exists
 */
const ensureStickerDir = () => {
  try {
    fs.ensureDirSync(STICKER_DIR);
    return true;
  } catch (err) {
    console.error('⚠️ Failed to create sticker directory:', err);
    return false;
  }
};

// ============================================
// SAVE STICKER
// ============================================

/**
 * Save a sticker to the pack
 * @param {Buffer} stickerBuffer - The sticker file buffer
 * @returns {Object} - Result with success status and sticker number
 */
const saveSticker = async (stickerBuffer) => {
  try {
    ensureStickerDir();
    
    // Get list of existing stickers
    const files = fs.readdirSync(STICKER_DIR)
      .filter(f => f.endsWith('.webp'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
      });
    
    // Get next sticker number
    const nextNum = files.length > 0 
      ? parseInt(files[files.length - 1].match(/\d+/)[0]) + 1 
      : 1;
    
    const filename = `sticker_${nextNum}.webp`;
    const filepath = path.join(STICKER_DIR, filename);
    
    // Save the sticker
    fs.writeFileSync(filepath, stickerBuffer);
    
    return {
      success: true,
      stickerNumber: nextNum,
      totalStickers: files.length + 1,
      filename
    };
  } catch (err) {
    console.error('⚠️ Failed to save sticker:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

// ============================================
// GET RANDOM STICKER
// ============================================

/**
 * Get a random sticker from the pack
 * @returns {Object|null} - Sticker filepath or null if none available
 */
const getRandomSticker = () => {
  try {
    ensureStickerDir();
    
    const files = fs.readdirSync(STICKER_DIR)
      .filter(f => f.endsWith('.webp'));
    
    if (files.length === 0) {
      return null;
    }
    
    // Pick random sticker
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const filepath = path.join(STICKER_DIR, randomFile);
    
    return {
      filepath,
      filename: randomFile,
      totalStickers: files.length
    };
  } catch (err) {
    console.error('⚠️ Failed to get random sticker:', err);
    return null;
  }
};

// ============================================
// STICKER STATS
// ============================================

/**
 * Get sticker pack statistics
 * @returns {Object} - Stats about saved stickers
 */
const getStickerStats = () => {
  try {
    ensureStickerDir();
    
    const files = fs.readdirSync(STICKER_DIR)
      .filter(f => f.endsWith('.webp'));
    
    let totalSize = 0;
    files.forEach(file => {
      const stats = fs.statSync(path.join(STICKER_DIR, file));
      totalSize += stats.size;
    });
    
    return {
      totalStickers: files.length,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      directory: STICKER_DIR
    };
  } catch (err) {
    console.error('⚠️ Failed to get sticker stats:', err);
    return {
      totalStickers: 0,
      totalSizeMB: '0.00',
      directory: STICKER_DIR
    };
  }
};

// ============================================
// CLEAR ALL STICKERS
// ============================================

/**
 * Delete all saved stickers (use with caution!)
 * @returns {Object} - Result with success status
 */
const clearAllStickers = () => {
  try {
    if (!fs.existsSync(STICKER_DIR)) {
      return { success: true, deleted: 0 };
    }
    
    const files = fs.readdirSync(STICKER_DIR)
      .filter(f => f.endsWith('.webp'));
    
    let deleted = 0;
    files.forEach(file => {
      fs.unlinkSync(path.join(STICKER_DIR, file));
      deleted++;
    });
    
    return {
      success: true,
      deleted
    };
  } catch (err) {
    console.error('⚠️ Failed to clear stickers:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

// ============================================
// SHOULD SEND STICKER (50% CHANCE)
// ============================================

/**
 * Determines if a sticker should be sent (50% random chance)
 * @returns {boolean}
 */
const shouldSendSticker = () => {
  return Math.random() < 0.5; // 50% chance
};

module.exports = {
  ensureStickerDir,
  saveSticker,
  getRandomSticker,
  getStickerStats,
  clearAllStickers,
  shouldSendSticker
};