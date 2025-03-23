import apiClient from './apiClient';

class CommentApi {
  /**
   * Създаване на коментар
   * @param {string} recipeId - ID на рецептата
   * @param {Object} commentData - данни за коментара
   */
  static async create(recipeId, commentData) {
    return apiClient.post(`/recipes/${recipeId}/comments`, commentData);
  }

  /**
   * Изтриване на коментар
   * @param {string} recipeId - ID на рецептата
   * @param {string} commentId - ID на коментара
   */
  static async delete(recipeId, commentId) {
    return apiClient.delete(`/recipes/${recipeId}/comments/${commentId}`);
  }
}

export default CommentApi;