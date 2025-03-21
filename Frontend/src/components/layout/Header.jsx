import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/api/useAuth';
import Button from '../common/Button';
import styles from './Header.module.css';
import defaultAvatar from '/images/default-avatar.webp'; // Импортиране на изображението по подразбиране

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  // Съкратено име на потребителя за показване
  const displayName = user ? (user.firstName || user.username || user.email.split('@')[0]) : '';
  
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <div className={styles.logo}>
          <Link to="/">
            <h1>Culinary<span>Corner</span></h1>
          </Link>
        </div>
        
        <button 
          className={styles.mobileMenuToggle} 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        
        <nav className={`${styles.mainNav} ${mobileMenuOpen ? styles.open : ''}`}>
          <ul>
            <li><Link to="/" className={styles.active}>Начало</Link></li>
            <li><Link to="/recipes">Рецепти</Link></li>
            <li><Link to="/categories">Категории</Link></li>
            <li><Link to="/about">За нас</Link></li>
            {isAuthenticated && (
              <li><Link to="/my-recipes">Моите рецепти</Link></li>
            )}
          </ul>
        </nav>
        
        <div className={styles.authNav}>
        {isAuthenticated ? (
          <div className={styles.userSection}>
            <Link to="/profile" className={styles.userProfileLink} title="Вижте профила си">
              <div className={styles.userProfile}>
                <img 
                  src={user?.profilePicture || defaultAvatar}
                  alt={`${displayName}'s avatar`}
                  className={styles.userAvatar}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }} 
                />
                <span className={styles.userName}>{displayName}</span>
              </div>
            </Link>
            <Button 
              onClick={handleLogout} 
              className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
            >
              Изход
            </Button>
          </div>
        ) : (
          <>
            <Link to="/login" className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}>Вход</Link>
            <Link to="/register" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}>Регистрация</Link>
          </>
        )}
        </div>
      </div>
    </header>
  );
}

export default Header;