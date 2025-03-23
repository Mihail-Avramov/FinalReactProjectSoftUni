import React from 'react';
import styles from './RecipeSkeleton.module.css';

const RecipeSkeleton = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.imageArea}></div>
      <div className={styles.content}>
        <div className={styles.titleArea}></div>
        <div className={styles.metaArea}>
          <div className={styles.metaBadge}></div>
          <div className={styles.metaBadge}></div>
          <div className={styles.metaBadge}></div>
        </div>
        <div className={styles.descriptionArea}>
          <div className={styles.descLine}></div>
          <div className={styles.descLine}></div>
          <div className={styles.descLine}></div>
        </div>
        <div className={styles.footerArea}>
          <div className={styles.authorArea}>
            <div className={styles.avatarCircle}></div>
            <div className={styles.authorName}></div>
          </div>
          <div className={styles.buttonArea}></div>
        </div>
      </div>
    </div>
  );
};

export default RecipeSkeleton;