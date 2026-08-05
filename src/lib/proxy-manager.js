const fs = require('fs');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');

class ProxyManager {
  constructor() {
    this.proxies = [];
    this.currentIndex = 0;
    this.proxyStats = new Map();
    this.lastCheck = Date.now();
    this.loadProxies();
  }

  loadProxies() {
    try {
      const proxyPath = path.join(__dirname, '..', '..', 'proxy.txt');
      if (!fs.existsSync(proxyPath)) {
        console.log('⚠️ proxy.txt not found, proxy system disabled');
        return;
      }

      const content = fs.readFileSync(proxyPath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && /^[\d.]+:\d+$/.test(trimmed)) {
          this.proxies.push(trimmed);
          this.proxyStats.set(trimmed, { success: 0, failed: 0, lastUsed: null });
        }
      }

      console.log(`✅ Proxy Manager: Loaded ${this.proxies.length} proxies from proxy.txt`);
    } catch (err) {
      console.error('❌ Error loading proxies:', err.message);
    }
  }

  getNextProxy() {
    if (this.proxies.length === 0) return null;
    
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    
    const stats = this.proxyStats.get(proxy);
    if (stats) stats.lastUsed = Date.now();
    
    return this.createAgent(proxy);
  }

  getRandomProxy() {
    if (this.proxies.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * this.proxies.length);
    const proxy = this.proxies[randomIndex];
    
    const stats = this.proxyStats.get(proxy);
    if (stats) stats.lastUsed = Date.now();
    
    return this.createAgent(proxy);
  }

  getProxyByIndex(index) {
    if (this.proxies.length === 0) return null;
    
    const safeIndex = Math.abs(index) % this.proxies.length;
    const proxy = this.proxies[safeIndex];
    
    const stats = this.proxyStats.get(proxy);
    if (stats) stats.lastUsed = Date.now();
    
    return this.createAgent(proxy);
  }

  createAgent(proxyString) {
    try {
      const [host, port] = proxyString.split(':');
      const proxyUrl = `http://${host}:${port}`;
      
      console.log(`✅ Proxy connection established: ${host}:${port}`);
      return new HttpsProxyAgent(proxyUrl);
    } catch (err) {
      console.error(`❌ Error creating proxy agent for ${proxyString}:`, err.message);
      return null;
    }
  }

  createSocksAgent(proxyString) {
    try {
      const [host, port] = proxyString.split(':');
      const proxyUrl = `socks5://${host}:${port}`;
      
      console.log(`✅ SOCKS Proxy connection established: ${host}:${port}`);
      return new SocksProxyAgent(proxyUrl);
    } catch (err) {
      console.error(`❌ Error creating SOCKS proxy agent:`, err.message);
      return null;
    }
  }

  markProxySuccess(proxyString) {
    const stats = this.proxyStats.get(proxyString);
    if (stats) {
      stats.success++;
    }
  }

  markProxyFailed(proxyString) {
    const stats = this.proxyStats.get(proxyString);
    if (stats) {
      stats.failed++;
    }
  }

  getTotalProxies() {
    return this.proxies.length;
  }

  getAvailableProxies() {
    return this.proxies.length;
  }

  getProxyStats() {
    return {
      total: this.proxies.length,
      available: this.proxies.length,
      lastCheck: this.lastCheck,
      rotationActive: this.proxies.length > 0
    };
  }

  getProxyStatusDisplay() {
    const stats = this.getProxyStats();
    const timeSinceCheck = Math.floor((Date.now() - stats.lastCheck) / 60000);
    
    return `╭━━━━━━━━━━━━━━━━━╮
│  🔒 PROXY STATUS  │
╰━━━━━━━━━━━━━━━━━╯

📊 Available: ${stats.available}/${stats.total} proxies
✅ Status: ${stats.total > 0 ? 'Operational' : 'No proxies loaded'}
🌐 Rotation: ${stats.rotationActive ? 'Active' : 'Inactive'}
⚡ Last Check: ${timeSinceCheck} mins ago

━━━━━━━━━━━━━━━━━`;
  }

  getRawProxyString(index) {
    if (this.proxies.length === 0) return null;
    const safeIndex = Math.abs(index) % this.proxies.length;
    return this.proxies[safeIndex];
  }
}

const proxyManager = new ProxyManager();

module.exports = proxyManager;
