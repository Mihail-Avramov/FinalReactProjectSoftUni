import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import AuthApi from '../../api/authApi';
import useApiData from '../useApiData';
import { isRequestCanceled } from '../../utils/requestUtils';

// Създаваме контекст за споделяне на информацията за автентикацията
export const AuthContext = createContext();

// Функция за извличане на потребителски данни от localStorage
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    localStorage.removeItem('user');
    return null;
  }
};

// Hook за създаване и управление на auth state
export function useAuthState() {
  const [user, setUser] = useState(getStoredUser());
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);
  
// Извличаме информация за валидността на токена само ако има токен
const verifyTokenCallback = useCallback(
    (signal) => {
      const token = localStorage.getItem('token');
      
      // Правим заявка само ако има токен
      if (token) {
        return AuthApi.verifyToken(signal);
      }
      
      // Ако няма токен, директно връщаме null
      // Това предотвратява ненужни заявки
      return Promise.resolve(null);
    },
    []
  );

  const updateUserInfo = useCallback((updatedUserData) => {
    // Не презаписваме целия обект, а обновяваме само подадените полета
    setUser(prevUser => {
      if (!prevUser) return updatedUserData;
      
      const updatedUser = { ...prevUser, ...updatedUserData };
      
      // Обновяваме и в localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    });
    
    return true;
  }, []);
  
  // Използваме useApiData за проверка на токена
  const { 
    data: tokenData, 
    loading: verifyingToken, 
    error: tokenError 
  } = useApiData(verifyTokenCallback, [], null);
  
  // При зареждане и при промяна на tokenData, актуализираме потребителя
  useEffect(() => {
    // Ако верифицирането на токена е приключило
    if (!verifyingToken) {
      // Ако има валиден токен и данни за потребителя
      if (tokenData && tokenData.user) {
        // Съхраняваме потребителските данни
        setUser(tokenData.user);
        localStorage.setItem('user', JSON.stringify(tokenData.user));
        
        // Ако има токен, съхраняваме го
        if (tokenData.token) {
          localStorage.setItem('token', tokenData.token);
        }
      } 
      // Ако има грешка при верификацията или няма валиден токен
      else if (tokenError || !tokenData) {
        // Изчистваме данните за сесията
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      
      // Инициализацията е завършена
      setIsInitializing(false);
    }
  }, [tokenData, verifyingToken, tokenError]);
  
  // Функция за вход
  const login = useCallback(async (credentials) => {
    setAuthError(null);
    try {
      const response = await AuthApi.login(credentials);
      
      if (response && response.user) {
        // При успешен вход съхраняваме данните
        localStorage.setItem('user', JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        setUser(response.user);
        return response.user;
      }
      return null;
    } catch (error) {
      if (!isRequestCanceled(error)) {
        setAuthError(error.message || 'Неуспешен опит за вход');
        throw error;
      }
    }
  }, []);
  
  // Функция за регистрация
  const register = useCallback(async (userData) => {
    setAuthError(null);
    try {
      const response = await AuthApi.register(userData);
      
      // При успешна регистрация, но без автоматичен вход
      return response;
    } catch (error) {
      if (!isRequestCanceled(error)) {
        setAuthError(error.message || 'Неуспешен опит за регистрация');
        throw error;
      }
    }
  }, []);
  
  // Функция за изход
  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      // Запазваме токена локално за тази функция
      const token = localStorage.getItem('token');
      
      if (token) {
        // Първо се обаждаме на сървъра, докато все още имаме валиден токен
        await AuthApi.logout();
      }
      
      // След успешно или неуспешно обаждане до сървъра, изчистваме локалните данни
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      return true;
    } catch (error) {
      if (!isRequestCanceled(error)) {
        console.error('Error during logout:', error);
        
        // Въпреки грешката, изчистваме локалните данни
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      return false;
    }
  }, []);
  
  // Функция за забравена парола
  const forgotPassword = useCallback(async (email) => {
    setAuthError(null);
    try {
      return await AuthApi.forgotPassword(email);
    } catch (error) {
      if (!isRequestCanceled(error)) {
        setAuthError(error.message || 'Грешка при заявка за забравена парола');
        throw error;
      }
    }
  }, []);
  
  // Функция за промяна на парола
  const resetPassword = useCallback(async (token, newPassword) => {
    setAuthError(null);
    try {
      return await AuthApi.resetPassword(token, newPassword);
    } catch (error) {
      if (!isRequestCanceled(error)) {
        setAuthError(error.message || 'Грешка при промяна на паролата');
        throw error;
      }
    }
  }, []);
  
  // Функция за проверка на имейл
  const verifyEmail = useCallback(async (token) => {
    setAuthError(null);
    try {
      const response = await AuthApi.verifyEmail(token);
      
      // Проверяваме дали потвърждението е било успешно
      if (response && response.success) {
        // Ако потребителят е влязъл, актуализираме статуса
        if (user) {
          const updatedUser = { ...user, emailVerified: true };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      return response;
    } catch (error) {
      if (!isRequestCanceled(error)) {
        setAuthError(error.message || 'Грешка при потвърждаване на имейл');
        throw error;
      }
    }
  }, [user]);
  
  // Функция за повторно изпращане на имейл за потвърждение
  const resendVerification = useCallback(async (email) => {
    setAuthError(null);
    try {
      return await AuthApi.resendVerification(email);
    } catch (error) {
      if (!isRequestCanceled(error)) {
        setAuthError(error.message || 'Грешка при повторно изпращане на имейл за потвърждение');
        throw error;
      }
    }
  }, []);
  
  // Обобщено състояние на автентикацията
  const isAuthenticated = !!user;
  const isLoading = isInitializing || verifyingToken;
  
  // Връщаме всички данни и функции
  return {
    user,
    isAuthenticated,
    isLoading,
    error: authError,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    updateUserInfo
  };
}

// Hook за използване в компоненти
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Допълнителни удобни hooks за достъп до отделни функционалности
export function useLogin() {
  const { login, isLoading, error } = useAuth();
  return { login, isLoading, error };
}

export function useRegister() {
  const { register, isLoading, error } = useAuth();
  return { register, isLoading, error };
}

export function useLogout() {
  const { logout } = useAuth();
  return logout;
}