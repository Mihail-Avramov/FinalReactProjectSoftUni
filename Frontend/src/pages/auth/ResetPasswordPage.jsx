import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../hooks/api/useAuth';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import './AuthPages.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Клиентска валидация
    if (password.length < 6) {
      setError('Паролата трябва да е поне 6 символа');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Паролите не съвпадат');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await resetPassword(token, password);
      if (response && response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000); // Пренасочване към вход след 3 секунди
      } else {
        setError('Не успяхме да променим паролата. Моля, опитайте отново.');
      }
    } catch (err) {
      setError(err.message || 'Възникна грешка при промяна на паролата.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-page reset-password-page">
      <SEO
        title="Промяна на парола"
        description="Задайте нова парола за вашия профил в CulinaryCorner и защитете акаунта си с надеждна парола."
        keywords="промяна на парола, нова парола, задаване на парола, парола, сигурност"
      />
      
      <div className="auth-container">
        <h1 className="auth-title">Промяна на парола</h1>
        
        {!token ? (
          <Alert type="error">
            Липсва валиден токен за промяна на парола. Моля, използвайте линка от имейла.
          </Alert>
        ) : success ? (
          <div className="success-container">
            <div className="success-icon">
              <i className="fa fa-check-circle"></i>
            </div>
            <h2>Паролата е променена!</h2>
            <p>Вашата нова парола е запазена успешно. Вече можете да влезете с нея.</p>
            <p className="redirect-message">Пренасочване към страницата за вход...</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <Alert type="error">{error}</Alert>}
            
            <FormInput
              label="Нова парола"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            
            <FormInput
              label="Потвърдете новата парола"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
            
            <Button 
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Запазване на нова парола
            </Button>
            
            <div className="auth-footer">
              <p>
                <Link to="/login" className="auth-link">
                  Обратно към вход
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;