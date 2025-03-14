import React, { useState, useEffect } from 'react';
import '../styles/History.css';

const History = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 1000); // Refresh every second
    return () => clearInterval(interval);
  }, []);

  const renderMiniBoard = (game) => {
    if (!game.state?.board) return null;
    
    return (
      <div className="mini-board">
        {game.state.board.map((row, y) => (
          <div key={y} className="mini-row">
            {row.map((cell, x) => {
              const isRevealed = game.state.revealed[y][x];
              const isFlagged = game.state.flags[y][x];
              const isMine = cell === -1;
              
              return (
                <div
                  key={`${x}-${y}`}
                  className={`mini-cell ${
                    isRevealed
                      ? isMine
                        ? 'mini-mine'
                        : `mini-revealed mini-n${cell}`
                      : isFlagged
                      ? 'mini-flag'
                      : ''
                  }`}
                >
                  {isRevealed ? (
                    isMine ? (
                      <span className="mini-symbol">💣</span>
                    ) : (
                      cell > 0 && <span className="mini-number">{cell}</span>
                    )
                  ) : isFlagged ? (
                    <span className="mini-symbol">🚩</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="history-loading">Loading history...</div>;
  }

  return (
    <div className="history-container">
      <h2>Recent Games</h2>
      <div className="games-list">
        {games.map((game) => (
          <div key={game.id} className="game-entry">
            {renderMiniBoard(game)}
            <div className="game-info">
              <span className={`game-status status-${game.status}`}>
                {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
              </span>
              <span className="game-time">
                {new Date(game.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
