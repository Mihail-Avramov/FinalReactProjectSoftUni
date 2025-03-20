import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../hooks/api/useAuth';
import { validateImage } from '../../utils/imageOptimization';
import FormInput from '../common/FormInput';
import ImageUpload from '../common/ImageUpload';
import Button from '../common/Button';
import Alert from '../common/Alert';
import './AuthForms.css';

const RegisterForm = ({ onSuccess }) => {
  const [registrationStage, setRegistrationStage] = useState('idle');
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Отделни състояния за полетата и техните грешки
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    profileImage: null
  });
  
  // Състояние за грешки на отделните полета
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
    profileImage: ''
  });
  
  // Състояние за докоснати полета (за да показваме грешки само след като потребителят е взаимодействал с полето)
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    username: false,
    firstName: false,
    lastName: false
  });
  
  // Състояние за валидност на формата
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Проверка на силата на паролата
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0, // от 0 до 4
    feedback: ''
  });

  // Валидиране на цялата форма
  useEffect(() => {
    const validateForm = () => {
      // Проверка дали всички задължителни полета са попълнени и без грешки
      const requiredFields = ['email', 'password', 'confirmPassword', 'username', 'firstName', 'lastName'];
      
      const hasAllRequiredFields = requiredFields.every(field => formData[field].trim() !== '');
      const hasNoErrors = Object.values(fieldErrors).every(error => error === '');
      
      setIsFormValid(hasAllRequiredFields && hasNoErrors);
    };
    
    validateForm();
  }, [formData, fieldErrors]);
  
  // Валидиране на имейл с регулярен израз
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Оценка на силата на паролата
  const evaluatePasswordStrength = (password) => {
    // Прост алгоритъм за оценка на паролата
    let score = 0;
    const feedback = [];
    
    if (password.length >= 8) {
      score++;
    } else {
      feedback.push('Паролата трябва да е поне 8 символа');
    }
    
    if (/[A-Z]/.test(password)) {
      score++;
    } else {
      feedback.push('Добавете главна буква');
    }
    
    if (/[a-z]/.test(password)) {
      score++;
    } else {
      feedback.push('Добавете малка буква');
    }
    
    if (/[0-9]/.test(password)) {
      score++;
    } else {
      feedback.push('Добавете цифра');
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    } else {
      feedback.push('Добавете специален символ');
    }
    
    return {
      score,
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Отлична парола!'
    };
  };
  
  // Вход от полета за текст
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

      // Отбелязваме полето за парола като докоснато веднага при въвеждане
    if (name === 'password' && value) {
      setTouched(prev => ({
        ...prev,
        password: true
      }));
    }
    
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
        
        // Оценяване на силата на паролата
        if (value) {
          setPasswordStrength(evaluatePasswordStrength(value));
        }
        
        // Проверка и за съвпадение с confirmPassword, ако е попълнено
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setFieldErrors(prev => ({
            ...prev,
            confirmPassword: 'Паролите не съвпадат'
          }));
        } else if (formData.confirmPassword) {
          setFieldErrors(prev => ({
            ...prev,
            confirmPassword: ''
          }));
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Моля, повторете паролата';
        } else if (value !== formData.password) {
          error = 'Паролите не съвпадат';
        }
        break;
        
      case 'username':
        if (!value) {
          error = 'Потребителското име е задължително';
        } else if (value.length < 3) {
          error = 'Потребителското име трябва да е поне 3 символа';
        }
        break;
        
      case 'firstName':
        if (!value) {
          error = 'Името е задължително';
        }
        break;
        
      case 'lastName':
        if (!value) {
          error = 'Фамилията е задължителна';
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
  
  const handleImageChange = async (file) => {
    try {
      if (!file) {
        setFormData((prev) => ({ ...prev, profileImage: null }));
        setFieldErrors(prev => ({ ...prev, profileImage: '' }));
        return;
      }
      
      // Валидиране на изображението
      const validation = validateImage(file, { maxSizeMB: 5 });
      
      if (!validation.valid) {
        setFieldErrors(prev => ({ ...prev, profileImage: validation.error }));
        return;
      }
      
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setFieldErrors(prev => ({ ...prev, profileImage: '' }));
    } catch (err) {
      console.error('Error processing image:', err);
      setFieldErrors(prev => ({ ...prev, profileImage: 'Възникна грешка при обработка на изображението' }));
    }
  };
  
  // Изпращане на формата
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    // Маркираме всички полета като докоснати за да покажем всички грешки
    const allFieldsTouched = Object.keys(touched).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {});
    setTouched(allFieldsTouched);
    
    // Проверка дали формата е валидна
    if (!isFormValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Подготовка на FormData за изпращане към сървъра
      const submitData = new FormData();
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('username', formData.username);
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      
      if (formData.profileImage) {
        setRegistrationStage('uploading-image');
        submitData.append('image', formData.profileImage);
      }
      
      // Изпращане на заявка към сървъра
      const response = await register(submitData);
      
      if (response && response.success) {
        onSuccess(formData.email);
      } else {
        setFormError('Възникна проблем при регистрацията');
      }
    } catch (err) {
      setFormError(err.message || 'Възникна грешка при регистрация');
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Рендериране на индикатор за силата на паролата
  const renderPasswordStrength = () => {
    if (!formData.password || !touched.password) return null;
    
    const { score, feedback } = passwordStrength;
    let strengthClass = '';
    let strengthText = '';
    
    switch (score) {
      case 0:
        strengthClass = 'very-weak';
        strengthText = 'Много слаба';
        break;
      case 1:
        strengthClass = 'weak';
        strengthText = 'Слаба';
        break;
      case 2:
        strengthClass = 'medium';
        strengthText = 'Средна';
        break;
      case 3:
        strengthClass = 'strong';
        strengthText = 'Силна';
        break;
      case 4:
      case 5:
        strengthClass = 'very-strong';
        strengthText = 'Много силна';
        break;
      default:
        strengthClass = '';
        strengthText = '';
    }
    
    return (
      <div className="password-strength-indicator">
        <div className="strength-bars">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className={`strength-bar ${index <= score ? strengthClass : ''}`}></div>
          ))}
        </div>
        <div className="strength-text">
          <span>{strengthText}</span>
          {score < 3 && <span className="strength-feedback"> - {feedback}</span>}
        </div>
      </div>
    );
  };

  const renderRegistrationStage = () => {
    if (!isSubmitting) return null;
    
    let message = "Моля изчакайте, създаваме вашия акаунт...";
    
    // Опционално - различни съобщения според етапа
    if (registrationStage === 'uploading-image') {
      message = "Качваме снимката и създаваме вашия акаунт...";
    }
    
    return (
      <div className="registration-modal">
        <div className="simple-modal-content">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <p className="spinner-message">{message}</p>
        </div>
      </div>
    );
  };
  
  return (
    <form className={`auth-form ${isSubmitting ? 'form-submitting' : ''}`} onSubmit={handleSubmit} noValidate>
      {formError && <Alert type="error">{formError}</Alert>}
  
      {/* Показваме модалния индикатор директно в body, а не в контейнера на формата */}
      {isSubmitting && ReactDOM.createPortal(
        renderRegistrationStage(),
        document.body
      )}
      
      {/* Overlay за блокиране на формата по време на изпращане */}
      {isSubmitting && <div className="form-overlay"></div>}
    
      <FormInput
        label="Имейл адрес"
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
        minLength={6}
        error={touched.password ? fieldErrors.password : ''}
        status={touched.password && !fieldErrors.password ? 'valid' : ''}
      />
      
      {renderPasswordStrength()}
      
      <FormInput
        label="Повторете паролата"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        minLength={6}
        error={touched.confirmPassword ? fieldErrors.confirmPassword : ''}
        status={touched.confirmPassword && !fieldErrors.confirmPassword ? 'valid' : ''}
      />
      
      <FormInput
        label="Потребителско име"
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        minLength={3}
        error={touched.username ? fieldErrors.username : ''}
        status={touched.username && !fieldErrors.username ? 'valid' : ''}
      />
      
      <FormInput
        label="Име"
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        error={touched.firstName ? fieldErrors.firstName : ''}
        status={touched.firstName && !fieldErrors.firstName ? 'valid' : ''}
      />
      
      <FormInput
        label="Фамилия"
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        error={touched.lastName ? fieldErrors.lastName : ''}
        status={touched.lastName && !fieldErrors.lastName ? 'valid' : ''}
      />
      
      <ImageUpload
        label="Профилна снимка (по желание)"
        onChange={handleImageChange}
        currentImage={formData.profileImage ? URL.createObjectURL(formData.profileImage) : null}
        className="profile-image-upload"
        error={fieldErrors.profileImage}
      />
      
      <Button 
        type="submit" 
        className="auth-button"
        disabled={isSubmitting || !isFormValid}
        loading={isSubmitting}
      >
        Регистрация
      </Button>
    </form>
  );
};

export default RegisterForm;