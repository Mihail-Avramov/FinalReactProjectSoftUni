import React from 'react';

function Hero() {
  return (
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
  );
}

export default Hero;