import React from 'react';
import { Link } from 'react-router-dom';
import { getCategoryIcon, getCategoryLabel } from '../../../utils/recipeHelpers';
import ImageCarousel from '../ImageCarousel';
import UserAvatar from '../../user/UserAvatar'; // Добавете импорта тук
import styles from './RecipeCard.module.css';

function RecipeCard({ recipe }) {
  const categoryLabel = getCategoryLabel(recipe.category);
  
  const hasValidImages = recipe.images && 
                        Array.isArray(recipe.images) && 
                        recipe.images.length > 0;
  
  const difficultyClass = {
    easy: styles.difficultyEasy,
    medium: styles.difficultyMedium,
    hard: styles.difficultyHard
  }[recipe.difficulty] || styles.difficultyMedium;

  const difficultyText = {
    easy: 'Лесно',
    medium: 'Средно', 
    hard: 'Трудно'
  }[recipe.difficulty] || 'Средно';

  const getDifficultyDots = () => {
    const difficultyLevel = {
      easy: 1,
      medium: 2,
      hard: 3
    }[recipe.difficulty] || 2;
    
    return (
      <div className={styles.difficultyDots}>
        {[1, 2, 3].map(level => (
          <span 
            key={level} 
            className={`${styles.difficultyDot} ${level <= difficultyLevel ? styles.activeDot : ''}`}
          ></span>
        ))}
      </div>
    );
  };
  
  return (
    <div className={styles.recipeCard}>
      <div className={styles.recipeImage}>
        <ImageCarousel 
          images={hasValidImages ? recipe.images : []}
          alt={recipe.title}
          noImageFallback="/images/no-image-500.jpg"
        />
        <div className={styles.cardOverlay}>
          <span className={styles.recipeCategory}>
            <span>{getCategoryIcon(recipe.category)}</span>
            {categoryLabel}
          </span>
          
          <span className={`${styles.likesIndicator} ${recipe.type === "trending" ? styles.trending : ""}`}>
            <span className={recipe.type === "trending" ? styles.trendingIcon : styles.heartIcon}>
              {recipe.type === "trending" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
              
            </span>

            {recipe.type !== "trending" && (recipe.likesCount || recipe.likes?.length || 0)}
            {recipe.type === "trending" && <span className={styles.trendingLabel}>HOT</span>}

          </span>       
        </div>
      </div>
      
      <div className={styles.recipeContent}>
        <Link to={`/recipes/${recipe._id}`} className={styles.titleLink}>
          <h3 className={styles.recipeTitle}>{recipe.title}</h3>
        </Link>
        
        <div className={styles.compactMeta}>
          <span className={`${styles.metaBadge} ${styles.timeBadge}`} title="Време за приготвяне">
            <span className={styles.metaIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </span> 
            {recipe.preparationTime} мин
          </span>
          <span className={`${styles.metaBadge} ${styles.servingsBadge}`} title="Брой порции">
          <span className={styles.metaIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M7 21v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"></path>
            </svg>
          </span>
            {recipe.servings}
          </span>
          <span className={`${styles.metaBadge} ${styles.difficultyBadge} ${difficultyClass}`} title="Ниво на трудност">
            {getDifficultyDots()} {difficultyText}
          </span>
        </div>
        
        <p className={styles.recipeDescription}>{recipe.description}</p>
        
        <div className={styles.recipeFooter}>
          <div className={styles.recipeAuthor}>
            <Link to={`/profile/${recipe.author?._id}`} className={styles.authorLink} title="Вижте профила на автора">
              <UserAvatar 
                src={recipe.author?.profilePicture} 
                alt={recipe.author?.username} 
                size="small"
                className={styles.authorAvatar}
              />
              <span className={styles.authorName}>{recipe.author?.username || 'Анонимен'}</span>
            </Link>
          </div>
          
          <div className={styles.recipeActions}>
            <Link to={`/recipes/${recipe._id}`} className={styles.viewButton}>
              Виж
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;