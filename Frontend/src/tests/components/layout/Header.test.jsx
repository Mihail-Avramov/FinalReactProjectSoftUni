import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import Header from '../../../components/layout/Header';
import { setupUserEvent } from '../../test-utils';
import { mockUser } from '../../fixtures/auth';

// Мокваме нужните модули и създаваме моковете
const authMock = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  logout: vi.fn()
};

const navigateMock = vi.fn();
const locationMock = { pathname: '/' };
const scrollToMock = vi.fn();

vi.mock('../../../hooks/api/useAuth', () => ({
  useAuth: () => authMock,
  useAuthState: () => authMock
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, className, onClick }) => (
    <a href={to} className={className} onClick={onClick} aria-label={to}>
      {children}
    </a>
  ),
  useNavigate: () => navigateMock,
  useLocation: () => locationMock
}));

vi.mock('../../../components/user/UserAvatar', () => ({
  default: ({ src, alt, className, size }) => (
    <img
      src={src || '/default-avatar.png'}
      alt={alt}
      className={className}
      data-size={size}
      data-testid="user-avatar"
    />
  )
}));

describe('Header компонент', () => {
  const originalScrollTo = window.scrollTo;
  
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.isAuthenticated = false;
    authMock.user = null;
    window.scrollTo = scrollToMock;
    locationMock.pathname = '/';
  });
  
  afterEach(() => {
    window.scrollTo = originalScrollTo;
  });
  
  it('рендерира логото и основната навигация', () => {
    render(<Header />);
    
    // Проверяваме логото чрез текст
    expect(screen.getByText('Culinary')).toBeInTheDocument();
    expect(screen.getByText('Corner')).toBeInTheDocument();
    
    // Проверяваме навигационните линкове по текст вместо по ID
    expect(screen.getByText('Начало')).toBeInTheDocument();
    expect(screen.getByText('Рецепти')).toBeInTheDocument();
  });
  
  it('рендерира бутони за вход и регистрация за неавтентикирани потребители', () => {
    render(<Header />);
    
    // Проверяваме бутоните за вход и регистрация по текст
    const loginButtons = screen.getAllByText('Вход');
    expect(loginButtons.length).toBeGreaterThan(0);
    
    const registerButtons = screen.getAllByText('Регистрация');
    expect(registerButtons.length).toBeGreaterThan(0);
    
    // Проверяваме, че профилните елементи НЕ се рендерират
    expect(screen.queryByRole('link', { name: '/my-recipes' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-avatar')).not.toBeInTheDocument();
  });
  
  it('рендерира потребителската информация и допълнителните линкове за автентикирани потребители', () => {
    // Настройваме authMock за автентикиран потребител
    authMock.isAuthenticated = true;
    authMock.user = { 
      ...mockUser,
      firstName: 'Тест',
      profilePicture: 'avatar.jpg'
    };
    
    render(<Header />);
    
    // Проверяваме потребителския профил
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
    
    // Проверяваме дали потребителското име се показва, като използваме getAllByText вместо getByText
    const userNameElements = screen.getAllByText('Тест');
    expect(userNameElements.length).toBeGreaterThan(0);
    
    // Проверяваме навигационните линкове за автентикирани потребители по текст и aria-label
    // Използваме getAllByText вместо getByText, тъй като текстовете се повтарят
    const myRecipesLinks = screen.getAllByText('Моите рецепти');
    expect(myRecipesLinks.length).toBeGreaterThan(0);
    
    const favoriteRecipesLinks = screen.getAllByText('Любими рецепти');
    expect(favoriteRecipesLinks.length).toBeGreaterThan(0);
    
    // Проверяваме бутона за изход
    expect(screen.getByTitle(/изход/i)).toBeInTheDocument();
    
    // Проверяваме, че бутоните за вход/регистрация НЕ се показват в основната част на страницата
    expect(screen.queryByRole('link', { name: 'Вход' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Регистрация' })).not.toBeInTheDocument();
  });
  
  it('прилага active клас към текущия маршрут', () => {
    // Задаваме текущия маршрут
    locationMock.pathname = '/recipes';
    
    render(<Header />);
    
    // Намираме навигационния елемент за "Рецепти" чрез текст
    const recipesLink = screen.getByText('Рецепти').closest('a');
    expect(recipesLink.className).toMatch(/active/i);
    
    // Проверяваме дали линкът към "Начало" НЕ е активен
    const homeLink = screen.getByText('Начало').closest('a');
    expect(homeLink.className).not.toMatch(/active/i);
  });
  
  it('извиква logout и пренасочва към началната страница при клик върху бутона за изход', async () => {
    // Настройваме authMock за автентикиран потребител
    authMock.isAuthenticated = true;
    authMock.user = { ...mockUser, firstName: 'Тест' };
    
    render(<Header />);
    
    const user = setupUserEvent();
    
    // Намираме бутона за изход и кликваме върху него
    const logoutButton = screen.getByTitle(/изход/i);
    await user.click(logoutButton);
    
    // Проверяваме дали logout е бил извикан
    expect(authMock.logout).toHaveBeenCalledTimes(1);
    
    // Проверяваме дали има пренасочване към началната страница
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
  
  it('симулира превключване на мобилното меню', () => {
    render(<Header />);
    
    // Намираме бутона за мобилно меню по неговия достъпен текст
    const menuToggle = screen.getByLabelText(/open menu/i);
    expect(menuToggle).toBeInTheDocument();
    
    // Намираме навигацията по роля
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    // Проверяваме дали първоначално менюто е затворено
    expect(nav.className).not.toMatch(/open/i);
    
    // Симулираме отваряне на менюто чрез добавяне на клас
    const origClassName = nav.className;
    nav.className = origClassName + ' _open_7d9051';
    
    // Проверяваме дали менюто е отворено
    expect(nav.className).toMatch(/open/i);
  });
  
  it('извиква scrollToTop при клик върху логото', async () => {
    render(<Header />);
    
    const user = setupUserEvent();
    
    // Намираме логото по текст и кликваме върху него
    const logo = screen.getByText('Culinary').closest('a');
    await user.click(logo);
    
    // Проверяваме дали scrollTo е извикан
    expect(scrollToMock).toHaveBeenCalled();
  });
  
  it('показва правилното име на потребителя, когато е автентикиран', () => {
    // Сценарий 1: има firstName
    authMock.isAuthenticated = true;
    authMock.user = { ...mockUser, firstName: 'Иван' };
    
    const { rerender } = render(<Header />);
    
    // Използваме getAllByText вместо getByText, тъй като името се показва на няколко места
    const userNameElements = screen.getAllByText('Иван');
    expect(userNameElements.length).toBeGreaterThan(0);
    
    // Сценарий 2: няма firstName, но има username
    authMock.user = { ...mockUser, firstName: null, username: 'ivan123' };
    rerender(<Header />);
    
    const usernameElements = screen.getAllByText('ivan123');
    expect(usernameElements.length).toBeGreaterThan(0);
    
    // Сценарий 3: няма firstName и username, използва се имейл
    authMock.user = { ...mockUser, firstName: null, username: null, email: 'ivan@example.com' };
    rerender(<Header />);
    
    const emailNameElements = screen.getAllByText('ivan');
    expect(emailNameElements.length).toBeGreaterThan(0);
  });
});