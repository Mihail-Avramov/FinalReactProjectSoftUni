import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, fireEvent, cleanup } from '@testing-library/react';
import { renderUI } from '../../test-utils.jsx';
import Alert from '../../../components/common/Alert';

// Автоматично почистване след всеки тест
afterEach(cleanup);

describe('Alert компонент', () => {
  it('рендерира съобщение', () => {
    renderUI(
      <Alert>Тестово съобщение</Alert>
    );
    
    expect(screen.getByText('Тестово съобщение')).toBeInTheDocument();
  });
  
  it('прилага правилния клас според type', () => {
    renderUI(
      <Alert type="error">Грешка</Alert>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-error');
  });
  
  // Разделяме големия тест на отделни по-малки тестове за всеки тип алерт
  it('прилага success тип и показва правилната икона', () => {
    renderUI(<Alert type="success">Успех</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert-success');
    expect(document.querySelector('.fa-check-circle')).toBeInTheDocument();
  });
  
  it('прилага error тип и показва правилната икона', () => {
    renderUI(<Alert type="error">Грешка</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert-error');
    expect(document.querySelector('.fa-exclamation-circle')).toBeInTheDocument();
  });
  
  it('прилага warning тип и показва правилната икона', () => {
    renderUI(<Alert type="warning">Предупреждение</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert-warning');
    expect(document.querySelector('.fa-exclamation-triangle')).toBeInTheDocument();
  });
  
  it('прилага info тип (по подразбиране) и показва правилната икона', () => {
    renderUI(<Alert>Информация</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert-info');
    expect(document.querySelector('.fa-info-circle')).toBeInTheDocument();
  });
  
  it('прилага danger тип и показва правилната икона', () => {
    renderUI(<Alert type="danger">Опасност</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert-danger');
    expect(document.querySelector('.fa-exclamation-circle')).toBeInTheDocument();
  });
  
  it('не показва бутон за затваряне по подразбиране', () => {
    renderUI(
      <Alert>Съобщение без затваряне</Alert>
    );
    
    const closeButton = screen.queryByRole('button', { name: /close/i });
    expect(closeButton).not.toBeInTheDocument();
  });
  
  it('показва бутон за затваряне когато dismissible е true', () => {
    renderUI(
      <Alert dismissible onDismiss={() => {}}>Съобщение със затваряне</Alert>
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });
  
  it('извиква onDismiss когато е кликнат бутона за затваряне', async () => {
    const handleDismiss = vi.fn();
    renderUI(
      <Alert dismissible onDismiss={handleDismiss}>Затвори ме</Alert>
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
  
  it('не добавя клас alert-dismissible когато dismissible е false', () => {
    renderUI(
      <Alert>Обикновено съобщение</Alert>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).not.toHaveClass('alert-dismissible');
  });
  
  it('добавя клас alert-dismissible когато dismissible е true', () => {
    renderUI(
      <Alert dismissible onDismiss={() => {}}>Съобщение за затваряне</Alert>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('alert-dismissible');
  });
  
  it('приема и прилага допълнителен className', () => {
    renderUI(
      <Alert className="custom-class test-class">Съобщение с класове</Alert>
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('custom-class');
    expect(alert).toHaveClass('test-class');
  });
  
  it('показва иконата в правилния контейнер', () => {
    renderUI(
      <Alert type="success">Успешно съобщение</Alert>
    );
    
    const iconContainer = document.querySelector('.alert-icon');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer.querySelector('.fa-check-circle')).toBeInTheDocument();
  });
  
  it('рендерира съдържанието в правилния контейнер', () => {
    renderUI(
      <Alert>
        <p>Параграф в съобщението</p>
        <span>Допълнителен текст</span>
      </Alert>
    );
    
    const messageContainer = document.querySelector('.alert-message');
    expect(messageContainer).toBeInTheDocument();
    expect(messageContainer.querySelector('p')).toBeInTheDocument();
    expect(messageContainer.querySelector('span')).toBeInTheDocument();
  });
  
  it('запазва структурата на alert-content', () => {
    renderUI(
      <Alert>Тестово съобщение</Alert>
    );
    
    const contentContainer = document.querySelector('.alert-content');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer.children.length).toBe(2); // icon + message
    expect(contentContainer.querySelector('.alert-icon')).toBeInTheDocument();
    expect(contentContainer.querySelector('.alert-message')).toBeInTheDocument();
  });
});