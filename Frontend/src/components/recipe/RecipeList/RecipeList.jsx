import React from 'react';
import RecipeCard from '../RecipeCard/RecipeCard';
import EmptyState from '../../common/EmptyState';
import RecipeSkeleton from './RecipeSkeleton';
import './RecipeList.css';

const RecipeList = ({ 
  recipes = [], 
  loading = false,
  count = 6, // Брой скелетони за показване при зареждане
  emptyMessage = 'Няма намерени рецепти.' 
}) => {
  // Показваме скелетони, ако се зареждат данни
  if (loading) {
    return (
      <div className="recipe-list">
        {Array(count).fill(0).map((_, index) => (
          <div key={`skeleton-${index}`} className="recipe-card-wrapper">
            <RecipeSkeleton />
          </div>
        ))}
      </div>
    );
  }
  
  // Показваме празно състояние, когато няма рецепти
  if (!recipes.length) {
    return (
      <EmptyState 
        message={emptyMessage}
        icon="utensils"
      />
    );
  }

  // Показваме рецептите
  return (
    <div className="recipe-list">
      {recipes.map((recipe) => (
        <div key={recipe._id} className="recipe-card-wrapper">
          <RecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
  );
};

export default RecipeList;