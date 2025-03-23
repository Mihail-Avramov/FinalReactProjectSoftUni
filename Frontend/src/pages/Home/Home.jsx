import React from 'react';
import SEO from '../../components/common/SEO';
import Hero from '../../components/home/Hero';
import FeaturedRecipes from '../../components/home/FeaturedRecipes';
import { useRecipes } from '../../hooks/api/useRecipes';
import styles from './Home.module.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function Home() {
  const { useTrending } = useRecipes();
  const { data: trendingRecipes, loading, error } = useTrending(6);

  return (
    <div className={styles.homePage}>
      <SEO
        title="Начало"
        description="CulinaryCorner - Открийте, споделете и се насладете на хиляди вкусни рецепти от цял свят. Разгледайте най-популярните рецепти, вдъхновете се и започнете своето кулинарно пътешествие."
        keywords="рецепти, готвене, храна, кулинария, вкусни ястия, популярни рецепти, кулинарни идеи"
        ogImage={trendingRecipes && trendingRecipes.length > 0 ? trendingRecipes[0].images[0] : undefined}
      />
      <Hero trendingRecipe={trendingRecipes && trendingRecipes.length > 0 ? trendingRecipes[0] : null} loading={loading} />
      <FeaturedRecipes recipes={trendingRecipes || []} loading={loading} error={error} />
    </div>
  );
}

export default Home;