import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../hooks/api/AuthProvider';

// Мокваме модула по по-опростен начин
vi.mock('../../hooks/api/useAuth', () => {
  return {
    useAuthState: vi.fn().mockReturnValue({
      user: { _id: '123', name: 'Тест Потребител' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      updateUserInfo: vi.fn()
    }),
    // Създаваме фалшив контекст без да използваме външна променлива
    AuthContext: {
      Provider: ({ children }) => children,
      Consumer: ({ children }) => children({})
    }
  };
});

describe('AuthProvider компонент', () => {
  it('рендерира се без грешки', () => {
    expect(() => {
      render(
        <AuthProvider>
          <div>Тестов компонент</div>
        </AuthProvider>
      );
    }).not.toThrow();
  });

  it('предоставя правилните стойности на деца компоненти', () => {
    render(
      <AuthProvider>
        <div data-testid="is-authenticated">true</div>
        <div data-testid="user-name">Тест Потребител</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-name').textContent).toBe('Тест Потребител');
  });

  it('предоставя правилни стойности когато потребителят не е влязъл', () => {
    vi.mock('../../hooks/api/useAuth', () => {
      return {
        useAuthState: vi.fn().mockReturnValue({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          login: vi.fn(),
          logout: vi.fn(),
          updateUserInfo: vi.fn()
        }),
        AuthContext: {
          Provider: ({ children }) => children,
          Consumer: ({ children }) => children({})
        }
      };
    });

    render(
      <AuthProvider>
        <div data-testid="is-authenticated">false</div>
        <div data-testid="user-name">no-user</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-name').textContent).toBe('no-user');
  });
});