 /*
 * ============================================
 * RPS.JS - Rock Paper Scissors Game Logic
 * Created by: 𝐋 𝐎 𝐑 𝐃 ♰ 𝔻 𝐄 𝐕 𝐈 𝐍 𝐄
 * ============================================
 */

// ============================================
// GAME CONSTANTS
// ============================================
const CHOICES = ['rock', 'paper', 'scissors'];
const CHOICE_EMOJIS = {
  'rock': '✊',
  'paper': '✋',
  'scissors': '✌️'
};

// ============================================
// GAME STATE FUNCTIONS
// ============================================

/**
 * Create initial game state for RPS
 */
const createGameState = () => {
  return {
    round: 1,
    maxRounds: 3,
    scores: {}, // { playerId: score }
    currentRoundChoices: {}, // { playerId: choice }
    waitingFor: null, // Player ID who needs to choose
    roundStartTime: Date.now()
  };
};

/**
 * Check if choice is valid
 */
const isValidChoice = (choice) => {
  const normalized = choice.toLowerCase().trim();
  return CHOICES.includes(normalized) || ['r', 'p', 's'].includes(normalized);
};

/**
 * Normalize choice (convert shortcuts)
 */
const normalizeChoice = (choice) => {
  const normalized = choice.toLowerCase().trim();
  if (normalized === 'r') return 'rock';
  if (normalized === 'p') return 'paper';
  if (normalized === 's') return 'scissors';
  return normalized;
};

/**
 * Get random choice for AI
 */
const getAIChoice = () => {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
};

/**
 * Pick random winner (50/50 chance for each player)
 * Returns winner's player ID
 */
const pickRandomWinner = (player1Id, player2Id) => {
  return Math.random() < 0.5 ? player1Id : player2Id;
};

/**
 * Check if someone won the game (reached 2 wins)
 */
const checkGameWinner = (scores) => {
  for (const [playerId, score] of Object.entries(scores)) {
    if (score >= 2) {
      return playerId;
    }
  }
  return null;
};

/**
 * Format round result message
 */
const formatRoundResult = (player1Id, player1Name, player1Choice, player2Id, player2Name, player2Choice, winnerId, scores, round) => {
  const p1Emoji = CHOICE_EMOJIS[player1Choice];
  const p2Emoji = CHOICE_EMOJIS[player2Choice];
  
  const winnerName = winnerId === player1Id ? player1Name : player2Name;
  const winnerNumber = winnerId === player1Id ? player1Id.split('@')[0] : player2Id.split('@')[0];
  
  return `🎮 𝗥𝗢𝗨𝗡𝗗 ${round} 𝗥𝗘𝗦𝗨𝗟𝗧𝗦 🎮

${p1Emoji} ${player1Name} chose ${player1Choice.toUpperCase()}
${p2Emoji} ${player2Name} chose ${player2Choice.toUpperCase()}

🎲 𝗥𝗔𝗡𝗗𝗢𝗠 𝗪𝗜𝗡𝗡𝗘𝗥 🎲
🏆 @${winnerNumber} 𝗪𝗜𝗡𝗦 𝗧𝗛𝗜𝗦 𝗥𝗢𝗨𝗡𝗗! 🔥

📊 𝗦𝗖𝗢𝗥𝗘:
${player1Name}: ${scores[player1Id] || 0}
${player2Name}: ${scores[player2Id] || 0}`;
};

/**
 * Format game over message
 */
const formatGameOver = (winnerId, winnerName, player1Id, player1Name, player2Id, player2Name, scores) => {
  const winnerNumber = winnerId.split('@')[0];
  
  return `🎮 𝗚𝗔𝗠𝗘 𝗢𝗩𝗘𝗥! 🎮

🏆 @${winnerNumber} 𝗪𝗜𝗡𝗦 𝗧𝗛𝗘 𝗚𝗔𝗠𝗘! 🔥👹

📊 𝗙𝗜𝗡𝗔𝗟 𝗦𝗖𝗢𝗥𝗘:
${player1Name}: ${scores[player1Id] || 0}
${player2Name}: ${scores[player2Id] || 0}

𝗕𝗘𝗦𝗧 𝗢𝗙 𝟯 💀`;
};

module.exports = {
  CHOICES,
  CHOICE_EMOJIS,
  createGameState,
  isValidChoice,
  normalizeChoice,
  getAIChoice,
  pickRandomWinner,
  checkGameWinner,
  formatRoundResult,
  formatGameOver
}; 