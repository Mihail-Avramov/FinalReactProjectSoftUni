import React from 'react';
import { Link } from 'react-router-dom';
import defaultAvatar from '/images/default-avatar.webp';
import styles from './ProfileHeader.module.css';

const ProfileHeader = ({ profile, isOwnProfile }) => {
  if (!profile) return null;
  
  return (
    <div className={styles.header}>
      <div className={styles.avatarContainer}>
        <img 
          src={profile.profilePicture || defaultAvatar} 
          alt={`${profile.firstName} ${profile.lastName}`} 
          className={styles.avatar}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultAvatar;
          }}
        />
      </div>
      
      <div className={styles.info}>
        <h1 className={styles.name}>{profile.firstName} {profile.lastName}</h1>
        <div className={styles.username}>@{profile.username}</div>
        
        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        
        {isOwnProfile ? (
          <div className={styles.actions}>
            <Link to="/profile/edit" className="btn btn-primary">
              Редактирай профила
            </Link>
          </div>
        ) : (
          <div className={styles.actions}>
            <Link to={`/profile/${profile._id}/recipes`} className="btn btn-primary">
              Разгледай рецептите
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;