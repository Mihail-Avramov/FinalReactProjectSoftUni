import React from 'react';
import './Alert.css';

/**
 * Компонент за известия с различни типове (грешка, предупреждение, успех, информация)
 */
const Alert = ({ children, type = 'info', dismissible = false, onDismiss, className = '' }) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
      case 'danger':
        return 'exclamation-circle';
      case 'warning':
        return 'exclamation-triangle';
      case 'success':
        return 'check-circle';
      case 'info':
      default:
        return 'info-circle';
    }
  };

  return (
    <div className={`alert alert-${type} ${dismissible ? 'alert-dismissible' : ''} ${className}`} role="alert">
      <div className="alert-content">
        <span className="alert-icon">
          <i className={`fa fa-${getIcon()}`}></i>
        </span>
        <div className="alert-message">{children}</div>
      </div>
      
      {dismissible && onDismiss && (
        <button 
          type="button" 
          className="alert-close" 
          onClick={onDismiss}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
};

export default Alert;