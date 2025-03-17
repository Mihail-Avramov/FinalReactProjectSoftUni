import React from 'react';

function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <div className="recipe-image">
        <img src={recipe.image} alt={recipe.title} />
        <span className="recipe-category">{recipe.category}</span>
      </div>
      <div className="recipe-content">
        <h3>{recipe.title}</h3>
        <div className="recipe-meta">
          <span><i className="icon-time"></i> {recipe.preparationTime} мин</span>
          <span><i className="icon-serving"></i> {recipe.servings} порции</span>
          <span><i className="icon-level"></i> {recipe.difficulty}</span>
        </div>
        <p>{recipe.description}</p>
        <div className="recipe-footer">
          <div className="recipe-stats">
            <span><i className="icon-like"></i> {recipe.likes}</span>
            <span><i className="icon-comment"></i> {recipe.comments}</span>
          </div>
          <a href="#" className="btn btn-sm btn-primary">Виж повече</a>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;