import React from 'react';
import styles from './ProfileStats.module.css';

const ProfileStats = ({ stats, isOwnProfile }) => {
  // Защита срещу null stats
  if (!stats) return null;
  
  // Форматираща функция - запазена същата
  const formatNumber = (value, decimals = 1) => {
    if (value === undefined || value === null) return '0';
    
    // Конвертиране към число, ако е низ
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    // Проверка дали е валидно число
    if (isNaN(num)) return '0';
    
    // Форматиране с фиксиран брой десетични знаци
    return typeof num === 'number' ? num.toFixed(decimals) : '0';
  };
  
  // Определяме кои статистики да покажем според това дали е собствен профил 
  const statsItems = isOwnProfile ? [
    { label: 'Рецепти', value: stats.recipesCount || 0 },
    { label: 'Получени харесвания', value: stats.totalLikes || 0 },
    { label: 'Любими рецепти', value: stats.favoriteRecipesCount || 0 },
    { label: 'Средно харесвания', value: formatNumber(stats.averageLikesPerRecipe) },
    { label: 'Коментари', value: stats.commentsCount || 0 }
  ] : [
    { label: 'Рецепти', value: stats.recipesCount || 0 },
    { label: 'Получени харесвания', value: stats.totalLikes || 0 },
    { label: 'Средно харесвания', value: formatNumber(stats.averageLikesPerRecipe) }
  ];
  
  return (
    <div className={styles.stats}>
      {statsItems.map((item, index) => (
        <div key={index} className={styles.item}>
          <div className={styles.value}>{item.value}</div>
          <div className={styles.label}>{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;