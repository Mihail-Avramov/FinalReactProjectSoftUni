import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import { RequireAuth, RequireGuest } from '../../../components/auth/ProtectedRoutes';

// Мокваме react-router-dom
const locationMock = { pathname: '/protected-route' };

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, state, replace }) => (
    <div data-testid="navigate-mock" data-to={to} data-state={JSON.stringify(state)} data-replace={replace.toString()}>
      Redirecting...
    </div>
  ),
  useLocation: () => locationMock
}));

// Мокваме useAuth hook
const authMock = {
  isAuthenticated: false,
  isLoading: false
};

vi.mock('../../../hooks/api/useAuth', () => ({
  useAuth: () => authMock
}));

// Мокваме LoadingSpinner компонент
vi.mock('../../../components/common/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}));

describe('ProtectedRoutes компоненти', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.isAuthenticated = false;
    authMock.isLoading = false;
    locationMock.pathname = '/protected-route';
  });
  
  describe('RequireAuth компонент', () => {
    it('показва спинър докато проверява автентикацията', () => {
      authMock.isLoading = true;
      
      render(
        <RequireAuth>
          <div>Защитено съдържание</div>
        </RequireAuth>
      );
      
      // Проверка за спинър
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      // Проверка, че съдържанието не се показва
      expect(screen.queryByText('Защитено съдържание')).not.toBeInTheDocument();
    });
    
    it('пренасочва към login, когато потребителят не е автентикиран', () => {
      authMock.isAuthenticated = false;
      
      render(
        <RequireAuth>
          <div>Защитено съдържание</div>
        </RequireAuth>
      );
      
      // Проверка за пренасочване към login
      const navigate = screen.getByTestId('navigate-mock');
      expect(navigate).toHaveAttribute('data-to', '/login');
      expect(navigate).toHaveAttribute('data-state', JSON.stringify({ from: '/protected-route' }));
      expect(navigate).toHaveAttribute('data-replace', 'true');
      
      // Проверка, че съдържанието не се показва
      expect(screen.queryByText('Защитено съдържание')).not.toBeInTheDocument();
    });
    
    it('показва защитеното съдържание, когато потребителят е автентикиран', () => {
      authMock.isAuthenticated = true;
      
      render(
        <RequireAuth>
          <div>Защитено съдържание</div>
        </RequireAuth>
      );
      
      // Проверка, че съдържанието се показва
      expect(screen.getByText('Защитено съдържание')).toBeInTheDocument();
      // Проверка, че няма пренасочване
      expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
    });
  });
  
  describe('RequireGuest компонент', () => {
    it('показва спинър докато проверява автентикацията', () => {
      authMock.isLoading = true;
      
      render(
        <RequireGuest>
          <div>Съдържание само за гости</div>
        </RequireGuest>
      );
      
      // Проверка за спинър
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      // Проверка, че съдържанието не се показва
      expect(screen.queryByText('Съдържание само за гости')).not.toBeInTheDocument();
    });
    
    it('пренасочва към начална страница, когато потребителят е автентикиран', () => {
      authMock.isAuthenticated = true;
      
      render(
        <RequireGuest>
          <div>Съдържание само за гости</div>
        </RequireGuest>
      );
      
      // Проверка за пренасочване към началната страница
      const navigate = screen.getByTestId('navigate-mock');
      expect(navigate).toHaveAttribute('data-to', '/');
      expect(navigate).toHaveAttribute('data-replace', 'true');
      
      // Проверка, че съдържанието не се показва
      expect(screen.queryByText('Съдържание само за гости')).not.toBeInTheDocument();
    });
    
    it('показва съдържанието само за гости, когато потребителят не е автентикиран', () => {
      authMock.isAuthenticated = false;
      
      render(
        <RequireGuest>
          <div>Съдържание само за гости</div>
        </RequireGuest>
      );
      
      // Проверка, че съдържанието се показва
      expect(screen.getByText('Съдържание само за гости')).toBeInTheDocument();
      // Проверка, че няма пренасочване
      expect(screen.queryByTestId('navigate-mock')).not.toBeInTheDocument();
    });
    
    it('пренасочва към предишната страница, когато потребителят е автентикиран и има state.from', () => {
      authMock.isAuthenticated = true;
      locationMock.state = { from: '/previous-page' };
      
      render(
        <RequireGuest>
          <div>Съдържание само за гости</div>
        </RequireGuest>
      );
      
      // Проверка за пренасочване към предишната страница
      const navigate = screen.getByTestId('navigate-mock');
      expect(navigate).toHaveAttribute('data-to', '/previous-page');
      expect(navigate).toHaveAttribute('data-replace', 'true');
    });
  });
});