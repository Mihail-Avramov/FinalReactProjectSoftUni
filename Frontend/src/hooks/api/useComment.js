import { useState, useCallback, useEffect } from 'react';
import commentApi from '../../api/commentApi';
import { useAuth } from './useAuth';

/**
 * Хук за работа с коментари към рецепти
 * Предоставя функционалност за създаване, четене, редакция и изтриване на коментари
 */
export const useComment = (recipeId, initialOptions = {}) => {
  const { isAuthenticated, user } = useAuth();
  
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialOptions.page || 1,
    limit: initialOptions.limit || 5,
    totalItems: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [editingComment, setEditingComment] = useState(null);
  
  const [options, setOptions] = useState({
    page: initialOptions.page || 1,
    limit: initialOptions.limit || 5,
    sort: initialOptions.sort || '-createdAt'
  });
  
  /**
   * Зарежда коментарите за дадена рецепта
   */
  const loadComments = useCallback(async (signal) => {
    if (!recipeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await commentApi.getComments(recipeId, options, signal);
      
      if (response && response.data) {
        // Работи както с трансформирани, така и с оригинални данни
        setComments(Array.isArray(response.data) ? response.data : []);
        setPagination(response.pagination || {
          page: options.page,
          limit: options.limit,
          totalItems: Array.isArray(response.data) ? response.data.length : 0,
          totalPages: 1
        });
      }
    } catch (err) {
      // Правилна обработка на отказани заявки
      if (err.name === 'AbortError' || err.isCanceled) {
        return;
      } 
      
      console.error('Error loading comments:', err);
      setError('Възникна проблем при зареждане на коментарите.');
    } finally {
      setLoading(false);
    }
  }, [recipeId, options]);
  
  /**
   * Създава нов коментар
   */
  const createComment = useCallback(async (content) => {
    if (!isAuthenticated) {
      setError('Трябва да влезете в профила си, за да коментирате.');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await commentApi.createComment(recipeId, content);

      if (response && response.success) {
        const newComment = response.data;

        if (newComment && newComment._id) {
          setComments(prevComments => [newComment, ...prevComments]);
          setPagination(prev => ({
            ...prev, 
            totalItems: prev.totalItems + 1,
            totalPages: Math.ceil((prev.totalItems + 1) / prev.limit)
          }));
          
          return newComment;
        }
      } else {
        throw new Error(response.message || 'Грешка при създаване на коментар.');
      }
    } catch (err) {
      if (err.name !== 'AbortError' && !err.isCanceled) {
        console.error('Error creating comment:', err);
        setError('Възникна проблем при създаване на коментара.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [recipeId, isAuthenticated]);
  
  /**
   * Обновява съществуващ коментар
   */
  const updateComment = useCallback(async (commentId, content) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await commentApi.updateComment(commentId, content);
      
      if (response.success) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === commentId ? response.data : comment
          )
        );
        
        setEditingComment(null);
        
        return response.data;
      } else {
        throw new Error(response.message || 'Грешка при обновяване на коментар.');
      }
    } catch (err) {
      if (err.name !== 'AbortError' && !err.isCanceled) {
        console.error('Error updating comment:', err);
        setError('Възникна проблем при редактиране на коментара.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Изтрива коментар
   */
  const deleteComment = useCallback(async (commentId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await commentApi.deleteComment(commentId);
      
      if (response.success) {
        setComments(prevComments => 
          prevComments.filter(comment => comment._id !== commentId)
        );
        
        setPagination(prev => {
          const newTotalItems = Math.max(0, prev.totalItems - 1);
          return {
            ...prev, 
            totalItems: newTotalItems,
            totalPages: Math.max(1, Math.ceil(newTotalItems / prev.limit))
          };
        });
        
        return true;
      } else {
        throw new Error(response.message || 'Грешка при изтриване на коментар.');
      }
    } catch (err) {
      if (err.name !== 'AbortError' && !err.isCanceled) {
        console.error('Error deleting comment:', err);
        setError('Възникна проблем при изтриване на коментара.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Проверява дали потребителят може да редактира коментар
   */
  const canEditComment = useCallback((comment) => {
    if (!isAuthenticated || !user || !comment) return false;
    return comment.author._id === user._id;
  }, [isAuthenticated, user]);
  
  /**
   * Проверява дали потребителят може да изтрие коментар
   */
  const canDeleteComment = useCallback((comment, recipeOwnerId) => {
    if (!isAuthenticated || !user || !comment) return false;
    // Потребител може да изтрие коментар ако:
    // 1. Той е автор на коментара
    // 2. Той е собственик на рецептата
    return comment.author._id === user._id || recipeOwnerId === user._id;
  }, [isAuthenticated, user]);
  
  /**
   * Задава страницата за пагинация
   */
  const setPage = useCallback((page) => {
    setOptions(prev => ({ ...prev, page }));
  }, []);
  
  /**
   * Задава лимит за пагинация
   */
  const setLimit = useCallback((limit) => {
    setOptions(prev => ({ ...prev, limit }));
  }, []);
  
  /**
   * Задава подреждане на коментарите
   */
  const setSort = useCallback((sort) => {
    setOptions(prev => ({ ...prev, sort }));
  }, []);
  
  /**
   * Задава коментар за редактиране
   */
  const startEditing = useCallback((comment) => {
    setEditingComment(comment);
  }, []);
  
  /**
   * Отменя редактирането на коментар
   */
  const cancelEditing = useCallback(() => {
    setEditingComment(null);
  }, []);
  
  // Зареждане на коментарите при промяна на опциите
  useEffect(() => {
    if (!recipeId) return;
    
    const abortController = new AbortController();
    loadComments(abortController.signal);
    
    return () => abortController.abort();
  }, [loadComments, recipeId]);
  
  return {
    // Данни
    comments,
    pagination,
    loading,
    error,
    editingComment,
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    canEditComment,
    canDeleteComment,
    startEditing,
    cancelEditing,
    setPage,
    setLimit,
    setSort,
  };
};