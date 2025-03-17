import React from 'react';
import styles from './LoadingSpinner.module.css';

function LoadingSpinner({ message = 'Зареждане...' }) {
  return (
    <div className={styles.container}>
      <div className={styles.overlay}>
        <div className={styles.spinner}></div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;