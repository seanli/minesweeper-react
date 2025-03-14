const redis = require('./redis');

class GameStateManager {
  constructor() {
    this.defaultWidth = 10;
    this.defaultHeight = 10;
    this.defaultMineCount = 10;
    this.maxGamesStored = 50;
  }

  validateDimensions(width, height, mineCount) {
    width = Math.max(5, Math.min(30, Math.floor(width)));
    height = Math.max(5, Math.min(30, Math.floor(height)));
    mineCount = Math.max(1, Math.min(width * height - 1, Math.floor(mineCount)));
    return { width, height, mineCount };
  }

  createEmptyBoard(width, height, defaultValue) {
    const board = Array(height).fill().map(() => Array(width).fill(defaultValue));
    if (!Array.isArray(board) || board.length !== height || 
        !board.every(row => Array.isArray(row) && row.length === width)) {
      throw new Error('Failed to create board array');
    }
    return board;
  }

  placeMines(board, width, height, mineCount) {
    const mines = new Set();
    
    while (mines.size < mineCount) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const key = `${x},${y}`;
      
      if (!mines.has(key)) {
        mines.add(key);
        board[y][x] = -1; // Mark mine position with -1
        
        // Calculate numbers for adjacent cells
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && board[ny][nx] !== -1) {
              board[ny][nx]++;
            }
          }
        }
      }
    }

    return Array.from(mines).map(pos => pos.split(',').map(Number));
  }

  createGameState(width = this.defaultWidth, height = this.defaultHeight, mineCount = this.defaultMineCount) {
    try {
      const dimensions = this.validateDimensions(width, height, mineCount);
      width = dimensions.width;
      height = dimensions.height;
      mineCount = dimensions.mineCount;

      const board = this.createEmptyBoard(width, height, 0);
      const revealed = this.createEmptyBoard(width, height, false);
      const flags = this.createEmptyBoard(width, height, false);
      const mines = this.placeMines(board, width, height, mineCount);

      const state = { board, revealed, flags, mines };

      if (!state.board || !state.revealed || !state.flags || !state.mines) {
        throw new Error('Invalid game state structure');
      }

      return state;
    } catch (error) {
      console.error('Error creating game state:', error);
      throw error;
    }
  }

  async saveGame(gameState, status = 'ongoing') {
    try {
      const gameId = Date.now().toString();
      const newGame = {
        id: gameId,
        state: {
          board: gameState.board,
          revealed: gameState.revealed,
          flags: gameState.flags,
          mines: gameState.mines
        },
        status,
        timestamp: Date.now()
      };
      
      // Save individual game state
      await redis.set(`game:${gameId}`, newGame);
      
      // Update games list
      let games = await redis.get('games') || [];
      games.unshift(newGame);
      if (games.length > this.maxGamesStored) {
        games = games.slice(0, this.maxGamesStored);
      }
      await redis.set('games', games);
      
      return gameId;
    } catch (error) {
      console.error('Error saving game:', error);
      throw new Error('Failed to save game state');
    }
  }

  async getGame(gameId) {
    try {
      // Try to get individual game state first
      const game = await redis.get(`game:${gameId}`);
      if (game) return game;
      
      // Fallback to searching in games list
      const games = await redis.get('games');
      if (!Array.isArray(games)) return null;
      
      const foundGame = games.find(g => g.id === gameId);
      if (!foundGame) return null;
      
      // Cache the game state for future access
      await redis.set(`game:${gameId}`, foundGame);
      return foundGame;
    } catch (error) {
      console.error('Error getting game:', error);
      throw new Error('Failed to retrieve game state');
    }
  }

  async updateGame(gameId, gameState, status) {
    try {
      const game = await this.getGame(gameId);
      if (!game) {
        throw new Error('Game not found');
      }
      
      const updatedGame = {
        ...game,
        state: gameState,
        status: status || game.status
      };
      
      await redis.set(`game:${gameId}`, updatedGame);
      
      // Update in games list
      let games = await redis.get('games') || [];
      games = games.map(g => g.id === gameId ? updatedGame : g);
      await redis.set('games', games);
      
      return updatedGame;
    } catch (error) {
      console.error('Error updating game:', error);
      throw new Error('Failed to update game state');
    }
  }

  async getRecentGames() {
    try {
      const games = await redis.get('games');
      return Array.isArray(games) ? games.slice(0, 5) : [];
    } catch (error) {
      console.error('Error getting recent games:', error);
      return [];
    }
  }
}

// Export a singleton instance
module.exports = new GameStateManager();
