// src/components/home/Categories.jsx
import React from 'react';

const categories = [
  { id: 1, name: 'Основни ястия', icon: '🍲', count: 125 },
  { id: 2, name: 'Салати', icon: '🥗', count: 84 },
  { id: 3, name: 'Десерти', icon: '🍰', count: 98 },
  { id: 4, name: 'Хляб и тестени', icon: '🍞', count: 42 },
  { id: 5, name: 'Напитки', icon: '🍹', count: 36 }
];

function Categories() {
  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-header">
          <h2>Категории рецепти</h2>
          <p>Разгледайте нашите категории и намерете нещо по ваш вкус</p>
        </div>
        
        <div className="categories-grid">
          {categories.map(category => (
            <a href="#" className="category-card" key={category.id}>
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
              <p>{category.count} рецепти</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;