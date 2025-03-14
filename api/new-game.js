const gameState = require('./lib/gameState');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Create new game state
    const state = gameState.createGameState();
    if (!state || !state.board || !state.revealed || !state.flags || !state.mines) {
      console.error('Invalid game state created:', state);
      throw new Error('Invalid game state created');
    }

    // Save game state
    const gameId = await gameState.saveGame(state);
    if (!gameId) {
      throw new Error('Failed to save game');
    }

    // Return the complete game state
    return res.status(200).json({
      game_id: gameId,
      board: state.board,
      revealed: state.revealed,
      flags: state.flags,
      mines: state.mines
    });
  } catch (error) {
    console.error('Error in new-game endpoint:', error);
    return res.status(500).json({
      error: 'Failed to create new game',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
