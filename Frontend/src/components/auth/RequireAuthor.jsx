import React, { useState, useEffect } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom'; // Добавяне на useLocation
import { useAuth } from '../../hooks/api/useAuth';
import RecipeApi from '../../api/recipeApi';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * Компонент за защита на маршрути, които изискват потребителят да е автор на рецептата
 */
export const RequireAuthor = ({ children, action = "edit" }) => {
  const { id } = useParams(); // Взимаме ID-то от URL-а
  const location = useLocation(); // Добавяме location
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  
  useEffect(() => {
    // Проверяваме само ако потребителят е влязъл
    if (!isLoading && isAuthenticated && id) {
      const checkAuthor = async () => {
        try {
          setRecipeLoading(true);
          const recipe = await RecipeApi.getById(id);
          
          // Проверка дали текущият потребител е автор
          if (recipe && recipe.author) {
            setIsAuthor(recipe.author._id === user._id);
          } else {
            setIsAuthor(false);
          }
        } catch (error) {
          console.error("Грешка при проверка на автор:", error);
          setIsAuthor(false);
        } finally {
          setRecipeLoading(false);
        }
      };
      
      checkAuthor();
    }
  }, [id, isAuthenticated, isLoading, user]);
  
  // Ако все още зареждаме данните за потребителя или рецептата
  if (isLoading || recipeLoading) {
    return <LoadingSpinner message="Проверка на права..." />;
  }
  
  // Ако потребителят не е влязъл
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Ако потребителят не е автор
  if (!isAuthor) {
    // Динамично съобщение според операцията
    const errorMessage = action === "delete" 
      ? "Нямате право да изтриете тази рецепта."
      : "Нямате право да редактирате тази рецепта.";
      
    return <Navigate to={`/recipes/${id}`} state={{ error: errorMessage }} replace />;
  }
  
  return children;
};

export default RequireAuthor;