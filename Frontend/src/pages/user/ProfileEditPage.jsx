import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/api/useAuth';
import { useProfile } from '../../hooks/api/useProfile';
import ProfileForm from '../../components/user/ProfileForm';
import ProfilePictureUpload from '../../components/user/ProfilePictureUpload';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import SEO from '../../components/common/SEO';
import './UserPages.css';

const ProfileEditPage = () => {
  const { isAuthenticated } = useAuth();
  const { profile, loading, error, loadProfile } = useProfile();
  const navigate = useNavigate();
  
  // Зареждаме профилните данни, ако не са заредени
  useEffect(() => {
    if (isAuthenticated && !profile) {
      loadProfile();
    } else if (!isAuthenticated) {
      // Ако не сме автентикирани, пренасочваме към входа
      navigate('/login');
    }
  }, [isAuthenticated, profile, loadProfile, navigate]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  return (
    <div className="profile-edit-page">
      <SEO
        title="Редактиране на профил"
        description="Редактирайте вашата профилна информация в CulinaryCorner - променете име, снимка и добавете информация за себе си."
        keywords="редактиране на профил, промяна на профилна снимка, актуализиране на профил, настройки на потребителски профил"
      />
      <div className="container">
        <div className="page-header">
          <h1>Редактиране на профил</h1>
          <Link to="/profile" className="btn btn-outline">Обратно към профила</Link>
        </div>
        
        <div className="edit-sections">
          <div className="edit-section">
            <h2>Профилна снимка</h2>
            {profile && (
              <ProfilePictureUpload 
                currentImage={profile.profilePicture}
              />
            )}
          </div>
          
          <div className="edit-section">
            <h2>Основна информация</h2>
            {profile && <ProfileForm profile={profile} />}
          </div>
          
          <div className="edit-section">
            <h2>Настройки на акаунта</h2>
            <div className="account-actions">
              <Link to="/account/change-password" className="btn btn-outline">
                Смяна на парола
              </Link>
              <Link to="/account/delete" className="btn btn-primary">
                Изтриване на акаунта
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditPage;