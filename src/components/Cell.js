import React from 'react';
import '../styles/Cell.css';

const Cell = ({ value, revealed, flagged, onClick, onRightClick }) => {
  const getCellContent = () => {
    if (!revealed && flagged) return '🚩';
    if (!revealed) return '';
    if (value === -1) return '💣';
    return value === 0 ? '' : value;
  };

  const getCellClass = () => {
    let className = 'cell';
    if (revealed) {
      className += ' revealed';
      if (value === -1) {
        className += ' mine';
      } else {
        className += ` number-${value}`;
      }
    }
    if (flagged) {
      className += ' flagged';
    }
    return className;
  };

  return (
    <button
      className={getCellClass()}
      onClick={onClick}
      onContextMenu={onRightClick}
      disabled={revealed && !flagged}
    >
      {getCellContent()}
    </button>
  );
};

export default Cell;
