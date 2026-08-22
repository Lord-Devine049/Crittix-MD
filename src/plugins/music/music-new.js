/*
 * MUSIC-NEW.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: lyricsfind, karaoke, remix, soundboard, ringtone,
 *           podcastsearch, audiobookdl, equalizer, bassboost
 */
const axios = require('axios');
const h = require('../../lib/helpers');
const fs = require('fs-extra');
const path = require('path');
const p = require('../../lib/phrases');


module.exports = [

  {
    command: 'lyricsfind',
    aliases: [ 'lyricsearch'],
    category: 'soultools',
    description: 'Find lyrics with fuzzy search. Usage: lyricsfind Blinding Lights The Weeknd',
    execute: async ({ text, args, reply }) => {
      const query = text || args.join(' ');
      if (!query) return reply(p.phrases.wrongUsage('type the song name. optionally add the artist. example! .lyricsfind blinding lights weeknd'));
      await reply('🎵 finding lyrics...');
      try {
        const { data } = await axios.get(`https://api.lyrics.ovh/suggest/${encodeURIComponent(query)}`, { timeout: 15000 });
        if (!data?.data?.length) return reply(p.phrases.error(`no results for "${query}"`));
        const song = data.data[0];
        const { data: lyricsData } = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist.name)}/${encodeURIComponent(song.title)}`, { timeout: 15000 });
        const lyrics = lyricsData?.lyrics?.substring(0, 3000);
        if (!lyrics) return reply(p.phrases.error(`found the song but no lyrics available`));
        reply(`🎵 *${song.title}*\n👤 ${song.artist.name}\n\n${lyrics}${lyricsData.lyrics.length > 3000 ? '\n\n_...truncated_' : ''}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`lyrics search failed — ${e.message}`)); }
    }
  },

  {
    command: 'karaoke',
    aliases: ['synclyrics', 'timestamplyrics'],
    category: 'soultools',
    description: 'Get time-synced lyrics info for a song. Usage: karaoke Blinding Lights',
    execute: async ({ text, args, reply }) => {
      const query = text || args.join(' ');
      if (!query) return reply(p.phrases.wrongUsage('type the song name. example! .karaoke bohemian rhapsody'));
      await reply('🎤 searching synced lyrics...');
      try {
        const { data } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}&limit=3`, { timeout: 15000 });
        if (!data?.length) return reply(p.phrases.error(`no synced lyrics found for "${query}"`));
        const song = data.find(s => s.syncedLyrics) || data[0];
        if (song.syncedLyrics) {
          const lines = song.syncedLyrics.split('\n').slice(0, 30).join('\n');
          reply(`🎤 *KARAOKE: ${song.trackName}*\n👤 ${song.artistName}\n\n\`\`\`\n${lines}\n\`\`\`\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        } else {
          const lines = song.plainLyrics?.substring(0, 1500) || 'No lyrics available';
          reply(`🎵 *${song.trackName}*\n👤 ${song.artistName}\n\n_⚠️ No synced lyrics — plain text:_\n\n${lines}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        }
      } catch (e) { reply(p.phrases.error(`karaoke fetch failed — ${e.message}`)); }
    }
  },

  {
    command: 'remix',
    aliases: ['makeremix', 'remixgen'],
    category: 'soultools',
    description: 'Generate a funny remix description for a track. Usage: remix Blinding Lights',
    execute: async ({ text, args, reply }) => {
      const track = text || args.join(' ');
      if (!track) return reply(p.phrases.wrongUsage('type the track name to remix. example! .remix sunflower post malone'));
      const styles = ['Afrobeats', 'Drill', 'Phonk', 'Lofi Hip-Hop', 'Jersey Club', 'Amapiano', 'Hyperpop', 'Reggaeton', 'Dembow', 'UK Drill', 'Trap Soul', 'Latin Trap'];
      const producers = ['Adekunle Beats', 'Shadow Prodz', 'Night Raiders Studio', 'Crittix Audio Lab', 'LORD DEVINE Productions', 'Void Sounds'];
      const features = ['ft. no one because you have no friends', 'ft. the ghost of your career', 'ft. Crittix (who did all the work)', '(featuring an AI that has more talent)'];
      const style = styles[Math.floor(Math.random() * styles.length)];
      const producer = producers[Math.floor(Math.random() * producers.length)];
      const feature = features[Math.floor(Math.random() * features.length)];
      const bpm = 70 + Math.floor(Math.random() * 100);
      reply(
        `🎛️ *REMIX GENERATOR*\n\n` +
        `🎵 *"${track}" — ${style} Remix*\n` +
        `${feature}\n\n` +
        `🎚️ BPM: ${bpm}\n` +
        `🎹 Key: ${['Am','Em','Dm','Cm','F#m'][Math.floor(Math.random()*5)]}\n` +
        `🏭 Produced by: ${producer}\n` +
        `⏱️ Runtime: ${2 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}\n\n` +
        `💿 Label: Crittix Empire Records\n\n` +
        `😂 _This is a joke — no actual audio was generated_\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'soundboard',
    aliases: ['sound', 'sfx'],
    category: 'soultools',
    description: 'Play a sound effect. Usage: soundboard list | soundboard laugh',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      // Pre-defined royalty-free sound URLs (from public sources)
      const sounds = {
        laugh: 'https://www.soundjay.com/human/laughing-1.mp3',
        applause: 'https://www.soundjay.com/human/applause-1.mp3',
        fail: 'https://www.soundjay.com/misc/fail-buzzer-02.mp3',
        success: 'https://www.soundjay.com/misc/success-fanfare-trumpets.mp3',
        ding: 'https://www.soundjay.com/misc/ding-idea-40142.mp3',
        drum: 'https://www.soundjay.com/misc/drum-roll-2.mp3',
      };
      const sound = args[0]?.toLowerCase();
      if (!sound || sound === 'list') return reply(`🔊 *SOUNDBOARD*\n\nAvailable sounds:\n${Object.keys(sounds).map(s => `• ${s}`).join('\n')}\n\nPlay: .soundboard <name>\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      const url = sounds[sound];
      if (!url) return reply(p.phrases.error(`sound "${sound}" not found — .soundboard list`));
      try {
        await sock.sendMessage(chatId, { audio: { url }, mimetype: 'audio/mp4' }, { quoted: msg });
      } catch (e) { reply(p.phrases.error(`sound play failed — ${e.message}`)); }
    }
  },

  {
    command: 'ringtone',
    aliases: ['cutaudio', 'audioclip'],
    category: 'soultools',
    description: 'Cut a short ringtone clip from uploaded audio. Reply to audio: ringtone 30 60 (start end in seconds)',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const audioMsg = quoted?.audioMessage || msg.message?.audioMessage;
      if (!audioMsg) return reply(p.phrases.error('reply to an audio message to cut it'));
      const start = parseInt(args[0] || 0);
      const duration = Math.min(60, parseInt(args[1] || 30) - start);
      if (duration <= 0) return reply(p.phrases.wrongUsage('reply to audio and provide start and end seconds. example! .ringtone 10 40'));
      await reply(`✂️ cutting ${duration}s clip starting at ${start}s...`);
      try {
        const ffmpeg = require('fluent-ffmpeg');
        const buffer = await sock.downloadMediaMessage(msg);
        const tmpIn = path.join(process.cwd(), 'tmp', `rtin_${Date.now()}.ogg`);
        const tmpOut = path.join(process.cwd(), 'tmp', `rtout_${Date.now()}.mp3`);
        fs.ensureDirSync(path.dirname(tmpIn));
        fs.writeFileSync(tmpIn, buffer);
        await new Promise((resolve, reject) => {
          ffmpeg(tmpIn).seekInput(start).duration(duration).audioCodec('libmp3lame').audioBitrate(128).save(tmpOut).on('end', resolve).on('error', reject);
        });
        const out = fs.readFileSync(tmpOut);
        await sock.sendMessage(chatId, { audio: out, mimetype: 'audio/mp3' }, { quoted: msg });
        fs.removeSync(tmpIn);
        fs.removeSync(tmpOut);
      } catch (e) { reply(p.phrases.error(`ringtone cut failed — ${e.message}`)); }
    }
  },

  {
    command: 'podcastsearch',
    aliases: ['podcast', 'findpodcast'],
    category: 'soultools',
    description: 'Search podcasts by name. Usage: podcastsearch true crime',
    execute: async ({ text, args, reply }) => {
      const query = text || args.join(' ');
      if (!query) return reply(p.phrases.wrongUsage('type the podcast name. example! .podcastsearch joe rogan experience'));
      try {
        const { data } = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&limit=5`, { timeout: 15000 });
        if (!data?.results?.length) return reply(p.phrases.error(`no podcasts found for "${query}"`));
        const results = data.results.map((p, i) =>
          `${i+1}. 🎙️ *${p.collectionName}*\n   👤 ${p.artistName}\n   📻 ${p.trackCount || '?'} episodes\n   🔗 ${p.collectionViewUrl || ''}`
        ).join('\n\n');
        reply(`🎙️ *PODCAST SEARCH: ${query}*\n\n${results}\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`podcast search failed — ${e.message}`)); }
    }
  },

  {
    command: 'audiobookdl',
    aliases: ['audiobook', 'librivox'],
    category: 'soultools',
    description: 'Search public domain audiobooks (LibriVox). Usage: audiobookdl Dracula',
    execute: async ({ text, args, reply }) => {
      const query = text || args.join(' ');
      if (!query) return reply(p.phrases.wrongUsage('type the audiobook title. example! .audiobookdl atomic habits'));
      try {
        const { data } = await axios.get(`https://librivox.org/api/feed/audiobooks/?title=^${encodeURIComponent(query)}&format=json&extended=1&limit=5`, { timeout: 15000 });
        const books = data?.books;
        if (!books?.length) return reply(p.phrases.error(`no public domain audiobooks found for "${query}" on LibriVox`));
        const results = books.slice(0, 5).map((b, i) =>
          `${i+1}. 📚 *${b.title}*\n   👤 ${b.authors?.map(a => a.first_name + ' ' + a.last_name).join(', ') || 'Unknown'}\n   ⏱️ ${b.totaltimesecs ? Math.floor(b.totaltimesecs/3600) + 'h' : '?'}\n   🔗 ${b.url_librivox}`
        ).join('\n\n');
        reply(`📚 *AUDIOBOOKS: ${query}*\n\n${results}\n\n✅ All books are public domain (free, legal)\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
      } catch (e) { reply(p.phrases.error(`audiobook search failed — ${e.message}`)); }
    }
  },

  {
    command: 'equalizer',
    aliases: ['eqsettings', 'eq'],
    category: 'soultools',
    description: 'Get EQ settings suggestion for a music genre. Usage: equalizer hiphop',
    execute: async ({ args, reply }) => {
      const genre = (args[0] || 'general').toLowerCase();
      const eqPresets = {
        hiphop: { bass: '+8dB', low_mid: '+3dB', mid: '-1dB', high_mid: '-2dB', presence: '+4dB', high: '+2dB', note: 'Heavy sub bass, boosted presence' },
        pop: { bass: '+3dB', low_mid: '+1dB', mid: '+2dB', high_mid: '+3dB', presence: '+4dB', high: '+5dB', note: 'Bright, forward mids, airy highs' },
        rock: { bass: '+4dB', low_mid: '-2dB', mid: '+3dB', high_mid: '+5dB', presence: '+4dB', high: '+2dB', note: 'Scooped mids, punchy presence' },
        jazz: { bass: '+2dB', low_mid: '+1dB', mid: '+2dB', high_mid: '+1dB', presence: '+2dB', high: '+3dB', note: 'Flat, natural, warm highs' },
        edm: { bass: '+7dB', low_mid: '+2dB', mid: '-3dB', high_mid: '+2dB', presence: '+3dB', high: '+6dB', note: 'Massive bass, scooped mids, sparkly highs' },
        rnb: { bass: '+6dB', low_mid: '+3dB', mid: '+1dB', high_mid: '+2dB', presence: '+3dB', high: '+4dB', note: 'Warm low end, silky highs' },
        classical: { bass: '+1dB', low_mid: '+1dB', mid: '+2dB', high_mid: '+2dB', presence: '+3dB', high: '+4dB', note: 'Natural, concert-hall spaciousness' },
        afrobeats: { bass: '+7dB', low_mid: '+4dB', mid: '+2dB', high_mid: '+2dB', presence: '+5dB', high: '+3dB', note: 'Big bass, forward mids for chant clarity' },
      };
      const eq = eqPresets[genre] || eqPresets.general || {
        bass: '+4dB', low_mid: '+2dB', mid: '0dB', high_mid: '+2dB', presence: '+3dB', high: '+3dB', note: 'Balanced general EQ'
      };
      reply(
        `🎛️ *EQ SETTINGS: ${genre.toUpperCase()}*\n\n` +
        `🔊 Sub Bass (60Hz): *${eq.bass}*\n` +
        `🎸 Low Mid (250Hz): *${eq.low_mid}*\n` +
        `🎤 Mids (1kHz): *${eq.mid}*\n` +
        `🎹 High Mid (3kHz): *${eq.high_mid}*\n` +
        `✨ Presence (6kHz): *${eq.presence}*\n` +
        `💫 Highs (12kHz): *${eq.high}*\n\n` +
        `📝 Note: ${eq.note}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'bassboost',
    aliases: ['bass', 'boostbass'],
    category: 'soultools',
    description: 'Apply bass boost to uploaded audio. Reply to audio: bassboost [level 1-10]',
    execute: async ({ sock, msg, chatId, args, reply }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const audioMsg = quoted?.audioMessage || msg.message?.audioMessage;
      if (!audioMsg) return reply(p.phrases.error('reply to an audio message to bass boost it'));
      const level = Math.min(10, Math.max(1, parseInt(args[0] || 5)));
      await reply(`🔊 applying bass boost (level ${level})...`);
      try {
        const ffmpeg = require('fluent-ffmpeg');
        const buffer = await sock.downloadMediaMessage(msg);
        const tmpIn = path.join(process.cwd(), 'tmp', `bbin_${Date.now()}.ogg`);
        const tmpOut = path.join(process.cwd(), 'tmp', `bbout_${Date.now()}.mp3`);
        fs.ensureDirSync(path.dirname(tmpIn));
        fs.writeFileSync(tmpIn, buffer);
        const bassGain = level * 3;
        await new Promise((resolve, reject) => {
          ffmpeg(tmpIn)
            .audioFilters([`equalizer=f=60:width_type=o:width=2:g=${bassGain}`, `equalizer=f=120:width_type=o:width=2:g=${Math.round(bassGain*0.7)}`])
            .audioCodec('libmp3lame').audioBitrate(128)
            .save(tmpOut).on('end', resolve).on('error', reject);
        });
        const out = fs.readFileSync(tmpOut);
        await sock.sendMessage(chatId, { audio: out, mimetype: 'audio/mp3' }, { quoted: msg });
        fs.removeSync(tmpIn);
        fs.removeSync(tmpOut);
      } catch (e) { reply(p.phrases.error(`bass boost failed — ${e.message}`)); }
    }
  }

];
