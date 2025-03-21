import { useState, useCallback } from 'react';
import userApi from '../../api/userApi';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Зареждане на профил с AbortController
  const loadProfile = useCallback((userId = null) => {
    const abortController = new AbortController();
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        const response = await userApi.getProfile(userId, abortController.signal);
        // Проверяваме дали заявката не е прекъсната преди промяна на състоянието
        if (!abortController.signal.aborted) {
          setProfile(response);
          setError(null);
        }
      } catch (err) {
        if (!abortController.signal.aborted && !err.isCanceled) {
          setError(err.message || 'Грешка при зареждане на профила');
          console.error('Error loading profile:', err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Връщаме функция, която може да се извика за отказване на заявката
    return () => abortController.abort();
  }, []);
  
  // Зареждане на статистики с AbortController
  const loadStats = useCallback((userId = null) => {
    const abortController = new AbortController();
    setLoading(true);
    setError(null);
    
    const fetchData = async () => {
      try {
        const response = await userApi.getUserStats(userId, abortController.signal);
        if (!abortController.signal.aborted) {
          setStats(response);
          setError(null);
        }
      } catch (err) {
        if (!abortController.signal.aborted && !err.isCanceled) {
          setError(err.message || 'Грешка при зареждане на статистики');
          console.error('Error loading stats:', err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    // Връщаме функция, която може да се извика за отказване на заявката
    return () => abortController.abort();
  }, []);
  
  // Актуализация на профил
  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfileData = await userApi.updateProfile(profileData);
      
      // Директно използваме върнатите данни
      setProfile(updatedProfileData);


      return { 
        success: true,
        profileData: updatedProfileData // За синхронизация с useAuth
      };
    } catch (err) {
      const errorMsg = err.message || 'Грешка при актуализиране на профила';
      setError(errorMsg);
      console.error('Error updating profile:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Актуализиране на профилна снимка
  const updateProfilePicture = useCallback(async (imageFile) => {
    setLoading(true);
    setError(null);
    
    try {
      // Интерцепторът връща директно данните от отговора
      const updatedProfileData = await userApi.updateProfilePicture(imageFile);
      
      // Директно използваме profilePicture от трансформирания отговор
      setProfile(prev => ({
        ...prev,
        profilePicture: updatedProfileData.profilePicture
      }));
      return { 
        success: true,
        profileData: updatedProfileData // Връщаме цялата информация
      };
    } catch (err) {
      const errorMsg = err.message || 'Грешка при качване на снимката';
      setError(errorMsg);
      console.error('Error updating profile picture:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Премахване на профилна снимка
  const resetProfilePicture = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Интерцепторът връща директно данните от отговора
      const updatedProfileData = await userApi.resetProfilePicture();
      
      // Директно използваме profilePicture от трансформирания отговор
      setProfile(prev => ({
        ...prev,
        profilePicture: updatedProfileData.profilePicture
      }));
      return { 
        success: true, 
        profileData: updatedProfileData
      };
    } catch (err) {
      const errorMsg = err.message || 'Грешка при премахване на снимката';
      setError(errorMsg);
      console.error('Error resetting profile picture:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      // Тук не трябва да използваме отговора, тъй като не съхраняваме данни
      await userApi.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Грешка при промяна на паролата';
      setError(errorMsg);
      console.error('Error changing password:', err);
      
      // Проверяваме дали има валидационни грешки от API
      if (err.validationErrors) {
        return { 
          success: false, 
          error: errorMsg,
          validationErrors: err.validationErrors
        };
      }
      
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Изтриване на акаунт
  const deleteAccount = useCallback(async (password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Тук не трябва да използваме отговора, тъй като не съхраняваме данни
      await userApi.deleteAccount(password);
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Грешка при изтриване на акаунта';
      setError(errorMsg);
      console.error('Error deleting account:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    profile,
    stats,
    loading,
    error,
    loadProfile,
    loadStats,
    updateProfile,
    updateProfilePicture,
    resetProfilePicture,
    changePassword,
    deleteAccount
  };
}