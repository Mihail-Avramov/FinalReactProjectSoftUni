import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ScrollToTop from '../../../components/common/ScrollToTop';
import { useLocation } from 'react-router-dom';

// Мокваме react-router-dom с mockImplementation, която можем да променяме
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn().mockImplementation(() => ({ pathname: '/initial-path' }))
}));

describe('ScrollToTop компонент', () => {
  // Създаваме мок на window.scrollTo
  const scrollToMock = vi.fn();
  
  beforeEach(() => {
    // Заместваме scrollTo с нашия мок
    window.scrollTo = scrollToMock;
    
    // Ресетваме броячите на извикванията на мока
    scrollToMock.mockClear();
    
    // Връщаме мока на useLocation към първоначалната стойност
    useLocation.mockImplementation(() => ({ pathname: '/initial-path' }));
  });
  
  afterEach(() => {
    // Възстановяваме оригиналните методи
    vi.restoreAllMocks();
  });
  
  it('не рендерира никакви видими елементи', () => {
    const { container } = render(<ScrollToTop />);
    expect(container.firstChild).toBeNull();
  });
  
  it('извиква window.scrollTo при монтиране', () => {
    render(<ScrollToTop />);
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
    expect(scrollToMock).toHaveBeenCalledTimes(1);
  });
  
  it('извиква window.scrollTo при промяна на pathname', () => {
    // Първо рендерираме с първоначалния path
    const { rerender } = render(<ScrollToTop />);
    expect(scrollToMock).toHaveBeenCalledTimes(1);
    
    // Променяме мока на useLocation с нов път
    useLocation.mockImplementation(() => ({ pathname: '/new-path' }));
    
    // Ререндерираме компонента
    rerender(<ScrollToTop />);
    
    // Проверяваме дали scrollTo е бил извикан отново
    expect(scrollToMock).toHaveBeenCalledTimes(2);
    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
  });
});