import React from 'react';

function Header() {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <h1>Culinary<span>Corner</span></h1>
        </div>
        
        <nav className="main-nav">
          <ul>
            <li><a href="#" className="active">Начало</a></li>
            <li><a href="#">Рецепти</a></li>
            <li><a href="#">Категории</a></li>
            <li><a href="#">За нас</a></li>
          </ul>
        </nav>
        
        <div className="auth-nav">
          <a href="#" className="btn btn-outline">Вход</a>
          <a href="#" className="btn btn-primary">Регистрация</a>
        </div>
      </div>
    </header>
  );
}

export default Header;