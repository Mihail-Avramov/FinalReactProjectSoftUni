import React, { useState, useRef, useEffect } from 'react';
import { useProfile } from '../../hooks/api/useProfile';
import { useAuth } from '../../hooks/api/useAuth';
import Button from '../common/Button';
import Alert from '../common/Alert';
import defaultAvatar from '/images/default-avatar.webp';
import styles from './ProfilePictureUpload.module.css';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

const ProfilePictureUpload = ({ currentImage }) => {
  const { updateProfilePicture, resetProfilePicture } = useProfile();
  const { updateUserInfo, user } = useAuth(); // Добавяме user
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  // Локално състояние за проследяване на актуалната снимка
  const [currentProfileImage, setCurrentProfileImage] = useState(currentImage);
  
  const fileInputRef = useRef(null);
  
  // Добавяме ефект, който следи външните промени на currentImage
  useEffect(() => {
    setCurrentProfileImage(currentImage);
  }, [currentImage]);
  
  // Добавяме ефект, който следи промените в user.profilePicture
  useEffect(() => {
    if (user && user.profilePicture !== undefined) {
      setCurrentProfileImage(user.profilePicture);
    }
  }, [user]);
  
  // Обработка на избор на файл
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError(null);
    
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    
    // Валидация на размера
    if (file.size > MAX_FILE_SIZE) {
      setError('Файлът е твърде голям. Максимален размер: 5MB');
      e.target.value = null;
      return;
    }
    
    // Валидация на формата
    if (!ALLOWED_FORMATS.includes(file.type)) {
      setError('Невалиден формат. Разрешени формати: JPG, PNG, WEBP');
      e.target.value = null;
      return;
    }
    
    // Създаване на превю
    const fileUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(fileUrl);
    setUploadSuccess(false);
  };
  
  // Почистване на URL обекта при размонтиране
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const result = await updateProfilePicture(selectedFile);

      if (result.success) {
        setUploadSuccess(true);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
        
        // Синхронизираме данните в useAuth
        if (result.profileData) {
          updateUserInfo(result.profileData);
        }
      } else {
        setError(result.error || 'Възникна проблем при качването');
      }
    } catch {
      setError('Възникна неочаквана грешка');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsUploading(true);
    setError(null);
    
    try {
      const result = await resetProfilePicture();
      
      if (result.success) {
        setUploadSuccess(true);
        // Обновяваме локално и изображението
        setCurrentProfileImage(null);

        // Синхронизираме данните в useAuth
        if (result.profileData) {
          updateUserInfo(result.profileData);
        }
      } else {
        setError(result.error || 'Възникна проблем при изтриването');
      }
    } catch {
      setError('Възникна неочаквана грешка');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      {isUploading && (
        <div className={styles.loaderOverlay}>
          <LoadingSpinner message="Качване на снимка..." />
        </div>
      )}

      <div className={styles.imageContainer}>
        <img 
          // Използваме локалното състояние вместо непосредствено prop-а
          src={previewUrl || currentProfileImage || defaultAvatar}
          alt="Профилна снимка" 
          className={styles.image}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultAvatar;
          }}
        />
      </div>
      
      {error && <Alert type="error">{error}</Alert>}
      {uploadSuccess && <Alert type="success">Снимката беше успешно обновена</Alert>}
      
      <div className={styles.controls}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          hidden
        />
        
        <Button
          type="button"
          onClick={handleButtonClick}
          variant="secondary"
          disabled={isUploading}
        >
          Избери снимка
        </Button>
        
        {selectedFile && (
          <Button
            type="button"
            onClick={handleUpload}
            variant="outline"
            disabled={isUploading}
            loading={isUploading}
          >
            Качи снимката
          </Button>
        )}
        
        {currentProfileImage && !selectedFile && (
          <Button
            type="button"
            onClick={handleDelete}
            variant="primary"
            disabled={isUploading}
          >
            Премахни снимката
          </Button>
        )}
      </div>
      
      <div className={styles.info}>
        <small>Позволени формати: JPG, PNG, WEBP</small>
        <small>Максимален размер: 5MB</small>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;