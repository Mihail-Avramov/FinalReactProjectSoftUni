import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import SEO from '../../../components/common/SEO';

describe('SEO компонент', () => {
  // Запазваме оригиналния document.title
  const originalTitle = document.title;
  
  beforeEach(() => {
    // Изчистваме мета таговете преди всеки тест
    Array.from(document.head.querySelectorAll('meta:not([charset]):not([name="viewport"])')).forEach(tag => {
      tag.remove();
    });
  });
  
  afterEach(() => {
    // Възстановяваме оригиналния title след всеки тест
    document.title = originalTitle;
    cleanup();
  });
  
  it('не рендерира видими елементи', () => {
    const { container } = render(<SEO title="Тестово заглавие" description="Тестово описание" />);
    expect(container.firstChild).toBeNull();
  });
  
  it('задава правилно заглавие на документа', () => {
    render(<SEO title="Тестово заглавие" />);
    expect(document.title).toBe('Тестово заглавие | Culinary Corner');
  });
  
  it('използва подразбиращо се заглавие, когато не е предоставено title', () => {
    render(<SEO />);
    expect(document.title).toBe('Culinary Corner - Вашият кулинарен свят');
  });
  
  it('създава мета тагове за description и keywords', () => {
    render(<SEO description="Тестово описание" keywords="ключова дума1, ключова дума2" />);
    
    const descriptionTag = document.querySelector('meta[name="description"]');
    const keywordsTag = document.querySelector('meta[name="keywords"]');
    
    expect(descriptionTag).not.toBeNull();
    expect(keywordsTag).not.toBeNull();
    expect(descriptionTag.getAttribute('content')).toBe('Тестово описание');
    expect(keywordsTag.getAttribute('content')).toBe('ключова дума1, ключова дума2');
  });
  
  it('създава Open Graph мета тагове', () => {
    render(
      <SEO 
        title="Тестово заглавие" 
        description="Тестово описание" 
        ogImage="/test-image.jpg" 
      />
    );
    
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    
    expect(ogTitleTag).not.toBeNull();
    expect(ogDescriptionTag).not.toBeNull();
    expect(ogImageTag).not.toBeNull();
    
    expect(ogTitleTag.getAttribute('content')).toBe('Тестово заглавие | Culinary Corner');
    expect(ogDescriptionTag.getAttribute('content')).toBe('Тестово описание');
    expect(ogImageTag.getAttribute('content')).toBe('/test-image.jpg');
  });
  
  it('създава Twitter мета тагове', () => {
    render(
      <SEO 
        title="Тестово заглавие" 
        description="Тестово описание" 
        ogImage="/test-image.jpg" 
      />
    );
    
    const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
    const twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
    const twitterImageTag = document.querySelector('meta[name="twitter:image"]');
    const twitterCardTag = document.querySelector('meta[name="twitter:card"]');
    
    expect(twitterTitleTag).not.toBeNull();
    expect(twitterDescriptionTag).not.toBeNull();
    expect(twitterImageTag).not.toBeNull();
    expect(twitterCardTag).not.toBeNull();
    
    expect(twitterTitleTag.getAttribute('content')).toBe('Тестово заглавие | Culinary Corner');
    expect(twitterDescriptionTag.getAttribute('content')).toBe('Тестово описание');
    expect(twitterImageTag.getAttribute('content')).toBe('/test-image.jpg');
    expect(twitterCardTag.getAttribute('content')).toBe('summary_large_image');
  });
  
  it('актуализира мета тагове при повторно рендериране', () => {
    const { rerender } = render(<SEO description="Първоначално описание" />);
    
    // Проверяваме началното състояние
    const initialDescriptionTag = document.querySelector('meta[name="description"]');
    expect(initialDescriptionTag.getAttribute('content')).toBe('Първоначално описание');
    
    // Ререндерираме с ново описание
    rerender(<SEO description="Ново описание" />);
    
    // Проверяваме дали тагът е актуализиран
    const updatedDescriptionTag = document.querySelector('meta[name="description"]');
    // Променяме очакването - не очакваме същия DOM елемент, а нов елемент със същото име
    expect(updatedDescriptionTag.getAttribute('content')).toBe('Ново описание');
  });
  
  it('премахва създадените мета тагове при размонтиране', () => {
    const { unmount } = render(<SEO description="Тестово описание" keywords="ключови думи" />);
    
    // Проверяваме дали таговете са създадени
    expect(document.querySelector('meta[name="description"]')).not.toBeNull();
    expect(document.querySelector('meta[name="keywords"]')).not.toBeNull();
    
    // Размонтираме компонента
    unmount();
    
    // Проверяваме дали таговете са премахнати
    expect(document.querySelector('meta[name="description"]')).toBeNull();
    expect(document.querySelector('meta[name="keywords"]')).toBeNull();
  });
});