import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import LoginForm from '../../components/auth/LoginForm';
import './AuthPages.css';

const LoginPage = () => {
  return (
    <div className="auth-page login-page">
      <SEO
        title="Вход"
        description="Влезте в профила си в CulinaryCorner и получете достъп до хиляди рецепти, запазете любимите си ястия и споделете свои кулинарни творения."
        keywords="вход, потребителски профил, login, потребител, влизане"
      />
      
      <div className="auth-container">
        <h1 className="auth-title">Вход в профила</h1>
        
        <LoginForm />
        
        <div className="auth-footer">
          <p>
            <Link to="/forgot-password" className="auth-link">
              Забравена парола?
            </Link>
          </p>
          <p>
            Нямате профил?{' '}
            <Link to="/register" className="auth-link">
              Създайте сега
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;