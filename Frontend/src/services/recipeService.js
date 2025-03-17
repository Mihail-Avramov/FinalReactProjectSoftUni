import api from './api';

const recipeService = {
  // Извличане на популярни рецепти
  async getTrendingRecipes(limit = 6) {
    try {
      const response = await api.get(`/recipes/trending?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trending recipes:', error);
      throw error;
    }
  },

  // Извличане на всички рецепти с пагинация
  async getRecipes(page = 1, limit = 10, filters = {}) {
    try {
      const response = await api.get('/recipes', {
        params: {
          page,
          limit,
          ...filters
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  }
};

export default recipeService;