import React, { useState, useEffect } from 'react';
import { useConfig } from '../../../hooks/api/useConfig';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './AppInitializer.css';

const AppInitializer = ({ children }) => {
  const { loading: configLoading } = useConfig();
  const [showSlowLoadingMessage, setShowSlowLoadingMessage] = useState(false);
  const [showVerySlowLoadingMessage, setShowVerySlowLoadingMessage] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let shortTimer, longTimer, elapsedTimer, progressInterval;
    
    if (configLoading) {
      const startTime = Date.now();
      
      // Обновяваме изминалото време
      elapsedTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
        
        // Изчисляваме прогреса - достига 100% след 30 секунди
        const calculatedProgress = Math.min(100, (elapsed / 30) * 100);
        setProgress(calculatedProgress);
      }, 1000);
      
      // След 3 секунди показваме първото съобщение
      shortTimer = setTimeout(() => {
        setShowSlowLoadingMessage(true);
      }, 3000);
      
      // След 10 секунди показваме по-детайлно съобщение
      longTimer = setTimeout(() => {
        setShowVerySlowLoadingMessage(true);
      }, 10000);
    } else {
      setShowSlowLoadingMessage(false);
      setShowVerySlowLoadingMessage(false);
      setElapsedTime(0);
      setProgress(0);
    }
    
    return () => {
      clearTimeout(shortTimer);
      clearTimeout(longTimer);
      clearInterval(elapsedTimer);
      clearInterval(progressInterval);
    };
  }, [configLoading]);
  
  // Подготвяме съобщението според времето на зареждане
  const getMessage = () => {
    if (showVerySlowLoadingMessage) {
      return "Събуждане на сървъра след период на неактивност";
    }
    if (showSlowLoadingMessage) {
      return "Събуждане на сървъра...";
    }
    return "Зареждане на приложението...";
  };
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  const formatTime = (seconds) => {
    return `${seconds} ${seconds === 1 ? 'секунда' : 'секунди'}`;
  };
  
  if (configLoading) {
    return (
      <div className="app-initializing">
        <div className="loading-content">
          {/* Лого - заменете src с реалния път до вашето лого */}
          <img 
            src="/android-chrome-192x192.png"
            alt="CulinaryCorner"
            className="app-logo"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          
          <LoadingSpinner message={getMessage()} />
          
          {showSlowLoadingMessage && (
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          
          {showSlowLoadingMessage && (
            <div className="timer">
              {formatTime(elapsedTime)}
            </div>
          )}
          
          {showVerySlowLoadingMessage && (
            <div className="loading-info">
              <p>
                <strong>Благодарим за търпението!</strong>
              </p>
              <p>Тъй като използваме безплатен хостинг, сървърът се "приспива" след период на неактивност.</p>
              <p>Първоначалното зареждане може да отнеме повече от 30 секунди.</p>
              
              {elapsedTime > 20 && (
                <button className="refresh-button" onClick={handleRefresh}>
                  Опресни страницата
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return children;
};

export default AppInitializer;