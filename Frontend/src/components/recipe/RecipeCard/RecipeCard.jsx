import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryIcon, getCategoryLabel } from '../../../utils/recipeHelpers';
import ImageCarousel from '../ImageCarousel';
import styles from './RecipeCard.module.css';

function RecipeCard({ recipe, currentUser, onLike, onFavorite }) {
  const [isLiked, setIsLiked] = useState(
    currentUser && recipe.likes?.includes(currentUser._id)
  );
  
  const [isFavorite, setIsFavorite] = useState(
    currentUser && currentUser.favorites?.includes(recipe._id)
  );
  
  // Категория и изображения
  const categoryLabel = getCategoryLabel(recipe.category);
  
  // Определяме стила за сложност
  const difficultyClass = {
    easy: styles.difficultyEasy,
    medium: styles.difficultyMedium,
    hard: styles.difficultyHard
  }[recipe.difficulty] || styles.difficultyMedium;

  // Текстове за нивата на трудност
  const difficultyText = {
    easy: 'Лесно',
    medium: 'Средно', 
    hard: 'Сложно'
  }[recipe.difficulty] || 'Средно';

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onLike) {
      onLike(recipe._id);
      setIsLiked(prev => !prev);
    }
  };
  
  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onFavorite) {
      onFavorite(recipe._id);
      setIsFavorite(prev => !prev);
    }
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
        
        {/* Бутони за действия (само за логнати потребители) */}
        {currentUser && (
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.actionButton} ${styles.likeButton} ${isLiked ? styles.liked : ''}`} 
              onClick={handleLike}
              title={isLiked ? "Премахни харесване" : "Харесай рецептата"}
            >
              <span className={styles.buttonIcon}>{isLiked ? '❤️' : '♡'}</span>
            </button>
            
            <button 
              className={`${styles.actionButton} ${styles.favoriteButton} ${isFavorite ? styles.favorited : ''}`} 
              onClick={handleFavorite}
              title={isFavorite ? "Премахни от любими" : "Добави в любими"}
            >
              <span className={styles.buttonIcon}>{isFavorite ? '★' : '☆'}</span>
            </button>
          </div>
        )}
      </div>
      
      <div className={styles.recipeContent}>
        <Link to={`/recipes/${recipe._id}`} className={styles.titleLink}>
          <h3 className={styles.recipeTitle}>{recipe.title}</h3>
        </Link>
        
        {/* Компактна лента с метаданните - с еднакви иконки и размери */}
        <div className={styles.compactMeta}>
          <span className={`${styles.metaBadge} ${styles.timeBadge}`} title="Време за приготвяне">
            <span className={styles.metaIcon}>⏱️</span> {recipe.preparationTime} мин
          </span>
          <span className={`${styles.metaBadge} ${styles.servingsBadge}`} title="Брой порции">
            <span className={styles.metaIcon}>🍽️</span> {recipe.servings}
          </span>
          <span className={`${styles.metaBadge} ${styles.difficultyBadge} ${difficultyClass}`} title="Ниво на трудност">
            <span className={styles.metaIcon}>📊</span> {difficultyText}
          </span>
        </div>
        
        <p className={styles.recipeDescription}>{recipe.description}</p>
        
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className={styles.ingredientsPreview}>
            <span className={styles.ingredientsLabel}>Съставки:</span> 
            {recipe.ingredients.slice(0, 3).join(', ')}
            {recipe.ingredients.length > 3 && '...'}
          </div>
        )}
        
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