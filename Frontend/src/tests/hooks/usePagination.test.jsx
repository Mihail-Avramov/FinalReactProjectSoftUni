import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import usePagination from '../../hooks/api/usePagination';

describe('usePagination hook', () => {
  it('инициализира се с подразбиращите се стойности', () => {
    const { result } = renderHook(() => usePagination());
    
    expect(result.current.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrev: false
    });
    
    expect(result.current.fetchOptions).toEqual({
      page: 1,
      limit: 10,
      sort: 'createdAt',
      order: 'desc'
    });
  });

  it('инициализира се с предоставените начални стойности', () => {
    const initialOptions = {
      page: 2,
      limit: 20,
      sort: 'title',
      order: 'asc',
      category: 'breakfast'
    };
    
    const { result } = renderHook(() => usePagination(initialOptions));
    
    expect(result.current.fetchOptions).toEqual({
      page: 2,
      limit: 20,
      sort: 'title',
      order: 'asc',
      category: 'breakfast'
    });
  });

  it('променя страницата при извикване на setPage', () => {
    const { result } = renderHook(() => usePagination());
    
    act(() => {
      result.current.setPage(3);
    });
    
    expect(result.current.fetchOptions.page).toBe(3);
  });

  it('променя лимита при извикване на setLimit', () => {
    const { result } = renderHook(() => usePagination());
    
    act(() => {
      result.current.setLimit(50);
    });
    
    expect(result.current.fetchOptions.limit).toBe(50);
  });

  it('променя сортирането при извикване на setSort', () => {
    const { result } = renderHook(() => usePagination());
    
    act(() => {
      result.current.setSort('title');
    });
    
    expect(result.current.fetchOptions.sort).toBe('title');
  });

  it('актуализира произволна опция с setOption', () => {
    const { result } = renderHook(() => usePagination());
    
    act(() => {
      result.current.setOption('category', 'dessert');
    });
    
    expect(result.current.fetchOptions.category).toBe('dessert');
  });

  it('правилно обработва API отговор', () => {
    const { result } = renderHook(() => usePagination());
    
    const apiResponse = {
      data: [{ id: 1 }, { id: 2 }],
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        pages: 3,
        hasNext: true,
        hasPrev: true
      }
    };
    
    let processedData;
    
    act(() => {
      processedData = result.current.processApiResponse(apiResponse);
    });
    
    // Проверяваме обработените данни
    expect(processedData).toEqual(apiResponse.data);
    
    // Проверяваме актуализираното състояние на пагинацията
    expect(result.current.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      pages: 3,
      hasNext: true,
      hasPrev: true
    });
  });

  it('запазва API отговор без пагинация непроменен', () => {
    const { result } = renderHook(() => usePagination());
    
    const apiResponse = { id: 1, name: 'Тестов обект' };
    
    let processedData;
    
    act(() => {
      processedData = result.current.processApiResponse(apiResponse);
    });
    
    // Ако няма данни за пагинация, връща обекта непроменен
    expect(processedData).toEqual(apiResponse);
  });
});