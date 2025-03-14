import React, { useEffect } from 'react';
import '../styles/Toast.css';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`} role="alert">
      {message}
    </div>
  );
};

export default Toast;
