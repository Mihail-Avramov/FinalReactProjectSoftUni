import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/api/AuthProvider';
import userEvent from '@testing-library/user-event';
import { AllProviders, MockThemeProvider } from './mocks/TestProviders.jsx';

/**
 * Мокване на useAuth за тестове
 * Използва по-прост подход за избягване на проблеми с обхватите
 */
export function mockUseAuth(overrides = {}) {
  // Създаваме обект с мока, който ще върнем
  const authMock = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateUserData: vi.fn(),
    clearAuthError: vi.fn(),
    ...overrides
  };
  
  // Директно заместваме имплементацията на модула
  vi.mock('../hooks/api/useAuth', () => {
    return {
      useAuthState: () => authMock,
      useAuth: () => authMock,
      default: () => authMock
    };
  });
  
  return authMock;
}

/**
 * Помощна функция за рендериране с AuthProvider
 */
export function renderWithAuth(ui, options = {}) {
  return render(ui, { wrapper: AuthProvider, ...options });
}

/**
 * Рендериране на компонент с Router и AuthProvider за тестване
 */
export function renderWithProviders(ui, options = {}) {
  const {
    initialEntries = ['/'],
    ...renderOptions
  } = options;

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>,
    renderOptions
  );
}

/**
 * Рендериране с всички контексти, необходими за повечето компоненти
 */
export function renderWithAllProviders(ui, options = {}) {
  const { 
    initialEntries = ['/'],
    initialTheme = 'light',
    ...renderOptions 
  } = options;

  return render(
    <AllProviders initialEntries={initialEntries} initialTheme={initialTheme}>
      {ui}
    </AllProviders>,
    renderOptions
  );
}

/**
 * Рендериране за базови UI компоненти без зависимост от контексти
 */
export function renderUI(ui, options = {}) {
  return render(ui, options);
}

/**
 * Създава потребителско събитие с настройка userEvent.setup()
 * @returns Инстанция на userEvent с конфигурирано забавяне
 */
export function setupUserEvent(options = {}) {
  return userEvent.setup({
    delay: 10,
    ...options
  });
}

/**
 * Мокване на useAuthState за тестове
 */
export function mockUseAuthState(authStateOverrides = {}) {
  return mockUseAuth(authStateOverrides);
}

/**
 * Мокване на useParams hook за тестване на компоненти, които 
 * използват параметри от URL
 */
export function mockUseParams(params = {}) {
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useParams: () => params
    };
  });
  return params;
}

// Помощна функция за създаване на localStorage мок
export function createLocalStorageMock() {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
}

// Помощна функция за мокване на API методи
export function mockApiMethod(api, method, response) {
  const mock = api[method].mockImplementation(() => Promise.resolve(response));
  return mock;
}

/**
 * Безопасно рендериране на React hook с асинхронно поведение
 * 
 * @param {Function} hookFn - Функция, която извиква hook за тестване
 * @param {Object} options - Опции за renderHook
 * @param {boolean} [options.immediate=false] - Дали да върне резултата веднага без изчакване на ефекти
 * @returns {Promise<Object>} Резултат от рендериране с .result и .rerender
 */
export async function renderHookSafe(hookFn, options = {}) {
  const { immediate = false, ...hookOptions } = options;
  
  // За начално състояние, просто връщаме резултата без да изчакваме 
  // ефектите да приключат
  if (immediate) {
    return renderHook(hookFn, hookOptions);
  }
  
  // За тестване на крайно състояние обвиваме в act и изчакваме ефектите
  let renderResult;
  await act(async () => {
    renderResult = renderHook(hookFn, hookOptions);
    await new Promise(resolve => setTimeout(resolve, 10));
  });
  
  return renderResult;
}

/**
 * Улавя само началното състояние на hook, преди изпълнение на ефектите
 */
export function captureInitialHookState(hookFn, options = {}) {
  return renderHook(hookFn, options);
}

/**
 * Обвива асинхронен код в act() за безопасно тестване на hooks
 * 
 * @param {Function} callback - Асинхронна функция за изпълнение
 * @returns {Promise<any>} - Резултат от изпълнението на callback
 */
export async function actAsync(callback) {
  let result;
  await act(async () => {
    result = await callback();
  });
  return result;
}

/**
 * Помощна функция за създаване на мокове за заявки
 */
export function createApiMocks(apiObject, methodNames) {
  const mocks = {};
  
  methodNames.forEach(methodName => {
    mocks[methodName] = vi.fn();
    apiObject[methodName] = mocks[methodName];
  });
  
  return mocks;
}

/**
 * Потискане на console.error за по-чисти тестове
 */
export function suppressConsoleError(fn) {
  const originalConsoleError = console.error;
  console.error = vi.fn();
  
  try {
    return fn();
  } finally {
    console.error = originalConsoleError;
  }
}

/**
 * Потискане на API грешки при тестване на грешни пътища
 * 
 * @param {Function} callback - функция, която изпълнява API заявка с очаквана грешка
 * @returns {Promise<any>} - резултат от изпълнението
 */
export async function suppressApiErrors(callback) {
  // Съхраняваме оригиналния console.error
  const originalError = console.error;
  
  // Временно го заменяме с функция, която игнорира API грешки
  console.error = (...args) => {
    const message = String(args[0] || '');
    if (message.includes('Error fetching data') || message.includes('API Error') || message.includes('Network error')) {
      return;
    }
    originalError(...args);
  };
  
  try {
    // Изпълняваме callback функцията
    return await callback();
  } finally {
    // Възстановяваме оригиналния console.error
    console.error = originalError;
  }
}

// Фикстури за тестване на рецепти
export const recipeFixtures = {
  singleRecipe: {
    _id: 'recipe123',
    title: 'Тестова рецепта',
    description: 'Тестово описание',
    ingredients: ['съставка 1', 'съставка 2'],
    steps: ['стъпка 1', 'стъпка 2'],
    prepTime: 30,
    cookTime: 45,
    difficulty: 'medium',
    category: 'lunch',
    servings: 4,
    author: { _id: 'user123', name: 'Тестов потребител' },
    likes: 5,
    favorites: 3,
    comments: []
  },
  
  recipesList: Array(5).fill().map((_, i) => ({
    _id: `recipe${i}`,
    title: `Рецепта ${i}`,
    description: `Описание ${i}`,
    prepTime: 20 + i * 5,
    cookTime: 30 + i * 10,
    difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
    category: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'][i % 5],
    likes: i * 2,
    favorites: i
  }))
};

/**
 * Създава тестови състояния с контролирани промени
 */
export function createTestState(initialState = {}) {
  let state = { ...initialState };
  const listeners = [];
  
  function setState(newState) {
    state = typeof newState === 'function' 
      ? newState(state) 
      : { ...state, ...newState };
    
    listeners.forEach(listener => listener(state));
  }
  
  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }
  
  function getState() {
    return state;
  }
  
  return { setState, getState, subscribe };
}

/**
 * Мокване на навигация от react-router-dom
 */
export function mockNavigate() {
  const navigateMock = vi.fn();
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => navigateMock
    };
  });
  return navigateMock;
}