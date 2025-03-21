import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';
import styles from './NotFound.module.css';

function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      <SEO
        title="Страницата не е намерена"
        description="Страницата, която търсите, не е намерена. Върнете се към началната страница или разгледайте нашите рецепти."
        keywords="404, страница не е намерена, грешка, липсваща страница"
      />
      
      <div className={styles.notFoundContent}>
        <div className={styles.errorCode}>404</div>
        
        <h1 className={styles.errorTitle}>Страницата не е намерена</h1>
        
        <p className={styles.errorMessage}>
          Упс! Изглежда, че страницата, която търсите, не съществува или е преместена.
        </p>
        
        <div className={styles.illustration}>
          <img 
            src="/images/404/404.webp" 
            alt="Страницата не е намерена" 
            className={styles.errorImage}
          />
        </div>
        
        <div className={styles.suggestion}>
          <p>Не се притеснявайте! Ето няколко полезни връзки:</p>
          <div className={styles.links}>
            <Link to="/" className={styles.homeButton}>Начална страница</Link>
            <Link to="/recipes" className={styles.linkButton}>Разгледайте рецепти</Link>
            <Link to="/contact" className={styles.linkButton}>Свържете се с нас</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;