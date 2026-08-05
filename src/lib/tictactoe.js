/*
 * ============================================
 * TICTACTOE.JS - Tic-Tac-Toe Game Logic
 * Created by: 𝐋 𝐎 𝐑 𝐃 ♰ 𝔻 𝐄 𝐕 𝐈 𝐍 𝐄
 * ============================================
 */

// ============================================
// BOARD UTILITIES
// ============================================

/**
 * Create empty board
 */
const createBoard = () => {
  return Array(9).fill(null); // [null, null, ..., null]
};

/**
 * Render board as string
 */
const renderBoard = (board) => {
  const display = board.map((cell, i) => {
    if (cell === 'X') return '❌';
    if (cell === 'O') return '⭕';
    return `${i + 1}️⃣`; // Show position number
  });
  
  return `
${display[0]} │ ${display[1]} │ ${display[2]}
─────────────
${display[3]} │ ${display[4]} │ ${display[5]}
─────────────
${display[6]} │ ${display[7]} │ ${display[8]}
`;
};

/**
 * Check if move is valid
 */
const isValidMove = (board, position) => {
  const index = position - 1; // Convert 1-9 to 0-8
  return index >= 0 && index < 9 && board[index] === null;
};

/**
 * Make a move on the board
 */
const makeMove = (board, position, symbol) => {
  const newBoard = [...board];
  newBoard[position - 1] = symbol;
  return newBoard;
};

/**
 * Check for winner
 */
const checkWinner = (board) => {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  
  for (const [a, b, c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Returns 'X' or 'O'
    }
  }
  
  return null;
};

/**
 * Check if board is full (draw)
 */
const isBoardFull = (board) => {
  return board.every(cell => cell !== null);
};

/**
 * Check game status
 */
const getGameStatus = (board) => {
  const winner = checkWinner(board);
  if (winner) return { status: 'won', winner };
  if (isBoardFull(board)) return { status: 'draw' };
  return { status: 'ongoing' };
};

// ============================================
// AI OPPONENT (Minimax Algorithm)
// ============================================

/**
 * Evaluate board for minimax
 */
const evaluate = (board) => {
  const winner = checkWinner(board);
  if (winner === 'O') return 10;  // AI wins
  if (winner === 'X') return -10; // Human wins
  return 0; // Draw or ongoing
};

/**
 * Minimax algorithm for AI
 */
const minimax = (board, depth, isMaximizing) => {
  const score = evaluate(board);
  
  // Terminal states
  if (score === 10) return score - depth;
  if (score === -10) return score + depth;
  if (isBoardFull(board)) return 0;
  
  if (isMaximizing) {
    let best = -1000;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O'; // AI move
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null; // Undo
      }
    }
    return best;
  } else {
    let best = 1000;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X'; // Human move
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null; // Undo
      }
    }
    return best;
  }
};

/**
 * Get best move for AI
 */
const getBestAIMove = (board) => {
  let bestVal = -1000;
  let bestMove = -1;
  
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O'; // Try AI move
      const moveVal = minimax(board, 0, false);
      board[i] = null; // Undo
      
      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }
  
  return bestMove + 1; // Return 1-9 position
};

module.exports = {
  createBoard,
  renderBoard,
  isValidMove,
  makeMove,
  checkWinner,
  isBoardFull,
  getGameStatus,
  getBestAIMove
};
