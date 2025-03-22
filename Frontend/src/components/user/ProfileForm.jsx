import React, { useState } from 'react';
import { useProfile } from '../../hooks/api/useProfile';
import { useAuth } from '../../hooks/api/useAuth';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import Alert from '../common/Alert';

const ProfileForm = ({ profile }) => {
  const { updateProfile } = useProfile();
  const { updateUserInfo } = useAuth();
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    bio: profile?.bio || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Изчистване на грешки при промяна
    setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Потребителското име е задължително';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Потребителското име трябва да е поне 3 символа';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Потребителското име може да съдържа само букви, цифри и долна черта';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Името е задължително';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилията е задължителна';
    }
    
    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = 'Биографията не може да надвишава 200 символа';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccessMessage('Профилът е актуализиран успешно!');
        
        // Синхронизираме данните в useAuth
        if (result.profileData) {
          updateUserInfo(result.profileData);
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ form: 'Възникна грешка при актуализирането на профила' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="profile-form">
      {successMessage && <Alert type="success">{successMessage}</Alert>}
      {errors.form && <Alert type="error">{errors.form}</Alert>}
      
      <FormInput
        label="Потребителско име"
        name="username"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        required
      />
      
      <FormInput
        label="Име"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        error={errors.firstName}
        required
      />
      
      <FormInput
        label="Фамилия"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        error={errors.lastName}
        required
      />
      
      <div className="form-group">
        <label htmlFor="bio">Биография</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="4"
          className={errors.bio ? 'form-control error' : 'form-control'}
          maxLength="200"
        />
        {errors.bio && <div className="error-message">{errors.bio}</div>}
        <div className="char-counter">
          {formData.bio?.length || 0}/200
        </div>
      </div>
      
      <Button
        type="submit"
        variant="outline"
        disabled={isSubmitting}
        loading={isSubmitting}
      >
        Запази промените
      </Button>
    </form>
  );
};

export default ProfileForm;