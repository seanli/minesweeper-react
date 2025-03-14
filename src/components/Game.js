import React, { useState, useEffect, useCallback } from 'react';
import Board from './Board';
import History from './History';
import Toast from './Toast';
import useGameState from '../hooks/useGameState';
import '../styles/Game.css';

const GAME_INSTRUCTIONS = [
  { text: 'Tap to reveal a cell', mobile: true },
  { text: 'Long press to place/remove a flag', mobile: true },
  { text: 'Left click to reveal a cell', mobile: false },
  { text: 'Right click to place/remove a flag', mobile: false }
];

const Game = () => {
  const { gameState, status, loading, startNewGame, revealCell, toggleFlag } = useGameState();
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const handleGameEnd = useCallback((newStatus) => {
    if (newStatus === 'won') {
      showToast('Congratulations! You won! 🎉', 'success');
    } else if (newStatus === 'lost') {
      showToast('Game Over! Try again! 💣', 'error');
    }
  }, [showToast]);

  const handleNewGame = useCallback(async () => {
    showToast('Starting new game...', 'success');
    await startNewGame();
  }, [startNewGame, showToast]);

  useEffect(() => {
    if (status !== 'ongoing' && (status === 'won' || status === 'lost')) {
      handleGameEnd(status);
    }
  }, [status, handleGameEnd]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  if (loading || !gameState) {
    return <div className="game-loading" role="alert">Loading...</div>;
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="game-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="game-header">
        <h1>Minesweeper</h1>
        <button 
          className="new-game-button" 
          onClick={handleNewGame}
          aria-label="Start New Game"
        >
          New Game
        </button>
        <div className="game-status" role="status">
          Status: {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      <Board
        board={gameState.board}
        revealed={gameState.revealed}
        flags={gameState.flags}
        onCellClick={revealCell}
        onCellRightClick={toggleFlag}
      />
      <div className="game-instructions" role="complementary">
        {GAME_INSTRUCTIONS
          .filter(instruction => instruction.mobile === isMobile)
          .map((instruction, index) => (
            <p key={index}>{instruction.text}</p>
          ))}
      </div>
      <History />
    </div>
  );
};

export default Game;
