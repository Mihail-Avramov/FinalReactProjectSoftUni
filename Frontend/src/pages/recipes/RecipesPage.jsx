import React, { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecipes } from '../../hooks/api/useRecipes';
import { useConfig } from '../../hooks/api/useConfig';
import RecipeFilters from '../../components/recipe/RecipeFilters/RecipeFilters';
import RecipeList from '../../components/recipe/RecipeList/RecipeList';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import SEO from '../../components/common/SEO';
import './RecipesPage.css';

const RecipesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: config } = useConfig();
  
  // Извличане на параметрите от URL
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 10;
  const sortParam = searchParams.get('sort') || '-createdAt';
  
  // Определяне на поле и посока за сортиране
  const isDescending = sortParam.startsWith('-');
  const actualSort = isDescending ? sortParam.substring(1) : sortParam;
  const initialOrder = isDescending ? 'desc' : 'asc';
  
  // Филтри от URL параметри
  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    minTime: searchParams.get('minTime') || '',
    maxTime: searchParams.get('maxTime') || '',
    author: searchParams.get('author') || ''
  };

  // Хук за рецепти с пагинация
  const { usePaginatedRecipes } = useRecipes();
  const { 
    data: recipes, 
    loading, 
    error,
    pagination,
    setPage: updatePage,
    setSort: updateSort,
    setOrder: updateOrder,
    updateOptions,
  } = usePaginatedRecipes({ 
    page, 
    limit, 
    sort: actualSort, 
    order: initialOrder,
    ...filters
  });
  
  // Обработчик за промяна на страница
  const handlePageChange = useCallback((newPage) => {
    console.log(`Промяна на страница: ${newPage}`);
    updatePage(newPage);
    
    // Актуализиране на URL параметрите
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, updatePage]);
  
  // Обработчик за промяна на филтри
  const handleFilterChange = useCallback((filterData) => {
    console.log('RecipesPage: handleFilterChange извикан с:', filterData);
    
    // Актуализиране на URL параметрите
    const newParams = new URLSearchParams(searchParams);
    Object.entries(filterData).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    // Връщане към първа страница при нови филтри
    newParams.set('page', 1);
    setSearchParams(newParams);
    
    // Актуализиране на опциите за заявката
    updateOptions({ ...filterData, page: 1 });
  }, [searchParams, setSearchParams, updateOptions]);
  
  // Обработчик за промяна на сортиране
  const handleSortChange = useCallback((sortData) => {
    console.log('RecipesPage: handleSortChange извикан с:', sortData);
    
    // Обновяване на сортирането
    if (sortData.sort) {
      console.log(`RecipesPage: извикване на setSort с ${sortData.sort}`);
      updateSort(sortData.sort);
    }
    
    if (sortData.order) {
      console.log(`RecipesPage: извикване на setOrder с ${sortData.order}`);
      updateOrder(sortData.order);
    }
    
    // Актуализиране на URL параметрите
    const newParams = new URLSearchParams(searchParams);
    if (sortData.sort) {
      const sortParam = sortData.order === 'desc' ? `-${sortData.sort}` : sortData.sort;
      newParams.set('sort', sortParam);
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, updateSort, updateOrder]);
  
  // Изчистване на филтрите
  const clearFilters = useCallback(() => {
    // Запазваме само page, limit и sort параметрите
    const newParams = new URLSearchParams();
    newParams.set('page', 1);
    newParams.set('limit', limit);
    newParams.set('sort', sortParam);
    setSearchParams(newParams);
    
    // Актуализиране на опциите за заявката
    updateOptions({
      page: 1,
      search: '',
      category: '',
      difficulty: '',
      minTime: '',
      maxTime: '',
      author: ''
    });
  }, [limit, sortParam, setSearchParams, updateOptions]);
  
  // Debug logging
  useEffect(() => {
    console.log("Pagination state:", pagination);
  }, [pagination]);

  return (
    <div className="recipes-page">
      <SEO 
        title="Рецепти | Кулинарно Кътче"
        description="Разгледайте вкусни рецепти от нашата колекция. Филтрирайте по категория, сложност и време за приготвяне."
        keywords="рецепти, храна, готвене, кулинария, ястия"
      />
      
      <div className="recipes-container">
        <aside className="recipes-sidebar">
          {/* Филтри за рецепти */}
          <RecipeFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onClearFilters={clearFilters}
            config={config}
            sort={pagination.sort || actualSort}
            order={pagination.order || initialOrder}
          />
        </aside>
        
        <main className="recipes-main">
          {/* Заглавие и описание */}
          <div className="recipes-header">
            <h1>Рецепти</h1>
            <p>Открийте вкусни рецепти от нашата колекция</p>
          </div>
          
          {/* Съобщения за грешка */}
          {error && (
            <Alert type="error" dismissible>
              {error}
            </Alert>
          )}
          
          {/* Резултати от търсенето */}
          {loading ? (
            <LoadingSpinner message="Зареждане на рецепти..." />
          ) : (
            <>
              <RecipeList 
                recipes={recipes} 
                emptyMessage={
                  filters.search 
                    ? `Няма намерени рецепти за "${filters.search}".`
                    : "Няма намерени рецепти, съответстващи на филтрите."
                }
              />
              
              {/* Пагинация */}
              {pagination && pagination.total > pagination.limit && (
                <Pagination 
                  currentPage={pagination.page}
                  totalPages={pagination.pages || Math.ceil(pagination.total / pagination.limit)}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecipesPage;