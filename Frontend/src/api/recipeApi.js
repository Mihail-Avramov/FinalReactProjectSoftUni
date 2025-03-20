import apiClient from './apiClient';

class RecipeApi {
  // Получаване на всички рецепти с пагинация
  static async getRecipes(page = 1, limit = 10, signal) {
    return apiClient.get('/recipes', {
      params: { page, limit },
      signal
    });
    // Отговорът ще бъде { data: [...], pagination: {...} }
  }
  
  // Получаване на трендващи рецепти (без пагинация)
  static async getTrending(limit = 6, signal) {
    return apiClient.get('/recipes/trending', {
      params: { limit },
      signal
    });
    // Отговорът ще бъде само масивът с рецепти
  }
  
  // Получаване на рецепта по ID
  static async getById(id, signal) {
    return apiClient.get(`/recipes/${id}`, { signal });
  }
  
  // Търсене на рецепти с пагинация
  static async search(params, signal) {
    return apiClient.get('/recipes/search', {
      params,
      signal
    });
    // Отговорът ще бъде { data: [...], pagination: {...} }
  }
  
  // Създаване на рецепта
  static async create(recipeData) {
    return apiClient.post('/recipes', recipeData);
  }
  
  // Редактиране на рецепта
  static async update(id, recipeData) {
    return apiClient.put(`/recipes/${id}`, recipeData);
  }
  
  // Изтриване на рецепта
  static async delete(id) {
    return apiClient.delete(`/recipes/${id}`);
  }
  
  // Харесване на рецепта
  static async like(id) {
    return apiClient.post(`/recipes/${id}/like`);
  }
  
  // Премахване на харесване
  static async unlike(id) {
    return apiClient.delete(`/recipes/${id}/like`);
  }
}

export default RecipeApi;