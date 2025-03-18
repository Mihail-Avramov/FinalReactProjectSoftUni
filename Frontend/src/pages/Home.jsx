import React, { useCallback } from 'react';
import Hero from '../components/home/Hero';
import FeaturedRecipes from '../components/home/FeaturedRecipes';
import recipeService from '../services/recipeService';
import useApiData from '../hooks/useApiData';
import styles from './Home.module.css';
import LoadingSpinner from '../components/common/LoadingSpinner';

function Home() {
  // Създаваме мемоизирана функция за извличане на данни
  const fetchTrendingRecipes = useCallback((signal) => {
    return recipeService.getTrendingRecipes(6, signal);
  }, []);
  
  // Използваме хука useApiData
  const { 
    data: trendingRecipes, 
    loading, 
    error 
  } = useApiData(
    fetchTrendingRecipes,
    [],
    'Не успяхме да заредим рецептите. Моля, опитайте по-късно.'
  );

  if (loading && (!trendingRecipes || trendingRecipes.length === 0)) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.homePage}>
      <Hero trendingRecipe={trendingRecipes && trendingRecipes.length > 0 ? trendingRecipes[0] : null} />
      <FeaturedRecipes recipes={trendingRecipes || []} loading={loading} error={error} />
    </div>
  );
}

export default Home;