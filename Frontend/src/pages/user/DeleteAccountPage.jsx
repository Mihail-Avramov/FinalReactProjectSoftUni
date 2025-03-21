import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/api/useProfile';
import { useAuth } from '../../hooks/api/useAuth';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import SEO from '../../components/common/SEO';
import './UserPages.css';

const DeleteAccountPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { deleteAccount } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setError('Моля, въведете паролата си');
      return;
    }
    
    // Показваме диалога за потвърждение
    setShowConfirmation(true);
  };
  
  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await deleteAccount(password);
      
      if (result.success) {
        // Изход от профила
        await logout();
        // Пренасочване към началната страница
        navigate('/', { replace: true });
      } else {
        setError(result.error || 'Възникна проблем при изтриването на акаунта');
        setShowConfirmation(false);
      }
    } catch {
      setError('Възникна неочаквана грешка');
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="delete-account-page">
      <SEO
        title="Изтриване на акаунт"
        description="Изтрийте вашия акаунт от CulinaryCorner. Моля, имайте предвид, че това действие е необратимо и всички ваши данни ще бъдат премахнати."
        keywords="изтриване на акаунт, премахване на профил, деактивиране на акаунт, изтриване на потребителски данни"
      />
      <div className="container">
        <div className="page-header">
          <h1>Изтриване на акаунт</h1>
          <Link to="/profile" className="btn btn-outline">Обратно към профила</Link>
        </div>
        
        <div className="form-container">
          <div className="warning-box">
            <h2>Внимание!</h2>
            <p>
              Изтриването на акаунта е необратимо действие. Всички ваши данни,
              включително рецепти, коментари и харесвания, ще бъдат премахнати
              завинаги.
            </p>
          </div>
          
          {error && <Alert type="error">{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Въведете паролата си за потвърждение"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            
            <div className="form-actions">
              <Button
                type="submit"
                className="btn-primary"
                disabled={!password || isSubmitting}
              >
                Изтрий акаунта
              </Button>
              
              <Link to="/profile" className="btn btn-secondary">
                Отказ
              </Link>
            </div>
          </form>
        </div>
        
        {showConfirmation && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Потвърждение за изтриване</h3>
              <p>
                Сигурни ли сте, че желаете да изтриете акаунта си завинаги? 
                Това действие не може да бъде отменено.
              </p>
              
              <div className="modal-actions">
                <Button
                  onClick={() => setShowConfirmation(false)}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  Отказ
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="btn-primary"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Потвърждавам изтриването
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountPage;