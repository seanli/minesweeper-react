import React, { useState, useEffect } from 'react';
import Board from './Board';
import History from './History';
import '../styles/Game.css';

const Game = () => {
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [status, setStatus] = useState('ongoing');
  const [loading, setLoading] = useState(true);

  const startNewGame = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/new-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setGameId(data.game_id);
      setGameState({
        board: data.board,
        revealed: data.revealed,
        flags: data.flags,
        mines: data.mines
      });
      setStatus('ongoing');
    } catch (error) {
      console.error('Error starting new game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = async (x, y) => {
    if (!gameId || status !== 'ongoing') return;

    try {
      const response = await fetch('/api/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, x, y })
      });
      const data = await response.json();
      
      setGameState({
        board: data.board,
        revealed: data.revealed,
        flags: data.flags,
        mines: data.mines
      });
      setStatus(data.status);
      
      if (data.status !== 'ongoing') {
        setTimeout(() => {
          alert(data.status === 'won' ? 'Congratulations! You won!' : 'Game Over!');
        }, 100);
      }
    } catch (error) {
      console.error('Error revealing cell:', error);
    }
  };

  const handleCellRightClick = async (x, y) => {
    if (!gameId || status !== 'ongoing') return;

    try {
      const response = await fetch('/api/toggle-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, x, y })
      });
      const data = await response.json();
      
      setGameState({
        board: data.board,
        revealed: data.revealed,
        flags: data.flags,
        mines: data.mines
      });
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  };

  useEffect(() => {
    startNewGame();
  }, []);

  if (loading || !gameState) {
    return <div className="game-loading">Loading...</div>;
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Minesweeper</h1>
        <button className="new-game-button" onClick={startNewGame}>
          New Game
        </button>
        <div className="game-status">
          Status: {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      <Board
        board={gameState.board}
        revealed={gameState.revealed}
        flags={gameState.flags}
        onCellClick={handleCellClick}
        onCellRightClick={handleCellRightClick}
      />
      <div className="game-instructions">
        <p>Left click to reveal a cell</p>
        <p>Right click to place/remove a flag</p>
      </div>
      <History />
    </div>
  );
};

export default Game;
