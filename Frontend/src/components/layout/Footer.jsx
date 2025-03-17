import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <h2>Culinary<span>Corner</span></h2>
            <p>Вашият кулинарен пътеводител</p>
          </div>
          
          <div className={styles.footerLinks}>
            <div className={styles.footerSection}>
              <h3>Навигация</h3>
              <ul>
                <li><Link to="/">Начало</Link></li>
                <li><Link to="/recipes">Рецепти</Link></li>
                <li><Link to="/categories">Категории</Link></li>
                <li><Link to="/about">За нас</Link></li>
              </ul>
            </div>
            
            <div className={styles.footerSection}>
              <h3>Полезни връзки</h3>
              <ul>
                <li><Link to="/terms">Условия за ползване</Link></li>
                <li><Link to="/privacy">Политика за поверителност</Link></li>
                <li><Link to="/contact">Контакти</Link></li>
                <li><Link to="/faq">Често задавани въпроси</Link></li>
              </ul>
            </div>
            
            <div className={styles.footerSection}>
              <h3>Последвайте ни</h3>
              <div className={styles.socialLinks}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>Facebook</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>Instagram</a>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>Pinterest</a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>YouTube</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} CulinaryCorner. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;