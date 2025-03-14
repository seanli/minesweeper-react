import React from 'react';
import Cell from './Cell';
import '../styles/Board.css';

const Board = ({ board, revealed, flags, onCellClick, onCellRightClick }) => {
  const handleContextMenu = (e) => {
    e.preventDefault(); // Prevent default right-click menu
  };

  return (
    <div className="board" onContextMenu={handleContextMenu}>
      {board.map((row, y) => (
        <div key={y} className="board-row">
          {row.map((value, x) => (
            <Cell
              key={`${x}-${y}`}
              value={value}
              revealed={revealed[y][x]}
              flagged={flags[y][x]}
              onClick={() => onCellClick(x, y)}
              onRightClick={(e) => {
                e.preventDefault();
                onCellRightClick(x, y);
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
