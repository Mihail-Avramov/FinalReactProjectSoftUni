import React from 'react';
import RecipeCard from '../RecipeCard/RecipeCard';
import EmptyState from '../../common/EmptyState';
import './RecipeList.css';

const RecipeList = ({ 
  recipes = [], 
  emptyMessage = 'Няма намерени рецепти.' 
}) => {
  if (!recipes.length) {
    return (
      <EmptyState 
        message={emptyMessage}
        icon="utensils"
      />
    );
  }

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