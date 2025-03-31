import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderUI, setupUserEvent } from '../../test-utils.jsx';
import FormInput from '../../../components/common/FormInput';

describe('FormInput компонент', () => {
  let user;
  
  beforeEach(() => {
    user = setupUserEvent();
  });

  it('рендерира входно поле с етикет', () => {
    renderUI(
      <FormInput 
        label="Потребителско име" 
        name="username" 
      />
    );
    
    expect(screen.getByLabelText('Потребителско име')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'username');
  });
  
  it('показва звездичка за задължителни полета', () => {
    renderUI(
      <FormInput 
        label="Потребителско име" 
        name="username" 
        required 
      />
    );
    
    const requiredMark = screen.getByText('*');
    expect(requiredMark).toBeInTheDocument();
    expect(requiredMark).toHaveClass('required-mark');
  });
  
  it('извиква onChange при промяна на стойността', async () => {
    const handleChange = vi.fn();
    renderUI(
      <FormInput 
        label="Потребителско име" 
        name="username" 
        onChange={handleChange} 
      />
    );
    
    const input = screen.getByLabelText('Потребителско име');
    await user.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalled();
  });
  
  it('извиква onBlur когато полето загуби фокус', async () => {
    const handleBlur = vi.fn();
    renderUI(
      <FormInput 
        label="Email" 
        name="email" 
        onBlur={handleBlur} 
      />
    );
    
    const input = screen.getByLabelText('Email');
    await user.click(input);
    await user.tab(); // Преместване на фокуса извън полето
    
    expect(handleBlur).toHaveBeenCalled();
  });
  
  it('показва съобщение за грешка когато има error', () => {
    renderUI(
      <FormInput 
        label="Email" 
        name="email" 
        error="Невалиден имейл адрес" 
      />
    );
    
    expect(screen.getByText('Невалиден имейл адрес')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveClass('is-invalid');
  });
  
  it('показва икона за валидно поле когато status е valid', () => {
    renderUI(
      <FormInput 
        label="Email" 
        name="email" 
        status="valid" 
      />
    );
    
    const checkIcon = document.querySelector('.fa-check-circle');
    expect(checkIcon).toBeInTheDocument();
  });
  
  it('показва икона за грешка когато има error', () => {
    renderUI(
      <FormInput 
        label="Email" 
        name="email" 
        error="Невалиден имейл адрес" 
      />
    );
    
    const errorIcon = document.querySelector('.fa-exclamation-circle');
    expect(errorIcon).toBeInTheDocument();
  });
  
  it('показва и скрива паролата при натискане на иконата', async () => {
    renderUI(
      <FormInput 
        label="Парола" 
        name="password" 
        type="password" 
      />
    );
    
    const input = screen.getByLabelText('Парола');
    expect(input).toHaveAttribute('type', 'password');
    
    const eyeIcon = document.querySelector('.fa-eye');
    expect(eyeIcon).toBeInTheDocument();
    
    // Кликваме върху иконата за показване на паролата
    const passwordToggle = document.querySelector('.input-icon');
    await user.click(passwordToggle);
    
    // Сега паролата трябва да е видима
    expect(input).toHaveAttribute('type', 'text');
    
    // Иконата трябва да се е променила
    const eyeSlashIcon = document.querySelector('.fa-eye-slash');
    expect(eyeSlashIcon).toBeInTheDocument();
  });
  
  it('показва брояч на символи когато characterCounter е true', () => {
    renderUI(
      <FormInput 
        label="Коментар" 
        name="comment" 
        maxLength={100} 
        value="Тестов коментар" 
        characterCounter 
      />
    );
    
    // Използваме regex pattern за по-гъвкаво търсене
    const counterElement = screen.getByText(/15\/100/);
    expect(counterElement).toBeInTheDocument();
  });
  
  it('променя цвета на брояча когато наближаваме лимита', () => {
    // Дълъг текст, близко до лимита (91 символа от 100)
    const longText = 'а'.repeat(91);
    
    renderUI(
      <FormInput 
        label="Коментар" 
        name="comment" 
        maxLength={100} 
        value={longText}
        characterCounter 
      />
    );
    
    // Проверяваме самия counter елемент, а не неговия родител
    const counterElement = screen.getByText(/91\/100/);
    expect(counterElement).toHaveClass('text-warning');
  });
  
  it('е неактивно когато disabled е true', () => {
    renderUI(
      <FormInput 
        label="Потребителско име" 
        name="username" 
        disabled 
      />
    );
    
    expect(screen.getByLabelText('Потребителско име')).toBeDisabled();
  });
  
  it('поддържа различни типове полета', () => {
    renderUI(
      <FormInput 
        label="Възраст" 
        name="age" 
        type="number" 
        min={18} 
        max={100} 
      />
    );
    
    const input = screen.getByLabelText('Възраст');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '18');
    expect(input).toHaveAttribute('max', '100');
  });
  
  it('приема placeholder', () => {
    renderUI(
      <FormInput 
        label="Търсене" 
        name="search" 
        placeholder="Въведете текст за търсене..." 
      />
    );
    
    expect(screen.getByPlaceholderText('Въведете текст за търсене...')).toBeInTheDocument();
  });
  
  it('приема и прилага допълнителен className', () => {
    renderUI(
      <FormInput 
        label="Име" 
        name="name" 
        className="custom-class" 
      />
    );
    
    // Проверяваме дали контейнерът съдържа допълнителния клас
    const formGroup = document.querySelector('.form-group');
    expect(formGroup).toHaveClass('custom-class');
  });
  
  it('приема допълнителни props', () => {
    renderUI(
      <FormInput 
        label="Код" 
        name="code" 
        data-testid="code-input"
        autoComplete="off"
        pattern="[0-9]{4}" 
      />
    );
    
    const input = screen.getByTestId('code-input');
    expect(input).toHaveAttribute('pattern', '[0-9]{4}');
    expect(input).toHaveAttribute('autoComplete', 'off');
  });
  
  it('задава подходящи autoComplete атрибути за специални типове полета', () => {
    // Тест за password поле
    renderUI(<FormInput name="password" type="password" label="Парола" />);
    expect(screen.getByLabelText('Парола')).toHaveAttribute('autoComplete', 'new-password');
    
    // Тест за email поле
    renderUI(<FormInput name="email" type="email" label="Имейл" />);
    expect(screen.getByLabelText('Имейл')).toHaveAttribute('autoComplete', 'email');
  });
  
  it('генерира уникален id когато не е подадено name', () => {
    renderUI(<FormInput label="Без име" />);
    
    const label = screen.getByText('Без име');
    const inputId = label.getAttribute('for');
    
    expect(inputId).toMatch(/input-[a-z0-9]+/);
    expect(document.getElementById(inputId)).toBeInTheDocument();
  });
});