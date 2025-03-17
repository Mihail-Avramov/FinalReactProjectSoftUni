function App() {
  return (
    <div className="app">
      {/* Header */}
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

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h2>Открийте света на кулинарията</h2>
            <p>Хиляди вкусни рецепти чакат да бъдат приготвени от Вас. Присъединете се към нашата общност и споделете Вашите кулинарни шедьоври.</p>
            <div className="hero-buttons">
              <a href="#" className="btn btn-primary btn-lg">Разгледай рецепти</a>
              <a href="#" className="btn btn-outline btn-lg">Научи повече</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" alt="Вкусни храни" />
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="featured-recipes">
        <div className="container">
          <div className="section-header">
            <h2>Популярни рецепти</h2>
            <p>Най-харесваните рецепти от нашата общност</p>
          </div>
          
          <div className="recipes-grid">
            {/* Recipe Card 1 */}
            <div className="recipe-card">
              <div className="recipe-image">
                <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=962&q=80" alt="Пица Маргарита" />
                <span className="recipe-category">Италианска</span>
              </div>
              <div className="recipe-content">
                <h3>Пица Маргарита</h3>
                <div className="recipe-meta">
                  <span><i className="icon-time"></i> 30 мин</span>
                  <span><i className="icon-serving"></i> 4 порции</span>
                  <span><i className="icon-level"></i> Лесно</span>
                </div>
                <p>Класическа италианска пица с домати, моцарела и босилек - символът на италианската кухня.</p>
                <div className="recipe-footer">
                  <div className="recipe-stats">
                    <span><i className="icon-like"></i> 245</span>
                    <span><i className="icon-comment"></i> 18</span>
                  </div>
                  <a href="#" className="btn btn-sm btn-primary">Виж повече</a>
                </div>
              </div>
            </div>
            
            {/* Recipe Card 2 */}
            <div className="recipe-card">
              <div className="recipe-image">
                <img src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=932&q=80" alt="Мусака" />
                <span className="recipe-category">Българска</span>
              </div>
              <div className="recipe-content">
                <h3>Традиционна мусака</h3>
                <div className="recipe-meta">
                  <span><i className="icon-time"></i> 60 мин</span>
                  <span><i className="icon-serving"></i> 6 порции</span>
                  <span><i className="icon-level"></i> Средно</span>
                </div>
                <p>Вкусна традиционна българска мусака с картофи, кайма и ароматни подправки.</p>
                <div className="recipe-footer">
                  <div className="recipe-stats">
                    <span><i className="icon-like"></i> 187</span>
                    <span><i className="icon-comment"></i> 12</span>
                  </div>
                  <a href="#" className="btn btn-sm btn-primary">Виж повече</a>
                </div>
              </div>
            </div>
            
            {/* Recipe Card 3 */}
            <div className="recipe-card">
              <div className="recipe-image">
                <img src="https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80" alt="Шоколадови брауни" />
                <span className="recipe-category">Десерт</span>
              </div>
              <div className="recipe-content">
                <h3>Шоколадови брауни</h3>
                <div className="recipe-meta">
                  <span><i className="icon-time"></i> 45 мин</span>
                  <span><i className="icon-serving"></i> 10 парчета</span>
                  <span><i className="icon-level"></i> Лесно</span>
                </div>
                <p>Богати, влажни и невероятно шоколадови брауни, които се разтапят в устата.</p>
                <div className="recipe-footer">
                  <div className="recipe-stats">
                    <span><i className="icon-like"></i> 320</span>
                    <span><i className="icon-comment"></i> 24</span>
                  </div>
                  <a href="#" className="btn btn-sm btn-primary">Виж повече</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="view-all">
            <a href="#" className="btn btn-outline">Виж всички рецепти</a>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Категории рецепти</h2>
            <p>Разгледайте нашите категории и намерете нещо по ваш вкус</p>
          </div>
          
          <div className="categories-grid">
            <a href="#" className="category-card">
              <div className="category-icon">🍲</div>
              <h3>Основни ястия</h3>
              <p>125 рецепти</p>
            </a>
            <a href="#" className="category-card">
              <div className="category-icon">🥗</div>
              <h3>Салати</h3>
              <p>84 рецепти</p>
            </a>
            <a href="#" className="category-card">
              <div className="category-icon">🍰</div>
              <h3>Десерти</h3>
              <p>98 рецепти</p>
            </a>
            <a href="#" className="category-card">
              <div className="category-icon">🍞</div>
              <h3>Хляб и тестени</h3>
              <p>42 рецепти</p>
            </a>
            <a href="#" className="category-card">
              <div className="category-icon">🍹</div>
              <h3>Напитки</h3>
              <p>36 рецепти</p>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h2>Culinary<span>Corner</span></h2>
              <p>Вашият кулинарен пътеводител</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-section">
                <h3>Навигация</h3>
                <ul>
                  <li><a href="#">Начало</a></li>
                  <li><a href="#">Рецепти</a></li>
                  <li><a href="#">Категории</a></li>
                  <li><a href="#">За нас</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h3>Полезни връзки</h3>
                <ul>
                  <li><a href="#">Условия за ползване</a></li>
                  <li><a href="#">Политика за поверителност</a></li>
                  <li><a href="#">Контакти</a></li>
                  <li><a href="#">Често задавани въпроси</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h3>Последвайте ни</h3>
                <div className="social-links">
                  <a href="#" className="social-icon">Facebook</a>
                  <a href="#" className="social-icon">Instagram</a>
                  <a href="#" className="social-icon">Pinterest</a>
                  <a href="#" className="social-icon">YouTube</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} CulinaryCorner. Всички права запазени.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;