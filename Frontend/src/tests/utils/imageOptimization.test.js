import { describe, it, expect } from 'vitest';
import { 
  validateImageSize, 
  validateImageFormat, 
  getFileExtension, 
  validateImage 
} from '../../utils/imageOptimization';

describe('validateImageSize функция', () => {
  it('връща true за файлове под лимита за размер', () => {
    const file = { size: 3 * 1024 * 1024 }; // 3MB
    expect(validateImageSize(file, 5)).toBe(true);
  });

  it('връща true за файлове точно на лимита за размер', () => {
    const file = { size: 5 * 1024 * 1024 }; // 5MB
    expect(validateImageSize(file, 5)).toBe(true);
  });

  it('връща false за файлове над лимита за размер', () => {
    const file = { size: 6 * 1024 * 1024 }; // 6MB
    expect(validateImageSize(file, 5)).toBe(false);
  });

  it('използва подразбиращия се лимит от 5MB, когато не е указан', () => {
    const file = { size: 6 * 1024 * 1024 }; // 6MB
    expect(validateImageSize(file)).toBe(false);
  });
});

describe('validateImageFormat функция', () => {
  it('връща true за jpg файлове', () => {
    const file = { type: 'image/jpg' };
    expect(validateImageFormat(file)).toBe(true);
  });

  it('връща true за jpeg файлове', () => {
    const file = { type: 'image/jpeg' };
    expect(validateImageFormat(file)).toBe(true);
  });

  it('връща true за png файлове', () => {
    const file = { type: 'image/png' };
    expect(validateImageFormat(file)).toBe(true);
  });

  it('връща true за webp файлове', () => {
    const file = { type: 'image/webp' };
    expect(validateImageFormat(file)).toBe(true);
  });

  it('връща false за неподдържани типове файлове', () => {
    const file = { type: 'image/gif' };
    expect(validateImageFormat(file)).toBe(false);
  });

  it('връща false за файлове, които не са изображения', () => {
    const file = { type: 'application/pdf' };
    expect(validateImageFormat(file)).toBe(false);
  });
});

describe('getFileExtension функция', () => {
  it('извлича разширението от просто име на файл', () => {
    expect(getFileExtension('снимка.jpg')).toBe('jpg');
  });

  it('извлича разширението от име на файл с няколко точки', () => {
    expect(getFileExtension('моя.лятна.снимка.png')).toBe('png');
  });

  it('връща разширението с малки букви', () => {
    expect(getFileExtension('ДОКУМЕНТ.PDF')).toBe('pdf');
  });

  it('обработва име на файл без разширение', () => {
    expect(getFileExtension('README')).toBe('readme');
  });
});

describe('validateImage функция', () => {
  it('връща valid true за null файлове (ако е незадължителен)', () => {
    const result = validateImage(null);
    expect(result.valid).toBe(true);
    expect(result.error).toBe(null);
  });

  it('връща грешка за формат за неподдържаните типове файлове', () => {
    const file = { type: 'image/gif', size: 1024 * 1024 };
    const result = validateImage(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Форматът на файла не е поддържан');
  });

  it('връща грешка за размер за файлове над лимита', () => {
    const file = { type: 'image/jpeg', size: 10 * 1024 * 1024 };
    const result = validateImage(file, { maxSizeMB: 5 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Размерът на файла трябва да бъде до 5MB');
  });

  it('връща valid true за файлове, отговарящи на всички критерии', () => {
    const file = { type: 'image/png', size: 2 * 1024 * 1024 };
    const result = validateImage(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBe(null);
  });
});