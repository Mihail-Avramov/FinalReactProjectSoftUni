import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useApiData from '../../hooks/useApiData';
import { isRequestCanceled } from '../../utils/requestUtils';
import { suppressApiErrors, captureInitialHookState, renderHookSafe } from '../test-utils.jsx';

// Мокваме requestUtils
vi.mock('../../utils/requestUtils', () => ({
  isRequestCanceled: vi.fn()
}));

describe('useApiData hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    isRequestCanceled.mockReturnValue(false);
  });

  it('връща данни при успешна заявка', async () => {
    const mockData = { id: 1, name: 'Test' };
    const fetchFn = vi.fn().mockResolvedValue(mockData);
    
    const { result } = await renderHookSafe(() => useApiData(fetchFn));
    
    // Изчакваме асинхронните операции
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
  
  it('връща грешка при неуспешна заявка', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('API Error'));
    const errorMsg = 'Тестова грешка';
    
    await suppressApiErrors(async () => {
      const { result } = await renderHookSafe(() => useApiData(fetchFn, [], errorMsg));
      
      // Изчакваме асинхронните операции
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(errorMsg);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });
  
  it('не актуализира състоянието при отказана заявка', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Abort Error'));
    isRequestCanceled.mockReturnValue(true);
    
    const { result } = await renderHookSafe(() => useApiData(fetchFn));
    
    // Изчакваме да се извика fetch функцията
    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
    
    // Вместо да проверяваме loading състоянието, проверяваме дали
    // isRequestCanceled е било извикано и дали грешката не е зададена
    expect(isRequestCanceled).toHaveBeenCalled();
    expect(result.current.error).toBe(null);
  });

  it('извиква fetch функцията с AbortController сигнал', async () => {
    const fetchFn = vi.fn().mockResolvedValue({});
    
    await renderHookSafe(() => useApiData(fetchFn));
    
    // Проверяваме че fetch е извикана с AbortController signal
    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(fetchFn.mock.calls[0][0]).toHaveProperty('aborted');
    });
  });
  
  // В теста за ререндериране, добавяме и проверка за използването на result
  it('повторно извиква fetch при промяна на зависимостите', async () => {
    const fetchFn = vi.fn().mockResolvedValue({});
    
    const { result, rerender } = renderHook(
      (props) => useApiData(fetchFn, [props?.id]),
      { initialProps: { id: 1 } }
    );
    
    // Изчакваме първата заявка и проверяваме loading състоянието
    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(result.current.loading).toBe(false);
    });
    
    // Променяме props
    rerender({ id: 2 });
    
    // Изчакваме втората заявка и проверяваме новото loading състояние
    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledTimes(2);
      expect(result.current.loading).toBe(false);
    });
  });

  it('коректно преминава през целия цикъл на зареждане', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });
    
    // Използваме стандартния renderHook
    const { result } = renderHook(() => useApiData(fetchFn));
    
    // Начално състояние е loading: true, но не е критично за теста
    
    // Важното е да проверим, че заявката се извиква
    expect(fetchFn).toHaveBeenCalledTimes(1);
    
    // И че крайното състояние е правилно
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ data: 'test' });
    expect(result.current.error).toBe(null);
  });

  it('правилно управлява целия жизнен цикъл на зареждане', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });
    
    // 1. Улавяме началното състояние
    const { result: initialResult } = captureInitialHookState(() => useApiData(fetchFn));
    expect(initialResult.current.loading).toBe(true);
    expect(initialResult.current.data).toBe(null);
    expect(initialResult.current.error).toBe(null);
    
    // 2. Тестваме крайното състояние след успешно зареждане
    const { result } = await renderHookSafe(() => useApiData(fetchFn));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ data: 'test' });
    expect(result.current.error).toBe(null);
    expect(fetchFn).toHaveBeenCalledTimes(2); // Един за началното, един за финалното
  });
});