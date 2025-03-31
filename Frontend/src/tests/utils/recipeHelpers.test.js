import { describe, it, expect } from 'vitest';
import { 
  getCategoryLabel, 
  getCategoryIcon, 
  getDifficultyLabel 
} from '../../utils/recipeHelpers';

describe('getCategoryLabel функция', () => {
  it('връща правилния етикет за категория закуска', () => {
    expect(getCategoryLabel('breakfast')).toBe('Закуска');
  });

  it('връща правилния етикет за категория обяд', () => {
    expect(getCategoryLabel('lunch')).toBe('Обяд');
  });

  it('връща правилния етикет за категория вечеря', () => {
    expect(getCategoryLabel('dinner')).toBe('Вечеря');
  });

  it('връща правилния етикет за категория десерт', () => {
    expect(getCategoryLabel('dessert')).toBe('Десерт');
  });

  it('връща етикет по подразбиране за непознати категории', () => {
    expect(getCategoryLabel('unknown')).toBe('Други');
  });

  it('връща етикет по подразбиране за празна категория', () => {
    expect(getCategoryLabel('')).toBe('Други');
  });

  it('връща етикет по подразбиране за неопределена категория', () => {
    expect(getCategoryLabel(undefined)).toBe('Други');
  });
});

describe('getCategoryIcon функция', () => {
  it('връща правилната икона за категория закуска', () => {
    expect(getCategoryIcon('breakfast')).toBe('🍳');
  });

  it('връща правилната икона за категория обяд', () => {
    expect(getCategoryIcon('lunch')).toBe('🥗');
  });

  it('връща правилната икона за категория напитки', () => {
    expect(getCategoryIcon('beverage')).toBe('🍹');
  });

  it('връща икона по подразбиране за непознати категории', () => {
    expect(getCategoryIcon('unknown')).toBe('🍽️');
  });

  it('връща икона по подразбиране за празна категория', () => {
    expect(getCategoryIcon('')).toBe('🍽️');
  });

  it('връща икона по подразбиране за неопределена категория', () => {
    expect(getCategoryIcon(undefined)).toBe('🍽️');
  });
});

describe('getDifficultyLabel функция', () => {
  it('връща правилния етикет за лесна сложност', () => {
    expect(getDifficultyLabel('easy')).toBe('Лесно');
  });

  it('връща правилния етикет за средна сложност', () => {
    expect(getDifficultyLabel('medium')).toBe('Средно');
  });

  it('връща правилния етикет за трудна сложност', () => {
    expect(getDifficultyLabel('hard')).toBe('Сложно');
  });

  it('връща етикет по подразбиране за непозната сложност', () => {
    expect(getDifficultyLabel('expert')).toBe('Неизвестно');
  });

  it('връща етикет по подразбиране за празна сложност', () => {
    expect(getDifficultyLabel('')).toBe('Неизвестно');
  });

  it('връща етикет по подразбиране за неопределена сложност', () => {
    expect(getDifficultyLabel(undefined)).toBe('Неизвестно');
  });
});