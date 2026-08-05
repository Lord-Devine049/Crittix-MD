/*
 * CRITTIX.JS - Crittix-MD
 * Created by: LORD DEVINE
 */

module.exports = {
  command: 'crittix',
  category: 'darkintelligence',
  description: 'Toggle Crittix AI chatbot',
  sudoOnly: true,
  execute: async ({ args, cfg, reply }) => {
    const crittixDB = require('../../lib/crittix-db');
    const action = args[0]?.toLowerCase();

    if (action === 'on') {
      crittixDB.setCrittixStatus(cfg.OWNER_NUMBER, true);
      return reply('Lord Crittix has awakened. mentions will not go unanswered');
    }

    if (action === 'off') {
      crittixDB.setCrittixStatus(cfg.OWNER_NUMBER, false);
      return reply('Lord Crittix has gone silent. for now.');
    }

    // No args — sassy status message
    const status = crittixDB.getCrittixStatus(cfg.OWNER_NUMBER);
    return reply(
      `you fool \n\nto enable Lord Crittix use *${cfg.PREFIX || '.'}crittix on*\nto silence him use *${cfg.PREFIX || '.'}crittix off*\n\ncurrent status: ${status ? 'ON' : 'OFF'}`
    );
  }
};