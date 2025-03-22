import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Функция за визуализация на страниците
  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Ако страниците са малко, показваме всички
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPageButton(i));
      }
    } else {
      // Винаги показваме първата страница
      pages.push(renderPageButton(1));
      
      // Определяме диапазона от страници, които да покажем
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Добавяме многоточие, ако необходимо
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="pagination-ellipsis">...</span>
        );
      }
      
      // Добавяме средните страници
      for (let i = startPage; i <= endPage; i++) {
        pages.push(renderPageButton(i));
      }
      
      // Добавяме многоточие, ако необходимо
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="pagination-ellipsis">...</span>
        );
      }
      
      // Винаги показваме последната страница
      pages.push(renderPageButton(totalPages));
    }
    
    return pages;
  };
  
  // Рендерира бутон за страница
  const renderPageButton = (pageNumber) => (
    <button
      key={pageNumber}
      className={`pagination-page-btn ${pageNumber === currentPage ? 'active' : ''}`}
      onClick={() => onPageChange(pageNumber)}
      disabled={pageNumber === currentPage}
    >
      {pageNumber}
    </button>
  );
  
  // Не показваме пагинация, ако има само 1 страница
  if (totalPages <= 1) return null;
  
  return (
    <div className="pagination">
      <button
        className="pagination-nav-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Предишна страница"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      
      <div className="pagination-pages">
        {renderPageNumbers()}
      </div>
      
      <button
        className="pagination-nav-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Следваща страница"
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;