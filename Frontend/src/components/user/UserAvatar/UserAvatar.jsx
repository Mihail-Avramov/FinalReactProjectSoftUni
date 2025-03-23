import React from 'react';
import styles from './UserAvatar.module.css';

/**
 * Компонент за показване на потребителски аватар с различни размери
 */
const UserAvatar = ({ 
  src, 
  alt, 
  size = "medium", // small, medium, large
  className = "",
  ...props 
}) => {
  const defaultAvatar = '/images/default-avatar.webp';

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultAvatar;
  };
  
  const sizeClass = styles[size] || styles.medium;

  return (
    <div className={`${styles.avatar} ${sizeClass} ${className}`} {...props}>
      <img 
        src={src || defaultAvatar}
        alt={alt || "User avatar"}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export default UserAvatar;