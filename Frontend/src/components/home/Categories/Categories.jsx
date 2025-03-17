import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import configService from '../../../services/configService';
import LoadingSpinner from '../../common/LoadingSpinner';
import { getCategoryIcon } from '../../../utils/recipeHelpers';
import styles from './Categories.module.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategoriesData() {
      try {
        setLoading(true);
        
        // Извличане на конфигурацията
        const config = await configService.getConfig();
        
        if (config && config.recipe && config.recipe.categories) {
          const formattedCategories = config.recipe.categories.map((category, index) => ({
            id: index + 1,
            name: category,
            displayName: config.localization?.categories?.[category] || category,
            icon: getCategoryIcon(category)
          }));
          
          setCategories(formattedCategories);
          setError(null);
        } else {
          console.warn("No categories found in config");
          setError('Не успяхме да намерим категориите.');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Не успяхме да заредим категориите. Моля, опитайте по-късно.');
      } finally {
        setLoading(false);
      }
    }

    fetchCategoriesData();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Категории рецепти</h2>
          </div>
          <LoadingSpinner message="Зареждане на категориите..." />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Категории рецепти</h2>
          </div>
          <div className="error-message">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>Категории рецепти</h2>
          <p>Разгледайте нашите категории и намерете нещо по ваш вкус</p>
        </div>
        
        <div className={styles.hexagonGrid}>
          {categories.map((category) => (
            <Link to={`/recipes?category=${category.name}`} className={styles.hexagonItem} key={category.id}>
              <div className={styles.hexagon}>
                <div className={styles.hexagonContent}>
                  <div className={styles.categoryIcon}>{category.icon}</div>
                  <h3>{category.displayName}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;