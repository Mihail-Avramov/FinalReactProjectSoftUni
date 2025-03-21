import apiClient from './apiClient';

const userApi = {
  // Профил
  getProfile: (userId = null, signal) => {
    const url = userId ? `/users/profile/${userId}` : '/users/profile';
    return apiClient.get(url, { signal });
  },
  
  updateProfile: (profileData) => {
    return apiClient.put('/users/profile', profileData);
  },
  
  // Статистики
  getUserStats: (userId = null, signal) => {
    const url = userId ? `/users/stats/${userId}` : '/users/stats';
    return apiClient.get(url, { signal });
  },
  
  // Профилна снимка
  updateProfilePicture: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiClient.put('/users/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  resetProfilePicture: () => {
    return apiClient.delete('/users/profile-picture');
  },
  
  // Настройки на акаунта
  changePassword: (currentPassword, newPassword) => {
    return apiClient.put('/users/change-password', {
      currentPassword,
      newPassword
    });
  },
  
  deleteAccount: (password) => {
    return apiClient.delete('/users/account', {
      data: { password }
    });
  }
};

export default userApi;