import React, { useState } from 'react';
import './FormInput.css';

/**
 * Компонент за входно поле с етикет
 */
const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  status,
  required = false,
  minLength,
  maxLength,
  disabled = false,
  className = '',
  ...otherProps
}) => {
  const id = `input-${name || Math.random().toString(36).substring(2, 9)}`;
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Определяме действителния тип на инпута за пароли
  const actualType = type === 'password' && showPassword ? 'text' : type;
  
  // Определяме класовете базирани на статуса и грешките
  const inputClass = `form-control ${error ? 'is-invalid' : ''} ${status === 'valid' ? 'is-valid' : ''}`;
  
  return (
    <div className={`form-group ${className} ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div className={`${type === 'password' || status === 'valid' || error ? 'input-with-icon' : ''}`}>
        <input
          id={id}
          type={actualType}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          disabled={disabled}
          className={inputClass}
          autoComplete={type === 'password' ? 'new-password' : type === 'email' ? 'email' : 'off'}
          {...otherProps}
        />
        
        {type === 'password' && (
          <span className="input-icon" onClick={togglePasswordVisibility}>
            <i className={`fa fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
          </span>
        )}
        
        {status === 'valid' && !error && (
          <span className="validation-icon valid-icon">
            <i className="fa fa-check-circle"></i>
          </span>
        )}
        
        {error && (
          <span className="validation-icon error-icon">
            <i className="fa fa-exclamation-circle"></i>
          </span>
        )}
      </div>
      
      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default FormInput;