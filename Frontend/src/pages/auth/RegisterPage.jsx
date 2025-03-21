import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import RegisterForm from '../../components/auth/RegisterForm';
import EmailVerificationNotice from '../../components/auth/EmailVerificationNotice';
import './AuthPages.css';

const RegisterPage = () => {
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const handleRegistrationSuccess = (email) => {
    setUserEmail(email);
    setRegistrationComplete(true);
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="auth-page register-page">
      <SEO
        title="Регистрация"
        description="Създайте нов профил в CulinaryCorner и започнете да споделяте рецепти, да запазвате любимите си ястия и да се свързвате с други кулинарни ентусиасти."
        keywords="регистрация, създаване на профил, signup, нов потребител, регистриране"
      />
      
      <div className="auth-container">
        <h1 className="auth-title">Създаване на профил</h1>
        
        {registrationComplete ? (
          <EmailVerificationNotice email={userEmail} />
        ) : (
          <>
            <RegisterForm onSuccess={handleRegistrationSuccess} />
            
            <div className="auth-footer">
              <p>
                Вече имате профил?{' '}
                <Link to="/login" className="auth-link">
                  Вход
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;