const gameState = require('./gameState');

class GameLogic {
  isValidPosition(x, y, board) {
    return x >= 0 && x < board[0].length && y >= 0 && y < board.length;
  }

  async revealCell(gameId, x, y) {
    try {
      const game = await gameState.getGame(gameId);
      if (!game || game.status !== 'ongoing') {
        throw new Error('Invalid game or game is not active');
      }

      const { board, revealed, flags, mines } = game.state;
      if (!this.isValidPosition(x, y, board)) {
        throw new Error('Invalid position');
      }

      if (revealed[y][x] || flags[y][x]) {
        return game;
      }

      revealed[y][x] = true;

      // Check if hit mine
      if (board[y][x] === -1) {
        // Reveal all mines
        mines.forEach(([mx, my]) => {
          revealed[my][mx] = true;
        });
        return await gameState.updateGame(gameId, { board, revealed, flags, mines }, 'lost');
      }

      // If empty cell, reveal neighbors
      if (board[y][x] === 0) {
        await this.revealEmptyCells(x, y, board, revealed, flags);
      }

      // Check if won
      const hasWon = this.checkWinCondition(board, revealed);
      if (hasWon) {
        return await gameState.updateGame(gameId, { board, revealed, flags, mines }, 'won');
      }

      return await gameState.updateGame(gameId, { board, revealed, flags, mines }, 'ongoing');
    } catch (error) {
      console.error('Error revealing cell:', error);
      throw error;
    }
  }

  async revealEmptyCells(x, y, board, revealed, flags) {
    const stack = [[x, y]];
    const width = board[0].length;
    const height = board.length;

    while (stack.length > 0) {
      const [cx, cy] = stack.pop();

      // Check all adjacent cells
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = cx + dx;
          const ny = cy + dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height && 
              !revealed[ny][nx] && !flags[ny][nx]) {
            revealed[ny][nx] = true;
            if (board[ny][nx] === 0) {
              stack.push([nx, ny]);
            }
          }
        }
      }
    }
  }

  async toggleFlag(gameId, x, y) {
    try {
      const game = await gameState.getGame(gameId);
      if (!game || game.status !== 'ongoing') {
        throw new Error('Invalid game or game is not active');
      }

      const { board, revealed, flags, mines } = game.state;
      if (!this.isValidPosition(x, y, board)) {
        throw new Error('Invalid position');
      }

      if (revealed[y][x]) {
        return game;
      }

      flags[y][x] = !flags[y][x];
      return await gameState.updateGame(gameId, { board, revealed, flags, mines }, 'ongoing');
    } catch (error) {
      console.error('Error toggling flag:', error);
      throw error;
    }
  }

  checkWinCondition(board, revealed) {
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        // If there's an unrevealed cell that's not a mine, game is not won
        if (!revealed[y][x] && board[y][x] !== -1) {
          return false;
        }
      }
    }
    return true;
  }
}

// Export a singleton instance
module.exports = new GameLogic();
