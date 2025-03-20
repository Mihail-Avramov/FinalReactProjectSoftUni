import apiClient from './apiClient';

class ConfigApi {
  // Получаване на конфигурация  
  static async getConfig(signal) {
    return apiClient.get('/config', { signal });
  }
}

export default ConfigApi;