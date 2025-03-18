import React from 'react';
import { Link } from 'react-router-dom';
import { getCategoryIcon, getCategoryLabel } from '../../../utils/recipeHelpers';
import ImageCarousel from '../ImageCarousel';
import styles from './RecipeCard.module.css';

function RecipeCard({ recipe }) {
  const categoryLabel = getCategoryLabel(recipe.category);
  
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
          images={recipe.images || []} 
          alt={recipe.title} 
        />
        <div className={styles.cardOverlay}>
          <span className={styles.recipeCategory}>
            <span>{getCategoryIcon(recipe.category)}</span>
            {categoryLabel}
          </span>
          
          <span className={styles.likesIndicator}>
            <span className={styles.heartIcon}>❤️</span> {recipe.likesCount || recipe.likes?.length || 0}
          </span>
        </div>
      </div>
      
      <div className={styles.recipeContent}>
        <Link to={`/recipes/${recipe._id}`} className={styles.titleLink}>
          <h3 className={styles.recipeTitle}>{recipe.title}</h3>
        </Link>
        
        <div className={styles.compactMeta}>
          <span className={`${styles.metaBadge} ${styles.timeBadge}`} title="Време за приготвяне">
            <span className={styles.metaIcon}>⏱️</span> {recipe.preparationTime} мин
          </span>
          <span className={`${styles.metaBadge} ${styles.servingsBadge}`} title="Брой порции">
            <span className={styles.metaIcon}>🍽️</span> {recipe.servings}
          </span>
          <span className={`${styles.metaBadge} ${styles.difficultyBadge} ${difficultyClass}`} title="Ниво на трудност">
            {getDifficultyDots()} {difficultyText}
          </span>
        </div>
        
        <p className={styles.recipeDescription}>{recipe.description}</p>
        
        <div className={styles.recipeFooter}>
          <div className={styles.recipeAuthor}>
            <img 
              src={recipe.author?.profilePicture || '/images/default-avatar.png'} 
              alt={recipe.author?.username} 
              className={styles.authorAvatar}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iI2JkYmRiZCIvPjxwYXRoIGQ9Ik0zMCwxODAgQzMwLDEyMCA2NSw0MCAxMDAsNDAgQzEzNSw0MCAxNzAsMTIwIDE3MCwxODAiIGZpbGw9IiNiZGJkYmQiLz48L3N2Zz4=';
              }}
            />
            <span className={styles.authorName}>{recipe.author?.username || 'Анонимен'}</span>
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