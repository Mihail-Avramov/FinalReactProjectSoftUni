import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/api/useAuth';
import { useProfile } from '../../hooks/api/useProfile';
import ProfileHeader from '../../components/user/ProfileHeader';
import ProfileStats from '../../components/user/ProfileStats';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import SEO from '../../components/common/SEO';
import './UserPages.css';

const ProfilePage = () => {
  const { userId } = useParams(); // Ако преглеждаме чужд профил
  const { user } = useAuth();
  const { profile, stats, loading, error, loadProfile, loadStats } = useProfile();
  
  // Флаг дали това е собственият профил на потребителя
  const isOwnProfile = !userId || (user && user._id === userId);
  
  useEffect(() => {
    // Използвайте функции, които връщат abort контролери
    const profileController = loadProfile(userId);
    const statsController = loadStats(userId);
    
    // Cleanup функция
    return () => {
      if (profileController) profileController();
      if (statsController) statsController();
    };
  }, [userId, loadProfile, loadStats]);
  
  // SEO данни - динамично генерирани според потребителя
  const profileName = profile ? `${profile.firstName} ${profile.lastName}` : 'Потребител';
  const seoTitle = isOwnProfile ? 'Моят профил' : `${profileName}`;
  const seoDescription = isOwnProfile 
    ? 'Вашият профил в CulinaryCorner - преглед на рецепти, статистики и лична информация.'
    : `Профил на ${profileName} в CulinaryCorner - преглед на рецепти и кулинарни постижения.`;

  if (loading && !profile) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <>
        <SEO
          title="Грешка при зареждане"
          description="Възникна проблем при зареждане на потребителския профил."
        />
        <Alert type="error">{error}</Alert>
      </>
    );
  }

  return (
    <div className="profile-page">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`${profileName}, потребителски профил, рецепти, кулинарни творения, готвач, culinary corner`}
        ogImage={profile?.profilePicture} // Използваме профилната снимка за og:image ако има такава
      />
      <div className="container">
        {profile && (
          <>
            <ProfileHeader 
              profile={profile}
              isOwnProfile={isOwnProfile}
            />
            
            <ProfileStats stats={stats} />
            
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;