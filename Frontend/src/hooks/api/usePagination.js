import { useState, useCallback } from 'react';

/**
 * Custom hook за управление на pagination и опции за заявки
 * @param {Object} initialOptions - Начални опции за заявката
 * @returns {Object} Обект с pagination state и методи
 */
function usePagination(initialOptions = {}) {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    ...otherOptions
  } = initialOptions;

  // Pagination state
  const [pagination, setPagination] = useState({
    page,
    limit,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Опции за заявка
  const [fetchOptions, setFetchOptions] = useState({
    page,
    limit,
    sort,
    order,
    ...otherOptions
  });

  // Setter функции
  const setPage = useCallback((newPage) => {
    setFetchOptions(prev => ({ ...prev, page: newPage }));
  }, []);

  const setLimit = useCallback((newLimit) => {
    setFetchOptions(prev => ({ ...prev, limit: newLimit }));
  }, []);

  const setSort = useCallback((newSort) => {
    setFetchOptions(prev => ({ ...prev, sort: newSort }));
  }, []);

  const setOrder = useCallback((newOrder) => {
    setFetchOptions(prev => ({ ...prev, order: newOrder }));
  }, []);

  // Обновяване на произволна опция
  const setOption = useCallback((name, value) => {
    setFetchOptions(prev => ({ ...prev, [name]: value }));
  }, []);

  // Функция за опресняване на данните
  const refresh = useCallback(() => {
    setFetchOptions(prev => ({ ...prev }));
  }, []);

  // Функция за обработка на отговор от API
  const processApiResponse = useCallback((response) => {
    if (response && response.pagination) {
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        pages: response.pagination.pages,
        hasNext: response.pagination.hasNext,
        hasPrev: response.pagination.hasPrev
      });
      return response.data;
    }
    return response;
  }, []);

  return {
    pagination,
    fetchOptions,
    setPage,
    setLimit,
    setSort,
    setOrder,
    setOption,
    refresh,
    processApiResponse
  };
}

export default usePagination;