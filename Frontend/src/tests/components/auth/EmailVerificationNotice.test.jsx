import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render, waitFor } from '@testing-library/react';
import EmailVerificationNotice from '../../../components/auth/EmailVerificationNotice';
import { setupUserEvent } from '../../test-utils';

// Мокваме Link от react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  )
}));

// Мокваме useAuth hook
const authMock = {
  resendVerification: vi.fn()
};

vi.mock('../../../hooks/api/useAuth', () => ({
  useAuth: () => authMock
}));

describe('EmailVerificationNotice компонент', () => {
  const emailProp = 'test@example.com';
  
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.resendVerification.mockResolvedValue({ success: true });
  });
  
  it('рендерира съобщение за успешна регистрация с правилния имейл', () => {
    render(<EmailVerificationNotice email={emailProp} />);
    
    // Проверка за основните елементи
    expect(screen.getByText(/регистрацията е успешна/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(emailProp))).toBeInTheDocument();
    expect(screen.getByText(/изпрати отново/i)).toBeInTheDocument();
    expect(screen.getByText(/към страницата за вход/i)).toBeInTheDocument();
  });
  
  it('показва успешно съобщение при повторно изпращане на имейл', async () => {
    render(<EmailVerificationNotice email={emailProp} />);
    const user = setupUserEvent();
    
    // Кликваме върху бутона за повторно изпращане
    await user.click(screen.getByText(/изпрати отново/i));
    
    // Проверка, че resendVerification е извикан с правилния имейл
    expect(authMock.resendVerification).toHaveBeenCalledWith(emailProp);
    
    // Проверка за съобщение за успех
    await waitFor(() => {
      expect(screen.getByText(/изпратихме нов имейл за потвърждение/i)).toBeInTheDocument();
    });
  });
  
  it('показва съобщение за грешка при неуспешно повторно изпращане', async () => {
    // Мокваме error отговор
    authMock.resendVerification.mockResolvedValueOnce({ success: false });
    
    render(<EmailVerificationNotice email={emailProp} />);
    const user = setupUserEvent();
    
    // Кликваме върху бутона за повторно изпращане
    await user.click(screen.getByText(/изпрати отново/i));
    
    // Проверка за съобщение за грешка
    await waitFor(() => {
      expect(screen.getByText(/не успяхме да изпратим имейл за потвърждение/i)).toBeInTheDocument();
    });
  });
  
  it('показва съобщение за грешка при изключение', async () => {
    // Мокваме грешка
    const resendError = new Error('Възникна грешка при изпращане');
    authMock.resendVerification.mockRejectedValueOnce(resendError);
    
    render(<EmailVerificationNotice email={emailProp} />);
    const user = setupUserEvent();
    
    // Кликваме върху бутона за повторно изпращане
    await user.click(screen.getByText(/изпрати отново/i));
    
    // Проверка за съобщение за грешка
    await waitFor(() => {
      expect(screen.getByText(/възникна грешка при изпращане/i)).toBeInTheDocument();
    });
  });
  
  it('деактивира бутона за повторно изпращане по време на заявката', async () => {
    // Симулираме забавяне в отговора
    authMock.resendVerification.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 100);
      });
    });
    
    render(<EmailVerificationNotice email={emailProp} />);
    const user = setupUserEvent();
    
    // Намираме бутона
    const resendButton = screen.getByText(/изпрати отново/i);
    
    // Кликваме върху бутона
    await user.click(resendButton);
    
    // Бутонът трябва да е деактивиран по време на заявката
    expect(resendButton.closest('button')).toHaveAttribute('disabled');
    
    // След приключване на заявката, бутонът трябва да е активен отново
    await waitFor(() => {
      expect(resendButton.closest('button')).not.toHaveAttribute('disabled');
    });
  });
  
  it('има линк към страницата за вход', () => {
    render(<EmailVerificationNotice email={emailProp} />);
    
    // Проверка за линк към страницата за вход
    const loginLink = screen.getByText(/към страницата за вход/i);
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});