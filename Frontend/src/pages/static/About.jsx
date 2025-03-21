import React from 'react';
import SEO from '../../components/common/SEO';
import styles from './StaticPage.module.css';

function About() {
  return (
    <div className={styles.staticPage}>
      <SEO
        title="За нас"
        description="Научете повече за CulinaryCorner - приложение създадено от страстни кулинари и технологични ентусиасти с мисия да направим кулинарното изкуство достъпно за всички."
        keywords="за нас, culinary corner, кулинарно изкуство, кулинарна общност, готварска платформа, готвене"
      />
      
      <div className={styles.pageHeader}>
        <h1>За нас</h1>
        <div className={styles.headerDivider}></div>
      </div>
      
      <div className={styles.contentContainer}>
        <section className={styles.section}>
          <h2>Кои сме ние?</h2>
          <p>
            CulinaryCorner е създаден от екип от страстни кулинари и технологични ентусиасти. 
            Нашата мисия е да направим кулинарното изкуство достъпно за всички и да създадем 
            вдъхновяваща общност от хора, които обичат да готвят.
          </p>
          
          <div className={styles.teamImage}>
            <img src="/images/about/team.webp" alt="Нашият екип" />
            <p className={styles.caption}>Екипът на CulinaryCorner</p>
          </div>
        </section>
        
        <section className={styles.section}>
          <h2>Нашата история</h2>
          <p>
            Всичко започна през 2020 г., когато основателите ни осъзнаха колко важно е споделянето на 
            традиционни рецепти и запазването на кулинарното наследство. Започнахме като малък блог, 
            но бързо се разраснахме в пълноценна платформа за споделяне на рецепти.
          </p>
          <p>
            Днес CulinaryCorner е дом на хиляди рецепти от цял свят, предоставяйки на потребителите 
            си инструменти за откриване, създаване и споделяне на кулинарни шедьоври.
          </p>
        </section>
        
        <section className={styles.section}>
          <h2>Нашата мисия</h2>
          <p>
            Вярваме, че храната сближава хората. Чрез нашата платформа се стремим да:
          </p>
          <ul className={styles.missionList}>
            <li>Направим готвенето достъпно и забавно за всеки</li>
            <li>Съхраним традиционни рецепти и кулинарни техники</li>
            <li>Насърчим културния обмен чрез споделяне на ястия от различни кухни</li>
            <li>Изградим подкрепяща общност от готвачи на всички нива</li>
          </ul>
        </section>
        
        <section className={styles.section}>
          <h2>Свържете се с нас</h2>
          <p>
            Имате въпроси или предложения? Не се колебайте да се свържете с нас на 
            <a href="mailto:info@culinarycorner.com" className={styles.emailLink}> info@culinarycorner.com</a> 
            или чрез нашата <a href="/contact" className={styles.inlineLink}>контактна форма</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;