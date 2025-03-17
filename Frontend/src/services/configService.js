import api from './api';

const configService = {
  // Извличане на конфигурация и референтни данни
  async getConfig() {
    try {
      const response = await api.get('/config');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching configuration:', error);
      throw error;
    }
  }
};

export default configService;