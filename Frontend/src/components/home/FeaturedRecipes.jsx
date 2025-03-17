import React from 'react';
import RecipeCard from '../recipe/RecipeCard';

// Заглушка за данни, които ще бъдат заменени с данни от API
const mockRecipes = [
  {
    id: 1,
    title: 'Пица Маргарита',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=962&q=80',
    category: 'Италианска',
    preparationTime: 30,
    servings: 4,
    difficulty: 'Лесно',
    description: 'Класическа италианска пица с домати, моцарела и босилек - символът на италианската кухня.',
    likes: 245,
    comments: 18
  },
  {
    id: 2,
    title: 'Традиционна мусака',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=932&q=80',
    category: 'Българска',
    preparationTime: 60,
    servings: 6,
    difficulty: 'Средно',
    description: 'Вкусна традиционна българска мусака с картофи, кайма и ароматни подправки.',
    likes: 187,
    comments: 12
  },
  {
    id: 3,
    title: 'Шоколадови брауни',
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
    category: 'Десерт',
    preparationTime: 45,
    servings: 10,
    difficulty: 'Лесно',
    description: 'Богати, влажни и невероятно шоколадови брауни, които се разтапят в устата.',
    likes: 320,
    comments: 24
  }
];

function FeaturedRecipes() {
  return (
    <section className="featured-recipes">
      <div className="container">
        <div className="section-header">
          <h2>Популярни рецепти</h2>
          <p>Най-харесваните рецепти от нашата общност</p>
        </div>
        
        <div className="recipes-grid">
          {mockRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
        
        <div className="view-all">
          <a href="#" className="btn btn-outline">Виж всички рецепти</a>
        </div>
      </div>
    </section>
  );
}

export default FeaturedRecipes;