const { Redis } = require('@upstash/redis');

const getConfig = () => {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.warn('Redis environment variables are not set');
    return {
      async get(key) { 
        console.log(`Mock get for key: ${key}`);
        return key === 'games' ? [] : null;
      },
      async set(key, value) {
        console.log(`Mock set for key: ${key}`, value);
        return true;
      },
      async has(key) {
        return false;
      }
    };
  }

  let client;
  try {
    client = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    const config = {
      async get(key) {
        try {
          const value = await client.get(key);
          if (value === null || value === undefined) {
            if (key === 'games') return [];
            return null;
          }
          return value; // Upstash Redis automatically handles JSON serialization
        } catch (error) {
          console.error(`Error getting ${key} from Redis:`, error);
          throw new Error(`Failed to get ${key} from Redis`);
        }
      },
      async set(key, value) {
        try {
          if (!key || value === undefined) {
            throw new Error('Invalid key or value');
          }
          await client.set(key, value); // Upstash Redis automatically handles JSON serialization
          return true;
        } catch (error) {
          console.error(`Error setting ${key} in Redis:`, error);
          throw new Error(`Failed to set ${key} in Redis`);
        }
      },
      async has(key) {
        try {
          if (!key) {
            throw new Error('Invalid key');
          }
          const value = await client.exists(key);
          return value === 1;
        } catch (error) {
          console.error(`Error checking ${key} in Redis:`, error);
          return false;
        }
      }
    };
    return config;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    throw new Error('Failed to initialize Redis client');
  }
};

function createGameState(width = 10, height = 10, mineCount = 10) {
  try {
    // Validate input parameters
    width = Math.max(5, Math.min(30, Math.floor(width)));
    height = Math.max(5, Math.min(30, Math.floor(height)));
    mineCount = Math.max(1, Math.min(width * height - 1, Math.floor(mineCount)));

    // Create game arrays with validation
    const board = Array(height).fill().map(() => Array(width).fill(0));
    if (!Array.isArray(board) || board.length !== height || 
        !board.every(row => Array.isArray(row) && row.length === width)) {
      throw new Error('Failed to create board array');
    }

    const revealed = Array(height).fill().map(() => Array(width).fill(false));
    if (!Array.isArray(revealed) || revealed.length !== height || 
        !revealed.every(row => Array.isArray(row) && row.length === width)) {
      throw new Error('Failed to create revealed array');
    }

    const flags = Array(height).fill().map(() => Array(width).fill(false));
    if (!Array.isArray(flags) || flags.length !== height || 
        !flags.every(row => Array.isArray(row) && row.length === width)) {
      throw new Error('Failed to create flags array');
    }

    const mines = new Set();

    // Place mines randomly
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

    const minesArray = Array.from(mines).map(pos => pos.split(',').map(Number));
    if (!Array.isArray(minesArray) || minesArray.length !== mineCount) {
      throw new Error('Failed to create mines array');
    }

    const state = {
      board,
      revealed,
      flags,
      mines: minesArray
    };

    // Final validation
    if (!state.board || !state.revealed || !state.flags || !state.mines) {
      throw new Error('Invalid game state structure');
    }

    return state;
  } catch (error) {
    console.error('Error creating game state:', error);
    throw error;
  }
}

async function saveGame(gameState, status = 'ongoing') {
  const config = getConfig();
  const gameId = Date.now().toString();
  
  try {
    // Create new game entry
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
    
    // Save game state to Redis
    await config.set(`game:${gameId}`, newGame);
    
    // Get existing games from Redis
    let games = await config.get('games') || [];
    
    // Add to games list
    games.unshift(newGame);
    if (games.length > 50) {
      games = games.slice(0, 50);
    }

    // Save updated games list
    await config.set('games', games);
    
    return gameId;
  } catch (error) {
    console.error('Error saving game:', error);
    throw new Error('Failed to save game state');
  }
}

async function getGame(gameId) {
  const config = getConfig();
  try {
    // Try to get individual game state first
    const game = await config.get(`game:${gameId}`);
    if (game) return game;
    
    // Fallback to searching in games list
    const games = await config.get('games');
    if (!Array.isArray(games)) return null;
    
    const foundGame = games.find(g => g.id === gameId);
    if (!foundGame) return null;
    
    // Cache the game state for future access
    await config.set(`game:${gameId}`, foundGame);
    return foundGame;
  } catch (error) {
    console.error('Error getting game:', error);
    throw new Error('Failed to retrieve game state');
  }
}

async function updateGame(gameId, gameState, status) {
  const config = getConfig();
  try {
    // Update individual game state
    const updatedGame = {
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
    
    await config.set(`game:${gameId}`, updatedGame);
    
    // Update in games list
    const games = await config.get('games');
    if (Array.isArray(games)) {
      const gameIndex = games.findIndex(g => g.id === gameId);
      if (gameIndex !== -1) {
        games[gameIndex] = updatedGame;
        await config.set('games', games);
      }
    }
  } catch (error) {
    console.error('Error updating game:', error);
    throw new Error('Failed to update game state');
  }
}

async function getRecentGames() {
  const config = getConfig();
  const games = await config.get('games');
  if (!Array.isArray(games)) return [];
  return games.slice(0, 5); // Return only the 5 most recent games
}

module.exports = {
  createGameState,
  saveGame,
  getGame,
  updateGame,
  getRecentGames
};
