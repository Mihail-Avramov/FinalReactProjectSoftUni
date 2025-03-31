import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { useRecipes } from '../../hooks/api/useRecipes';
import RecipeApi from '../../api/recipeApi';
// Импортираме renderHookSafe
import { renderHookSafe } from '../test-utils.jsx';

// Мокване на RecipeApi
vi.mock('../../api/recipeApi', () => ({
  default: {
    getTrending: vi.fn(),
    getRecipes: vi.fn(),
    getById: vi.fn(),
    getUserRecipes: vi.fn(),
    getFavoriteRecipes: vi.fn(),
    getUserRecipesByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleLike: vi.fn(),
    toggleFavorite: vi.fn(),
    bulkToggleFavorites: vi.fn()
  }
}));

describe('useRecipes hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  describe('useTrending', () => {
    it('връща трендващи рецепти при успешна заявка', async () => {
      const mockRecipes = [
        { _id: '1', title: 'Рецепта 1' },
        { _id: '2', title: 'Рецепта 2' }
      ];
      
      RecipeApi.getTrending.mockResolvedValue(mockRecipes);
      
      const { result } = await renderHookSafe(() => {
        const { useTrending } = useRecipes();
        return useTrending(2);
      });
      
      // Изчакваме асинхронните операции
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.data).toEqual(mockRecipes);
      expect(result.current.error).toBe(null);
      expect(RecipeApi.getTrending).toHaveBeenCalledWith(2, expect.anything());
    });
    
    it('връща грешка при неуспешна заявка', async () => {
      RecipeApi.getTrending.mockRejectedValue(new Error('API Error'));
      
      const { result } = await renderHookSafe(() => {
        const { useTrending } = useRecipes();
        return useTrending();
      });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe('Не успяхме да заредим популярните рецепти');
    });
  });
  
  describe('usePaginatedRecipes', () => {
    it('връща рецепти с пагинация при успешна заявка', async () => {
      const mockResponse = {
        data: [
          { _id: '1', title: 'Рецепта 1' },
          { _id: '2', title: 'Рецепта 2' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 50,
          pages: 5
        }
      };
      
      RecipeApi.getRecipes.mockResolvedValue(mockResponse);
      
      const { result } = await renderHookSafe(() => {
        const { usePaginatedRecipes } = useRecipes();
        return usePaginatedRecipes();
      });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.data).toEqual(mockResponse.data);
      expect(result.current.pagination).toEqual(mockResponse.pagination);
      expect(RecipeApi.getRecipes).toHaveBeenCalledWith(expect.objectContaining({
        page: 1,
        limit: 10
      }));
    });
    
    it('правилно актуализира опциите при setSort', async () => {
      const mockResponse = { 
        data: [{ _id: '1' }], 
        pagination: { page: 1, limit: 10 } 
      };
      
      RecipeApi.getRecipes.mockResolvedValue(mockResponse);
      
      const { result } = await renderHookSafe(() => {
        const { usePaginatedRecipes } = useRecipes();
        return usePaginatedRecipes();
      });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      // Зануляваме броя извиквания, за да проследим само новите
      RecipeApi.getRecipes.mockClear();
      
      // Задаваме нов критерий за сортиране
      await act(async () => {
        result.current.setSort('title');
      });
      
      // Проверяваме дали е направена нова заявка с правилните параметри
      expect(RecipeApi.getRecipes).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'title' })
      );
    });
  });
  
  describe('useRecipe', () => {
    it('връща рецепта по ID при успешна заявка', async () => {
      const mockRecipe = { 
        _id: '123', 
        title: 'Тестова рецепта',
        ingredients: ['съставка 1', 'съставка 2'] 
      };
      
      RecipeApi.getById.mockResolvedValue(mockRecipe);
      
      const { result } = await renderHookSafe(() => {
        const { useRecipe } = useRecipes();
        return useRecipe('123');
      });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.data).toEqual(mockRecipe);
      expect(RecipeApi.getById).toHaveBeenCalledWith('123', true, expect.anything());
    });
    
    it('не прави заявка когато ID е null', async () => {
      const { result } = await renderHookSafe(() => {
        const { useRecipe } = useRecipes();
        return useRecipe(null);
      });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.data).toBe(null);
      expect(RecipeApi.getById).not.toHaveBeenCalled();
    });
  });
  
  describe('useUserRecipes', () => {
    it('връща рецепти на потребителя при успешна заявка', async () => {
      const mockResponse = {
        data: [
          { _id: '1', title: 'Моя рецепта 1' },
          { _id: '2', title: 'Моя рецепта 2' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      };
      
      RecipeApi.getUserRecipes.mockResolvedValue(mockResponse);
      
      const { result } = await renderHookSafe(() => {
        const { useUserRecipes } = useRecipes();
        return useUserRecipes();
      });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.data).toEqual(mockResponse.data);
      expect(result.current.pagination).toEqual(mockResponse.pagination);
    });
  });
  
  describe('useFavoriteRecipes', () => {
    it('връща любими рецепти на потребителя при успешна заявка', async () => {
      const mockResponse = {
        data: [
          { _id: '1', title: 'Любима рецепта 1' },
          { _id: '2', title: 'Любима рецепта 2' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1
        }
      };
      
      RecipeApi.getFavoriteRecipes.mockResolvedValue(mockResponse);
      
      const { result } = await renderHookSafe(() => {
        const { useFavoriteRecipes } = useRecipes();
        return useFavoriteRecipes();
      });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.data).toEqual(mockResponse.data);
      expect(result.current.pagination).toEqual(mockResponse.pagination);
      expect(RecipeApi.getFavoriteRecipes).toHaveBeenCalled();
    });
    
    it('връща null при неуспешна заявка', async () => {
      RecipeApi.getFavoriteRecipes.mockRejectedValue(new Error('API Error'));
      
      const { result } = await renderHookSafe(() => {
        const { useFavoriteRecipes } = useRecipes();
        return useFavoriteRecipes();
      });
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBeTruthy();
    });
  });
  
  describe('useRecipeActions', () => {
    it('toggleLike променя състоянието на харесване', async () => {
      const mockResponse = { success: true, liked: true };
      RecipeApi.toggleLike.mockResolvedValue(mockResponse);
      
      const { result } = await renderHookSafe(() => {
        const { useRecipeActions } = useRecipes();
        return useRecipeActions();
      });
      
      const response = await result.current.toggleLike('123');
      
      expect(response).toEqual(mockResponse);
      expect(RecipeApi.toggleLike).toHaveBeenCalledWith('123');
    });
    
    it('toggleFavorite променя състоянието на любими', async () => {
      const mockResponse = { success: true, favorited: true };
      RecipeApi.toggleFavorite.mockResolvedValue(mockResponse);
      
      const { result } = await renderHookSafe(() => {
        const { useRecipeActions } = useRecipes();
        return useRecipeActions();
      });
      
      const response = await result.current.toggleFavorite('123');
      
      expect(response).toEqual(mockResponse);
      expect(RecipeApi.toggleFavorite).toHaveBeenCalledWith('123');
    });
    
    it('createRecipe създава нова рецепта', async () => {
      const newRecipe = { title: 'Нова рецепта', ingredients: ['съставка'] };
      const mockResponse = { _id: '999', ...newRecipe };
      
      RecipeApi.create.mockResolvedValue(mockResponse);
      
      const { result } = await renderHookSafe(() => {
        const { useRecipeActions } = useRecipes();
        return useRecipeActions();
      });
      
      const response = await result.current.createRecipe(newRecipe);
      
      expect(response).toEqual(mockResponse);
      expect(RecipeApi.create).toHaveBeenCalledWith(newRecipe);
    });
  });
});