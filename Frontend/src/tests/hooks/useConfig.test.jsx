import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConfig } from '../../hooks/api/useConfig';
import ConfigApi from '../../api/configApi';

// Мокване на ConfigApi
vi.mock('../../api/configApi', () => ({
  default: {
    getConfig: vi.fn()
  }
}));

describe('useConfig hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('връща данни при успешна заявка', async () => {
    const mockConfig = {
      categories: ['breakfast', 'lunch', 'dinner'],
      difficulties: ['easy', 'medium', 'hard']
    };
    
    // Мокване на успешна заявка
    ConfigApi.getConfig.mockResolvedValue(mockConfig);
    
    // Използваме renderHook за тестване на hooks
    const { result } = renderHook(() => useConfig());
    
    // В началото зареждането е активно
    expect(result.current.loading).toBe(true);
    
    // Изчакваме асинхронните операции да приключат
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Проверяваме получените данни
    expect(result.current.data).toEqual(mockConfig);
    expect(result.current.error).toBe(null);
    expect(ConfigApi.getConfig).toHaveBeenCalledTimes(1);
  });

  it('връща грешка при неуспешна заявка', async () => {
    // Мокване на неуспешна заявка
    ConfigApi.getConfig.mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useConfig());
    
    // Изчакваме асинхронните операции да приключат
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Проверяваме състоянието при грешка
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Не успяхме да заредим конфигурацията');
    expect(ConfigApi.getConfig).toHaveBeenCalledTimes(1);
  });
});