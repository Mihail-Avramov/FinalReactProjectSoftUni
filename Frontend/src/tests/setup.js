import { expect, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as jestDomMatchers from '@testing-library/jest-dom';

// Създаваме обединен списък с шаблони за игнориране за console.error и console.warn
const ignoredPatterns = [
  /Warning.*not wrapped in act/,
  /Warning.*update during an existing state transition/,
  /Warning.*received.*after component unmounted/,
  /Warning.*You provided a `value` prop to a form field/,
  /Error fetching data/,
  /API Error/,
  /Network error/,
  /Failed to load/
];

// Съхраняваме оригиналните функции
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Заглушаване на предупреждения и грешки
console.error = (...args) => {
  const message = String(args[0] || '');
  if (ignoredPatterns.some(pattern => pattern.test(message))) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  const message = String(args[0] || '');
  if (ignoredPatterns.some(pattern => pattern.test(message))) {
    return;
  }
  originalConsoleWarn(...args);
};

// Добавяне на custom matchers
expect.extend(jestDomMatchers);

// Почистване след всеки тест
afterEach(() => {
  cleanup();
});

// Връщаме оригиналните функции след тестовете
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});