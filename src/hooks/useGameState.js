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
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [updateGameState]);

  const revealCell = useCallback(async (x, y) => {
    if (!gameId || status !== 'ongoing' || !gameState) return;

    // Optimistically update the UI
    const newRevealed = gameState.revealed.map(row => [...row]);
    newRevealed[y][x] = true;
    
    setGameState(prev => ({
      ...prev,
      revealed: newRevealed
    }));

    try {
      const response = await fetch('/api/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, x, y })
      });
      const data = await response.json();
      
      // Update with actual server state
      updateGameState(data);
    } catch (error) {
      console.error('Error revealing cell:', error);
      setStatus('error');
      
      // Revert optimistic update on error
      setGameState(prev => ({
        ...prev,
        revealed: gameState.revealed
      }));
    }
  }, [gameId, status, gameState, updateGameState]);

  const toggleFlag = useCallback(async (x, y) => {
    if (!gameId || status !== 'ongoing' || !gameState) return;

    // Optimistically update the UI
    const newFlags = gameState.flags.map(row => [...row]);
    newFlags[y][x] = !newFlags[y][x];
    
    setGameState(prev => ({
      ...prev,
      flags: newFlags
    }));

    try {
      const response = await fetch('/api/toggle-flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId, x, y })
      });
      const data = await response.json();
      
      // Update with actual server state
      updateGameState(data);
    } catch (error) {
      console.error('Error toggling flag:', error);
      setStatus('error');
      
      // Revert optimistic update on error
      setGameState(prev => ({
        ...prev,
        flags: gameState.flags
      }));
    }
  }, [gameId, status, gameState, updateGameState]);

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
