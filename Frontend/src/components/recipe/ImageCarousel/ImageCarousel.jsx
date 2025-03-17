import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './ImageCarousel.module.css';

function ImageCarousel({ images, alt }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);

  // Мемоизираме функцията за смяна на слайд
  const changeSlide = useCallback((newIndex) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    
    // Изчистваме флага за анимация след завършване на прехода
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600); // Малко повече от времето на анимацията
  }, [isTransitioning]);

  // Автоматично сменя снимките при повече от една
  useEffect(() => {
    if (!isHovering && images.length > 1) {
      timerRef.current = setInterval(() => {
        changeSlide((currentIndex + 1) % images.length);
      }, 5000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [images.length, isHovering, currentIndex, changeSlide]);

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    changeSlide((currentIndex + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    changeSlide((currentIndex - 1 + images.length) % images.length);
  };

  const handleDotClick = (index) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    changeSlide(index);
  };

  // Избира случайна снимка при началото на компонента
  useEffect(() => {
    if (images.length > 1) {
      setCurrentIndex(Math.floor(Math.random() * images.length));
    }
  }, [images.length]);

  // Placeholder изображение ако няма снимки
  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIgLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5Ij7QndGP0LzQsCDQuNC30L7QsdGA0LDQttC10L3QuNC1PC90ZXh0Pjwvc3ZnPg==';

  if (!images || images.length === 0) {
    return (
      <div className={styles.carousel}>
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}>🖼️</span>
          <img src={placeholderImage} alt={alt || 'Рецепта без изображение'} />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={styles.carousel}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={styles.carouselTrack}>
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`${styles.carouselSlide} ${index === currentIndex ? styles.activeSlide : ''}`}
            style={{ 
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 1 : 0
            }}
          >
            <img 
              src={image.card || image.url} 
              alt={`${alt || 'Recipe'} ${index + 1}`}
              loading="lazy"
              className={index === currentIndex ? styles.activeImage : ''}
            />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <button 
            className={`${styles.controlButton} ${styles.prevButton}`} 
            onClick={handlePrev}
            aria-label="Previous image"
            disabled={isTransitioning}
          >
            <span className={styles.arrowIcon}>◀</span>
          </button>
          
          <button 
            className={`${styles.controlButton} ${styles.nextButton}`} 
            onClick={handleNext}
            aria-label="Next image"
            disabled={isTransitioning}
          >
            <span className={styles.arrowIcon}>▶</span>
          </button>
          
          <div className={styles.dots}>
            {images.map((_, index) => (
              <span 
                key={index} 
                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDotClick(index);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageCarousel;