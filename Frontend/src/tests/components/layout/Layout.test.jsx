import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import { AllProviders } from '../../mocks/TestProviders';
import Layout from '../../../components/layout/Layout';

// Мокваме Header и Footer компонентите
vi.mock('../../../components/layout/Header', () => ({
  default: () => <div data-testid="header-mock">Header Component</div>
}));

vi.mock('../../../components/layout/Footer', () => ({
  default: () => <div data-testid="footer-mock">Footer Component</div>
}));

describe('Layout компонент', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('рендерира Header, main секция и Footer', () => {
    render(
      <Layout>
        <div data-testid="content">Test Content</div>
      </Layout>,
      { wrapper: AllProviders }
    );
    
    // Проверяваме дали Header и Footer се рендерират
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
    
    // Проверяваме дали main елементът е рендериран
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    
    // Проверяваме дали children съдържанието е рендерирано правилно
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('прилага правилните CSS класове', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
      { wrapper: AllProviders }
    );
    
    // Проверяваме дали main елементът има клас, който започва с 'main'
    const mainElement = screen.getByRole('main');
    expect(mainElement.className).toMatch(/main/);
    
    // Проверяваме дали контейнерът има клас, който започва с 'app'
    const appContainer = mainElement.parentElement;
    expect(appContainer.className).toMatch(/app/);
  });
  
  it('предава съдържанието към main елемента', () => {
    render(
      <Layout>
        <h1>Заглавие</h1>
        <p>Параграф</p>
      </Layout>,
      { wrapper: AllProviders }
    );
    
    // Проверяваме дали съдържанието е предадено
    expect(screen.getByRole('heading', { level: 1, name: 'Заглавие' })).toBeInTheDocument();
    expect(screen.getByText('Параграф')).toBeInTheDocument();
  });
});