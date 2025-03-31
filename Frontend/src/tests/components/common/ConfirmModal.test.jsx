import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderUI, setupUserEvent } from '../../test-utils.jsx';
import ConfirmModal from '../../../components/common/ConfirmModal';

// Мокване на портала за React
vi.mock('react-dom', async () => {
  const originalModule = await vi.importActual('react-dom');
  return {
    ...originalModule,
    createPortal: (node) => node,
  };
});

describe('ConfirmModal компонент', () => {
  let onClose;
  let onConfirm;
  
  beforeEach(() => {
    // Създаваме mock функции преди всеки тест
    onClose = vi.fn();
    onConfirm = vi.fn();
    
    // Добавяме div елемент за портал
    const portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(portalRoot);
  });
  
  afterEach(() => {
    // Изчистваме мок функциите
    vi.clearAllMocks();
    
    // Премахваме портала
    const portalRoot = document.getElementById('modal-root');
    if (portalRoot) {
      document.body.removeChild(portalRoot);
    }
    
    // Възстановяваме overflow на body
    document.body.style.overflow = '';
  });

  it('не рендерира модал, когато isOpen е false', () => {
    renderUI(
      <ConfirmModal
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
      />
    );
    
    expect(screen.queryByText('Тестов модал')).not.toBeInTheDocument();
  });
  
  it('рендерира модал с правилно съдържание, когато isOpen е true', () => {
    renderUI(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
      />
    );
    
    expect(screen.getByText('Тестов модал')).toBeInTheDocument();
    expect(screen.getByText('Тестово съобщение')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /потвърди/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /отказ/i })).toBeInTheDocument();
  });
  
  it('прилага персонализирани текстове за бутоните', () => {
    renderUI(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
        confirmText="Изтрий"
        cancelText="Запази"
      />
    );
    
    expect(screen.getByRole('button', { name: 'Изтрий' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Запази' })).toBeInTheDocument();
  });
  
  it('показва правилната икона според типа на модала', () => {
    const { rerender } = renderUI(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Предупреждение"
        message="Внимание!"
        type="warning"
      />
    );
    
    // Проверяваме иконата за тип warning
    expect(document.querySelector('.fa-exclamation-triangle')).toBeInTheDocument();
    
    // Променяме типа на danger
    rerender(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Опасност"
        message="Внимание!"
        type="danger"
      />
    );
    
    // Проверяваме иконата за тип danger
    expect(document.querySelector('.fa-trash-alt, .fa-exclamation-circle')).toBeInTheDocument();
    
    // Променяме типа на info
    rerender(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Информация"
        message="Внимание!"
        type="info"
      />
    );
    
    // Проверяваме иконата за тип info
    expect(document.querySelector('.fa-info-circle')).toBeInTheDocument();
  });
  
  it('извиква onClose когато бутонът за отказ е натиснат', async () => {
    renderUI(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
      />
    );
    
    const user = setupUserEvent();
    const cancelButton = screen.getByRole('button', { name: /отказ/i });
    
    await user.click(cancelButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
  
  it('извиква onConfirm и onClose когато бутонът за потвърждение е натиснат', async () => {
    renderUI(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
      />
    );
    
    const user = setupUserEvent();
    const confirmButton = screen.getByRole('button', { name: /потвърди/i });
    
    await user.click(confirmButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  
  it('извиква onClose когато бутонът за затваряне е натиснат', async () => {
    renderUI(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
      />
    );
    
    const user = setupUserEvent();
    // Намираме бутона за затваряне (обикновено има aria-label="Close" или подобен атрибут)
    const closeButton = screen.getByRole('button', { name: /затвори|close/i });
    
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
  
  it('извиква onClose при натискане на клавиш Escape', () => {
    renderUI(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
      />
    );
    
    // Симулираме натискане на Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  
  it('прилага overflow: hidden към body когато модалът е отворен', () => {
    renderUI(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
      />
    );
    
    expect(document.body.style.overflow).toBe('hidden');
  });
  
  it('възстановява оригиналния overflow на body когато модалът е затворен', () => {
    // Задаваме първоначален стил
    document.body.style.overflow = 'auto';
    
    const { rerender } = renderUI(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
      />
    );
    
    expect(document.body.style.overflow).toBe('hidden');
    
    // Затваряме модала
    rerender(
      <ConfirmModal
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
      />
    );
    
    expect(document.body.style.overflow).toBe('auto');
  });
  
  it('извиква onClose при клик извън модала', async () => {
    renderUI(
      <ConfirmModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="Тестов модал"
        message="Тестово съобщение"
      />
    );
    
    // Намираме заглавието и после се качваме нагоре до overlay контейнера
    const title = screen.getByText('Тестов модал');
    // modalContent е два родителя нагоре от заглавието (h3 -> div.modalHeader -> div.modalContent)
    const modalContent = title.parentElement.parentElement;
    // overlay е родителят на modalContent
    const overlay = modalContent.parentElement;
    
    // Симулираме клик върху overlay елемента
    fireEvent.click(overlay);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});