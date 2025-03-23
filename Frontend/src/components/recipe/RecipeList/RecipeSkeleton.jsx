import React from 'react';
import { Skeleton } from '../../ui/Skeleton/Skeleton';
import styles from './RecipeSkeleton.module.css';

const RecipeSkeleton = () => {
  return (
    <div className={styles.skeletonCard}>
      {/* Изображение */}
      <Skeleton height="200px" width="100%" className={styles.image} />
      
      <div className={styles.content}>
        {/* Заглавие */}
        <Skeleton height="24px" width="85%" className={styles.title} />
        <Skeleton height="18px" width="60%" className={styles.title} />
        
        {/* Метаданни */}
        <div className={styles.meta}>
          <Skeleton height="20px" width="30%" />
          <Skeleton height="20px" width="20%" />
          <Skeleton height="20px" width="35%" />
        </div>
        
        {/* Описание */}
        <div className={styles.description}>
          <Skeleton height="14px" width="100%" />
          <Skeleton height="14px" width="90%" />
          <Skeleton height="14px" width="95%" />
        </div>
        
        {/* Футър */}
        <div className={styles.footer}>
          <div className={styles.author}>
            <Skeleton height="32px" width="32px" borderRadius="50%" />
            <Skeleton height="16px" width="80px" />
          </div>
          <Skeleton height="36px" width="60px" />
        </div>
      </div>
    </div>
  );
};

export default RecipeSkeleton;