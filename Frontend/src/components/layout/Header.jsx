import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/api/useAuth';
import Button from '../common/Button';
import UserAvatar from '../user/UserAvatar';
import styles from './Header.module.css';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const headerRef = useRef(null);
  
  // Опростяване на handleClickOutside
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuOpen && headerRef.current && !headerRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    await logout();
    navigate('/');
  };
  
  const displayName = user ? (user.firstName || user.username || user.email.split('@')[0]) : '';
  
  return (
    <header className={styles.header} ref={headerRef}>
      <div className={`container ${styles.headerContainer}`}>
        {/* Мобилен бутон за меню */}
        <button 
          className={styles.mobileMenuToggle} 
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span className={`${styles.menuIcon} ${mobileMenuOpen ? styles.menuOpen : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        
        {/* Лого */}
        <div className={styles.logo}>
          <Link 
            to="/" 
            onClick={scrollToTop}
          >
            <h1>Culinary<span>Corner</span></h1>
          </Link>
        </div>
        
        {/* Основно навигационно меню */}
        <nav 
          className={`${styles.mainNav} ${mobileMenuOpen ? styles.open : ''}`}
          onClick={(e) => {
            // Проверка дали кликът е върху nav елемента, а не върху неговите деца
            if (e.target === e.currentTarget) {
              setMobileMenuOpen(false);
            }
          }}
        >
          <ul>
            <li>
              <Link to="/" className={location.pathname === '/' ? styles.active : ''}>
                <i className={`${styles.navIcon} fas fa-home`}></i>
                <span>Начало</span>
              </Link>
            </li>
            <li>
              <Link to="/recipes" className={location.pathname.startsWith('/recipes') ? styles.active : ''}>
                <i className={`${styles.navIcon} fas fa-utensils`}></i>
                <span>Рецепти</span>
              </Link>
            </li>
            {isAuthenticated && (
              <>
                {/* На мобилен изглед добавяме допълнителни линкове в основната навигация */}
                <li className={styles.mobileOnly}>
                  <Link to="/profile" className={location.pathname.startsWith('/profile') ? styles.active : ''}>
                    <i className={`${styles.navIcon} fas fa-user`}></i>
                    <span>Моят профил</span>
                  </Link>
                </li>
                <li>
                  <Link to="/my-recipes" className={location.pathname.startsWith('/my-recipes') ? styles.active : ''}>
                    <i className={`${styles.navIcon} fas fa-book-open`}></i>
                    <span>Моите рецепти</span>
                  </Link>
                </li>
                <li>
                  <Link to="/my-favorites" className={location.pathname.startsWith('/my-favorites') ? styles.active : ''}>
                    <i className={`${styles.navIcon} fas fa-heart`}></i>
                    <span>Любими рецепти</span>
                  </Link>
                </li>
                <li className={styles.mobileOnly}>
                  <a href="#" onClick={handleLogout} className={styles.logoutNavLink}>
                    <i className={`${styles.navIcon} fas fa-sign-out-alt`}></i>
                    <span>Изход</span>
                  </a>
                </li>
              </>
            )}
            {/* Добавяме бутоните за вход/регистрация в мобилната навигация */}
            {!isAuthenticated && (
              <>
                <li className={styles.mobileOnly}>
                  <Link to="/login" className={location.pathname === '/login' ? styles.active : ''}>
                    <i className={`${styles.navIcon} fas fa-sign-in-alt`}></i>
                    <span>Вход</span>
                  </Link>
                </li>
                <li className={styles.mobileOnly}>
                  <Link to="/register" className={`${styles.registerLink} ${location.pathname === '/register' ? styles.active : ''}`}>
                    <i className={`${styles.navIcon} fas fa-user-plus`}></i>
                    <span>Регистрация</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        {/* Секция за автентикация */}
        <div className={styles.authNav}>
          {isAuthenticated ? (
            <div className={styles.userSection} ref={userMenuRef}>
              <Link 
                to="/profile" 
                className={styles.userProfileLink} 
                title={`Профил на ${displayName}`}
              >
                <div className={styles.userProfile}>
                  <UserAvatar 
                    src={user?.profilePicture}
                    alt={`${displayName}'s avatar`}
                    className={styles.userAvatar}
                    size="medium"
                  />
                  <span className={styles.userName}>{displayName}</span>
                </div>
              </Link>
              
              {/* Бутон за изход - само за настолни устройства */}
              <Button 
                onClick={handleLogout} 
                variant="outline"
                size="small"
                className={styles.logoutButton}
                title="Изход от профила"
              >
                <i className={`${styles.logoutIcon} fas fa-sign-out-alt`}></i>
                <span className={styles.logoutText}>Изход</span>
              </Button>
              
              {/* Потребителско dropdown меню */}
              <div className={`${styles.userDropdownMenu} ${styles.mobileOnly}`}>
                <div className={styles.userMenuHeader}>
                  <span className={styles.menuDisplayName}>{displayName}</span>
                </div>
                <Link to="/profile" className={styles.userMenuItem}>
                  <i className="fas fa-user"></i> 
                  Моят профил
                </Link>
                <Link to="/my-recipes" className={styles.userMenuItem}>
                  <i className="fas fa-book-open"></i> 
                  Моите рецепти
                </Link>
                <Link to="/favorites" className={styles.userMenuItem}>
                  <i className="fas fa-heart"></i> 
                  Запазени рецепти
                </Link>
                <a href="#" onClick={handleLogout} className={`${styles.userMenuItem} ${styles.logoutMenuItem}`}>
                  <i className="fas fa-sign-out-alt"></i> 
                  Изход
                </a>
              </div>
            </div>
          ) : (
            // Бутони за неавтентикирани потребители - само за настолни устройства
            <div className={styles.authButtons}>
              <Link to="/login" className="btn btn-outline btn-sm">Вход</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Регистрация</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;