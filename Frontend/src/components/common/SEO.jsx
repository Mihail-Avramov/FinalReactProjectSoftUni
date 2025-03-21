import { useEffect } from 'react';

/**
 * Компонент за управление на SEO мета данни
 */
const SEO = ({
  title,
  description,
  keywords = "",
  author = "Mihail Avramov",
  ogImage = "/images/og-image.jpg"
}) => {
  useEffect(() => {
    // Конструиране на пълно заглавие
    const fullTitle = title ? `${title} | Culinary Corner` : 'Culinary Corner - Вашият кулинарен свят';
    
    // Задаване на заглавие
    document.title = fullTitle;
    
    // Управление на meta тагове
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: author },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
      { name: 'twitter:card', content: 'summary_large_image' }
    ];
    
    // Масив за проследяване на създадените meta тагове
    const createdMetaTags = [];
    
    // Обработка на всеки meta таг
    metaTags.forEach(({ name, property, content }) => {
      if (!content) return;
      
      // Създаване на селектор
      let selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let metaTag = document.querySelector(selector);
      
      if (metaTag) {
        // Актуализиране на съществуващ таг
        metaTag.setAttribute('content', content);
      } else {
        // Създаване на нов таг
        metaTag = document.createElement('meta');
        if (name) metaTag.setAttribute('name', name);
        if (property) metaTag.setAttribute('property', property);
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
        
        // Запазване на референция за по-късно почистване
        createdMetaTags.push(metaTag);
      }
    });
    
    // Почистване при размонтиране
    return () => {
      createdMetaTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [title, description, keywords, author, ogImage]);

  // Този компонент не рендерира нищо във визуалния DOM
  return null;
};

export default SEO;