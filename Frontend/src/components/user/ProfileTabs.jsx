import React from 'react';
import styles from './ProfileTabs.module.css';

const ProfileTabs = ({ activeTab, setActiveTab, isOwnProfile }) => {
  const tabs = [
    { id: 'recipes', label: 'Рецепти', icon: 'utensils' },
  ];
  
  if (isOwnProfile) {
    tabs.splice(1, 0, { id: 'favorites', label: 'Любими', icon: 'heart' });
  }
  
  return (
    <div className={styles.tabs}>
      {tabs.map(tab => (
        <div 
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <i className={`fas fa-${tab.icon} ${styles.icon}`}></i>
          <span>{tab.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ProfileTabs;