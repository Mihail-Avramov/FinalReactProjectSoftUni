import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderUI, setupUserEvent } from '../../test-utils.jsx';
import Pagination from '../../../components/common/Pagination';

describe('Pagination компонент', () => {
  // Основни тестове за структура и видимост
  it('не рендерира пагинация, когато има само 1 страница', () => {
    const { container } = renderUI(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );
    
    expect(container.firstChild).toBeNull();
  });
  
  it('рендерира пагинация с правилна структура', () => {
    renderUI(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );
    
    // Проверяваме общата структура
    const pagination = document.querySelector('.pagination');
    expect(pagination).toBeInTheDocument();
    
    // Проверяваме бутоните за страници
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    
    // Проверяваме навигационните бутони
    expect(screen.getByTitle('Предишна страница')).toBeInTheDocument();
    expect(screen.getByTitle('Следваща страница')).toBeInTheDocument();
  });
  
  // Тестове за различни сценарии на пагинация
  it('показва всички страници, когато са 5 или по-малко', () => {
    renderUI(
      <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
    );
    
    // Проверяваме дали всички бутони за страници са показани
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    
    // Не трябва да има многоточие
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });
  
  it('показва многоточие при много страници', () => {
    renderUI(
      <Pagination currentPage={5} totalPages={10} onPageChange={() => {}} />
    );
    
    // Трябва да показва: 1 ... 4 5 6 ... 10
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    
    // Трябва да има и двете многоточия
    const ellipses = screen.getAllByText('...');
    expect(ellipses).toHaveLength(2);
  });
  
  it('показва правилен диапазон за началните страници', () => {
    renderUI(
      <Pagination currentPage={2} totalPages={10} onPageChange={() => {}} />
    );
    
    // Трябва да показва: 1 2 3 ... 10
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    
    // Трябва да има само крайно многоточие
    const ellipses = screen.getAllByText('...');
    expect(ellipses).toHaveLength(1);
  });
  
  it('показва правилен диапазон за крайните страници', () => {
    renderUI(
      <Pagination currentPage={9} totalPages={10} onPageChange={() => {}} />
    );
    
    // Трябва да показва: 1 ... 8 9 10
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '9' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    
    // Трябва да има само начално многоточие
    const ellipses = screen.getAllByText('...');
    expect(ellipses).toHaveLength(1);
  });
  
  // Тестове за състояния на бутоните и интеракции
  it('прилага active клас за текущата страница', () => {
    renderUI(
      <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
    );
    
    const currentPageButton = screen.getByRole('button', { name: '3' });
    expect(currentPageButton).toHaveClass('active');
    expect(currentPageButton).toBeDisabled();
  });
  
  it('деактивира бутона за предишна страница, когато е на първа страница', () => {
    renderUI(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );
    
    const prevButton = screen.getByTitle('Предишна страница');
    expect(prevButton).toBeDisabled();
  });
  
  it('деактивира бутона за следваща страница, когато е на последна страница', () => {
    renderUI(
      <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
    );
    
    const nextButton = screen.getByTitle('Следваща страница');
    expect(nextButton).toBeDisabled();
  });
  
  // Тестове за функционалност на callback
  it('извиква onPageChange с правилната страница при клик на бутон', async () => {
    const handlePageChange = vi.fn();
    renderUI(
      <Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />
    );
    
    const user = setupUserEvent();
    await user.click(screen.getByRole('button', { name: '4' }));
    
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });
  
  it('извиква onPageChange с предишната страница при клик на бутона за назад', async () => {
    const handlePageChange = vi.fn();
    renderUI(
      <Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />
    );
    
    const user = setupUserEvent();
    await user.click(screen.getByTitle('Предишна страница'));
    
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
  
  it('извиква onPageChange със следващата страница при клик на бутона за напред', async () => {
    const handlePageChange = vi.fn();
    renderUI(
      <Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />
    );
    
    const user = setupUserEvent();
    await user.click(screen.getByTitle('Следваща страница'));
    
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });
});