import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderUI, setupUserEvent } from '../../test-utils.jsx';
import Button from '../../../components/common/Button';

describe('Button компонент', () => {
  it('рендерира бутон с правилен текст', () => {
    renderUI(<Button>Текст на бутона</Button>);
    expect(screen.getByRole('button', { name: /текст на бутона/i })).toBeInTheDocument();
  });
  
  it('прилага правилните класове според variant', () => {
    renderUI(<Button variant="secondary">Вторичен бутон</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-secondary');
  });
  
  it('прилага правилните класове според size', () => {
    renderUI(<Button size="small">Малък бутон</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-small');
  });
  
  it('е неактивен когато disabled е true', () => {
    const handleClick = vi.fn();
    renderUI(
      <Button disabled onClick={handleClick}>
        Неактивен бутон
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    // Тъй като бутонът е неактивен, не е нужно да тестваме клик
    // Вместо userEvent, използваме fireEvent ако искаме да потвърдим, че
    // onClick не се извиква при клик на неактивен бутон
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
  
  it('показва спинър и е неактивен когато loading е true', () => {
    const handleClick = vi.fn();
    renderUI(
      <Button loading onClick={handleClick}>
        Зареждащ се бутон
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-loading');
    expect(button).toBeDisabled();
    
    // Проверка за наличие на спинър
    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    
    // Използваме fireEvent вместо userEvent за неактивни елементи
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
  
  it('извиква onClick функцията при клик', async () => {
    const handleClick = vi.fn();
    renderUI(<Button onClick={handleClick}>Кликни ме</Button>);
    
    const user = setupUserEvent();
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('може да бъде с различен тип (submit, reset)', () => {
    renderUI(<Button type="submit">Изпрати</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
  
  it('приема допълнителни props и атрибути', () => {
    renderUI(
      <Button data-testid="custom-button" aria-label="Специален бутон">
        Специален
      </Button>
    );
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Специален бутон');
  });
});