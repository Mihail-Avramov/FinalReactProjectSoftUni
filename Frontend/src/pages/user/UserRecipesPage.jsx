import React, { useCallback, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useRecipes } from '../../hooks/api/useRecipes';
import { useConfig } from '../../hooks/api/useConfig';
import { useProfile } from '../../hooks/api/useProfile'; 
import RecipeFilters from '../../components/recipe/RecipeFilters/RecipeFilters';
import RecipeList from '../../components/recipe/RecipeList/RecipeList';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import SEO from '../../components/common/SEO';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import '../recipes/RecipesPage.css';
import './UserPages.css';

const UserRecipesPage = () => {
  // Запазваме съществуващите хукове и логика...
  
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: config } = useConfig();
  const { profile: userProfile, loading: profileLoading, error: profileError, loadProfile } = useProfile();
  
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
    maxTime: searchParams.get('maxTime') || ''
  };

  // Зареждане на информация за потребителя
  useEffect(() => {
    loadProfile(userId);
  }, [userId, loadProfile]);

  // Хук за рецепти на конкретен потребител с пагинация
  const { useUserRecipesByUserId } = useRecipes();
  const { 
    data: recipes, 
    loading, 
    error,
    pagination,
    setPage: updatePage,
    setSort: updateSort,
    setOrder: updateOrder,
    updateOptions,
  } = useUserRecipesByUserId(userId, { 
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
    newParams.set('page', 1);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, updateSort, updateOrder]);
  
  // Изчистване на филтрите
  const clearFilters = useCallback(() => {
    // Задаваме стойности по подразбиране
    const defaultSort = '-createdAt';
    
    // Създаваме нови параметри
    const newParams = new URLSearchParams();
    newParams.set('page', 1);
    newParams.set('limit', limit);
    newParams.set('sort', defaultSort);
    setSearchParams(newParams);
    
    // Актуализиране на опциите за заявката
    updateOptions({
      page: 1,
      search: '',
      category: '',
      difficulty: '',
      minTime: '',
      maxTime: '',
      sort: 'createdAt',
      order: 'desc'
    });
  }, [limit, setSearchParams, updateOptions]);

  // Форматиране на името на потребителя
  const userName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Потребителя';

  // Комбинирано състояние на зареждане за целия компонент
  // Използваме оптимизирана логика, за да избегнем ненужно показване на спинер
  const isInitialLoading = (profileLoading && !userProfile) || (loading && !recipes);
  const isRefetching = (profileLoading && userProfile) || (loading && recipes);
  
  // Съобщение за зареждане според текущото състояние
  const loadingMessage = profileLoading && !userProfile 
    ? "Зареждане на информация за потребителя..." 
    : "Зареждане на рецепти...";

    return (
    <div className="recipes-page user-recipes-page">
      <SEO 
        title={`Рецепти на ${userName}`}
        description={`Разгледайте всички рецепти, споделени от ${userName}.`}
        keywords={`рецепти, ${userName}, готвач, кулинария`}
      />
      
      {/* Един общ LoadingOverlay за цялата страница */}
      <LoadingOverlay 
        active={isInitialLoading} 
        message={loadingMessage}
        className="page-loading-overlay"
      >
        {/* Заглавие и информация за потребителя */}
        <div className="recipes-top-header">
          <div className="back-arrow-mobile">
            <Link to={`/profile/${userId}`} className="btn btn-link">
              <i className="fas fa-arrow-left"></i>
            </Link>
          </div>
          
          {userProfile ? (
            <div className="user-header">
              <img 
                src={userProfile.profilePicture || '/images/default-avatar.png'} 
                alt={`${userProfile.firstName} ${userProfile.lastName}`}
                className="user-avatar-md"
              />
              <div className="user-header-content">
                <h1>Рецепти на {userProfile.firstName} {userProfile.lastName}</h1>
                {userProfile.username && (
                  <div className="username">@{userProfile.username}</div>
                )}
              </div>
            </div>
          ) : (
            !profileLoading && <h1>Рецепти на потребителя</h1>
          )}
          
          <div className="back-to-profile desktop-only">
            <Link to={`/profile/${userId}`} className="btn btn-outline btn-sm">
               Обратно към профила
            </Link>
          </div>
        </div>
        
        {/* Съобщения за грешка */}
        {(error || profileError) && (
          <Alert type="error" dismissible className="top-margin-alert">
            {error || `Грешка при зареждане на информация за потребителя: ${profileError}`}
          </Alert>
        )}
        
        {/* Основно съдържание - двуколонна подредба */}
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
              disabled={isInitialLoading || isRefetching}
            />
          </aside>
          
          <main className="recipes-main">
            {/* Резултати от търсенето */}
            <RecipeList 
              recipes={recipes || []} 
              loading={false} // Ръчно управляваме LoadingOverlay
              emptyMessage={
                filters.search 
                  ? `Няма намерени рецепти за "${filters.search}".`
                  : `${userName} все още няма публикувани рецепти${filters.category || filters.difficulty ? ', съответстващи на филтрите' : ''}.`
              }
            />
            
            {/* Пагинация - показваме я само ако има данни */}
            {pagination && pagination.total > pagination.limit && (
              <Pagination 
                currentPage={pagination.page}
                totalPages={pagination.pages || Math.ceil(pagination.total / pagination.limit)}
                onPageChange={handlePageChange}
                disabled={isInitialLoading || isRefetching}
              />
            )}
          </main>
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default UserRecipesPage;