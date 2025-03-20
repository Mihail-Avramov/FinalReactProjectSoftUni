import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { useAuth } from '../../hooks/api/useAuth';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import Alert from '../common/Alert';
import './AuthForms.css';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Разширяваме състоянията за поддръжка на валидация
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Нови състояния за поддръжка на валидация
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  
  // Състояние за валидност на формата
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Проверяваме дали има дестинация за пренасочване след вход
  const from = location.state?.from || '/';
  
  // Валидиране на цялата форма
  useEffect(() => {
    const validateForm = () => {
      const hasAllFields = formData.email.trim() !== '' && formData.password.trim() !== '';
      const hasNoErrors = !fieldErrors.email && !fieldErrors.password;
      
      setIsFormValid(hasAllFields && hasNoErrors);
    };
    
    validateForm();
  }, [formData, fieldErrors]);
  
  // Валидиране на имейл с регулярен израз
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Валидиране в реално време
    validateField(name, value);
  };
  
  // Отбелязване на поле като докоснато при напускането му
  const handleBlur = (e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Валидиране при напускане на полето
    validateField(name, formData[name]);
  };
  
  // Валидиране на конкретно поле
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!value) {
          error = 'Имейлът е задължителен';
        } else if (!validateEmail(value)) {
          error = 'Моля, въведете валиден имейл адрес';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Паролата е задължителна';
        } else if (value.length < 6) {
          error = 'Паролата трябва да е поне 6 символа';
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Маркираме всички полета като докоснати
    const allFieldsTouched = { email: true, password: true };
    setTouched(allFieldsTouched);
    
    // Проверка дали формата е валидна
    if (!isFormValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(formData);
      if (result) {
        // Пренасочване към предишната страница или началната страница
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Неуспешен опит за вход');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Рендериране на спинър при изпращане
  const renderLoginSpinner = () => {
    if (!isSubmitting) return null;
    
    return (
      <div className="registration-modal">
        <div className="simple-modal-content">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <p className="spinner-message">Извършване на вход в системата...</p>
        </div>
      </div>
    );
  };
  
  return (
    <form className={`auth-form ${isSubmitting ? 'form-submitting' : ''}`} onSubmit={handleSubmit}>
      {error && <Alert type="error">{error}</Alert>}
      
      {/* Модален спинър при изпращане */}
      {isSubmitting && ReactDOM.createPortal(
        renderLoginSpinner(),
        document.body
      )}
      
      {/* Overlay за блокиране на формата по време на изпращане */}
      {isSubmitting && <div className="form-overlay"></div>}
      
      <FormInput
        label="Имейл"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        error={touched.email ? fieldErrors.email : ''}
        status={touched.email && !fieldErrors.email ? 'valid' : ''}
      />
      
      <FormInput
        label="Парола"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        error={touched.password ? fieldErrors.password : ''}
        status={touched.password && !fieldErrors.password ? 'valid' : ''}
      />
      
      <Button 
        type="submit"
        className="auth-button"
        disabled={isSubmitting || !isFormValid}
        loading={isSubmitting}
      >
        Вход
      </Button>
    </form>
  );
};

export default LoginForm;