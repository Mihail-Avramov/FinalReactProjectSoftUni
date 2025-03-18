import api from './api';

// Кеш променливи - извън обекта, за да се запазват между извикванията
let trendingRecipesCache = {};
let trendingRecipesTimestamp = {};

// TTL (време на живот) за кеша в милисекунди
const TRENDING_CACHE_TTL = 10 * 60 * 1000; // 10 минути

const recipeService = {
  // Извличане на популярни рецепти с кеширане
  async getTrendingRecipes(limit = 6, signal) {
    // Проверяваме дали има кеширани данни за този лимит
    const cacheKey = `trending_${limit}`;
    const cachedData = trendingRecipesCache[cacheKey];
    const cachedTimestamp = trendingRecipesTimestamp[cacheKey];
    
    // Ако имаме кеширани данни и те не са остарели, връщаме ги
    if (cachedData && cachedTimestamp && (Date.now() - cachedTimestamp < TRENDING_CACHE_TTL)) {
      console.debug(`Използване на кеширани trending рецепти (limit: ${limit})`);
      return cachedData;
    }
    
    try {
      const response = await api.get(`/recipes/trending?limit=${limit}`, { signal });
      const data = response.data.data;
      
      // Кешираме новите данни
      trendingRecipesCache[cacheKey] = data;
      trendingRecipesTimestamp[cacheKey] = Date.now();
      
      return data;
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.debug('Request was canceled, ignoring error');
        throw error;
      }
      
      console.error('Error fetching trending recipes:', error);
      throw error;
    }
  },
  
  // Метод за изчистване на кеша - полезен при добавяне/редактиране на рецепти
  clearTrendingCache() {
    trendingRecipesCache = {};
    trendingRecipesTimestamp = {};
    console.debug('Trending recipes cache cleared');
  }
};

export default recipeService;