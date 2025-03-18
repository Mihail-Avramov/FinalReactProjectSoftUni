import React from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../../recipe/RecipeCard';
import LoadingSpinner from '../../common/LoadingSpinner';
import styles from './FeaturedRecipes.module.css';

function FeaturedRecipes({ recipes = [], loading = false, error = null }) {
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