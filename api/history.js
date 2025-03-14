const gameState = require('./lib/gameState');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const games = await gameState.getRecentGames();
    return res.status(200).json(games || []);
  } catch (error) {
    console.error('Error fetching game history:', error);
    return res.status(500).json({
      error: 'Failed to fetch game history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
