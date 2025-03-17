import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';
import recipeService from '../../../services/recipeService';
import configService from '../../../services/configService';
import { Skeleton } from '../../ui/Skeleton/Skeleton';

function Hero() {
  const [heroRecipe, setHeroRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [localizedCategories, setLocalizedCategories] = useState({});
  const [difficulties, setDifficulties] = useState({});
  const navigate = useNavigate();
  
  useEffect(() => {
    // Заявки към бекенд API за извличане на необходимите данни
    const fetchData = async () => {
      try {
        // Зареждаме конфигурацията за категориите и превода им
        const config = await configService.getConfig();
        
        if (config) {
          // Извличаме категориите и превода им
          const categoriesData = config.recipe.categories.map(key => ({
            key,
            label: config.localization.categories[key] || key
          }));
          
          setCategories(categoriesData);
          setLocalizedCategories(config.localization.categories);
          setDifficulties(config.localization.difficulties);
        }
        
        // Използваме recipeService вместо директна fetch заявка
        const trendingRecipes = await recipeService.getTrendingRecipes(1);
        
        if (trendingRecipes && trendingRecipes.length > 0) {
          setHeroRecipe(trendingRecipes[0]);
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Hero section data:', error);
        // Гарантираме, че компонентът все пак ще бъде зареден
        setIsLoaded(true);
      }
    };
    
    fetchData();
  }, []);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Използване на query параметър search от getRecipes API
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  // Избор на подходящо изображение с fallback
  const heroImage = heroRecipe?.images?.length > 0 
    ? heroRecipe.images[0].url
    : `https://images.unsplash.com/photo-1611326387235-8879d5276a2d?auto=format&fit=crop&w=2000&q=80`;
  
  // Локализирана трудност според данните от configAPI
  const getLocalizedDifficulty = (key) => {
    return difficulties[key] || key;
  };

  // Проверка за снимката на автора с fallback към стандартна иконка
  // Обърнете внимание, че използваме profilePicture вместо avatar според JSON отговора
  const getAuthorAvatar = () => {
    if (heroRecipe?.author?.profilePicture) {
      return (
        <img 
          src={heroRecipe.author.profilePicture} 
          alt={`${heroRecipe.author.username || 'Автор'}`}
          className={styles.authorAvatar}
        />
      );
    }
    return <span className={styles.authorIcon}>👨‍🍳</span>;
  };
  
  // Връщане на пълно име на автора, ако го има
  const getAuthorName = () => {
    const author = heroRecipe?.author;
    if (!author) return 'Анонимен';
    
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    
    return author.username || 'Анонимен';
  };
  
  return (
    <section className={styles.heroWrapper}>
      <div 
        className={`${styles.hero} ${isLoaded ? styles.loaded : ''}`}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${heroImage})`,
        }}
      >
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
                    <span className={styles.searchIconLeft}>🔍</span>
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
                  <span className={styles.tagLabel}>Популярни: </span>
                  <div className={styles.tags}>
                    {categories.slice(0, 4).map(category => (
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
          
          {heroRecipe ? (
            <div className={styles.featuredRecipeInfo}>
              <div className={styles.featuredTag}>Акцент на деня</div>
              <Link to={`/recipes/${heroRecipe._id}`} className={styles.featuredTitle}>
                {heroRecipe.title}
              </Link>
              
              {/* Използване на профилна снимка от author.profilePicture */}
              {heroRecipe.author && (
                <Link to={`/users/${heroRecipe.author._id}`} className={styles.authorSection}>
                  <div className={styles.authorImageContainer}>
                    {getAuthorAvatar()}
                  </div>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>
                      {getAuthorName()}
                    </span>
                    {heroRecipe.author.username && heroRecipe.author.firstName && (
                      <span className={styles.authorUsername}>@{heroRecipe.author.username}</span>
                    )}
                  </div>
                </Link>
              )}
              
              <div className={styles.featuredMeta}>
                <span className={styles.likeCount}>
                  ❤️ {heroRecipe.likesCount || heroRecipe.likes?.length || 0}
                </span>
                <span className={styles.difficulty}>
                  {heroRecipe.difficulty === 'easy' && '● '}
                  {heroRecipe.difficulty === 'medium' && '●● '}
                  {heroRecipe.difficulty === 'hard' && '●●● '}
                  {getLocalizedDifficulty(heroRecipe.difficulty)}
                </span>
                <span className={styles.time}>⏱️ {heroRecipe.preparationTime} мин</span>
                {heroRecipe.commentCount !== undefined && (
                  <span className={styles.commentCount}>💬 {heroRecipe.commentCount}</span>
                )}
              </div>
              <div className={styles.featuredTags}>
                <span className={styles.categoryTag}>
                  {localizedCategories[heroRecipe.category] || heroRecipe.category}
                </span>
                {heroRecipe.servings && (
                  <span className={styles.servingsTag}>
                    {heroRecipe.servings} {heroRecipe.servings === 1 ? 'порция' : 'порции'}
                  </span>
                )}
              </div>
            </div>
          ) : isLoaded ? (
            <div className={styles.featuredRecipeInfo}>
              <div className={styles.featuredTag}>Акцент на деня</div>
              <span className={styles.featuredTitle}>Зареждане на избрани рецепти...</span>
            </div>
          ) : (
            <div className={styles.featuredRecipeInfo}>
              <div className={styles.featuredTag}><Skeleton width="100px" height="18px" /></div>
              <div className={styles.featuredTitleSkeleton}>
                <Skeleton width="250px" height="28px" />
              </div>
              {/* Скелетон за автор информация */}
              <div className={styles.authorSection}>
                <div className={styles.authorImageContainer}>
                  <Skeleton width="40px" height="40px" borderRadius="50%" />
                </div>
                <div className={styles.authorInfo}>
                  <Skeleton width="120px" height="16px" />
                  <Skeleton width="80px" height="12px" />
                </div>
              </div>
              <div className={styles.featuredMeta}>
                {[1, 2, 3, 4].map(i => (
                  <span key={i} className={styles.metaItemSkeleton}>
                    <Skeleton width="80px" height="18px" />
                  </span>
                ))}
              </div>
            </div>
          )}
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