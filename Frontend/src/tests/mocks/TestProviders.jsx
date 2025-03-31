import React from 'react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Мок на ThemeProvider за тестове
 */
export const MockThemeProvider = ({ children, initialTheme = 'light' }) => {
  return <div data-theme={initialTheme}>{children}</div>;
};

/**
 * Мокнат AuthProvider, който не използва useAuthState
 */
export const MockAuthProvider = ({ children }) => {
  return <div data-testid="mock-auth-provider">{children}</div>;
};

/**
 * Обвиващ компонент, който предоставя всички необходими провайдъри
 * за тестване на компоненти, но с мокнат AuthProvider
 */
export const AllProviders = ({ children, initialEntries = ['/'], initialTheme = 'light' }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <MockThemeProvider initialTheme={initialTheme}>
        <MockAuthProvider>
          {children}
        </MockAuthProvider>
      </MockThemeProvider>
    </MemoryRouter>
  );
};