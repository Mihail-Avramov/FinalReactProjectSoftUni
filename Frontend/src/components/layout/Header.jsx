import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
          </ul>
        </nav>
        
        <div className={styles.authNav}>
          <Link to="/login" className="btn btn-outline btn-sm">Вход</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Регистрация</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;