import { useCallback, useState } from 'react';
import useApiData from '../useApiData';
import RecipeApi from '../../api/recipeApi';

export function useRecipes() {
  // Hook за трендващи рецепти (без пагинация)
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
  
  // Hook за списък с пагинация
  const usePaginatedRecipes = (page = 1, limit = 10) => {
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    const fetchRecipes = useCallback(
      async (signal) => {
        const response = await RecipeApi.getRecipes(page, limit, signal);
        
        // Проверяваме дали отговорът съдържа данни и пагинация
        if (response && response.pagination) {
          setTotalPages(response.pagination.pages);
          setTotalItems(response.pagination.total);
          return response.data; // Връщаме само данните за рецептите
        }
        
        return response; // Ако няма пагинация, връщаме отговора директно
      },
      [page, limit]
    );
    
    const result = useApiData(
      fetchRecipes,
      [page, limit],
      'Не успяхме да заредим рецептите'
    );
    
    return {
      ...result,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  };
  
  // Hook за рецепта по ID
  const useRecipe = (id) => {
    const fetchRecipe = useCallback(
      (signal) => id ? RecipeApi.getById(id, signal) : null,
      [id]
    );
    
    return useApiData(
      fetchRecipe, 
      [id], 
      'Не успяхме да заредим детайли за рецептата'
    );
  };
  
  // Hook за търсене с пагинация
  const useSearch = (searchParams, page = 1, limit = 10) => {
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    const fetchSearchResults = useCallback(
      async (signal) => {
        const response = await RecipeApi.search(
          { ...searchParams, page, limit },
          signal
        );
        
        if (response && response.pagination) {
          setTotalPages(response.pagination.pages);
          setTotalItems(response.pagination.total);
          return response.data;
        }
        
        return response;
      },
      [searchParams, page, limit]
    );
    
    const result = useApiData(
      fetchSearchResults,
      [searchParams, page, limit],
      'Не успяхме да заредим резултатите от търсенето'
    );
    
    return {
      ...result,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  };
  
  // Hook за CRUD операции
  const useRecipeActions = () => {
    const createRecipe = useCallback((data) => RecipeApi.create(data), []);
    const updateRecipe = useCallback((id, data) => RecipeApi.update(id, data), []);
    const deleteRecipe = useCallback((id) => RecipeApi.delete(id), []);
    const likeRecipe = useCallback((id) => RecipeApi.like(id), []);
    const unlikeRecipe = useCallback((id) => RecipeApi.unlike(id), []);
    
    return {
      createRecipe,
      updateRecipe,
      deleteRecipe,
      likeRecipe,
      unlikeRecipe
    };
  };
  
  return {
    useTrending,
    usePaginatedRecipes,
    useRecipe,
    useSearch,
    useRecipeActions
  };
}