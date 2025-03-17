import React from 'react';
import Hero from '../components/home/Hero';
import FeaturedRecipes from '../components/home/FeaturedRecipes';
import Categories from '../components/home/Categories';

function Home() {
  return (
    <>
      <Hero />
      <FeaturedRecipes />
      <Categories />
    </>
  );
}

export default Home;