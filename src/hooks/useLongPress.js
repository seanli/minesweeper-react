import { useCallback, useRef, useState } from 'react';

const useLongPress = (onPress, onLongPress, longPressDelay = 500) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timerRef = useRef(null);
  const touchStartTime = useRef(0);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    touchStartTime.current = Date.now();
    timerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      onLongPress(e);
    }, longPressDelay);
  }, [onLongPress, longPressDelay]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    clearTimeout(timerRef.current);
    const touchDuration = Date.now() - touchStartTime.current;

    if (!longPressTriggered && touchDuration < longPressDelay) {
      onPress(e);
    }
    setLongPressTriggered(false);
  }, [onPress, longPressTriggered, longPressDelay]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    clearTimeout(timerRef.current);
    setLongPressTriggered(false);
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove
  };
};

export default useLongPress;
