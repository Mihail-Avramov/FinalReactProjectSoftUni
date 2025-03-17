import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>Culinary<span>Corner</span></h2>
            <p>Вашият кулинарен пътеводител</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <h3>Навигация</h3>
              <ul>
                <li><a href="#">Начало</a></li>
                <li><a href="#">Рецепти</a></li>
                <li><a href="#">Категории</a></li>
                <li><a href="#">За нас</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Полезни връзки</h3>
              <ul>
                <li><a href="#">Условия за ползване</a></li>
                <li><a href="#">Политика за поверителност</a></li>
                <li><a href="#">Контакти</a></li>
                <li><a href="#">Често задавани въпроси</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Последвайте ни</h3>
              <div className="social-links">
                <a href="#" className="social-icon">Facebook</a>
                <a href="#" className="social-icon">Instagram</a>
                <a href="#" className="social-icon">Pinterest</a>
                <a href="#" className="social-icon">YouTube</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CulinaryCorner. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;