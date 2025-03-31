export const mockUser = { 
  _id: '123', 
  name: 'Тест Потребител',
  email: 'test@example.com',
  profilePicture: 'default.jpg'
};

export const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const mockLoginResponse = {
  success: true,
  user: mockUser,
  token: mockToken
};

export const mockComments = [
  { 
    _id: 'comment1', 
    content: 'Страхотна рецепта!', 
    author: { _id: '123', name: 'Тест Потребител' },
    createdAt: '2023-01-01T12:00:00.000Z'
  },
  { 
    _id: 'comment2', 
    content: 'Ще я пробвам скоро!', 
    author: { _id: '456', name: 'Друг Потребител' },
    createdAt: '2023-01-02T14:30:00.000Z'
  }
];

export const mockPagination = {
  page: 1,
  limit: 10,
  totalItems: 2,
  totalPages: 1
};