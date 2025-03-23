import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecipes } from '../../hooks/api/useRecipes';
import { useConfig } from '../../hooks/api/useConfig';
import RecipeFilters from '../../components/recipe/RecipeFilters/RecipeFilters';
import RecipeList from '../../components/recipe/RecipeList/RecipeList';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import SEO from '../../components/common/SEO';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import './RecipesPage.css';

const MyRecipesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: config } = useConfig();
  
  // Извличане на параметрите от URL
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = parseInt(searchParams.get('limit')) || 6;
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
  };

  // Хук за лични рецепти с пагинация - КЛЮЧОВАТА РАЗЛИКА
  const { useUserRecipes } = useRecipes();
  const { 
    data: recipes, 
    loading, 
    error,
    pagination,
    setPage: updatePage,
    setSort: updateSort,
    setOrder: updateOrder,
    updateOptions,
  } = useUserRecipes({ 
    page, 
    limit, 
    sort: actualSort, 
    order: initialOrder,
    ...filters
  });
  
  // Обработчик за промяна на страница
  const handlePageChange = useCallback((newPage) => {
    updatePage(newPage);
    
    // Актуализиране на URL параметрите
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, updatePage]);
  
  // Обработчик за промяна на филтри
  const handleFilterChange = useCallback((filterData) => {
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
    // Обновяване на сортирането
    if (sortData.sort) {
      updateSort(sortData.sort);
    }
    
    if (sortData.order) {
      updateOrder(sortData.order);
    }
    
    // Актуализиране на URL параметрите
    const newParams = new URLSearchParams(searchParams);
    if (sortData.sort) {
      const sortParam = sortData.order === 'desc' ? `-${sortData.sort}` : sortData.sort;
      newParams.set('sort', sortParam);
    }
    
    // ВАЖНО: Връщаме се към първа страница при промяна на сортирането
    newParams.set('page', 1);
    setSearchParams(newParams);
    
    // Актуализиране на опциите, включително страницата
    updateOptions({
      sort: sortData.sort,
      order: sortData.order,
      page: 1
    });
  }, [searchParams, setSearchParams, updateSort, updateOrder, updateOptions]);
  
  // Изчистване на филтрите
  const clearFilters = useCallback(() => {
    // Задаваме стойности по подразбиране
    const defaultSort = '-createdAt';
    
    // Актуализиране на опциите за заявката с всички нужни параметри
    updateOptions({
      page: 1,
      search: '',
      category: '',
      difficulty: '',
      minTime: '',
      maxTime: '',
      sort: 'createdAt',   // Без тире, това е полето
      order: 'desc'        // Посоката отделно
    });
    
    // След това обновяваме URL
    const newParams = new URLSearchParams();
    newParams.set('page', 1);
    newParams.set('limit', limit);
    newParams.set('sort', defaultSort);  // С тире, това е URL параметърът
    setSearchParams(newParams);
  }, [limit, setSearchParams, updateOptions]);

  return (
    <div className="recipes-page">
      <SEO 
        title="Моите рецепти | Кулинарно Кътче"
        description="Управлявайте вашите собствени рецепти. Филтрирайте и сортирайте рецептите, които сте създали."
        keywords="рецепти, моите рецепти, управление на рецепти, готвене"
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
            sort={pagination?.sort || actualSort}
            order={pagination?.order || initialOrder}
          />
        </aside>
        
        <main className="recipes-main">
          {/* Заглавие и описание */}
          <div className="recipes-header">
            <h1>Моите рецепти</h1>
            <p>Управлявайте вашите собствени рецепти</p>
          </div>
          
          {/* Съобщения за грешка */}
          {error && (
            <Alert type="error" dismissible>
              {error}
            </Alert>
          )}
          
          {/* Резултати от търсенето */}
          <LoadingOverlay 
            active={loading} 
            message="Зареждане на рецепти..."
            minHeight={recipes && recipes.length ? 'auto' : '400px'}
          >
            <RecipeList 
              recipes={recipes || []} 
              loading={false}  // Винаги false, защото overlay-ът поема loading state
              emptyMessage={
                filters.search 
                  ? `Нямате създадени рецепти, съдържащи "${filters.search}".`
                  : "Все още нямате създадени рецепти."
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
          </LoadingOverlay>
        </main>
      </div>
    </div>
  );
};

export default MyRecipesPage;