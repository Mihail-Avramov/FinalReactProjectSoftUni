import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeFilters.css';

const RecipeFilters = ({ 
  filters, 
  onFilterChange, 
  onSortChange, 
  onClearFilters, 
  config,
  sort = 'createdAt',
  order = 'desc'
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [currentSort, setCurrentSort] = useState(sort);
  const [currentOrder, setCurrentOrder] = useState(order);
  const [selectedTime, setSelectedTime] = useState(0);
  const navigate = useNavigate();

  // Синхронизиране на локалния стейт с пропс
  useEffect(() => {
    setLocalFilters(filters);
    
    // Определяне на избраното време от филтрите
    if (filters.maxTime === '30' && !filters.minTime) {
      setSelectedTime(30);
    } else if (filters.minTime === '31' && filters.maxTime === '60') {
      setSelectedTime(31);
    } else if (filters.minTime === '61' && filters.maxTime === '120') {
      setSelectedTime(61);
    } else if (filters.minTime === '121') {
      setSelectedTime(121);
    } else {
      setSelectedTime(0);
    }
  }, [filters]);

  // Синхронизиране на сортирането с пропс
  useEffect(() => {
    console.log(`Получени нови пропс за сортиране: sort=${sort}, order=${order}`);
    setCurrentSort(sort);
    setCurrentOrder(order);
  }, [sort, order]);
  
  // Дебъг log за конфигурацията при зареждане
  useEffect(() => {
    console.log("Заредена конфигурация:", config);
    if (config?.recipe?.sortOptions) {
      console.log("Опции за сортиране от конфигурацията:");
      config.recipe.sortOptions.forEach((opt, i) => 
        console.log(`  ${i}: ${JSON.stringify(opt)}`)
      );
    }
  }, [config]);

  // Обработчици за търсене
  const handleSearchChange = (e) => {
    setLocalFilters(prev => ({ ...prev, search: e.target.value }));
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ search: localFilters.search });
  };
  
  // Обработчик за филтри
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
    onFilterChange({ [name]: value });
  };

  // Обработчик за предефинирани опции за време
  const handleTimeChange = (time) => {
    let minTime = '';
    let maxTime = '';
    
    if (selectedTime === time) {
      // Ако сме кликнали на същия бутон, изчистваме филтъра
      setSelectedTime(0);
    } else {
      // Задаваме новото време
      setSelectedTime(time);
      
      if (time === 30) {
        maxTime = '30';
      } else if (time === 31) {
        minTime = '31';
        maxTime = '60';
      } else if (time === 61) {
        minTime = '61';
        maxTime = '120';        
      } else if (time == 121) {
        minTime = '121';
      }
    }
    
    // Обновяваме локалните филтри
    setLocalFilters(prev => ({ ...prev, minTime, maxTime }));
    
    // Известяваме родителя за промяната
    onFilterChange({ minTime, maxTime });
  };
  
  // Обработчик за сортиране
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setCurrentSort(newSort);
    
    console.log("Избрана е опция за сортиране:", newSort);
    
    // Директна проверка дали имаме валидна стойност
    if (!newSort) {
      console.warn("Избраната стойност за сортиране е празна!");
      return; // Не изпращаме промени с празна стойност
    }
    
    // Намиране на съответстващата опция в конфигурацията
    let matchingOption = null;
    let newOrder = currentOrder;
    
    if (config?.recipe?.sortOptions) {
      // Използваме option.value вместо option.sort
      matchingOption = config.recipe.sortOptions.find(opt => opt.value === newSort);
      
      console.log("Намерена опция за сортиране:", matchingOption);
      
      // Ако опцията има посока, използваме я
      if (matchingOption && matchingOption.direction) {
        newOrder = matchingOption.direction;
        setCurrentOrder(newOrder);
        console.log(`Задаване на посока от конфигурацията: ${newOrder}`);
      }
    }
    
    // Изпращаме заявка с новите стойности
    console.log(`Изпращане на: sort=${newSort}, order=${newOrder}`);
    onSortChange({
      sort: newSort,
      order: newOrder
    });
  };
  
  // Обработчик за промяна на посоката на сортиране
  const handleOrderChange = () => {
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    setCurrentOrder(newOrder);
    
    console.log(`Промяна на посоката на сортиране: ${newOrder}`);
    
    onSortChange({
      sort: currentSort,
      order: newOrder
    });
  };
  
  // За отваряне на страницата за създаване на рецепта
  const handleCreateClick = () => {
    navigate('/recipes/create');
  };

  return (
    <div className="recipe-filters">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="search"
            placeholder="Търси рецепти..."
            value={localFilters.search || ''}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </form>
      
      <div className="filter-section">
        <h3>Категории</h3>
        <select 
          name="category"
          value={localFilters.category || ''}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">Всички категории</option>
          {config && config.localization && config.localization.categories && 
            Object.entries(config.localization.categories).map(([value, label]) => (
              <option key={value} value={value}>{label || value}</option>
            ))
          }
        </select>
      </div>
      
      <div className="filter-section">
        <h3>Сложност</h3>
        <div className="difficulty-buttons">
          {config && config.localization && config.localization.difficulties && 
            Object.entries(config.localization.difficulties).map(([value, label]) => (
              <button
                key={value}
                type="button"
                name="difficulty"
                className={`difficulty-btn ${localFilters.difficulty === value ? 'active' : ''}`}
                onClick={() => onFilterChange({ 
                  difficulty: localFilters.difficulty === value ? '' : value 
                })}
              >
                {label || value}
              </button>
            ))
          }
        </div>
      </div>
      
      <div className="filter-section">
        <h3>Време за приготвяне</h3>
        <div className="time-buttons">
          <button
            type="button"
            className={`time-btn ${selectedTime === 30 ? 'active' : ''}`}
            onClick={() => handleTimeChange(30)}
          >
            До 30 мин
          </button>
          <button
            type="button"
            className={`time-btn ${selectedTime === 31 ? 'active' : ''}`}
            onClick={() => handleTimeChange(31)}
          >
            30 - 60 мин
          </button>
          <button
            type="button"
            className={`time-btn ${selectedTime === 61 ? 'active' : ''}`}
            onClick={() => handleTimeChange(61)}
          >
            60 - 120 мин
          </button>
          <button
            type="button"
            className={`time-btn ${selectedTime === 121 ? 'active' : ''}`}
            onClick={() => handleTimeChange(121)}
          >
            Над 120 мин
          </button>
        </div>
      </div>
      
      <div className="filter-section">
        <h3>Сортиране</h3>
        <div className="sort-controls">
          <select 
            value={currentSort}
            onChange={handleSortChange}
            className="sort-select"
          >
            {config && config.recipe && Array.isArray(config.recipe.sortOptions) ? 
              config.recipe.sortOptions.map((option, index) => {
                // Извличане на чистата стойност за сортиране (без знак минус)
                const sortValue = option.value || '';
                
                // Проверка дали имаме валидна стойност
                if (!sortValue) {
                  console.warn(`Невалидна опция за сортиране #${index}:`, option);
                  return null;
                }
                
                return (
                  <option key={index} value={sortValue}>
                    {option.label}
                  </option>
                );
              })
              : <option value="createdAt">Най-нови</option>
            }
          </select>
          <button 
            type="button"
            className="order-toggle"
            onClick={handleOrderChange}
            title={currentOrder === 'asc' ? 'Низходящо' : 'Възходящо'}
          >
            <i className={`fas fa-sort-${currentOrder === 'asc' ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>
      
      <div className="filter-actions">
        <button 
          type="button"
          className="clear-filters"
          onClick={onClearFilters}
        >
          Изчисти филтрите
        </button>
        
        <button 
          type="button"
          className="create-recipe-btn"
          onClick={handleCreateClick}
        >
          <i className="fas fa-plus"></i> Създай рецепта
        </button>
      </div>
    </div>
  );
};

export default RecipeFilters;