import React, { memo } from 'react';
import useLongPress from '../hooks/useLongPress';
import '../styles/Cell.css';

const CELL_CONTENT = {
  FLAG: '🚩',
  MINE: '💣',
  EMPTY: ''
};

const Cell = memo(({ value, revealed, flagged, onClick, onRightClick }) => {
  const touchHandlers = useLongPress(onClick, onRightClick);

  const getCellContent = () => {
    if (!revealed && flagged) return CELL_CONTENT.FLAG;
    if (!revealed) return CELL_CONTENT.EMPTY;
    if (value === -1) return CELL_CONTENT.MINE;
    return value === 0 ? CELL_CONTENT.EMPTY : value;
  };

  const cellClassName = [
    'cell',
    revealed && 'revealed',
    revealed && value === -1 && 'mine',
    revealed && value > 0 && `number-${value}`,
    flagged && 'flagged'
  ].filter(Boolean).join(' ');

  return (
    <button
      className={cellClassName}
      onClick={onClick}
      onContextMenu={onRightClick}
      {...touchHandlers}
      disabled={revealed && !flagged}
      aria-label={`Cell ${revealed ? 'revealed' : 'hidden'} ${flagged ? 'flagged' : ''}`}
    >
      {getCellContent()}
    </button>
  );
});

export default Cell;
