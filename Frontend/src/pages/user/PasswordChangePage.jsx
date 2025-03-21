import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/api/useProfile';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SEO from '../../components/common/SEO';
import './UserPages.css';

const PasswordChangePage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { changePassword } = useProfile();
  const navigate = useNavigate();
  
  // Преработваме validateField с useCallback и предаваме formData като параметър
  const validateField = useCallback((name, value, allValues) => {
    switch (name) {
      case 'currentPassword':
        return value ? '' : 'Моля, въведете текущата парола';
      
      case 'newPassword':
        if (!value) {
          return 'Моля, въведете нова парола';
        } else if (value.length < 6) {
          return 'Паролата трябва да е поне 6 символа';
        } else if (value === allValues.currentPassword) {
          return 'Новата парола трябва да е различна от текущата';
        }
        return '';
      
      case 'confirmPassword':
        if (!value) {
          return 'Моля, потвърдете новата парола';
        } else if (value !== allValues.newPassword) {
          return 'Паролите не съвпадат';
        }
        return '';
      
      default:
        return '';
    }
  }, []);

  // Това ще валидира всички полета при промяна във formData
  useEffect(() => {
    // Валидираме само полетата, които са били докоснати
    const newErrors = {};
    
    Object.keys(touched).forEach(field => {
      if (touched[field]) {
        // Предаваме целия formData обект като трети аргумент
        const errorMessage = validateField(field, formData[field], formData);
        if (errorMessage) {
          newErrors[field] = errorMessage;
        }
      }
    });
    
    // Премахваме дублираната логика, тъй като validateField вече обработва всички проверки
    setErrors(newErrors);
  }, [formData, touched, validateField]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Нов манипулатор за когато поле загуби фокус
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  
  // Актуализираме validateForm да използва новата validateField функция
  const validateForm = () => {
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true
    });
    
    const newErrors = {
      currentPassword: validateField('currentPassword', formData.currentPassword, formData),
      newPassword: validateField('newPassword', formData.newPassword, formData),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword, formData)
    };
    
    // Премахваме празните съобщения за грешки
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await changePassword(formData.currentPassword, formData.newPassword);
      
      if (result.success) {
        setSuccess(true);
        // Изчистваме формата
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTouched({
          currentPassword: false,
          newPassword: false,
          confirmPassword: false
        });
        
        // След успешна смяна, пренасочване след 2 секунди
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        // Обработка на грешки от API както преди
        if (result.validationErrors) {
          const apiErrors = {};
          
          Object.entries(result.validationErrors).forEach(([field, message]) => {
            apiErrors[field] = message;
          });
          
          setErrors(prev => ({ ...prev, ...apiErrors }));
        } else {
          setErrors({ general: result.error || 'Възникна грешка при смяната на паролата' });
        }
      }
    } catch {
      setErrors({ general: 'Възникна неочаквана грешка' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="password-change-page">
      <SEO
        title="Смяна на парола"
        description="Променете паролата на вашия акаунт в CulinaryCorner за подобрена сигурност и защита на вашите данни."
        keywords="смяна на парола, промяна на парола, нова парола, сигурност на акаунт, защита на потребителски данни"
      />
      <div className="container">
        <div className="page-header">
          <h1>Смяна на парола</h1>
          <Link to="/profile" className="btn btn-outline">Обратно към профила</Link>
        </div>
        
        <div className="form-container">
                    {isSubmitting && (
            <div className="loading-overlay">
              <LoadingSpinner message="Промяна на паролата..." />
            </div>
          )}
          
          {success && (
            <Alert type="success">
              Паролата беше променена успешно! Ще бъдете пренасочени към профила си.
            </Alert>
          )}
          
          {errors.general && <Alert type="error">{errors.general}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Текуща парола"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.currentPassword}
              required
            />
            
            <FormInput
              label="Нова парола"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.newPassword}
              required
              minLength={6}
            />
            
            <FormInput
              label="Потвърдете новата парола"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              required
              minLength={6}
            />
            
            <div className="form-actions">
              <Button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || Object.keys(errors).length > 0}
                loading={isSubmitting}
              >
                Промени паролата
              </Button>
              
              <Link to="/profile" className="btn btn-secondary">
                Отказ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangePage;