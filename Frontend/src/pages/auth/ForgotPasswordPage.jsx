import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../hooks/api/useAuth';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const response = await forgotPassword(email);
      if (response && response.success) {
        setSuccess(true);
      } else {
        setError('Не успяхме да обработим заявката. Моля, опитайте отново.');
      }
    } catch (err) {
      setError(err.message || 'Възникна грешка при обработка на заявката.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="auth-page forgot-password-page">
      <SEO
        title="Забравена парола"
        description="Възстановете достъпа до профила си в CulinaryCorner чрез изпращане на инструкции за нова парола на вашия имейл."
        keywords="забравена парола, възстановяване на парола, reset password, изгубена парола"
      />
      
      <div className="auth-container">
        <h1 className="auth-title">Забравена парола</h1>
        
        {success ? (
          <div className="success-container">
            <div className="success-icon">
              <i className="fa fa-envelope"></i>
            </div>
            <h2>Готово!</h2>
            <p>
              Изпратихме инструкции за възстановяване на паролата на адрес <strong>{email}</strong>.
              Моля, проверете входящата си поща и следвайте посочения линк.
            </p>
            <div className="auth-actions">
              <Link to="/login" className="btn btn-secondary">
                Обратно към вход
              </Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <Alert type="error">{error}</Alert>}
            
            <p className="form-description">
              Въведете имейла, с който сте регистрирани, и ние ще ви изпратим инструкции за възстановяване на паролата.
            </p>
            
            <FormInput
              label="Имейл"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Button 
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Изпрати инструкции
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

export default ForgotPasswordPage;