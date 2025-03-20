import apiClient from './apiClient';

class AuthApi {
  // Регистрация
  static async register(userData) {
    // FormData ще бъде изпратен автоматично ако userData е FormData обект
    // за поддръжка на качване на изображение при регистрация
    return apiClient.post('/auth/register', userData);
  }
  
  // Вход
  static async login(credentials) {
    return apiClient.post('/auth/login', credentials);
  }
  
  // Изход
  static async logout() {
    return apiClient.post('/auth/logout');
  }
  
  // Забравена парола - изпращане на имейл
  static async forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email });
  }
  
  // Промяна на парола след забравена парола
  static async resetPassword(token, newPassword) {
    // Токенът се подава като URL параметър, а не в тялото
    return apiClient.post(`/auth/reset-password/${token}`, { password: newPassword });
  }
  
  // Проверка дали токенът за автентикация е валиден
  static async verifyToken(signal) {
    return apiClient.get('/auth/verify-token', { signal });
  }
  
  // Потвърждение на имейл след регистрация
  static async verifyEmail(token) {
    return apiClient.get(`/auth/verify-email/${token}`);
  }
  
  // Повторно изпращане на имейл за потвърждение
  static async resendVerification(email) {
    return apiClient.post('/auth/resend-verification', { email });
  }
}

export default AuthApi;