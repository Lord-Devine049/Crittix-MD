 /*
 * ============================================
 * CRITTIX-DB.JS - Crittix Status Management
 * Created by: 𝐋 𝐎 𝐑 𝐃 ♰ 𝔻 𝐄 𝐕 𝐈 𝐍 𝐄
 * ============================================
 */

const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'crittix-status.json');

// ============================================
// DATABASE FUNCTIONS
// ============================================
const loadStatusData = () => {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
    return {};
  } catch (e) {
    console.error('⚠️ Error loading crittix status:', e);
    return {};
  }
};

const saveStatusData = (data) => {
  try {
    fs.ensureDirSync(path.dirname(DB_PATH));
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('⚠️ Error saving crittix status:', e);
  }
};

// ============================================
// STATUS FUNCTIONS
// ============================================

/**
 * Set Crittix status GLOBALLY for an owner (all chats)
 * @param {string} ownerNumber - Bot owner's number
 * @param {boolean} enabled - true = ON, false = OFF
 */
const setCrittixStatus = (ownerNumber, enabled) => {
  const data = loadStatusData();
  
  // Store as owner-level setting (not per-chat)
  data[ownerNumber] = {
    ownerNumber,
    enabled,
    updatedAt: Date.now()
  };
  
  saveStatusData(data);
};

/**
 * Get Crittix status for an owner (global check)
 * Defaults to OFF (so it doesn't roast unless explicitly enabled)
 */
const getCrittixStatus = (ownerNumber) => {
  const data = loadStatusData();
  
  if (!data[ownerNumber]) {
    return false; // Default OFF
  }
  
  return data[ownerNumber].enabled;
};

/**
 * Track engagement (for engagement nuke feature)
 */
const engagementTracker = new Map();
const engagementRoasted = new Set();

const trackEngagement = (messageId) => {
  const count = (engagementTracker.get(messageId) || 0) + 1;
  engagementTracker.set(messageId, count);
  return count;
};

const hasBeenRoasted = (messageId) => {
  return engagementRoasted.has(messageId);
};

const markAsRoasted = (messageId) => {
  engagementRoasted.add(messageId);
};

// Cleanup old engagement data every 2 hours
setInterval(() => {
  engagementTracker.clear();
  engagementRoasted.clear();
  console.log('🧹 Cleaned Crittix engagement tracker');
}, 2 * 60 * 60 * 1000);

module.exports = {
  setCrittixStatus,
  getCrittixStatus,
  trackEngagement,
  hasBeenRoasted,
  markAsRoasted
}; 