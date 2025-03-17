import React, { useState, useCallback } from 'react';
import Hero from '../components/home/Hero';
import FeaturedRecipes from '../components/home/FeaturedRecipes';
import Categories from '../components/home/Categories';
import styles from './Home.module.css';

function Home() {
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  
  const handleRecipesLoaded = useCallback((recipes) => {
    setTrendingRecipes(recipes);
  }, []);

  return (
    <div className={styles.homePage}>
      <Hero featuredRecipes={trendingRecipes} />
      <FeaturedRecipes onRecipesLoaded={handleRecipesLoaded} limit={8} />
      <Categories />
    </div>
  );
}

export default Home;