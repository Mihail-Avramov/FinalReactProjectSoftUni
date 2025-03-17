import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

function Hero({ featuredRecipes = [] }) {
  const [heroRecipe, setHeroRecipe] = useState(null);
  
  useEffect(() => {
    if (featuredRecipes && featuredRecipes.length > 0) {
      const recipesWithImages = featuredRecipes.filter(recipe => 
        recipe.images && recipe.images.length > 0
      );
      
      if (recipesWithImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * recipesWithImages.length);
        setHeroRecipe(recipesWithImages[randomIndex]);
      } else {
        const randomIndex = Math.floor(Math.random() * featuredRecipes.length);
        setHeroRecipe(featuredRecipes[randomIndex]);
      }
    }
  }, [featuredRecipes]);
  
  // Избор на подходящо изображение
  const heroImage = heroRecipe?.images?.length > 0 
    ? heroRecipe.images[0].url
    : `https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1470&q=80`;
  
  return (
    <section 
      className={styles.hero}
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${heroImage})`,
      }}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          {heroRecipe ? (
            <>
              <span className={styles.badge}>Популярна рецепта</span>
              <h2>{heroRecipe.title}</h2>
              <p>{heroRecipe.description}</p>
              <div className={styles.meta}>
                <span><i className="icon-time"></i> {heroRecipe.preparationTime} мин</span>
                <span><i className="icon-serving"></i> {heroRecipe.servings} порции</span>
              </div>
              <div className={styles.buttons}>
                <Link to={`/recipes/${heroRecipe._id}`} className="btn btn-primary btn-lg">
                  Виж рецептата
                </Link>
                <Link to="/recipes" className="btn btn-outline btn-lg">
                  Всички рецепти
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2>Открийте света на кулинарията</h2>
              <p>Хиляди вкусни рецепти чакат да бъдат приготвени от Вас. Присъединете се към нашата общност и споделете Вашите кулинарни шедьоври.</p>
              <div className={styles.buttons}>
                <Link to="/recipes" className="btn btn-primary btn-lg">Разгледай рецепти</Link>
                <Link to="/about" className="btn btn-outline btn-lg">Научи повече</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;