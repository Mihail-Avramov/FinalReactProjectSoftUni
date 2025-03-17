// Превод на категории
export function getCategoryLabel(category) {
    const categoryLabels = {
      'breakfast': 'Закуска',
      'lunch': 'Обяд',
      'dinner': 'Вечеря',
      'dessert': 'Десерт',
      'snack': 'Снакс',
      'beverage': 'Напитки',
      'other': 'Други'
    };
    
    return categoryLabels[category] || 'Други';
  }
  
  // Икони за категории
  export function getCategoryIcon(category) {
    const categoryIcons = {
      'breakfast': '🍳',
      'lunch': '🥗',
      'dinner': '🍲',
      'dessert': '🍰',
      'snack': '🥨',
      'beverage': '🍹',
      'other': '🍽️'
    };
    
    return categoryIcons[category] || '🍽️';
  }
  
  // Превод на нива на трудност
  export function getDifficultyLabel(difficulty) {
    const difficultyLabels = {
      'easy': 'Лесно',
      'medium': 'Средно',
      'hard': 'Сложно'
    };
    
    return difficultyLabels[difficulty] || 'Неизвестно';
  }