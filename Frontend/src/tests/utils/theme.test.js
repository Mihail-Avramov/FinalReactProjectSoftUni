import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  CATEGORIES, 
  DIFFICULTY,
  formatTime,
  isDarkMode,
  setupScrollAnimation
} from '../../utils/theme';

describe('CATEGORIES константа', () => {
  it('съдържа очакваните ключове на категориите', () => {
    const expectedKeys = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage', 'other'];
    expect(Object.keys(CATEGORIES)).toEqual(expect.arrayContaining(expectedKeys));
  });

  it('има правилна структура за всяка категория', () => {
    Object.values(CATEGORIES).forEach(category => {
      expect(category).toHaveProperty('icon');
      expect(category).toHaveProperty('label');
      expect(typeof category.icon).toBe('string');
      expect(typeof category.label).toBe('string');
    });
  });
});

describe('DIFFICULTY константа', () => {
  it('съдържа очакваните нива на трудност', () => {
    const expectedLevels = ['easy', 'medium', 'hard'];
    expect(Object.keys(DIFFICULTY)).toEqual(expect.arrayContaining(expectedLevels));
  });

  it('има правилна структура за всяко ниво на трудност', () => {
    Object.values(DIFFICULTY).forEach(level => {
      expect(level).toHaveProperty('label');
      expect(level).toHaveProperty('color');
      expect(typeof level.label).toBe('string');
      expect(typeof level.color).toBe('string');
    });
  });
});

describe('formatTime функция', () => {
  it('форматира секунди в минути:секунди правилно', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(120)).toBe('2:00');
    expect(formatTime(3661)).toBe('61:01'); // 1 час, 1 минута, 1 секунда
  });

  it('добавя водеща нула към секундите, когато е необходимо', () => {
    expect(formatTime(61)).toBe('1:01');
    expect(formatTime(70)).toBe('1:10');
  });

  it('връща правилна стойност за нула', () => {
    expect(formatTime(0)).toBe('0:00');
  });
});

describe('isDarkMode функция', () => {
  let originalMatchMedia;
  
  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });
  
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });
  
  it('връща true, когато тъмният режим е предпочитан', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
    }));
    
    expect(isDarkMode()).toBe(true);
  });
  
  it('връща false, когато тъмният режим не е предпочитан', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
    }));
    
    expect(isDarkMode()).toBe(false);
  });
  
  it('връща false, когато matchMedia не е налично', () => {
    window.matchMedia = undefined;
    
    expect(isDarkMode()).toBe(false);
  });
});

describe('setupScrollAnimation функция', () => {
  let mockObserve;
  let mockDisconnect;
  let originalIntersectionObserver;
  let mockElements;
  
  beforeEach(() => {
    mockObserve = vi.fn();
    mockDisconnect = vi.fn();
    mockElements = [
      { classList: { add: vi.fn() } },
      { classList: { add: vi.fn() } }
    ];
    
    originalIntersectionObserver = window.IntersectionObserver;
    
    window.IntersectionObserver = vi.fn().mockImplementation(callback => {
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
        callback
      };
    });
    
    document.querySelectorAll = vi.fn().mockReturnValue(mockElements);
  });
  
  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
  });
  
  it('създава IntersectionObserver с правилен праг', () => {
    setupScrollAnimation();
    
    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.1 }
    );
  });
  
  it('наблюдава всички елементи с клас animate', () => {
    setupScrollAnimation();
    
    expect(document.querySelectorAll).toHaveBeenCalledWith('.animate');
    expect(mockObserve).toHaveBeenCalledTimes(mockElements.length);
  });
  
  it('добавя клас animate-in, когато елементът се пресича', () => {
    setupScrollAnimation();
    
    const observer = window.IntersectionObserver.mock.results[0].value;
    observer.callback([{ isIntersecting: true, target: mockElements[0] }]);
    
    expect(mockElements[0].classList.add).toHaveBeenCalledWith('animate-in');
  });
  
  it('не добавя клас animate-in, когато елементът не се пресича', () => {
    setupScrollAnimation();
    
    const observer = window.IntersectionObserver.mock.results[0].value;
    observer.callback([{ isIntersecting: false, target: mockElements[0] }]);
    
    expect(mockElements[0].classList.add).not.toHaveBeenCalled();
  });
});