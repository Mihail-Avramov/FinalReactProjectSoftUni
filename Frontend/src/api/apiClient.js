import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Интерцептор за добавяне на токен и правилен Content-Type
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Проверяваме дали данните са FormData и премахваме Content-Type,
  // за да позволим на axios да го зададе автоматично със съответния boundary
  if (config.data instanceof FormData) {
    // Премахваме изрично зададен Content-Type,
    // за да може axios да зададе автоматично правилния multipart/form-data с boundary
    delete config.headers['Content-Type'];
  } else {
    // За всички останали заявки използваме JSON
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

// Подобрен интерцептор за обработка на различни структури на отговора
apiClient.interceptors.response.use(
  response => {
    // Успешна обработка - без промяна
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      if (response.data.pagination) {
        return {
          data: response.data.data,
          pagination: response.data.pagination
        };
      }
      return response.data.data;
    }
    return response.data;
  },
  error => {
    // Проверка за отказана заявка
    if (axios.isCancel(error)) {
      return Promise.reject({ 
        isCanceled: true, 
        message: 'Заявката беше отказана' 
      });
    }
    
    // Извличане на структурирана грешка от бекенда
    if (error.response && error.response.data) {
      const { data } = error.response;
      
      // Проверка за структурирана грешка във формат { success: false, error: { ... } }
      if (data.success === false && data.error) {
        const apiError = {
          status: error.response.status,
          code: data.error.code || error.response.status,
          message: data.error.message || 'Възникна грешка при изпълнение на заявката',
          originalError: error,
          isApiError: true
        };
        
        // Добавяне на полетата с грешки, ако има такива
        if (data.error.fields) {
          apiError.validationErrors = data.error.fields;
          apiError.isValidationError = true;
        }
        
        // Специфична обработка за 401 Unauthorized
        if (apiError.code === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Тук при нужда може да се добави навигация към login страницата
        }
        
        return Promise.reject(apiError);
      }
    }
    
    // Обработка на стандартни грешки
    const defaultError = {
      status: error.response?.status || 500,
      message: error.message || 'Възникна грешка при комуникацията със сървъра',
      originalError: error
    };
    
    return Promise.reject(defaultError);
  }
);

export default apiClient;