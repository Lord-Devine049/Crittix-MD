/*
 * AUDIOEFFECTS.JS - Crittix-MD
 * Created by: LORD DEVINE
 * Applies ffmpeg audio effects to quoted audio
 */
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const h = require('../../lib/helpers');
const p = require('../../lib/phrases');


const effects = {
  bass:      '-af equalizer=f=54:width_type=o:width=2:g=20',
  blown:     '-af acrusher=.1:1:64:0:log',
  deep:      '-af atempo=4/4,asetrate=44500*2/3',
  earrape:   '-af volume=12',
  fast:      '-filter:a "atempo=1.63,asetrate=44100"',
  fat:       '-filter:a "atempo=1.6,asetrate=22100"',
  nightcore: '-filter:a atempo=1.06,asetrate=44100*1.25',
  reverse:   '-filter_complex "areverse"',
  robot:     '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"',
  slow:      '-filter:a "atempo=0.7,asetrate=44100"',
  squirrel:  '-filter:a "atempo=0.5,asetrate=65100"',
  chipmunk:  '-filter:a "atempo=1.4,asetrate=44100*1.6"',
  smooth:    '-af "equalizer=f=1000:width_type=o:width=2:g=-3,equalizer=f=8000:width_type=o:width=2:g=2,aecho=0.8:0.88:6:0.4"',
  tremolo:   '-af "tremolo=f=5:d=0.7"',
  vibrato:   '-af "vibrato=f=7:d=0.5"',
  '8d':      '-af "apulsator=hz=0.125"',
  echo:      '-af "aecho=0.8:0.88:60:0.4"',
  flanger:   '-af "flanger=delay=0:depth=2:regen=0:width=71:speed=0.5:shape=sinusoidal:phase=25:interp=linear"'
};

const getRandom = (ext) => path.join('/tmp', `audio_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`);

module.exports = {
  command: Object.keys(effects),
  aliases: [],
  category: 'creativetools',
  description: 'Apply audio effects to a quoted audio message',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply, command }) => {
    const cmd = (command || 'bass').toLowerCase();
    const set = effects[cmd];
    if (!set) return reply(p.phrases.notFound('unknown audio effect.'));

    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted) return reply(p.phrases.wrongUsage(`reply to an audio message to use .${cmd}.`));

    const quotedType = Object.keys(quoted)[0];
    if (!quotedType.includes('audio') && !quotedType.includes('Audio'))
      return reply(p.phrases.wrongUsage('reply to an audio message to apply this effect.'));

    try {
      reply(`⚡ *Processing ${cmd.toUpperCase()} effect...*`);

      const quotedMsg = {
        key: { remoteJid: chatId, id: ctx?.stanzaId, participant: ctx?.participant },
        message: quoted
      };

      const buffer = await sock.downloadMediaMessage(quotedMsg);
      if (!buffer) return reply(p.phrases.error('failed to download the audio.'));

      const inputFile = getRandom('.mp3');
      const outputFile = getRandom('.mp3');

      fs.writeFileSync(inputFile, buffer);

      await new Promise((resolve, reject) => {
        exec(`ffmpeg -y -i ${inputFile} ${set} ${outputFile}`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const result = fs.readFileSync(outputFile);
      fs.unlinkSync(inputFile);
      fs.unlinkSync(outputFile);

      await sock.sendMessage(chatId, {
        audio: result,
        mimetype: 'audio/mpeg'
      }, { quoted: msg });
    } catch (err) {
      reply(p.phrases.error(`Failed to apply ${cmd} effect. ffmpeg required.`));
    }
  }
};
