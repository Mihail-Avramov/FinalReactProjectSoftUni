import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../../recipe/RecipeCard';
import recipeService from '../../../services/recipeService';
import LoadingSpinner from '../../common/LoadingSpinner';
import { CATEGORIES } from '../../../utils/theme';
import styles from './FeaturedRecipes.module.css';

function FeaturedRecipes({ onRecipesLoaded, limit = 8 }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTrendingRecipes() {
      try {
        setLoading(true);
        // Загрузить больше рецептов для более заполненного вида
        const data = await recipeService.getTrendingRecipes(limit);
        setRecipes(data);
        
        // Изпращане на рецептите към родителя за Hero секцията
        if (onRecipesLoaded && typeof onRecipesLoaded === 'function') {
          onRecipesLoaded(data);
        }
        
        setError(null);
      } catch (err) {
        setError('Не успяхме да заредим популярните рецепти. Моля, опитайте по-късно.');
        console.error('Error fetching trending recipes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrendingRecipes();
  }, [onRecipesLoaded, limit]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Популярни рецепти</h2>
          </div>
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Популярни рецепти</h2>
          </div>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>Популярни рецепти</h2>
          <p>Най-харесваните рецепти от нашата общност</p>
        </div>
        
        {recipes.length > 0 ? (
          <div className={styles.recipesGrid}>
            {recipes.map(recipe => (
              <div key={recipe._id} className={styles.recipeCardWrapper}>
                <RecipeCard recipe={recipe} className={styles.fadeIn} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyRecipes}>
            <p>Все още няма популярни рецепти. Бъдете първият, който ще сподели!</p>
          </div>
        )}
        
        <div className={styles.viewAll}>
          <Link to="/recipes" className={styles.viewAllButton}>Виж всички рецепти</Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedRecipes;