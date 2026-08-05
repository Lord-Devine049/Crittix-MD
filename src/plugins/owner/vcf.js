/*
 * VCF.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Exports all group members as a .vcf contact file
 */
const fs   = require('fs-extra');
const path = require('path');
const h    = require('../../lib/helpers');

module.exports = {
  command: ['vcf', 'exportcontacts'],
  category: 'voidsystem',
  description: 'Export all group members as a .vcf contacts file',
  groupOnly: true,
  ownerOnly: true,
  execute: async ({ sock, msg, chatId, reply }) => {
    try {
      const meta    = await sock.groupMetadata(chatId);
      const members = meta.participants;
      if (!members.length) return reply(h.demonFail('No members found'));

      // Build VCF content
      let vcf = '';
      members.forEach((p, i) => {
        const num = p.id.split('@')[0];
        vcf += `BEGIN:VCARD\n`;
        vcf += `VERSION:3.0\n`;
        vcf += `FN:${meta.subject} Member ${i + 1}\n`;
        vcf += `TEL;TYPE=CELL:+${num}\n`;
        vcf += `END:VCARD\n`;
      });

      // Save temp file
      const tmpDir  = path.join(process.cwd(), 'database', 'tmp');
      fs.ensureDirSync(tmpDir);
      const tmpPath = path.join(tmpDir, `${chatId.split('@')[0]}.vcf`);
      fs.writeFileSync(tmpPath, vcf, 'utf8');

      const buf      = fs.readFileSync(tmpPath);
      const filename = `${meta.subject.replace(/[^a-zA-Z0-9]/g,'_')}_members.vcf`;

      await sock.sendMessage(chatId, {
        document: buf,
        mimetype: 'text/vcard',
        fileName: filename,
        caption:  `📒 *${meta.subject}*\n👥 ${members.length} contacts exported\n\nTap to save all members to your phone`,
      }, { quoted: msg });

      // cleanup
      fs.removeSync(tmpPath);

    } catch (e) { reply('failed — ' + e.message); }
  }
};
