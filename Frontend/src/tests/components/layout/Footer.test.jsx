import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../../../components/layout/Footer';

describe('Footer компонент', () => {
  // Помощна функция за рендериране с MemoryRouter
  const renderFooter = () => {
    return render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
  };

  it('рендерира логото и основната информация', () => {
    renderFooter();
    
    // Проверяваме логото
    expect(screen.getByText('Culinary')).toBeInTheDocument();
    expect(screen.getByText('Corner')).toBeInTheDocument();
    
    // Проверяваме подзаглавието
    expect(screen.getByText('Вашият кулинарен пътеводител')).toBeInTheDocument();
    
    // Проверяваме авторското право
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(/©\s*\d{4}\s*CulinaryCorner/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${currentYear}.*CulinaryCorner`))).toBeInTheDocument();
  });

  it('съдържа заглавия на секциите', () => {
    renderFooter();
    
    // Проверяваме заглавията на секциите
    expect(screen.getByText('Навигация')).toBeInTheDocument();
    expect(screen.getByText('Полезни връзки')).toBeInTheDocument();
    
    // Проверяваме дали секцията "Последвайте ни" е налична 
    // (може да е видима само на десктоп версията, но трябва да е в DOM)
    const followUsHeading = screen.getAllByText('Последвайте ни');
    expect(followUsHeading.length).toBeGreaterThan(0);
  });

  it('отваря и затваря акордеон секции при кликване', async () => {
    renderFooter();
    
    const user = userEvent.setup();
    
    // Намираме секцията за навигация
    const navigationHeader = screen.getByText('Навигация');
    const navigationContent = navigationHeader.nextElementSibling;
    
    // Проверяваме дали не съдържа 'open' в името на класа първоначално
    expect(navigationContent.className).not.toMatch(/open/i);
    
    // Кликваме върху заглавието, за да отворим секцията
    await user.click(navigationHeader);
    
    // Проверяваме дали съдържа 'open' в името на класа след клика
    expect(navigationContent.className).toMatch(/open/i);
    
    // Кликваме отново и проверяваме дали се затваря
    await user.click(navigationHeader);
    expect(navigationContent.className).not.toMatch(/open/i);
  });

  it('съдържа правилните навигационни връзки', () => {
    renderFooter();
    
    // Отваряме секцията с навигация, като първо я намираме
    const navLinks = [
      { text: 'Начало', href: '/' },
      { text: 'Рецепти', href: '/recipes' },
      { text: 'Категории', href: '/categories' },
      { text: 'За нас', href: '/about' }
    ];
    
    // Проверяваме дали всички очаквани връзки съществуват
    navLinks.forEach(link => {
      const linkElement = screen.getByRole('link', { name: link.text });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', link.href);
    });
  });

  it('съдържа правилните полезни връзки', () => {
    renderFooter();
    
    const usefulLinks = [
      { text: 'Условия за ползване', href: '/terms' },
      { text: 'Политика за поверителност', href: '/privacy' },
      { text: 'Контакти', href: '/contact' },
      { text: 'Често задавани въпроси', href: '/faq' }
    ];
    
    // Проверяваме дали всички очаквани връзки съществуват
    usefulLinks.forEach(link => {
      const linkElement = screen.getByRole('link', { name: link.text });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', link.href);
    });
  });

  it('съдържа връзки към социални мрежи', () => {
    renderFooter();
    
    // Дефинираме очакваните социални мрежи
    const socialNetworks = [
      { url: 'facebook.com' },
      { url: 'instagram.com' },
      { url: 'pinterest.com' },
      { url: 'youtube.com' }
    ];
    
    // Намираме секцията със социални мрежи
    const socialSection = screen.getByText('Последвайте ни').closest('section');
    
    // Взимаме всички връзки в тази секция
    const socialLinks = socialSection ? 
      Array.from(socialSection.querySelectorAll('a')) : 
      screen.getAllByRole('link');
    
    // Проверяваме дали всяка социална мрежа е налична
    socialNetworks.forEach(network => {
      const hasLink = socialLinks.some(link => 
        link.href.includes(network.url));
      expect(hasLink).toBe(true);
    });
  });

  it('визуализира правилно текста за авторско право с текущата година', () => {
    renderFooter();
    
    const currentYear = new Date().getFullYear();
    const copyrightText = screen.getByText(new RegExp(`©\\s*${currentYear}\\s*CulinaryCorner`));
    
    expect(copyrightText).toBeInTheDocument();
    expect(copyrightText.textContent).toMatch(/Всички права запазени/i);
  });

  it('съдържа линкове за социални мрежи с правилните атрибути', () => {
    renderFooter();
    
    // Дефинираме очакваните социални мрежи
    const socialNetworks = [
      { url: 'facebook.com' },
      { url: 'instagram.com' },
      { url: 'pinterest.com' },
      { url: 'youtube.com' }
    ];
    
    // Намираме всички връзки във футъра
    const allLinks = screen.getAllByRole('link');
    
    // Филтрираме само тези, които са външни линкове (социални мрежи)
    const socialLinks = allLinks.filter(link => 
      socialNetworks.some(network => link.href.includes(network.url))
    );
    
    expect(socialLinks.length).toBeGreaterThan(0);
    
    // Проверяваме дали всяка социална мрежа е налична
    socialNetworks.forEach(network => {
      const hasLink = socialLinks.some(link => 
        link.href.includes(network.url));
      expect(hasLink).toBe(true);
    });
    
    // Проверяваме дали URL-тата са външни адреси
    socialLinks.forEach(link => {
      // Проверяваме дали URL-то започва с http:// или https://
      expect(link.href).toMatch(/^https?:\/\//);
    });
  });

  it('поддържа само една отворена акордеон секция наведнъж', async () => {
    renderFooter();
    
    const user = userEvent.setup();
    
    // Намираме заглавията на секциите
    const navigationHeader = screen.getByText('Навигация');
    const usefulLinksHeader = screen.getByText('Полезни връзки');
    
    // Намираме съдържанието на секциите
    const navigationContent = navigationHeader.nextElementSibling;
    const usefulLinksContent = usefulLinksHeader.nextElementSibling;
    
    // Кликваме върху първата секция, за да я отворим
    await user.click(navigationHeader);
    expect(navigationContent.className).toMatch(/open/i);
    expect(usefulLinksContent.className).not.toMatch(/open/i);
    
    // Кликваме върху втората секция - първата трябва да се затвори
    await user.click(usefulLinksHeader);
    expect(navigationContent.className).not.toMatch(/open/i);
    expect(usefulLinksContent.className).toMatch(/open/i);
  });
});