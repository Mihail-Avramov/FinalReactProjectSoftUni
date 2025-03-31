import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { mockUser } from '../fixtures/auth';

// Мокванията трябва да предхождат импортите на реалните модули
// Първо мокваме useAuth hook - това е ключово!
vi.mock('../../hooks/api/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: mockUser
  })
}));

// След това мокваме commentApi
vi.mock('../../api/commentApi', () => ({
  default: {
    getComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn()
  }
}));

// Чак след мокването импортираме реалния модул
import { useComment } from '../../hooks/api/useComment';
import commentApi from '../../api/commentApi';

// Мокване на console.error
const originalConsoleError = console.error;
console.error = vi.fn();

describe('useComment hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });
  
  describe('loadComments', () => {
    it('зарежда коментари при успешна заявка', async () => {
      const mockComments = [
        { 
          _id: 'comment1', 
          content: 'Страхотна рецепта!', 
          author: { _id: 'user1', name: 'Потребител 1' } 
        },
        { 
          _id: 'comment2', 
          content: 'Ще я пробвам!', 
          author: { _id: 'user2', name: 'Потребител 2' } 
        }
      ];
      
      const mockResponse = {
        data: mockComments,
        pagination: {
          page: 1,
          limit: 5,
          totalItems: 2,
          totalPages: 1
        }
      };
      
      commentApi.getComments.mockResolvedValue(mockResponse);
      
      const { result } = renderHook(() => useComment('recipe123'));
      
      // Изчакваме зареждането да приключи
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.comments).toEqual(mockComments);
      expect(result.current.pagination).toEqual(mockResponse.pagination);
      expect(commentApi.getComments).toHaveBeenCalledWith('recipe123', expect.anything(), expect.anything());
    });
    
    it('задава грешка при неуспешна заявка', async () => {
      commentApi.getComments.mockRejectedValue(new Error('Failed to load'));
      
      const { result } = renderHook(() => useComment('recipe123'));
      
      // Изчакваме зареждането да приключи
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.error).toBe('Възникна проблем при зареждане на коментарите.');
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('createComment', () => {
    it('създава нов коментар при успешна заявка', async () => {
      const newComment = { 
        _id: 'new-comment', 
        content: 'Нов коментар', 
        author: { _id: mockUser._id, name: mockUser.name } 
      };
      
      commentApi.createComment.mockResolvedValue({
        success: true,
        data: newComment
      });
      
      const { result } = renderHook(() => useComment('recipe123'));
      
      let createdComment;
      
      // Изчакваме зареждането да приключи
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        createdComment = await result.current.createComment('Нов коментар');
      });
      
      expect(createdComment).toEqual(newComment);
      expect(result.current.comments[0]).toEqual(newComment);
      expect(commentApi.createComment).toHaveBeenCalledWith('recipe123', 'Нов коментар');
    });
    
    it('връща null и задава грешка при неуспешна заявка', async () => {
      commentApi.createComment.mockRejectedValue(new Error('Creation failed'));
      
      const { result } = renderHook(() => useComment('recipe123'));
      
      // Изчакваме зареждането да приключи
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      let createdComment;
      
      await act(async () => {
        createdComment = await result.current.createComment('Нов коментар');
      });
      
      expect(createdComment).toBe(null);
      expect(result.current.error).toBe('Възникна проблем при създаване на коментара.');
    });
  });
  
  describe('canEditComment', () => {
    it('връща true за коментар на текущия потребител', () => {
      const comment = {
        _id: 'comment1',
        content: 'Тестов коментар',
        author: { _id: mockUser._id, name: mockUser.name }
      };
      
      const { result } = renderHook(() => useComment('recipe123'));
      
      expect(result.current.canEditComment(comment)).toBe(true);
    });
    
    it('връща false за коментар на друг потребител', () => {
      const comment = {
        _id: 'comment1',
        content: 'Тестов коментар',
        author: { _id: 'other-user', name: 'Друг потребител' }
      };
      
      const { result } = renderHook(() => useComment('recipe123'));
      
      expect(result.current.canEditComment(comment)).toBe(false);
    });
  });
  
  describe('canDeleteComment', () => {
    it('връща true за коментар на текущия потребител', () => {
      const comment = {
        _id: 'comment1',
        content: 'Тестов коментар',
        author: { _id: mockUser._id, name: mockUser.name }
      };
      
      const { result } = renderHook(() => useComment('recipe123'));
      
      expect(result.current.canDeleteComment(comment)).toBe(true);
    });
    
    it('връща true за коментар на друг потребител, ако текущият е собственик на рецептата', () => {
      const comment = {
        _id: 'comment1',
        content: 'Тестов коментар',
        author: { _id: 'other-user', name: 'Друг потребител' }
      };
      
      const { result } = renderHook(() => useComment('recipe123'));
      
      expect(result.current.canDeleteComment(comment, mockUser._id)).toBe(true);
    });
  });
  
  describe('пагинация и сортиране', () => {
    it('правилно прилага опциите за пагинация', async () => {
      const mockResponsePage1 = {
        data: [{ _id: 'comment1' }],
        pagination: { page: 1, limit: 5, totalItems: 10, totalPages: 2 }
      };
      
      const mockResponsePage2 = {
        data: [{ _id: 'comment6' }],
        pagination: { page: 2, limit: 5, totalItems: 10, totalPages: 2 }
      };
      
      commentApi.getComments.mockResolvedValueOnce(mockResponsePage1);
      
      const { result } = renderHook(() => useComment('recipe123'));
      
      // Изчакваме първото зареждане
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      // Зануляваме мока за второто извикване
      commentApi.getComments.mockReset();
      commentApi.getComments.mockResolvedValueOnce(mockResponsePage2);
      
      // Променяме страницата
      await act(async () => {
        result.current.setPage(2);
      });
      
      // Изчакваме второто зареждане
      await waitFor(() => expect(commentApi.getComments).toHaveBeenCalled());
      
      expect(commentApi.getComments).toHaveBeenCalledWith(
        'recipe123', 
        expect.objectContaining({ page: 2 }),
        expect.anything()
      );
    });
    
    it('правилно прилага опциите за сортиране', async () => {
      commentApi.getComments.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5, totalItems: 0, totalPages: 1 }
      });
      
      const { result } = renderHook(() => useComment('recipe123'));
      
      // Изчакваме първото зареждане
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      // Зануляваме мока за второто извикване
      commentApi.getComments.mockReset();
      commentApi.getComments.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5, totalItems: 0, totalPages: 1 }
      });
      
      // Променяме сортирането
      await act(async () => {
        result.current.setSort('createdAt');
      });
      
      // Изчакваме второто зареждане
      await waitFor(() => expect(commentApi.getComments).toHaveBeenCalled());
      
      expect(commentApi.getComments).toHaveBeenCalledWith(
        'recipe123', 
        expect.objectContaining({ sort: 'createdAt' }),
        expect.anything()
      );
    });
  });
});