import apiClient from './apiClient';

class AuthApi {
  // Регистрация
  static async register(userData) {
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
  
  // Промяна на парола
  static async resetPassword(token, newPassword) {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  }
  
  // Проверка дали токенът е валиден
  static async verifyToken(signal) {
    return apiClient.get('/auth/verify', { signal });
  }
}

export default AuthApi;