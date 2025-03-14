import React, { useState, useRef, useCallback } from 'react';
import '../styles/Cell.css';

const Cell = ({ value, revealed, flagged, onClick, onRightClick }) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timerRef = useRef(null);
  const touchStartTime = useRef(0);

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

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    touchStartTime.current = Date.now();
    timerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      onRightClick(e);
    }, 500);
  }, [onRightClick]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    clearTimeout(timerRef.current);
    const touchDuration = Date.now() - touchStartTime.current;

    if (!longPressTriggered && touchDuration < 500) {
      onClick(e);
    }
    setLongPressTriggered(false);
  }, [onClick, longPressTriggered]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    clearTimeout(timerRef.current);
    setLongPressTriggered(false);
  }, []);

  return (
    <button
      className={getCellClass()}
      onClick={onClick}
      onContextMenu={onRightClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      disabled={revealed && !flagged}
    >
      {getCellContent()}
    </button>
  );
};

export default Cell;
