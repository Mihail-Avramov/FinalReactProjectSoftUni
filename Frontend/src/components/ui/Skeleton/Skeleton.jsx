import React from 'react';
import styles from './Skeleton.module.css';

export const Skeleton = ({ width, height, borderRadius, className }) => {
  return (
    <div 
      className={`${styles.skeleton} ${className || ''}`}
      style={{ 
        width, 
        height,
        borderRadius: borderRadius || '4px'
      }}
    />
  );
};