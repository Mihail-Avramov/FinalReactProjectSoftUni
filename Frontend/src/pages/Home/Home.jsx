import React from 'react';
import Hero from '../../components/home/Hero';
import FeaturedRecipes from '../../components/home/FeaturedRecipes';
import { useRecipes } from '../../hooks/api/useRecipes';
import styles from './Home.module.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function Home() {
  const { useTrending } = useRecipes();
  const { data: trendingRecipes, loading, error } = useTrending(6);

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