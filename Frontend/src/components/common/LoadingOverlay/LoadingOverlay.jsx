import React from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './LoadingOverlay.css';

const LoadingOverlay = ({ 
  active = false, 
  message = 'Зареждане...',
  children,
  minHeight = '400px' // Минимална височина на контейнера
}) => {
  return (
    <div className="loading-overlay-container" style={{ minHeight }}>
      {children}
      
      {active && (
        <div className="loading-overlay">
          <LoadingSpinner message={message} />
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;