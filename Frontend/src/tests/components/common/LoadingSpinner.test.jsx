import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderUI } from '../../test-utils.jsx';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';

describe('LoadingSpinner компонент', () => {
  it('рендерира се правилно с подразбиращото се съобщение', () => {
    const { container } = renderUI(<LoadingSpinner />);
    
    // Проверка дали съобщението по подразбиране се рендерира
    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    
    // Проверка за наличие на spinner елемент
    const spinnerElement = container.querySelector('div > div > div');
    expect(spinnerElement).toBeInTheDocument();
  });
  
  it('рендерира се с персонализирано съобщение', () => {
    renderUI(<LoadingSpinner message="Моля, изчакайте..." />);
    
    // Проверка дали персонализираното съобщение се рендерира
    expect(screen.getByText('Моля, изчакайте...')).toBeInTheDocument();
  });
  
  it('има правилната структура', () => {
    const { container } = renderUI(<LoadingSpinner />);
    
    // Прототипна структура: div > div > (div + p)
    const rootDiv = container.firstChild;
    expect(rootDiv.tagName).toBe('DIV');
    
    const overlayDiv = rootDiv.firstChild;
    expect(overlayDiv.tagName).toBe('DIV');
    
    // Проверка за spinner и съобщение
    expect(overlayDiv.children[0].tagName).toBe('DIV'); // spinner
    expect(overlayDiv.children[1].tagName).toBe('P');   // message
    expect(overlayDiv.children[1].textContent).toBe('Зареждане...');
  });
  
  it('запазва съобщението когато се променя', () => {
    const { rerender } = renderUI(<LoadingSpinner message="Първоначално съобщение" />);
    expect(screen.getByText('Първоначално съобщение')).toBeInTheDocument();
    
    // Промяна на съобщението с rerender
    rerender(<LoadingSpinner message="Ново съобщение" />);
    expect(screen.getByText('Ново съобщение')).toBeInTheDocument();
  });
});