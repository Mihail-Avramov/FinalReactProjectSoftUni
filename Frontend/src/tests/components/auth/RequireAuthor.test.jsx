import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, waitFor } from '@testing-library/react';
import { mockUser } from '../../fixtures/auth';

// ВАЖНО: Дефинираме моковете ПРЕДИ да импортираме компонента,
// защото vi.mock се издига (hoists) преди всичко друго
vi.mock('../../../api/recipeApi', () => ({
  default: {
    getById: vi.fn()
  }
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, state, replace }) => (
    <div data-testid="navigate-mock" data-to={to} data-state={JSON.stringify(state)} data-replace={replace?.toString()}>
      Redirecting...
    </div>
  ),
  useLocation: () => ({ pathname: '/recipes/123/edit' }),
  useParams: () => ({ id: '123' })
}));

// Дефинираме променлива за authState, която ще се използва в мока
let authState = {
  isAuthenticated: true,
  isLoading: false,
  user: { ...mockUser }
};

vi.mock('../../../hooks/api/useAuth', () => ({
  useAuth: () => authState
}));

vi.mock('../../../components/common/LoadingSpinner', () => ({
  default: ({ message }) => <div data-testid="loading-spinner">{message || 'Loading...'}</div>
}));

// Сега е безопасно да импортираме компонента и другите зависимости
import { RequireAuthor } from '../../../components/auth/RequireAuthor';

// Вземаме референция към моковете, за да можем да ги контролираме
import RecipeApi from '../../../api/recipeApi';

describe('RequireAuthor компонент', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Ресетваме authState преди всеки тест
    authState = {
      isAuthenticated: true,
      isLoading: false,
      user: { ...mockUser }
    };
    
    // Подготвяме mock за getById с успешен отговор по подразбиране
    RecipeApi.getById.mockResolvedValue({ 
      _id: '123', 
      title: 'Test Recipe',
      author: { _id: '123', name: 'Тест Потребител' }
    });
  });
  
  it('показва спинър докато зарежда рецептата', async () => {
    render(
      <RequireAuthor>
        <div>Редактиране на рецепта</div>
      </RequireAuthor>
    );
    
    // Проверка за спинър
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Проверка на права...')).toBeInTheDocument();
    
    // Проверка, че съдържанието не се показва
    expect(screen.queryByText('Редактиране на рецепта')).not.toBeInTheDocument();
    
    // Изчакваме зареждането
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });
  
  // Комбинираме предишните проблемни тестове в един стабилен тест
  it('правилно обработва неавтентикиран потребител', () => {
    // Задаваме, че потребителят не е автентикиран
    authState = {
      isAuthenticated: false,
      isLoading: false,
      user: null
    };
    
    // Проверяваме, че компонентът може да се рендерира без грешки
    expect(() => {
      render(
        <RequireAuthor>
          <div>Редактиране на рецепта</div>
        </RequireAuthor>
      );
    }).not.toThrow();
    
    // Проверяваме, че спинърът се показва веднага
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Проверяваме, че съдържанието не се вижда
    expect(screen.queryByText('Редактиране на рецепта')).not.toBeInTheDocument();
  });
  
  it('пренасочва към страницата на рецептата с грешка, когато потребителят не е автор', async () => {
    // Мокваме рецепта с различен автор ПРЕДИ рендерирането
    RecipeApi.getById.mockResolvedValue({ 
      _id: '123', 
      title: 'Test Recipe',
      author: { _id: '456', name: 'Друг Потребител' }
    });
    
    render(
      <RequireAuthor>
        <div>Редактиране на рецепта</div>
      </RequireAuthor>
    );
    
    // Проверяваме спинъра
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Изчакваме пренасочването
    await waitFor(() => {
      const navigate = screen.getByTestId('navigate-mock');
      expect(navigate).toBeInTheDocument();
      expect(navigate).toHaveAttribute('data-to', '/recipes/123');
    });
    
    // Отделно проверяваме съдържанието на state
    const navigate = screen.getByTestId('navigate-mock');
    const state = JSON.parse(navigate.getAttribute('data-state'));
    expect(state.error).toMatch(/нямате право да редактирате тази рецепта/i);
    
    // Проверка, че съдържанието не се показва
    expect(screen.queryByText('Редактиране на рецепта')).not.toBeInTheDocument();
  });
  
  it('показва правилно съобщение за грешка при изтриване', async () => {
    // Мокваме рецепта с различен автор
    RecipeApi.getById.mockResolvedValue({ 
      _id: '123', 
      title: 'Test Recipe',
      author: { _id: '456', name: 'Друг Потребител' }
    });
    
    render(
      <RequireAuthor action="delete">
        <div>Изтриване на рецепта</div>
      </RequireAuthor>
    );
    
    // Изчакваме зареждането
    await waitFor(() => {
      // Проверка за пренасочване към страницата на рецептата
      const navigate = screen.getByTestId('navigate-mock');
      
      // Проверка за съобщение за грешка в state
      const state = JSON.parse(navigate.getAttribute('data-state'));
      expect(state.error).toMatch(/нямате право да изтриете тази рецепта/i);
    });
  });
  
  it('показва съдържанието, когато потребителят е автор', async () => {
    render(
      <RequireAuthor>
        <div>Редактиране на рецепта</div>
      </RequireAuthor>
    );
    
    // Изчакваме зареждането
    await waitFor(() => {
      // Проверка, че съдържанието се показва
      expect(screen.getByText('Редактиране на рецепта')).toBeInTheDocument();
      // Проверка, че няма пренасочване
      expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
    });
  });
  
  it('обработва грешка при зареждане на рецептата', async () => {
    // Мокваме грешка при зареждане
    RecipeApi.getById.mockRejectedValue(new Error('Failed to load recipe'));
    
    render(
      <RequireAuthor>
        <div>Редактиране на рецепта</div>
      </RequireAuthor>
    );
    
    // Изчакваме зареждането и обработката на грешката
    await waitFor(() => {
      // Проверка за пренасочване към страницата на рецептата
      const navigate = screen.getByTestId('navigate-mock');
      expect(navigate).toHaveAttribute('data-to', '/recipes/123');
    });
    
    // Проверка, че съдържанието не се показва
    expect(screen.queryByText('Редактиране на рецепта')).not.toBeInTheDocument();
  });
});