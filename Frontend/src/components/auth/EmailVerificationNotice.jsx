import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/api/useAuth';
import Button from '../common/Button';
import Alert from '../common/Alert';

const EmailVerificationNotice = ({ email }) => {
  const { resendVerification } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleResendVerification = async () => {
    setSending(true);
    setError(null);
    
    try {
      const response = await resendVerification(email);
      if (response && response.success) {
        setSent(true);
      } else {
        setError('Не успяхме да изпратим имейл за потвърждение.');
      }
    } catch (err) {
      setError(err.message || 'Възникна грешка при изпращане на имейл за потвърждение.');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="verification-notice">
      <div className="success-icon">
        <i className="fa fa-check-circle"></i>
      </div>
      
      <h2>Регистрацията е успешна!</h2>
      
      <p>
        Изпратихме имейл за потвърждение на адрес <strong>{email}</strong>.
        Моля, проверете входящата си поща и следвайте инструкциите, за да активирате вашия профил.
      </p>
      
      {sent ? (
        <Alert type="success">
          Изпратихме нов имейл за потвърждение. Моля, проверете вашата поща.
        </Alert>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : null}
      
      <div className="verification-actions">
        <p className="resend-text">
          Не сте получили имейл?{' '}
          <Button 
            variant="link" 
            onClick={handleResendVerification} 
            disabled={sending}
            loading={sending}
          >
            Изпрати отново
          </Button>
        </p>
        
        <Link to="/login" className="auth-link">
          Към страницата за вход
        </Link>
      </div>
    </div>
  );
};

export default EmailVerificationNotice;