/**
 * Константи за кулинарните категории и техните икони
 */
export const CATEGORIES = {
  breakfast: {
    icon: '🍳',
    label: 'Закуска'
  },
  lunch: {
    icon: '🥗',
    label: 'Обяд'
  },
  dinner: {
    icon: '🍲',
    label: 'Вечеря'
  },
  dessert: {
    icon: '🍰',
    label: 'Десерт'
  },
  snack: {
    icon: '🥨',
    label: 'Закуска'
  },
  beverage: {
    icon: '🍹',
    label: 'Напитка'
  },
  other: {
    icon: '🍽️',
    label: 'Друго'
  }
};

/**
 * Нива на трудност
 */
export const DIFFICULTY = {
  easy: {
    label: 'Лесно',
    color: 'var(--secondary)'
  },
  medium: {
    label: 'Средно',
    color: 'var(--accent)'
  },
  hard: {
    label: 'Трудно',
    color: 'var(--primary)'
  }
};

/**
 * Помощник за превръщане на секунди в минути:секунди формат
 */
export function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

/**
 * Проверка дали работим в тъмен режим
 */
export function isDarkMode() {
  return Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

/**
 * Добавя клас за анимиране на елементи при появяване
 */
export function setupScrollAnimation() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.animate').forEach(el => {
    observer.observe(el);
  });
}