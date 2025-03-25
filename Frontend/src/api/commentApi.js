import api from './apiClient';

const commentApi = {
  /**
   * Създаване на нов коментар към рецепта
   * @param {string} recipeId - ID на рецептата
   * @param {string} content - Съдържание на коментара
   * @returns {Promise} - Създаденият коментар с информация за автора
   */
  async createComment(recipeId, content, signal) {
    const response = await api.post(
      `/comments/recipe/${recipeId}`, 
      { content },
      { signal }
    );
    
    // Адаптираме отговора да бъде в същия формат като другите методи
    // Проверяваме дали response е пряко обект с данни или wrapper
    if (response && response._id) {
      // Ако response е директно обектът с данни
      return {
        success: true,
        data: response
      };
    }
    
    // В противен случай приемаме, че може да съдържа .data свойство
    return {
      success: true,
      data: response.data || response
    };
  },
  
  /**
   * Получаване на коментари за рецепта с пагинация
   * @param {string} recipeId - ID на рецептата
   * @param {Object} options - Опции за пагинация
   * @returns {Promise} - Коментари и информация за пагинацията
   */
  async getComments(recipeId, options = {}, signal) {
    const { page = 1, limit = 5, sort = '-createdAt' } = options;
    
    const response = await api.get(
      `/comments/recipe/${recipeId}`, 
      { 
        params: { page, limit, sort },
        signal
      }
    );
    
    // Адаптираме отговора да работи с useComment
    if (response && Array.isArray(response.data)) {
      // Трансформираният отговор от apiClient
      return {
        success: true,
        data: response.data,
        pagination: response.pagination || {
          page: options.page,
          limit: options.limit,
          totalItems: response.data.length,
          totalPages: 1
        }
      };
    }
    
    // Отговорът вече е трансформиран в apiClient
    return {
      success: true,
      data: response,
      pagination: { page, limit, totalItems: 0, totalPages: 1 }
    };
  },
  
  /**
   * Обновяване на коментар (само собственикът може да редактира)
   * @param {string} commentId - ID на коментара
   * @param {string} content - Ново съдържание на коментара
   * @returns {Promise} - Обновеният коментар
   */
  async updateComment(commentId, content, signal) {
    const response = await api.put(
      `/comments/${commentId}`, 
      { content },
      { signal }
    );
    // Добавяме success флаг
    return { success: true, data: response };
  },
  
  /**
   * Изтриване на коментар
   * (само собственикът на коментара или собственикът на рецептата могат да изтриват)
   * @param {string} commentId - ID на коментара
   * @returns {Promise} - Резултат от изтриването
   */
  async deleteComment(commentId, signal) {
    const response = await api.delete(
      `/comments/${commentId}`,
      { signal }
    );
    // Добавяме success флаг
    return { success: true, data: response };
  }
};

export default commentApi;