import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/api/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import './AuthPages.css';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const { verifyEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Използваме ref за проследяване дали вече сме направили опит за верификация
  const verificationAttemptedRef = useRef(false);
  
  useEffect(() => {
    // Проверяваме дали вече сме изпълнили верификацията
    if (verificationAttemptedRef.current) {
      return;
    }

    const verifyUserEmail = async () => {
      if (!token) {
        setError('Невалиден токен за потвърждение.');
        setLoading(false);
        return;
      }
      
      try {
        const response = await verifyEmail(token);
        if (response && response.success) {
          setSuccess(true);
          
          // Ако потребителят вече е влязъл, пренасочваме към началната страница след кратък таймаут
          if (isAuthenticated) {
            setTimeout(() => navigate('/'), 3000);
          }
        } else {
          setError('Невалиден или изтекъл токен за потвърждение.');
        }
      } catch (err) {
        setError(err.message || 'Възникна грешка при потвърждаване на имейла.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyUserEmail();
  }, [token, verifyEmail, isAuthenticated, navigate]);
  
  if (loading) {
    return (
      <div className="auth-page verify-email-page">
        <div className="auth-container">
          <LoadingSpinner />
          <p className="text-center">Потвърждаване на имейл адрес...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="auth-page verify-email-page">
      <div className="auth-container">
        {success ? (
          <>
            <div className="success-icon">
              <i className="fa fa-check-circle"></i>
            </div>
            <h1 className="auth-title">Имейл адресът е потвърден!</h1>
            <p className="text-center">
              Вашият имейл адрес беше успешно потвърден. Вече можете да използвате пълната функционалност на профила си.
            </p>
            <div className="auth-actions">
              {isAuthenticated ? (
                <p className="text-center">Пренасочване към началната страница...</p>
              ) : (
                <Link to="/login" className="btn btn-primary btn-block">
                  Вход в профила
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="error-icon">
              <i className="fa fa-exclamation-circle"></i>
            </div>
            <h1 className="auth-title">Неуспешно потвърждение</h1>
            <Alert type="error">{error}</Alert>
            <div className="auth-actions">
              <Link to="/login" className="btn btn-secondary">
                Към страницата за вход
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;