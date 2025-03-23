import React, { useState, useEffect } from 'react';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const hasImages = images && images.length > 0;
  const maxThumbnails = 5; // Максимален брой показвани миниатюри

  // Избор на подходящо изображение според наличността
  const getImageUrl = (type) => {
    if (hasImages) {
      if (type === 'main') {
        return images[mainImage].url; // Оригинален размер за fullscreen
      } else if (type === 'card') {
        return images[mainImage].card; // Среден размер за основното показване
      } else if (type === 'thumbnail') {
        return images[mainImage].thumbnail; // Малък размер за миниатюри
      }
    }
    
    // Статични изображения за placeholder
    if (type === 'main') {
      return '/images/no-image-1000.webp';
    } else if (type === 'card') {
      return '/images/no-image-500.jpg';
    } else {
      return '/images/no-image-200.jpg';
    }
  };
  
  useEffect(() => {
    setMainImage(0);
  }, [images]);
  
  const handleThumbnailClick = (index) => {
    setMainImage(index);
  };
  
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const handlePrev = (e) => {
    e.stopPropagation();
    setMainImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };
  
  const handleNext = (e) => {
    e.stopPropagation();
    setMainImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Определя дали да показва индикатор за повече миниатюри
  const showMoreIndicator = hasImages && images.length > maxThumbnails;
  // Колко миниатюри да покаже
  const visibleThumbnails = hasImages ? 
    (showMoreIndicator ? images.slice(0, maxThumbnails - 1) : images) : [];
  
  return (
    <div className={styles.gallery}>
      <div className={styles.galleryLayout}>
        {/* Вертикални миниатюри отляво - видими само на десктоп */}
        {hasImages && images.length > 1 && (
          <div className={styles.verticalThumbnails}>
            {visibleThumbnails.map((image, index) => (
              <div 
                key={image._id || index}
                className={`${styles.thumbnail} ${index === mainImage ? styles.active : ''}`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img 
                  src={image.thumbnail} 
                  alt={`Миниатюра ${index + 1}`} 
                  loading="lazy" 
                />
              </div>
            ))}
            {showMoreIndicator && (
              <div 
                className={`${styles.thumbnail} ${styles.moreIndicator}`}
                onClick={handleFullscreenToggle}
                title="Вижте всички снимки"
              >
                <span>+{images.length - (maxThumbnails - 1)}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Основно изображение */}
        <div 
          className={`${styles.mainImage} ${isFullscreen ? styles.fullscreen : ''}`} 
          onClick={handleFullscreenToggle}
        >
          <img 
            src={isFullscreen ? getImageUrl('main') : getImageUrl('card')}
            alt="Изображение на рецептата" 
            loading="eager" 
            className={styles.mainImageElement}
          />
          
          {isFullscreen && (
            <>
              <button className={styles.closeButton} onClick={handleFullscreenToggle}>
                &times;
              </button>
              {hasImages && images.length > 1 && (
                <>
                  <button className={`${styles.navButton} ${styles.prevButton}`} onClick={handlePrev}>
                    &#10094;
                  </button>
                  <button className={`${styles.navButton} ${styles.nextButton}`} onClick={handleNext}>
                    &#10095;
                  </button>
                </>
              )}
            </>
          )}
          
          {!isFullscreen && (
            <>
              <div className={styles.imageOverlay}>
                {hasImages && images.length > 1 && (
                  <div className={styles.imageCounter}>{mainImage + 1}/{images.length}</div>
                )}
              </div>
              <button 
                className={styles.expandButton} 
                onClick={handleFullscreenToggle}
                title="Увеличи изображението"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Хоризонтални миниатюри отдолу - видими само на мобилни устройства */}
      {hasImages && images.length > 1 && (
        <div className={styles.horizontalThumbnails}>
          {visibleThumbnails.map((image, index) => (
            <div 
              key={image._id || index}
              className={`${styles.thumbnail} ${index === mainImage ? styles.active : ''}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <img 
                src={image.thumbnail}
                alt={`Миниатюра ${index + 1}`} 
                loading="lazy" 
              />
            </div>
          ))}
          {showMoreIndicator && (
            <div 
              className={`${styles.thumbnail} ${styles.moreIndicator}`}
              onClick={handleFullscreenToggle}
              title="Вижте всички снимки"
            >
              <span>+{images.length - (maxThumbnails - 1)}</span>
            </div>
          )}
        </div>
      )}
      
      {isFullscreen && (
        <div className={styles.overlay} onClick={handleFullscreenToggle}></div>
      )}
    </div>
  );
};

export default ImageGallery;