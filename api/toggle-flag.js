const gameLogic = require('./lib/gameLogic');
const gameState = require('./lib/gameState');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { game_id, x, y } = req.body;
    if (!game_id) {
      return res.status(400).json({ error: 'Missing game_id' });
    }
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const game = await gameState.getGame(game_id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    if (game.status !== 'ongoing') {
      return res.status(400).json({ error: 'Game is already finished', status: game.status, ...game.state });
    }

    // Validate game state
    const state = game.state;
    if (!state || !state.board || !state.revealed || !state.flags || !state.mines) {
      return res.status(500).json({ error: 'Invalid game state' });
    }

    // Validate coordinates against actual board dimensions
    if (x < 0 || x >= state.board[0].length || y < 0 || y >= state.board.length) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Use game logic to toggle flag
    const updatedGame = await gameLogic.toggleFlag(game_id, x, y);

    return res.status(200).json({
      status: updatedGame.status,
      board: updatedGame.state.board,
      revealed: updatedGame.state.revealed,
      flags: updatedGame.state.flags,
      mines: updatedGame.state.mines
    });
  } catch (error) {
    console.error('Error toggling flag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
