import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import CommentSection from '../../../components/comments/CommentSection';
import { mockUser, mockComments } from '../../fixtures/auth';
import { renderUI, setupUserEvent } from '../../test-utils';

// Създаваме мокови функции за useComment
const useCommentMock = {
  comments: [],
  pagination: { totalItems: 0, page: 1, totalPages: 0, limit: 5 },
  loading: false,
  error: null,
  editingComment: null,
  createComment: vi.fn(),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
  canEditComment: vi.fn(() => false),
  startEditing: vi.fn(),
  cancelEditing: vi.fn(),
  setPage: vi.fn(),
};

// Създаваме мок за useAuth
const useAuthMock = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
};

// Мокваме useComment хука
vi.mock('../../../hooks/api/useComment', () => ({
  useComment: () => useCommentMock
}));

// Мокваме хука за автентикация
vi.mock('../../../hooks/api/useAuth', () => ({
  useAuth: () => useAuthMock
}));

describe('CommentSection компонент', () => {
  const recipeId = 'recipe123';
  const recipeOwnerId = 'user123';
  const onCommentAdded = vi.fn();
  let user;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Важно: Ресетваме стойностите на моковете преди всеки тест
    useCommentMock.comments = [];
    useCommentMock.pagination = { totalItems: 0, page: 1, totalPages: 0, limit: 5 };
    useCommentMock.loading = false;
    useCommentMock.error = null;
    useCommentMock.editingComment = null;
    useCommentMock.createComment = vi.fn();
    useCommentMock.updateComment = vi.fn();
    useCommentMock.deleteComment = vi.fn();
    useCommentMock.canEditComment = vi.fn(() => false);
    useCommentMock.startEditing = vi.fn();
    useCommentMock.cancelEditing = vi.fn();
    useCommentMock.setPage = vi.fn();
    
    // Ресетваме auth мока
    useAuthMock.isAuthenticated = false;
    useAuthMock.user = null;
    useAuthMock.isLoading = false;
    
    user = setupUserEvent();
  });

  it('показва съобщение за липса на коментари, когато няма такива', () => {
    renderUI(
      <CommentSection recipeId={recipeId} recipeOwnerId={recipeOwnerId} onCommentAdded={onCommentAdded} />
    );

    expect(screen.getByText(/Все още няма коментари/i)).toBeInTheDocument();
    expect(screen.getByText(/Коментари \(0\)/i)).toBeInTheDocument();
  });

  it('показва спинър докато зарежда коментарите', () => {
    // Настройка на мока за зареждане
    useCommentMock.loading = true;

    renderUI(
      <CommentSection recipeId={recipeId} recipeOwnerId={recipeOwnerId} onCommentAdded={onCommentAdded} />
    );

    expect(screen.getByText(/Зареждане на коментари/i)).toBeInTheDocument();
  });

  it('показва подкана за вход, когато потребителят не е логнат', () => {
    // Уверяваме се, че потребителят не е автентикиран
    useAuthMock.isAuthenticated = false;
    useAuthMock.user = null;

    renderUI(
      <CommentSection recipeId={recipeId} recipeOwnerId={recipeOwnerId} onCommentAdded={onCommentAdded} />
    );

    // ПОПРАВКА: Вместо да търсим по текст, търсим директно <a> елемента
    const loginLink = screen.getByRole('link', { name: /влезете в профила си/i });
    expect(loginLink).toBeInTheDocument();
    
    // Проверяваме дали родителският елемент съдържа целия текст
    const promptElement = loginLink.closest('div');
    expect(promptElement).toHaveClass('_commentLoginPrompt_cd1644');
  });

  it('показва форма за коментари, когато потребителят е логнат', () => {
    // Мокваме автентикиран потребител
    useAuthMock.isAuthenticated = true;
    useAuthMock.user = { ...mockUser };

    renderUI(
      <CommentSection recipeId={recipeId} recipeOwnerId={recipeOwnerId} onCommentAdded={onCommentAdded} />
    );

    expect(screen.getByPlaceholderText(/Напишете коментар/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Коментирай/i })).toBeInTheDocument();
  });

  it('показва съобщение за модерация, когато потребителят е собственик на рецептата', () => {
    // Мокваме автентикиран потребител, който е собственик на рецептата
    useAuthMock.isAuthenticated = true;
    useAuthMock.user = { ...mockUser, _id: recipeOwnerId };

    // Мокваме наличие на коментари
    useCommentMock.comments = mockComments;
    useCommentMock.pagination = { totalItems: mockComments.length, page: 1, totalPages: 1, limit: 5 };

    renderUI(
      <CommentSection recipeId={recipeId} recipeOwnerId={recipeOwnerId} onCommentAdded={onCommentAdded} />
    );

    expect(screen.getByText(/Като собственик на рецептата/i)).toBeInTheDocument();
  });

  it('правилно рендерира списък с коментари', () => {
    // Мокваме коментари
    useCommentMock.comments = mockComments;
    useCommentMock.pagination = { totalItems: mockComments.length, page: 1, totalPages: 1, limit: 5 };

    renderUI(
      <CommentSection recipeId={recipeId} recipeOwnerId={recipeOwnerId} onCommentAdded={onCommentAdded} />
    );

    // Проверяваме дали всеки коментар се показва
    mockComments.forEach(comment => {
      expect(screen.getByText(comment.content)).toBeInTheDocument();
    });

    // Проверяваме дали се показва правилният брой коментари
    expect(screen.getByText(`Коментари (${mockComments.length})`)).toBeInTheDocument();
  });

  it('позволява изпращане на нов коментар', async () => {
    // Мокваме автентикиран потребител
    useAuthMock.isAuthenticated = true;
    useAuthMock.user = { ...mockUser };

    const createCommentMock = vi.fn().mockResolvedValue(true);
    useCommentMock.createComment = createCommentMock;

    renderUI(
      <CommentSection recipeId={recipeId} recipeOwnerId={recipeOwnerId} onCommentAdded={onCommentAdded} />
    );

    // Намираме текстовото поле и бутона
    const commentInput = screen.getByPlaceholderText(/Напишете коментар/i);
    const submitButton = screen.getByRole('button', { name: /Коментирай/i });

    // Въвеждаме текст и натискаме бутона
    await user.type(commentInput, 'Това е тестов коментар');
    await user.click(submitButton);

    // Проверяваме дали функцията за създаване на коментар е извикана
    expect(createCommentMock).toHaveBeenCalledWith('Това е тестов коментар');
    
    // Проверяваме дали callback функцията e извикана след успешно създаване
    await waitFor(() => {
      expect(onCommentAdded).toHaveBeenCalled();
    });
  });

  it('позволява редактиране на коментар', async () => {
    // Мокваме автентикиран потребител, който може да редактира коментар
    useAuthMock.isAuthenticated = true;
    useAuthMock.user = { ...mockUser };

    const startEditingMock = vi.fn();
    useCommentMock.startEditing = startEditingMock;
    
    // ВАЖНА ПРОМЯНА: Разрешаваме редактиране на коментари и добавяме реален масив
    const testComments = [ 
      { 
        _id: 'comment1', 
        content: 'Страхотна рецепта!', 
        author: { _id: '123', name: 'Тест Потребител' },
        createdAt: '2023-01-01T12:00:00.000Z' 
      }
    ];
    
    useCommentMock.comments = testComments;
    useCommentMock.pagination = { totalItems: testComments.length, page: 1, totalPages: 1, limit: 5 };
    useCommentMock.canEditComment = vi.fn(() => true);

    renderUI(
      <CommentSection recipeId={recipeId} recipeOwnerId={recipeOwnerId} onCommentAdded={onCommentAdded} />
    );

    // Намираме бутона за редактиране
    const editButton = screen.getByTitle('Редактирай коментара');
    
    // Натискаме бутона за редактиране
    await user.click(editButton);
    
    // Проверяваме дали функцията за започване на редактиране е извикана с правилния коментар
    expect(startEditingMock).toHaveBeenCalledWith(testComments[0]);
  });

  it('позволява изтриване на коментар', async () => {
    // Мокваме автентикиран потребител, който е автор на коментар
    useAuthMock.isAuthenticated = true;
    useAuthMock.user = { ...mockUser };

    const deleteCommentMock = vi.fn().mockResolvedValue(true);
    
    // ВАЖНА ПРОМЯНА: Добавяме опростен масив от коментари
    const testComments = [ 
      { 
        _id: 'comment1', 
        content: 'Страхотна рецепта!', 
        author: { _id: '123', name: 'Тест Потребител' },
        createdAt: '2023-01-01T12:00:00.000Z' 
      }
    ];
    
    // Мокваме хука с функция за изтриване
    useCommentMock.comments = testComments;
    useCommentMock.pagination = { totalItems: testComments.length, page: 1, totalPages: 1, limit: 5 };
    useCommentMock.deleteComment = deleteCommentMock;
    useCommentMock.canEditComment = vi.fn(() => true);

    renderUI(
      <CommentSection recipeId={recipeId} recipeOwnerId={recipeOwnerId} onCommentAdded={onCommentAdded} />
    );

    // Намираме бутона за изтриване
    const deleteButton = screen.getByTitle('Изтрий коментара');
    
    // Натискаме бутона за изтриване
    await user.click(deleteButton);
    
    // ПРОМЯНА: Директно търсим заглавието на модалния прозорец
    const modalTitle = screen.getByText(/Изтриване на коментар/i);
    expect(modalTitle).toBeInTheDocument();
    
    // Намираме бутона за изтриване в модалния прозорец - чрез getAllByText и вземаме втория резултат
    // тъй като първият е бутонът в коментара, а вторият е в модалния прозорец
    const confirmButton = screen.getAllByText(/Изтрий/i)[1];
    
    // Потвърждаваме изтриването
    await user.click(confirmButton);
    
    // Проверяваме дали функцията за изтриване е извикана
    expect(deleteCommentMock).toHaveBeenCalledWith('comment1');
  });

  it('показва съобщение за грешка при проблем', () => {
    // Мокваме грешка
    useCommentMock.error = 'Възникна грешка при зареждане на коментарите';

    renderUI(
      <CommentSection recipeId={recipeId} recipeOwnerId={recipeOwnerId} onCommentAdded={onCommentAdded} />
    );

    expect(screen.getByText(/Възникна грешка при зареждане на коментарите/i)).toBeInTheDocument();
  });
});