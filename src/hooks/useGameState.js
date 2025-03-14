import { useState, useCallback } from 'react';

const useGameState = () => {
  const [gameState, setGameState] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [status, setStatus] = useState('ongoing');
  const [loading, setLoading] = useState(true);

  const updateGameState = useCallback((data) => {
    setGameState({
      board: data.board,
      revealed: data.revealed,
      flags: data.flags,
      mines: data.mines
    });
    if (data.status) {
      setStatus(data.status);
    }
  }, []);

  const startNewGame = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/new-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setGameId(data.game_id);
      updateGameState(data);
      setStatus('ongoing');
    } catch (error) {
      console.error('Error starting new game:', error);
    } finally {
      setLoading(false);
    }
  }, [updateGameState]);

  const revealCell = useCallback(async (x, y) => {
    if (!gameId || status !== 'ongoing') return;

    try {
      const response = await fetch('/api/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, x, y })
      });
      const data = await response.json();
      updateGameState(data);
      
      if (data.status !== 'ongoing') {
        setTimeout(() => {
          alert(data.status === 'won' ? 'Congratulations! You won!' : 'Game Over!');
        }, 100);
      }
    } catch (error) {
      console.error('Error revealing cell:', error);
    }
  }, [gameId, status, updateGameState]);

  const toggleFlag = useCallback(async (x, y) => {
    if (!gameId || status !== 'ongoing') return;

    try {
      const response = await fetch('/api/toggle-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, x, y })
      });
      const data = await response.json();
      updateGameState(data);
    } catch (error) {
      console.error('Error toggling flag:', error);
    }
  }, [gameId, status, updateGameState]);

  return {
    gameState,
    status,
    loading,
    startNewGame,
    revealCell,
    toggleFlag
  };
};

export default useGameState;
