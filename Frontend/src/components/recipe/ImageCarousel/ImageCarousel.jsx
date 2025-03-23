import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './ImageCarousel.module.css';

function ImageCarousel({ images, alt, noImageFallback = '/images/no-image-500.jpg' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef(null);

  // Проверяваме дали имаме изображения
  const hasValidImages = Array.isArray(images) && images.length > 0 && 
                        images.some(img => img && (img.card || img.url));
  
  // Определяме масива със снимки за показване
  const displayImages = hasValidImages 
    ? images.filter(img => img && (img.card || img.url))
    : [{ url: noImageFallback, card: noImageFallback }];

  const changeSlide = useCallback((newIndex) => {
    if (isTransitioning || displayImages.length <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex(newIndex);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  }, [isTransitioning, displayImages.length]);

  useEffect(() => {
    if (!isHovering && displayImages.length > 1) {
      timerRef.current = setInterval(() => {
        changeSlide((currentIndex + 1) % displayImages.length);
      }, 5000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [displayImages.length, isHovering, currentIndex, changeSlide]);

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    changeSlide((currentIndex + 1) % displayImages.length);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    changeSlide((currentIndex - 1 + displayImages.length) % displayImages.length);
  };

  const handleDotClick = (index) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    changeSlide(index);
  };

  useEffect(() => {
    if (displayImages.length > 1) {
      setCurrentIndex(Math.floor(Math.random() * displayImages.length));
    }
  }, [displayImages.length]);

  // Обработчик за грешки при зареждане на изображение
  const handleImageError = (e) => {
    console.log('Грешка при зареждане на изображение');
    e.target.src = noImageFallback;
  };

  return (
    <div 
      className={styles.carousel}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={styles.carouselTrack}>
        {displayImages.map((image, index) => (
          <div 
            key={index} 
            className={`${styles.carouselSlide} ${index === currentIndex ? styles.activeSlide : ''}`}
            style={{ 
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 1 : 0
            }}
          >
            <img 
              src={image.card || image.url || noImageFallback} 
              alt={`${alt || 'Рецепта'} ${displayImages.length > 1 ? index + 1 : ''}`}
              loading="lazy"
              onError={handleImageError}
              className={index === currentIndex ? styles.activeImage : ''}
            />
          </div>
        ))}
      </div>
      
      {displayImages.length > 1 && (
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
            {displayImages.map((_, index) => (
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