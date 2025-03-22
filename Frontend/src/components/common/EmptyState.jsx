import React from 'react';
import './EmptyState.css';

/**
 * Компонент за показване на съобщение при липса на данни
 * @param {string} message - Съобщение което да бъде показано
 * @param {string} icon - Font Awesome иконка (без префикса 'fa-')
 * @param {React.ReactNode} children - Опционално допълнително съдържание
 * @param {function} action - Опционален обработчик за действие при клик върху бутон
 * @param {string} actionText - Текст за бутона за действие 
 */
const EmptyState = ({ 
  message, 
  icon = 'info-circle',
  children,
  action,
  actionText = 'Опитайте отново'
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={`fas fa-${icon}`}></i>
      </div>
      <p className="empty-state-message">{message}</p>
      
      {children && <div className="empty-state-content">{children}</div>}
      
      {action && (
        <button 
          className="empty-state-action-btn"
          onClick={action}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;