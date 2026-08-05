const fs = require('fs-extra');
const path = require('path');

/**
 * Centralized Owner Authentication System
 * Handles all owner/sudo checks with LID mapping support
 * Supports UNLIMITED multiple owners with auto-add/remove on pair/disconnect
 * Each owner gets their own independent configuration in config folder
 */

const normalizeNumber = (jidOrNumber) => {
  if (!jidOrNumber) return '';
  let cleaned = jidOrNumber.toString().replace(/\D/g, '');
  return cleaned.replace(/^0+/, '');
};

const getOwnerFilePath = () => path.join(__dirname, '..', '..', 'database', 'owner.json');
const getSudoFilePath = () => path.join(__dirname, '..', '..', 'database', 'sudo.json');
const getConfigDir = () => path.join(__dirname, '..', '..', 'config');

const loadOwnerConfig = () => {
  try {
    const filePath = getOwnerFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data.owners)) {
        return { owners: data.owners };
      }
      if (!data.owner) data.owner = '';
      return data;
    }
    return { owners: [] };
  } catch (e) {
    console.error('⚠️ Error loading owner.json:', e);
    return { owners: [] };
  }
};

const saveOwnerConfig = (data) => {
  try {
    const filePath = getOwnerFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('⚠️ Error saving owner.json:', e);
    return false;
  }
};

const loadSudoConfig = () => {
  try {
    const filePath = getSudoFilePath();
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return { sudoUsers: [] };
  } catch (e) {
    console.error('⚠️ Error loading sudo.json:', e);
    return { sudoUsers: [] };
  }
};

const saveSudoConfig = (data) => {
  try {
    const filePath = getSudoFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('⚠️ Error saving sudo.json:', e);
    return false;
  }
};

const getOwnerConfigFilePath = (ownerNumber) => {
  const cleanNumber = normalizeNumber(ownerNumber);
  return path.join(getConfigDir(), `${cleanNumber}.json`);
};

const getDefaultOwnerConfig = (ownerNumber) => ({
  ownerNumber: normalizeNumber(ownerNumber),
  mode: 'self',
  prefix: '.',
  antibot: false,
  antibug: false,
  anticall: false,
  sudoUsers: [],
  createdAt: Date.now(),
  lastActive: Date.now()
});

const loadOwnerConfigFromFile = (ownerNumber) => {
  try {
    const filePath = getOwnerConfigFilePath(ownerNumber);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
  } catch (e) {
    console.error(`⚠️ Error loading config for ${ownerNumber}:`, e);
    return null;
  }
};

const saveOwnerConfigToFile = (ownerNumber, config) => {
  try {
    fs.ensureDirSync(getConfigDir());
    const filePath = getOwnerConfigFilePath(ownerNumber);
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    return true;
  } catch (e) {
    console.error(`⚠️ Error saving config for ${ownerNumber}:`, e);
    return false;
  }
};

const deleteOwnerConfigFile = (ownerNumber) => {
  try {
    const filePath = getOwnerConfigFilePath(ownerNumber);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (e) {
    console.error(`⚠️ Error deleting config for ${ownerNumber}:`, e);
    return false;
  }
};

const getOwnerConfig = (ownerNumber) => {
  const cleanNumber = normalizeNumber(ownerNumber);
  if (!cleanNumber) return getDefaultOwnerConfig('');
  
  const config = loadOwnerConfigFromFile(cleanNumber);
  if (config) {
    return {
      ...getDefaultOwnerConfig(cleanNumber),
      ...config
    };
  }
  
  return getDefaultOwnerConfig(cleanNumber);
};

const setOwnerConfig = (ownerNumber, updates) => {
  const cleanNumber = normalizeNumber(ownerNumber);
  if (!cleanNumber) return false;
  
  try {
    let config = loadOwnerConfigFromFile(cleanNumber);
    if (!config) {
      config = getDefaultOwnerConfig(cleanNumber);
    }
    
    Object.assign(config, updates, { lastActive: Date.now() });
    
    const saved = saveOwnerConfigToFile(cleanNumber, config);
    if (saved) {
    }
    return saved;
  } catch (e) {
    console.error('⚠️ Error setting owner config:', e);
    return false;
  }
};

const createOwnerConfig = (ownerNumber) => {
  const cleanNumber = normalizeNumber(ownerNumber);
  if (!cleanNumber) return false;
  
  try {
    const existingConfig = loadOwnerConfigFromFile(cleanNumber);
    
    if (!existingConfig) {
      const config = getDefaultOwnerConfig(cleanNumber);
      const saved = saveOwnerConfigToFile(cleanNumber, config);
      if (saved) {
      }
      return saved;
    }
    
    existingConfig.lastActive = Date.now();
    return saveOwnerConfigToFile(cleanNumber, existingConfig);
  } catch (e) {
    console.error('⚠️ Error creating owner config:', e);
    return false;
  }
};

const removeOwnerConfig = (ownerNumber) => {
  const cleanNumber = normalizeNumber(ownerNumber);
  if (!cleanNumber) return false;
  
  return deleteOwnerConfigFile(cleanNumber);
};

const getOwnerMode = (ownerNumber) => {
  const config = getOwnerConfig(ownerNumber);
  return config.mode || 'self';
};

const getOwnerPrefix = (ownerNumber) => {
  const config = getOwnerConfig(ownerNumber);
  return config.prefix || '.';
};

const getOwnerSudoUsers = (ownerNumber) => {
  const config = getOwnerConfig(ownerNumber);
  return config.sudoUsers || [];
};

const addOwnerSudoUser = (ownerNumber, sudoNumber) => {
  const cleanOwner = normalizeNumber(ownerNumber);
  const cleanSudo = normalizeNumber(sudoNumber);
  if (!cleanOwner || !cleanSudo) return false;
  
  const config = getOwnerConfig(cleanOwner);
  if (!config.sudoUsers) config.sudoUsers = [];
  
  if (!config.sudoUsers.includes(cleanSudo)) {
    config.sudoUsers.push(cleanSudo);
    return setOwnerConfig(cleanOwner, { sudoUsers: config.sudoUsers });
  }
  
  return true;
};

const removeOwnerSudoUser = (ownerNumber, sudoNumber) => {
  const cleanOwner = normalizeNumber(ownerNumber);
  const cleanSudo = normalizeNumber(sudoNumber);
  if (!cleanOwner || !cleanSudo) return false;
  
  const config = getOwnerConfig(cleanOwner);
  if (!config.sudoUsers) return true;
  
  config.sudoUsers = config.sudoUsers.filter(u => normalizeNumber(u) !== cleanSudo);
  return setOwnerConfig(cleanOwner, { sudoUsers: config.sudoUsers });
};

const isOwnerSudoUser = (ownerNumber, userNumber) => {
  const cleanOwner = normalizeNumber(ownerNumber);
  const cleanUser = normalizeNumber(userNumber);
  if (!cleanOwner || !cleanUser) return false;
  
  const sudoUsers = getOwnerSudoUsers(cleanOwner);
  return sudoUsers.some(u => cleanUser.endsWith(normalizeNumber(u)) || normalizeNumber(u).endsWith(cleanUser));
};

const resolveOwnerNumber = (sender, groupMetadata = null) => {
  let senderNumber = sender;
  
  if (sender.includes('@lid')) {
    if (groupMetadata && groupMetadata.participants) {
      const participant = groupMetadata.participants.find(p => p.id === sender);
      if (participant && participant.lid) {
        const lidNumber = participant.lid.split(':')[0];
        if (lidNumber) senderNumber = lidNumber;
      }
    }
    
    if (senderNumber === sender) {
      const resolved = resolveLIDToPhone(sender);
      if (resolved) senderNumber = resolved;
    }
  }
  
  return normalizeNumber(senderNumber);
};

const getOwnerNumbers = () => {
  const ownerData = loadOwnerConfig();
  
  if (ownerData && Array.isArray(ownerData.owners)) {
    const owners = ownerData.owners
      .map(num => normalizeNumber(num.toString().trim()))
      .filter(num => num.length > 0);
    return [...new Set(owners)];
  }
  
  if (!ownerData || !ownerData.owner || ownerData.owner.trim() === '') return [];
  
  const owners = ownerData.owner
    .split(',')
    .map(num => normalizeNumber(num.trim()))
    .filter(num => num.length > 0);
  
  return [...new Set(owners)];
};

const addOwner = (phoneNumber) => {
  try {
    const cleanNumber = normalizeNumber(phoneNumber);
    if (!cleanNumber) {
        return false;
    }
    
    const currentOwners = getOwnerNumbers();
    
    
    if (currentOwners.includes(cleanNumber)) {
      createOwnerConfig(cleanNumber);
      return true;
    }
    
    const newOwnerList = [...currentOwners, cleanNumber];
    const newData = { owners: newOwnerList };
    
    const saved = saveOwnerConfig(newData);
    if (saved) {
      
      createOwnerConfig(cleanNumber);
    }
    return saved;
  } catch (e) {
    console.error('⚠️ Error adding owner:', e);
    return false;
  }
};

const removeOwner = (phoneNumber) => {
  try {
    const cleanNumber = normalizeNumber(phoneNumber);
    if (!cleanNumber) return false;
    
    const currentOwners = getOwnerNumbers();
    
    
    if (!currentOwners.includes(cleanNumber)) {
      return true;
    }
    
    const newOwners = currentOwners.filter(num => num !== cleanNumber);
    const newData = { owners: newOwners };
    
    const saved = saveOwnerConfig(newData);
    if (saved) {
      
      removeOwnerConfig(cleanNumber);
    }
    return saved;
  } catch (e) {
    console.error('⚠️ Error removing owner:', e);
    return false;
  }
};

const resolveLIDToPhone = (lidJid) => {
  if (!lidJid.includes('@lid')) return null;
  
  try {
    const lidNumber = lidJid.split('@')[0];
    const authDir = path.join(__dirname, '..', '..', 'auth');
    
    if (fs.existsSync(authDir)) {
      const botFolders = fs.readdirSync(authDir);
      for (const folder of botFolders) {
        const mappingFile = path.join(authDir, folder, `lid-mapping-${lidNumber}_reverse.json`);
        if (fs.existsSync(mappingFile)) {
          const mappingContent = fs.readFileSync(mappingFile, 'utf8');
          const actualNumber = normalizeNumber(mappingContent.replace(/["']/g, '').trim());
          return actualNumber;
        }
      }
    }
  } catch (e) {
    console.error('⚠️ Error resolving LID:', e.message);
  }
  
  return null;
};

const isOwner = (sender, groupMetadata = null) => {
  const ownerNumbers = getOwnerNumbers();
  if (ownerNumbers.length === 0) {
    console.warn('⚠️ No owners configured in database/owner.json');
    return false;
  }

  let senderNumber = sender;
  if (sender.includes('@lid')) {
    if (groupMetadata && groupMetadata.participants) {
      const participant = groupMetadata.participants.find(p => p.id === sender);
      if (participant && participant.lid) {
        const lidNumber = participant.lid.split(':')[0];
        if (lidNumber) {
          senderNumber = lidNumber;
        }
      }
    }
    
    if (senderNumber === sender) {
      const actualPhone = resolveLIDToPhone(sender);
      if (actualPhone) {
        senderNumber = actualPhone;
      }
    }
  }
  
  const cleanSender = normalizeNumber(senderNumber);
  
  const isMatch = ownerNumbers.some(ownerNum => {
    const cleanOwner = normalizeNumber(ownerNum);
    return cleanSender === cleanOwner || 
           cleanSender.endsWith(cleanOwner) || 
           cleanOwner.endsWith(cleanSender);
  });
  
  return isMatch;
};

const isSudo = (sender, groupMetadata = null) => {
  if (isOwner(sender, groupMetadata)) return true;

  let actualPhone = sender;
  if (sender.includes('@lid')) {
    if (groupMetadata && groupMetadata.participants) {
      const participant = groupMetadata.participants.find(p => p.id === sender);
      if (participant && participant.lid) {
        const lidNumber = participant.lid.split(':')[0];
        if (lidNumber) actualPhone = lidNumber;
      }
    }
    
    if (actualPhone === sender) {
      const resolved = resolveLIDToPhone(sender);
      if (resolved) actualPhone = resolved;
    }
  }

  const cleanSender = normalizeNumber(actualPhone);

  const sudoData = loadSudoConfig();
  if (sudoData && sudoData.sudoUsers && sudoData.sudoUsers.length > 0) {
    const isSudoUser = sudoData.sudoUsers.some(u => cleanSender.endsWith(normalizeNumber(u)));
    if (isSudoUser) {
        return true;
    }
  }
  
  return false;
};

const canUseInSelfMode = (sender, botOwnerNumber, groupMetadata = null) => {
  const cleanSender = resolveOwnerNumber(sender, groupMetadata);
  const cleanBotOwner = normalizeNumber(botOwnerNumber);
  
  if (cleanSender === cleanBotOwner || 
      cleanSender.endsWith(cleanBotOwner) || 
      cleanBotOwner.endsWith(cleanSender)) {
    return true;
  }
  
  if (isOwnerSudoUser(cleanBotOwner, cleanSender)) {
    return true;
  }
  
  return false;
};

const hasPermission = (sender, requiredLevel = 'user') => {
  switch (requiredLevel.toLowerCase()) {
    case 'owner':
      return isOwner(sender);
    case 'sudo':
      return isSudo(sender);
    case 'user':
    default:
      return true;
  }
};

const getPermissionContext = (sender) => {
  const isOwnerUser = isOwner(sender);
  const isSudoUser = isSudo(sender);
  
  return {
    sender,
    isOwner: isOwnerUser,
    isSudo: isSudoUser,
    permissionLevel: isOwnerUser ? 'owner' : (isSudoUser ? 'sudo' : 'user')
  };
};

const isOwnerOfThisBot = (sender, botPhoneNumber) => {
  if (!botPhoneNumber) return isOwner(sender);
  
  let senderNumber = sender;
  if (sender.includes('@lid')) {
    const resolved = resolveLIDToPhone(sender);
    if (resolved) senderNumber = resolved;
  }
  const cleanSender = normalizeNumber(senderNumber);
  const cleanBotPhone = normalizeNumber(botPhoneNumber);
  
  const isThisBot = cleanSender === cleanBotPhone || 
                    cleanSender.includes(cleanBotPhone) || 
                    cleanSender.endsWith(cleanBotPhone);
  
  return isThisBot;
};

const getMatchingOwnerNumber = (sender, groupMetadata = null) => {
  const cleanSender = resolveOwnerNumber(sender, groupMetadata);
  const ownerNumbers = getOwnerNumbers();
  
  for (const ownerNum of ownerNumbers) {
    const cleanOwner = normalizeNumber(ownerNum);
    if (cleanSender === cleanOwner || 
        cleanSender.endsWith(cleanOwner) || 
        cleanOwner.endsWith(cleanSender)) {
      return cleanOwner;
    }
  }
  
  return null;
};

module.exports = {
  normalizeNumber,
  resolveLIDToPhone,
  isOwner,
  isSudo,
  hasPermission,
  getPermissionContext,
  getOwnerNumbers,
  addOwner,
  removeOwner,
  isOwnerOfThisBot,
  loadOwnerConfig,
  saveOwnerConfig,
  getOwnerConfig,
  setOwnerConfig,
  createOwnerConfig,
  removeOwnerConfig,
  getOwnerMode,
  getOwnerPrefix,
  resolveOwnerNumber,
  getDefaultOwnerConfig,
  getOwnerSudoUsers,
  addOwnerSudoUser,
  removeOwnerSudoUser,
  isOwnerSudoUser,
  canUseInSelfMode,
  getMatchingOwnerNumber,
  loadSudoConfig,
  saveSudoConfig,
  getConfigDir
};
