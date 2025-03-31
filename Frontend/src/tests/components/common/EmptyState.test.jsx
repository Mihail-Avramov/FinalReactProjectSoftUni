import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderUI, setupUserEvent } from '../../test-utils.jsx';
import EmptyState from '../../../components/common/EmptyState';

describe('EmptyState компонент', () => {
  it('рендерира съобщение', () => {
    renderUI(
      <EmptyState message="Няма намерени резултати" />
    );
    
    expect(screen.getByText('Няма намерени резултати')).toBeInTheDocument();
  });
  
  it('рендерира иконата по подразбиране', () => {
    renderUI(
      <EmptyState message="Няма данни" />
    );
    
    const icon = document.querySelector('.fa-info-circle');
    expect(icon).toBeInTheDocument();
  });
  
  it('рендерира персонализирана икона', () => {
    renderUI(
      <EmptyState 
        message="Няма съобщения" 
        icon="envelope" 
      />
    );
    
    const icon = document.querySelector('.fa-envelope');
    expect(icon).toBeInTheDocument();
  });
  
  it('не рендерира бутон за действие по подразбиране', () => {
    renderUI(
      <EmptyState message="Празно състояние" />
    );
    
    const actionButton = screen.queryByRole('button');
    expect(actionButton).not.toBeInTheDocument();
  });
  
  it('рендерира бутон за действие когато е предоставен action', async () => {
    const handleAction = vi.fn();
    
    renderUI(
      <EmptyState 
        message="Грешка при зареждане" 
        action={handleAction} 
      />
    );
    
    const actionButton = screen.getByRole('button', { name: 'Опитайте отново' });
    expect(actionButton).toBeInTheDocument();
    
    const user = setupUserEvent();
    await user.click(actionButton);
    
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
  
  it('персонализира текста на бутона за действие', () => {
    renderUI(
      <EmptyState 
        message="Няма продукти" 
        action={() => {}} 
        actionText="Добави продукт" 
      />
    );
    
    const actionButton = screen.getByRole('button', { name: 'Добави продукт' });
    expect(actionButton).toBeInTheDocument();
  });
  
  it('рендерира допълнително съдържание като children', () => {
    renderUI(
      <EmptyState message="Няма резултати">
        <p>Опитайте с различни критерии за търсене</p>
        <a href="/help">Помощ</a>
      </EmptyState>
    );
    
    expect(screen.getByText('Опитайте с различни критерии за търсене')).toBeInTheDocument();
    expect(screen.getByText('Помощ')).toBeInTheDocument();
  });
  
  it('прилага правилните CSS класове на елементите', () => {
    renderUI(
      <EmptyState 
        message="Тестово съобщение" 
        action={() => {}}
      />
    );
    
    // Проверка на главния контейнер
    const container = document.querySelector('.empty-state');
    expect(container).toBeInTheDocument();
    
    // Проверка на контейнера на иконата
    const iconContainer = document.querySelector('.empty-state-icon');
    expect(iconContainer).toBeInTheDocument();
    
    // Проверка на съобщението
    const message = document.querySelector('.empty-state-message');
    expect(message).toBeInTheDocument();
    expect(message.textContent).toBe('Тестово съобщение');
    
    // Проверка на бутона
    const button = document.querySelector('.empty-state-action-btn');
    expect(button).toBeInTheDocument();
  });
  
  it('има правилната структура на компонента', () => {
    const { container } = renderUI(
      <EmptyState 
        message="Структурен тест" 
        action={() => {}} 
        actionText="Действие"
      >
        <span>Допълнително съдържание</span>
      </EmptyState>
    );
    
    const emptyState = container.querySelector('.empty-state');
    
    // Проверяваме реда на елементите в компонента
    expect(emptyState.children[0]).toHaveClass('empty-state-icon');
    expect(emptyState.children[1]).toHaveClass('empty-state-message');
    expect(emptyState.children[2]).toHaveClass('empty-state-content');
    expect(emptyState.children[3]).toHaveClass('empty-state-action-btn');
    
    // Проверяваме children съдържанието
    const childContent = emptyState.querySelector('.empty-state-content');
    expect(childContent.textContent).toBe('Допълнително съдържание');
  });
});