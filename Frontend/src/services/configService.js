import api from './api';

let cachedConfig = null;
let cachedTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 минути

const configService = {
  async getConfig(signal) {
    // Проверка за валиден кеш
    if (cachedConfig && cachedTimestamp && (Date.now() - cachedTimestamp < CACHE_TTL)) {
      return cachedConfig;
    }
    
    try {
      const response = await api.get('/config', { signal });
      cachedConfig = response.data.data;
      cachedTimestamp = Date.now();
      return cachedConfig;
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.debug('Request was canceled, ignoring error');
        throw error;
      }      
      console.error('Error fetching configuration:', error);
      throw error;
    }
  }
};

export default configService;