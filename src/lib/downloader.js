/*
 * ============================================
 * DOWNLOADER.JS - MEDIA DOWNLOAD FUNCTIONS
 * Created by: LORD DEVINE
 * Telegram: @Heis_Devine
 * ============================================
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const FormData = require('form-data');
const chalk = require('chalk');

// ============================================
// YOUTUBE DOWNLOAD (yt-search + multi-API fallback)
// ============================================
const ytAudioApis = [
  // API 1 — hectormanuel (primary, exactly as case.js uses it)
  async (videoUrl) => {
    const res = await axios.get(`https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`, { timeout: 15000 });
    const d = res.data;
    if (!d?.status || (!d?.audio && !d?.videos)) throw new Error('API 1 (hector): no audio');
    console.log(chalk.green('[YTPLAY] API 1 (hectormanuel) success'));
    return { audioUrl: d.audio, title: d.title || '' };
  },
  // API 2 — apiloader.xyz
  async (videoUrl) => {
    const videoId = videoUrl.match(/(?:v=|\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    if (!videoId) throw new Error('Could not extract video ID');
    const res = await axios.get(`https://api.apiloader.xyz/youtube/dl?id=${videoId}`, { timeout: 20000 });
    const d = res.data;
    const audioUrl = d?.audio?.url || d?.audio || '';
    if (!audioUrl) throw new Error('API 2 (apiloader): no audio url');
    console.log(chalk.green('[YTPLAY] API 2 (apiloader) success'));
    return { audioUrl, title: d?.title || '' };
  },
  // API 3 — vrfrsr.com
  async (videoUrl) => {
    const res = await axios.get(`https://api.vrfrsr.com/api/ytmp3?url=${encodeURIComponent(videoUrl)}`, { timeout: 20000 });
    const d = res.data;
    const audioUrl = d?.result?.download || d?.download || '';
    if (!audioUrl) throw new Error('API 3 (vrfrsr): no audio url');
    console.log(chalk.green('[YTPLAY] API 3 (vrfrsr) success'));
    return { audioUrl, title: d?.result?.title || d?.title || '' };
  }
];

async function ytPlay(query) {
  try {
    const ytSearch = require('yt-search');

    console.log(chalk.cyan('[YTPLAY] Searching:'), query);

    const searchResult = await ytSearch(query);
    const video = (searchResult.videos || [])[0];
    if (!video) throw new Error('No search results found');

    console.log(chalk.cyan('[YTPLAY] Found:'), video.title, '|', video.url);

    let audioUrl = '';
    let title = video.title;

    for (const api of ytAudioApis) {
      try {
        const result = await api(video.url);
        audioUrl = result.audioUrl;
        title = result.title || title;
        break;
      } catch (err) {
        console.log(chalk.yellow('[YTPLAY] Fallback:'), err.message);
      }
    }

    if (!audioUrl) throw new Error('All download APIs failed');

    return {
      title,
      author:    video.author?.name || video.author || 'Unknown',
      duration:  video.timestamp    || 'Unknown',
      views:     video.views        || 'Unknown',
      thumbnail: video.thumbnail    || '',
      url:       video.url,
      audioUrl,
    };
  } catch (error) {
    console.error(chalk.red('[YTPLAY] Error:'), error.message);
    throw error;
  }
}

// ============================================
// TIKTOK DOWNLOAD (Prexzy API)
// ============================================
async function tiktokDL(url) {
  try {
    const apiUrl = `https://prexzyapis.com/download/tiktok?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl, { timeout: 20000 });

    if (!data || !data.status || !data.data) {
      throw new Error('Failed to fetch TikTok data');
    }

    const d = data.data;

    // video can be a string or array — handle both
    const videoUrl = Array.isArray(d.play)
      ? d.play[0]
      : (d.play || d.video || '');

    return {
      title:     d.title    || 'TikTok Video',
      thumbnail: d.cover    || '',
      author:    d.author   || 'Unknown',
      duration:  d.duration || 'Unknown',
      videoUrl,
      audioUrl:  d.music    || d.audio || ''
    };
  } catch (error) {
    console.error(chalk.red('TikTok DL Error:'), error.message);
    throw error;
  }
}

// ============================================
// SPOTIFY DOWNLOAD
// ============================================
async function spotifyDL(url) {
  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/spotifydl?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);
    
    if (!data || !data.download) {
      throw new Error('Failed to fetch Spotify data');
    }
    
    return {
      title: data.title || 'Unknown',
      artist: data.artist || 'Unknown',
      album: data.album || 'Unknown',
      thumbnail: data.thumbnail || '',
      duration: data.duration || 'Unknown',
      downloadUrl: data.download
    };
  } catch (error) {
    console.error(chalk.red('Spotify DL Error:'), error);
    throw error;
  }
}

// ============================================
// SPOTIFY SEARCH
// ============================================
async function spotifySearch(query) {
  try {
    const apiUrl = `https://draculazyx-xyzdrac.hf.space/api/Spotify?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);
    
    if (!data || !data.data || data.data.length === 0) {
      throw new Error('No results found');
    }
    
    return data.data.slice(0, 5).map(track => ({
      title: track.title || 'Unknown',
      artist: track.artist || 'Unknown',
      album: track.album || 'Unknown',
      duration: track.duration || 'Unknown',
      url: track.url || '',
      thumbnail: track.thumbnail || ''
    }));
  } catch (error) {
    console.error(chalk.red('Spotify Search Error:'), error);
    throw error;
  }
}

// ============================================
// APK DOWNLOAD (davidcyril API)
// ============================================
async function apkDL(appName) {
  try {
    const apiUrl = `https://apis.davidcyril.name.ng/download/apk?text=${encodeURIComponent(appName)}`;
    const { data } = await axios.get(apiUrl, { timeout: 20000 });

    if (!data || !data.status || !data.apk) {
      throw new Error('APK not found');
    }

    return {
      name:        data.apk.name         || appName,
      package:     data.apk.package      || 'Unknown',
      version:     data.apk.lastUpdated  || 'Unknown',
      icon:        data.apk.icon         || '',
      downloadUrl: data.apk.downloadLink || ''
    };
  } catch (error) {
    console.error(chalk.red('APK DL Error:'), error.message);
    throw error;
  }
}

// ============================================
// URL TO IMAGE (CATBOX)
// ============================================
async function uploadToCatbox(buffer) {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', buffer, { filename: 'file.jpg' });
    
    const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });
    
    return data.trim();
  } catch (error) {
    console.error(chalk.red('Catbox Upload Error:'), error);
    throw error;
  }
}

// ============================================
// URL TO IMAGE (TELEGRAPH)
// ============================================
async function uploadToTelegraph(buffer) {
  try {
    const form = new FormData();
    form.append('file', buffer, { filename: 'file.jpg' });
    
    const { data } = await axios.post('https://telegra.ph/upload', form, {
      headers: form.getHeaders()
    });
    
    if (!data || !data[0] || !data[0].src) {
      throw new Error('Upload failed');
    }
    
    return 'https://telegra.ph' + data[0].src;
  } catch (error) {
    console.error(chalk.red('Telegraph Upload Error:'), error);
    throw error;
  }
}

// ============================================
// MOVIE INFO (OMDB)
// ============================================
async function getMovieInfo(title) {
  try {
    const apiUrl = `http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(title)}&plot=full`;
    const { data } = await axios.get(apiUrl);
    
    if (!data || data.Response === 'False') {
      throw new Error('Movie not found');
    }
    
    return {
      title: data.Title || 'Unknown',
      year: data.Year || 'Unknown',
      rated: data.Rated || 'N/A',
      released: data.Released || 'Unknown',
      runtime: data.Runtime || 'Unknown',
      genre: data.Genre || 'Unknown',
      director: data.Director || 'Unknown',
      actors: data.Actors || 'Unknown',
      plot: data.Plot || 'No plot available',
      language: data.Language || 'Unknown',
      country: data.Country || 'Unknown',
      awards: data.Awards || 'N/A',
      poster: data.Poster || '',
      ratings: data.Ratings || [],
      imdbRating: data.imdbRating || 'N/A',
      imdbVotes: data.imdbVotes || 'N/A',
      boxOffice: data.BoxOffice || 'N/A'
    };
  } catch (error) {
    console.error(chalk.red('Movie Info Error:'), error);
    throw error;
  }
}

// ============================================
// WEATHER INFO
// ============================================
async function getWeather(location) {
  try {
    const apiUrl = `https://wttr.in/${encodeURIComponent(location)}?format=j1`;
    const { data } = await axios.get(apiUrl);
    
    if (!data || !data.current_condition) {
      throw new Error('Location not found');
    }
    
    const current = data.current_condition[0];
    const area = data.nearest_area?.[0];
    
    return {
      location: area?.areaName?.[0]?.value || location,
      region: area?.region?.[0]?.value || 'Unknown',
      country: area?.country?.[0]?.value || 'Unknown',
      temperature: current.temp_C || 'Unknown',
      temperatureF: current.temp_F || 'Unknown',
      condition: current.weatherDesc?.[0]?.value || 'Unknown',
      humidity: current.humidity || 'Unknown',
      windSpeed: current.windspeedKmph || 'Unknown',
      feelsLike: current.FeelsLikeC || 'Unknown',
      uvIndex: current.uvIndex || 'Unknown',
      visibility: current.visibility || 'Unknown'
    };
  } catch (error) {
    console.error(chalk.red('Weather Error:'), error);
    throw error;
  }
}

// ============================================
// CURRENCY CONVERTER
// ============================================
async function convertCurrency(amount, from, to) {
  try {
    const apiUrl = `https://api.exchangerate.host/convert?from=${from.toUpperCase()}&to=${to.toUpperCase()}&amount=${amount}`;
    const { data } = await axios.get(apiUrl);
    
    if (!data || !data.result) {
      throw new Error('Conversion failed');
    }
    
    return {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: amount,
      result: data.result,
      rate: data.info?.rate || 'Unknown',
      date: data.date || 'Unknown'
    };
  } catch (error) {
    console.error(chalk.red('Currency Error:'), error);
    throw error;
  }
}

// ============================================
// AI CHAT (GPT-4.5)
// ============================================
async function aiChat(query) {
  try {
    const apiUrl = `https://all-in-1-ais.officialhectormanuel.workers.dev/?query=${encodeURIComponent(query)}&model=gpt-4.5`;
    const { data } = await axios.get(apiUrl);
    
    if (!data || !data.response) {
      throw new Error('AI response failed');
    }
    
    return data.response;
  } catch (error) {
    console.error(chalk.red('AI Chat Error:'), error);
    throw error;
  }
}

// ============================================
// ANIME WAIFU PICS
// ============================================
async function getWaifuPic(category = 'waifu') {
  try {
    const apiUrl = `https://waifu.pics/api/sfw/${category}`;
    const { data } = await axios.get(apiUrl);
    
    if (!data || !data.url) {
      throw new Error('Failed to fetch waifu pic');
    }
    
    return data.url;
  } catch (error) {
    console.error(chalk.red('Waifu Pic Error:'), error);
    throw error;
  }
}

// ============================================
// GFX TEXT GENERATOR
// ============================================
async function generateGFX(command, text1, text2 = '') {
  try {
    const apiUrl = `https://api.nexoracle.com/image-creating/${command}?apikey=d0634e61e8789b051e&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}`;
    const { data } = await axios.get(apiUrl);
    
    if (!data || !data.result) {
      throw new Error('GFX generation failed');
    }
    
    return data.result;
  } catch (error) {
    console.error(chalk.red('GFX Error:'), error);
    throw error;
  }
}

// ============================================
// SHORT URL
// ============================================
async function shortUrl(url) {
  try {
    const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);
    
    return data.trim();
  } catch (error) {
    console.error(chalk.red('Short URL Error:'), error);
    throw error;
  }
}

// ============================================
// FACEBOOK DOWNLOAD (Prexzy API)
// ============================================
async function facebookDL(url) {
  try {
    const apiUrl = `https://prexzyapis.com/download/facebook?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl, { timeout: 20000 });

    if (!data || !data.status || !data.data) {
      throw new Error('Failed to fetch Facebook video');
    }

    const d = data.data;
    return {
      title:     d.title     || 'Facebook Video',
      thumbnail: d.thumbnail || '',
      sd:        d.sd        || '',
      hd:        d.hd        || ''
    };
  } catch (error) {
    console.error(chalk.red('Facebook DL Error:'), error.message);
    throw error;
  }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  ytPlay,
  tiktokDL,
  facebookDL,
  spotifyDL,
  spotifySearch,
  apkDL,
  uploadToCatbox,
  uploadToTelegraph,
  getMovieInfo,
  getWeather,
  convertCurrency,
  aiChat,
  getWaifuPic,
  generateGFX,
  shortUrl
};

// ============================================
// END OF DOWNLOADER.JS
// 💜 CREATED BY LORD DEVINE 🖤
// ============================================
