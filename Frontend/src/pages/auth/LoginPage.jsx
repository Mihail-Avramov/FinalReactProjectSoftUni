import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import './AuthPages.css';

const LoginPage = () => {
  return (
    <div className="auth-page login-page">
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