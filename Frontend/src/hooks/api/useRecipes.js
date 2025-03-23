import { useCallback, useEffect } from 'react';
import useApiData from '../useApiData';
import usePagination from './usePagination';
import RecipeApi from '../../api/recipeApi';

export function useRecipes() {
  /**
   * Hook за трендващи рецепти
   */
  const useTrending = (limit = 6) => {
    const fetchTrending = useCallback(
      (signal) => RecipeApi.getTrending(limit, signal),
      [limit]
    );
    
    return useApiData(
      fetchTrending,
      [limit],
      'Не успяхме да заредим популярните рецепти'
    );
  };

  /**
   * Hook за списък с рецепти с пагинация
   */
  const usePaginatedRecipes = (initialOptions = {}) => {
    const {
      pagination,
      fetchOptions,
      setPage,
      setLimit,
      setSort: originalSetSort,
      setOrder: originalSetOrder,
      setOption,
      refresh,
      processApiResponse
    } = usePagination(initialOptions);
    
    // Функция за масово актуализиране на опции
    const updateOptions = useCallback((options) => {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          setOption(key, value);
        }
      });
    }, [setOption]);
    
    const fetchRecipes = useCallback(
      async (signal) => {
        const response = await RecipeApi.getRecipes({
          ...fetchOptions,
          signal
        });
        
        return processApiResponse(response);
      },
      [fetchOptions, processApiResponse]
    );
    
    // Функциите за сортиране
    const enhancedSetSort = useCallback((newSort) => {
      console.log("enhancedSetSort извикан с:", newSort);
      originalSetSort(newSort);
      // Директно обновяване на данните
      refresh();
    }, [originalSetSort, refresh]);
  
    const enhancedSetOrder = useCallback((newOrder) => {
      console.log("enhancedSetOrder извикан с:", newOrder);
      originalSetOrder(newOrder);
      // Директно обновяване на данните
      refresh();
    }, [originalSetOrder, refresh]);
    
    const result = useApiData(
      fetchRecipes,
      [fetchOptions],
      'Не успяхме да заредим рецептите'
    );
    
    return {
      ...result,
      pagination,
      setPage,
      setLimit,
      setSort: enhancedSetSort,
      setOrder: enhancedSetOrder,
      updateOptions,
      refresh
    };
  };
  
  /**
   * Hook за рецепта по ID
   */
  const useRecipe = (id, withComments = true) => {
    const fetchRecipe = useCallback(
      (signal) => id ? RecipeApi.getById(id, withComments, signal) : null,
      [id, withComments]
    );
    
    return useApiData(
      fetchRecipe, 
      [id, withComments], 
      'Не успяхме да заредим детайли за рецептата'
    );
  };
  
  /**
   * Hook за собствени рецепти на потребителя
   */
  const useUserRecipes = (initialOptions = {}) => {
    const {
      pagination,
      fetchOptions,
      setPage,
      setLimit,
      setSort,
      setOrder,
      setOption,
      refresh,
      processApiResponse
    } = usePagination(initialOptions);
    
    // Функция за масово актуализиране на опции
    const updateOptions = useCallback((options) => {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          setOption(key, value);
        }
      });
    }, [setOption]);
    
    const fetchUserRecipes = useCallback(
      async (signal) => {
        const response = await RecipeApi.getUserRecipes({
          page: fetchOptions.page,
          limit: fetchOptions.limit,
          sort: fetchOptions.sort,
          order: fetchOptions.order,
          search: fetchOptions.search,
          category: fetchOptions.category,
          difficulty: fetchOptions.difficulty,
          signal
        });
        
        return processApiResponse(response);
      },
      [fetchOptions, processApiResponse]
    );
    
    const result = useApiData(
      fetchUserRecipes,
      [fetchOptions],
      'Не успяхме да заредим вашите рецепти'
    );
    
    return {
      ...result,
      pagination,
      setPage,
      setLimit,
      setSort,
      setOrder,
      setOption,
      updateOptions,
      refresh
    };
  };
  
  /**
   * Hook за любими рецепти на потребителя
   */
  const useFavoriteRecipes = (initialOptions = {}) => {
    const {
      pagination,
      fetchOptions,
      setPage,
      setLimit,
      setSort,
      setOrder,
      setOption,
      refresh,
      processApiResponse
    } = usePagination(initialOptions);
    
    // Функция за масово актуализиране на опции
    const updateOptions = useCallback((options) => {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          setOption(key, value);
        }
      });
    }, [setOption]);
    
    const fetchFavoriteRecipes = useCallback(
      async (signal) => {
        const response = await RecipeApi.getFavoriteRecipes({
          page: fetchOptions.page,
          limit: fetchOptions.limit,
          sort: fetchOptions.sort,
          order: fetchOptions.order,
          search: fetchOptions.search,
          category: fetchOptions.category,
          difficulty: fetchOptions.difficulty,
          signal
        });
        
        return processApiResponse(response);
      },
      [fetchOptions, processApiResponse]
    );
    
    const result = useApiData(
      fetchFavoriteRecipes,
      [fetchOptions],
      'Не успяхме да заредим любимите ви рецепти'
    );
    
    return {
      ...result,
      pagination,
      setPage,
      setLimit,
      setSort,
      setOrder,
      setOption,
      updateOptions,
      refresh
    };
  };
  
  /**
   * Hook за рецептите на конкретен потребител
   */
  const useUserRecipesByUserId = (userId, initialOptions = {}) => {
    // Добавяме userId към началните опции
    const mergedOptions = { ...initialOptions, userId };
    
    const {
      pagination,
      fetchOptions,
      setPage,
      setLimit,
      setSort,
      setOrder,
      setOption,
      refresh,
      processApiResponse
    } = usePagination(mergedOptions);
    
    // Актуализираме userId, когато се промени външната стойност
    useEffect(() => {
      setOption('userId', userId);
    }, [userId, setOption]);
    
    // Функция за масово актуализиране на опции
    const updateOptions = useCallback((options) => {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          setOption(key, value);
        }
      });
    }, [setOption]);
    
    const fetchUserRecipesByUserId = useCallback(
      async (signal) => {
        if (!fetchOptions.userId) return null;
        
        const response = await RecipeApi.getUserRecipesByUserId(
          fetchOptions.userId,
          {
            page: fetchOptions.page,
            limit: fetchOptions.limit,
            sort: fetchOptions.sort,
            order: fetchOptions.order,
            search: fetchOptions.search,
            category: fetchOptions.category,
            difficulty: fetchOptions.difficulty,
            signal
          }
        );
        
        return processApiResponse(response);
      },
      [fetchOptions, processApiResponse]
    );
    
    const result = useApiData(
      fetchUserRecipesByUserId,
      [fetchOptions],
      'Не успяхме да заредим рецептите на този потребител'
    );
    
    return {
      ...result,
      pagination,
      setPage,
      setLimit,
      setSort,
      setOrder,
      setOption,
      updateOptions,
      refresh
    };
  };
  
  /**
   * Hook за CRUD операции
   */
  const useRecipeActions = () => {
    const createRecipe = useCallback((data) => RecipeApi.create(data), []);
    const updateRecipe = useCallback((id, data) => RecipeApi.update(id, data), []);
    const deleteRecipe = useCallback((id) => RecipeApi.delete(id), []);
    const toggleLike = useCallback((id) => RecipeApi.toggleLike(id), []);
    const toggleFavorite = useCallback((id) => RecipeApi.toggleFavorite(id), []);
    const bulkToggleFavorites = useCallback(
      (recipeIds, action) => RecipeApi.bulkToggleFavorites(recipeIds, action),
      []
    );
    
    return {
      createRecipe,
      updateRecipe,
      deleteRecipe,
      toggleLike,
      toggleFavorite,
      bulkToggleFavorites
    };
  };
  
  return {
    useTrending,
    usePaginatedRecipes,
    useRecipe,
    useUserRecipes,
    useFavoriteRecipes,
    useUserRecipesByUserId,
    useRecipeActions
  };
}

export default useRecipes;