import apiClient from './apiClient';

class RecipeApi {
  /**
   * Получаване на всички рецепти с пагинация
   * @param {number} page - номер на страница
   * @param {number} limit - брой резултати на страница
   * @param {string} sort - поле за сортиране
   * @param {string} order - посока на сортиране (asc/desc)
   * @param {AbortSignal} signal - сигнал за прекъсване на заявката
   */
  static async getRecipes(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt', 
      order = 'desc',
      search,
      category,
      difficulty,
      minTime,
      maxTime,
      author,
      signal
    } = options;
  
    // Конструиране на параметрите за заявката
    const params = {
      page,
      limit,
      sort: `${order === 'desc' ? '-' : ''}${sort}`
    };
  
    // Добавяне на филтри, само ако не са празни
    if (search) params.search = search;
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    if (minTime) params.minTime = minTime;
    if (maxTime) params.maxTime = maxTime;
    if (author) params.author = author;
  
    return apiClient.get('/recipes', { params, signal });
  }
  
  /**
   * Получаване на трендващи рецепти
   * @param {number} limit - брой рецепти
   * @param {AbortSignal} signal - сигнал за прекъсване на заявката
   */
  static async getTrending(limit = 6, signal) {
    return apiClient.get('/recipes/trending', {
      params: { limit },
      signal
    });
  }
  
  /**
   * Получаване на рецепта по ID
   * @param {string} id - ID на рецептата
   * @param {boolean} withComments - дали да включва коментари
   * @param {AbortSignal} signal - сигнал за прекъсване на заявката
   */
  static async getById(id, withComments = true, signal) {
    return apiClient.get(`/recipes/${id}`, { 
      params: { comments: withComments },
      signal 
    });
  }
  
  /**
   * Създаване на рецепта
   * @param {Object} recipeData - данни за рецептата
   */
  static async create(recipeData) {
    // За FormData, apiClient автоматично ще зададе правилния Content-Type
    return apiClient.post('/recipes', recipeData);
  }
  
  /**
   * Редактиране на рецепта
   * @param {string} id - ID на рецептата
   * @param {Object} recipeData - нови данни за рецептата
   */
  static async update(id, recipeData) {
    return apiClient.put(`/recipes/${id}`, recipeData);
  }
  
  /**
   * Изтриване на рецепта
   * @param {string} id - ID на рецептата
   */
  static async delete(id) {
    return apiClient.delete(`/recipes/${id}`);
  }
  
  /**
   * Харесване/премахване на харесване на рецепта
   * @param {string} id - ID на рецептата
   */
  static async toggleLike(id) {
    return apiClient.post(`/recipes/${id}/like`);
  }
  
  /**
   * Добавяне/премахване на рецепта от любими
   * @param {string} id - ID на рецептата
   */
  static async toggleFavorite(id) {
    return apiClient.post(`/recipes/${id}/favorite`);
  }
  
  /**
   * Получаване на собствените рецепти на потребителя
   * @param {Object} options - опции за заявката
   */
  static async getUserRecipes(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      search,
      category,
      difficulty,
      signal
    } = options;
  
    // Конструиране на параметрите за заявката
    const params = {
      page,
      limit,
      sort: `${order === 'desc' ? '-' : ''}${sort}`
    };
  
    // Добавяне на филтри, само ако не са празни
    if (search) params.search = search;
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
  
    return apiClient.get('/recipes/users/', { params, signal });
  }
  
  /**
   * Получаване на рецептите на конкретен потребител
   * @param {string} userId - ID на потребителя
   * @param {Object} options - опции за заявката
   */
  static async getUserRecipesByUserId(userId, options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      search,
      category,
      difficulty,
      signal 
    } = options;
  
    // Конструиране на параметрите за заявката
    const params = {
      page,
      limit,
      sort: `${order === 'desc' ? '-' : ''}${sort}`
    };
  
    // Добавяне на филтри, само ако не са празни
    if (search) params.search = search;
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
  
    return apiClient.get(`/recipes/users/${userId}`, { params, signal });
  }
  
  /**
   * Получаване на любимите рецепти на потребителя
   * @param {Object} options - опции за заявката
   */
  static async getFavoriteRecipes(options = {}) {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      search,
      category,
      difficulty,
      signal 
    } = options;
  
    // Конструиране на параметрите за заявката
    const params = {
      page,
      limit,
      sort: `${order === 'desc' ? '-' : ''}${sort}`
    };
  
    // Добавяне на филтри, само ако не са празни
    if (search) params.search = search;
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
  
    return apiClient.get('/recipes/users/favorites', { params, signal });
  }
  
  /**
   * Bulk операция с любими рецепти (добавяне/премахване на множество)
   * @param {Array} recipeIds - масив с ID-та на рецепти
   * @param {string} action - действие ('like' или 'unlike')
   */
  static async bulkToggleFavorites(recipeIds, action) {
    return apiClient.post('/recipes/favorites/bulk', { recipeIds, action });
  }
}

export default RecipeApi;