import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';
import { useConfig } from '../../../hooks/api/useConfig';
import { Skeleton } from '../../ui/Skeleton/Skeleton';

function Hero({ trendingRecipe }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [heroImage, setHeroImage] = useState('/images/default-hero.jpg');
  const navigate = useNavigate();
  
  // Директно използваме специализирания hook за конфигурация
  const { data: config, loading } = useConfig();
  
  // Изчисляваме производна стойност isLoaded от loading
  const isLoaded = !loading;
  
  // Изчисляваме категориите от конфигурацията
  const categories = React.useMemo(() => {
    if (!config || !config.recipe || !config.recipe.categories) return [];
    
    return config.recipe.categories.map(key => ({
      key,
      label: config.localization.categories[key] || key
    }));
  }, [config]);
  
  // Актуализираме фоновото изображение при промяна на trending рецептата
  React.useEffect(() => {
    if (trendingRecipe && trendingRecipe.images && trendingRecipe.images.length > 0) {
      setHeroImage(trendingRecipe.images[0].url);
    }
  }, [trendingRecipe]);
  
  const handleImageError = () => {
    console.warn('Hero image failed to load, using default');
    setHeroImage('/images/default-hero.jpg');
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <section className={styles.heroWrapper}>
      <div 
        className={`${styles.hero} ${isLoaded ? styles.loaded : ''}`}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${heroImage})`,
        }}
      >
        <img 
          src={heroImage}
          alt=""
          style={{ display: 'none' }}
          onError={handleImageError}
        />
        
        <div className={styles.overlay}>
          <div className={styles.container}>
            <div className={styles.content}>
              <h1 className={styles.title}>
                <span className={styles.highlightText}>Вкусни</span> рецепти за всеки повод
              </h1>
              
              <p className={styles.subtitle}>
                Открийте света на кулинарията и се присъединете към хиляди ентусиасти, 
                които споделят своите любими рецепти всеки ден
              </p>
              
              <div className={styles.searchWrapper}>
                <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
                  <div className={styles.searchContainer}>
                    <span className={styles.searchIconLeft}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Търси рецепти, съставки или техники..."
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Търсене на рецепти"
                    />
                    <button type="submit" className={styles.searchButton}>
                      Търси
                    </button>
                  </div>
                </form>
              </div>
              
              {isLoaded ? (
                <div className={styles.popularTags}>
                  <span className={styles.tagLabel}>Категории: </span>
                  <div className={styles.tags}>
                    {categories.slice(0, 5).map(category => (
                      <Link 
                        key={category.key}
                        to={`/recipes?category=${category.key}`}
                        className={styles.tag}
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.popularTags}>
                  <span className={styles.tagLabel}>Популярни: </span>
                  <div className={styles.tags}>
                    {[1, 2, 3, 4].map(i => (
                      <span key={i} className={`${styles.tag} ${styles.tagSkeleton}`}>
                        <Skeleton width="60px" height="16px" />
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.wave}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
          <path fill="#f9f9f9" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,53.3C1120,53,1280,75,1360,85.3L1440,96L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
        </svg>
      </div>
    </section>
  );
}

export default Hero;