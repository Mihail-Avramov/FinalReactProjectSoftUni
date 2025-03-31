import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfile } from '../../hooks/api/useProfile';
import userApi from '../../api/userApi';
import { mockUser } from '../fixtures/auth';
import { suppressConsoleError } from '../test-utils.jsx';

// Мокване на userApi
vi.mock('../../api/userApi', () => ({
  default: {
    getProfile: vi.fn(),
    getUserStats: vi.fn(),
    updateProfile: vi.fn(),
    updateProfilePicture: vi.fn(),
    resetProfilePicture: vi.fn(),
    changePassword: vi.fn(),
    deleteAccount: vi.fn()
  }
}));

// Мокване на console.error за чисти тестове
const originalConsoleError = console.error;
console.error = vi.fn();

describe('useProfile hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });
  
  describe('loadProfile', () => {
    it('зарежда профилни данни при успешна заявка', async () => {
      userApi.getProfile.mockResolvedValue(mockUser);
      
      const { result } = renderHook(() => useProfile());
      
      // Началното състояние
      expect(result.current.profile).toBe(null);
      expect(result.current.loading).toBe(false);
      
      // Извикваме loadProfile
      await act(async () => {
        result.current.loadProfile();
      });
      
      // Проверяваме крайното състояние
      expect(result.current.profile).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(userApi.getProfile).toHaveBeenCalled();
    });
    
    it('задава грешка при неуспешна заявка', async () => {
      const errorMessage = 'Failed to load profile';
      userApi.getProfile.mockRejectedValue(new Error(errorMessage));
      
      const { result } = renderHook(() => useProfile());
      
      // Използваме suppressConsoleError
      await suppressConsoleError(async () => {
        await act(async () => {
          result.current.loadProfile();
        });
      });
      
      // Проверяваме състоянието на грешка, без да проверяваме конкретния текст
      expect(result.current.profile).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
      // Алтернативно, можем да проверим конкретната грешка:
      // expect(result.current.error).toBe(errorMessage);
    });
    
    it('поддържа userId параметър', async () => {
      userApi.getProfile.mockResolvedValue(mockUser);
      
      const { result } = renderHook(() => useProfile());
      
      // Извикваме loadProfile с ID
      await act(async () => {
        result.current.loadProfile('user123');
      });
      
      expect(userApi.getProfile).toHaveBeenCalledWith('user123', expect.anything());
    });
  });
  
  describe('loadStats', () => {
    it('зарежда потребителски статистики при успешна заявка', async () => {
      const mockStats = {
        recipesCount: 10,
        favoritesCount: 5,
        likesReceived: 50
      };
      
      userApi.getUserStats.mockResolvedValue(mockStats);
      
      const { result } = renderHook(() => useProfile());
      
      // Извикваме loadStats
      await act(async () => {
        result.current.loadStats();
      });
      
      // Проверяваме крайното състояние
      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
  
  describe('updateProfile', () => {
    it('актуализира профилните данни при успешна заявка', async () => {
      const updatedProfile = { 
        ...mockUser, 
        name: 'Актуализирано Име' 
      };
      
      userApi.updateProfile.mockResolvedValue(updatedProfile);
      
      const { result } = renderHook(() => useProfile());
      
      let updateResult;
      
      await act(async () => {
        updateResult = await result.current.updateProfile({ name: 'Актуализирано Име' });
      });
      
      // Проверяваме крайното състояние
      expect(result.current.profile).toEqual(updatedProfile);
      expect(updateResult.success).toBe(true);
      expect(updateResult.profileData).toEqual(updatedProfile);
      expect(userApi.updateProfile).toHaveBeenCalledWith({ name: 'Актуализирано Име' });
    });
    
    it('връща грешка при неуспешна заявка', async () => {
      const errorMessage = 'Update failed';
      userApi.updateProfile.mockRejectedValue(new Error(errorMessage));
      
      const { result } = renderHook(() => useProfile());
      
      let updateResult;
      
      await act(async () => {
        updateResult = await result.current.updateProfile({ name: 'Ново име' });
      });
      
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBeTruthy();
      expect(result.current.error).toBeTruthy();
    });
  });
  
  describe('updateProfilePicture', () => {
    it('актуализира профилната снимка при успешна заявка', async () => {
      const mockFile = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
      const updatedData = { profilePicture: 'new-picture-url.jpg' };
      
      userApi.updateProfilePicture.mockResolvedValue(updatedData);
      
      const { result } = renderHook(() => useProfile());
      
      let updateResult;
      
      await act(async () => {
        updateResult = await result.current.updateProfilePicture(mockFile);
      });
      
      expect(result.current.profile).toEqual({ profilePicture: 'new-picture-url.jpg' });
      expect(updateResult.success).toBe(true);
      expect(userApi.updateProfilePicture).toHaveBeenCalledWith(mockFile);
    });
  });
  
  describe('changePassword', () => {
    it('променя паролата при успешна заявка', async () => {
      userApi.changePassword.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useProfile());
      
      let changeResult;
      
      await act(async () => {
        changeResult = await result.current.changePassword('oldPass', 'newPass');
      });
      
      expect(changeResult.success).toBe(true);
      expect(userApi.changePassword).toHaveBeenCalledWith('oldPass', 'newPass');
    });
    
    it('връща валидационни грешки при неуспешна заявка', async () => {
      const validationErrors = { 
        currentPassword: 'Невалидна текуща парола' 
      };
      
      const error = new Error('Invalid password');
      error.validationErrors = validationErrors;
      
      userApi.changePassword.mockRejectedValue(error);
      
      const { result } = renderHook(() => useProfile());
      
      let changeResult;
      
      await act(async () => {
        changeResult = await result.current.changePassword('wrongPass', 'newPass');
      });
      
      expect(changeResult.success).toBe(false);
      expect(changeResult.validationErrors).toEqual(validationErrors);
    });
  });
  
  describe('deleteAccount', () => {
    it('изтрива акаунта при успешна заявка', async () => {
      userApi.deleteAccount.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useProfile());
      
      let deleteResult;
      
      await act(async () => {
        deleteResult = await result.current.deleteAccount('password123');
      });
      
      expect(deleteResult.success).toBe(true);
      expect(userApi.deleteAccount).toHaveBeenCalledWith('password123');
    });
  });
});