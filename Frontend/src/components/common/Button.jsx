import React from 'react';
import './Button.css';

/**
 * Многофункционален компонент за бутони
 */
const Button = ({
  children,
  type = 'button',
  className = '',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  ...otherProps
}) => {
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...otherProps}
    >
      {loading && (
        <span className="btn-spinner">
          <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
          <span className="visually-hidden">Зареждане...</span>
        </span>
      )}
      <span className={loading ? 'btn-text-with-spinner' : ''}>{children}</span>
    </button>
  );
};

export default Button;